const express = require('express');
const router = express.Router();
const AnalyticsEvent = require('../models/AnalyticsEvent');

// @route   POST /api/analytics/track
// @desc    Track user behavior event
router.post('/track', async (req, res) => {
    try {
        const {
            eventId,
            eventTitle,
            sessionId,
            eventType,
            data
        } = req.body;

        if (!sessionId || !eventType) {
            return res.status(400).json({ message: 'sessionId and eventType are required' });
        }

        const analyticsEvent = new AnalyticsEvent({
            eventId,
            eventTitle,
            sessionId,
            userId: req.body.userId,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            eventType,
            data: data || {},
            timestamp: new Date()
        });

        await analyticsEvent.save();
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ message: 'Failed to track event' });
    }
});

// @route   POST /api/analytics/track-batch
// @desc    Track multiple events at once (for better performance)
router.post('/track-batch', async (req, res) => {
    try {
        const { events } = req.body;

        if (!Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ message: 'events array is required' });
        }

        const analyticsEvents = events.map(event => ({
            ...event,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            timestamp: new Date()
        }));

        await AnalyticsEvent.insertMany(analyticsEvents);
        
        res.status(201).json({ success: true, count: events.length });
    } catch (error) {
        console.error('Batch analytics tracking error:', error);
        res.status(500).json({ message: 'Failed to track events' });
    }
});

// @route   GET /api/analytics/funnel/:eventId
// @desc    Get registration funnel data
router.get('/funnel/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const funnelData = await AnalyticsEvent.getRegistrationFunnel(eventId, start, end);
        
        // Calculate conversion rates
        const funnel = {
            started: 0,
            formStarted: 0,
            formCompleted: 0,
            paymentStarted: 0,
            completed: 0
        };

        funnelData.forEach(item => {
            switch (item.eventType) {
                case 'registration_started':
                    funnel.started = item.uniqueCount;
                    break;
                case 'registration_step_2_started':
                    funnel.formStarted = item.uniqueCount;
                    break;
                case 'registration_step_2_completed':
                    funnel.formCompleted = item.uniqueCount;
                    break;
                case 'registration_step_3_started':
                    funnel.paymentStarted = item.uniqueCount;
                    break;
                case 'registration_completed':
                    funnel.completed = item.uniqueCount;
                    break;
            }
        });

        // Calculate conversion rates
        const conversionRates = {
            startedToFormStarted: funnel.started > 0 ? (funnel.formStarted / funnel.started * 100).toFixed(2) : 0,
            formStartedToCompleted: funnel.formStarted > 0 ? (funnel.formCompleted / funnel.formStarted * 100).toFixed(2) : 0,
            formCompletedToPayment: funnel.formCompleted > 0 ? (funnel.paymentStarted / funnel.formCompleted * 100).toFixed(2) : 0,
            paymentToCompleted: funnel.paymentStarted > 0 ? (funnel.completed / funnel.paymentStarted * 100).toFixed(2) : 0,
            overallConversion: funnel.started > 0 ? (funnel.completed / funnel.started * 100).toFixed(2) : 0
        };

        res.json({
            funnel,
            conversionRates,
            period: { start, end }
        });
    } catch (error) {
        console.error('Funnel analytics error:', error);
        res.status(500).json({ message: 'Failed to get funnel data' });
    }
});

// @route   GET /api/analytics/dropoffs/:eventId
// @desc    Get drop-off points in registration flow
router.get('/dropoffs/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const dropoffs = await AnalyticsEvent.getDropOffPoints(eventId, start, end);
        
        // Calculate percentages
        const total = dropoffs.reduce((sum, item) => sum + item.count, 0);
        const dropoffData = dropoffs.map(item => ({
            step: item._id,
            count: item.count,
            percentage: ((item.count / total) * 100).toFixed(2)
        }));

        res.json({
            dropoffs: dropoffData,
            totalDropoffs: total,
            period: { start, end }
        });
    } catch (error) {
        console.error('Dropoff analytics error:', error);
        res.status(500).json({ message: 'Failed to get dropoff data' });
    }
});

// @route   GET /api/analytics/form-errors/:eventId
// @desc    Get most common form field errors
router.get('/form-errors/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const errors = await AnalyticsEvent.getFormFieldErrors(eventId, start, end);
        
        const formattedErrors = errors.map(item => ({
            fieldName: item._id.fieldName,
            errorMessage: item._id.errorMessage,
            count: item.count
        }));

        res.json({
            errors: formattedErrors,
            period: { start, end }
        });
    } catch (error) {
        console.error('Form errors analytics error:', error);
        res.status(500).json({ message: 'Failed to get form error data' });
    }
});

// @route   GET /api/analytics/time-per-step/:eventId
// @desc    Get average time spent per registration step
router.get('/time-per-step/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const timeData = await AnalyticsEvent.getAverageTimePerStep(eventId, start, end);
        
        const formattedData = timeData.map(item => ({
            step: item._id,
            avgTimeSeconds: (item.avgTime / 1000).toFixed(2),
            avgTimeMinutes: (item.avgTime / 60000).toFixed(2),
            sampleSize: item.count
        }));

        res.json({
            timePerStep: formattedData,
            period: { start, end }
        });
    } catch (error) {
        console.error('Time per step analytics error:', error);
        res.status(500).json({ message: 'Failed to get time data' });
    }
});

// @route   GET /api/analytics/multi-event/:eventId
// @desc    Get multi-event registration analytics
router.get('/multi-event/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const multiEventData = await AnalyticsEvent.getMultiEventAnalytics(eventId, start, end);
        
        res.json({
            multiEventAnalytics: multiEventData[0] || {
                totalOpened: 0,
                totalCompleted: 0,
                conversionRate: 0
            },
            period: { start, end }
        });
    } catch (error) {
        console.error('Multi-event analytics error:', error);
        res.status(500).json({ message: 'Failed to get multi-event data' });
    }
});

// @route   GET /api/analytics/dashboard/:eventId
// @desc    Get comprehensive analytics dashboard data
router.get('/dashboard/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Fetch all analytics in parallel
        const [funnelData, dropoffs, formErrors, timeData, multiEventData] = await Promise.all([
            AnalyticsEvent.getRegistrationFunnel(eventId, start, end),
            AnalyticsEvent.getDropOffPoints(eventId, start, end),
            AnalyticsEvent.getFormFieldErrors(eventId, start, end),
            AnalyticsEvent.getAverageTimePerStep(eventId, start, end),
            AnalyticsEvent.getMultiEventAnalytics(eventId, start, end)
        ]);

        // Process funnel data
        const funnel = {
            started: 0,
            formStarted: 0,
            formCompleted: 0,
            paymentStarted: 0,
            completed: 0
        };

        funnelData.forEach(item => {
            switch (item.eventType) {
                case 'registration_started':
                    funnel.started = item.uniqueCount;
                    break;
                case 'registration_step_2_started':
                    funnel.formStarted = item.uniqueCount;
                    break;
                case 'registration_step_2_completed':
                    funnel.formCompleted = item.uniqueCount;
                    break;
                case 'registration_step_3_started':
                    funnel.paymentStarted = item.uniqueCount;
                    break;
                case 'registration_completed':
                    funnel.completed = item.uniqueCount;
                    break;
            }
        });

        // Calculate conversion rates
        const conversionRates = {
            startedToFormStarted: funnel.started > 0 ? (funnel.formStarted / funnel.started * 100).toFixed(2) : 0,
            formStartedToCompleted: funnel.formStarted > 0 ? (funnel.formCompleted / funnel.formStarted * 100).toFixed(2) : 0,
            formCompletedToPayment: funnel.formCompleted > 0 ? (funnel.paymentStarted / funnel.formCompleted * 100).toFixed(2) : 0,
            paymentToCompleted: funnel.paymentStarted > 0 ? (funnel.completed / funnel.paymentStarted * 100).toFixed(2) : 0,
            overallConversion: funnel.started > 0 ? (funnel.completed / funnel.started * 100).toFixed(2) : 0
        };

        // Process dropoff data
        const totalDropoffs = dropoffs.reduce((sum, item) => sum + item.count, 0);
        const dropoffData = dropoffs.map(item => ({
            step: item._id,
            count: item.count,
            percentage: ((item.count / totalDropoffs) * 100).toFixed(2)
        }));

        // Process form errors
        const topErrors = formErrors.slice(0, 10).map(item => ({
            fieldName: item._id.fieldName,
            errorMessage: item._id.errorMessage,
            count: item.count
        }));

        // Process time data
        const timePerStep = timeData.map(item => ({
            step: item._id,
            avgTimeSeconds: (item.avgTime / 1000).toFixed(2),
            avgTimeMinutes: (item.avgTime / 60000).toFixed(2),
            sampleSize: item.count
        }));

        res.json({
            funnel,
            conversionRates,
            dropoffs: dropoffData,
            topFormErrors: topErrors,
            timePerStep,
            multiEventAnalytics: multiEventData[0] || {
                totalOpened: 0,
                totalCompleted: 0,
                conversionRate: 0
            },
            period: { start, end }
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({ message: 'Failed to get dashboard data' });
    }
});

module.exports = router;
