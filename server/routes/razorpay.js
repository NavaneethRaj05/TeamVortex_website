const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Event = require('../models/Event');

// @route   POST /api/razorpay/create-order
// @desc    Create Razorpay order for payment
router.post('/create-order', async (req, res) => {
    try {
        const { eventId, amount, currency = 'INR', registrationData } = req.body;
        
        if (!eventId || !amount) {
            return res.status(400).json({ error: 'Event ID and amount are required' });
        }
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Use event-specific keys or fallback to environment variables
        const keyId = event.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
        const keySecret = event.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
        
        if (!keyId || !keySecret) {
            return res.status(500).json({ error: 'Razorpay credentials not configured' });
        }
        
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });
        
        const options = {
            amount: Math.round(amount * 100), // amount in paise (smallest currency unit)
            currency,
            receipt: `receipt_${eventId}_${Date.now()}`,
            payment_capture: 1, // Auto capture payment
            notes: {
                event_id: eventId,
                event_title: event.title,
                registration_type: event.registrationType || 'Solo'
            }
        };
        
        const order = await razorpay.orders.create(options);
        
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: keyId,
            eventTitle: event.title
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create order', 
            message: error.message 
        });
    }
});

// @route   POST /api/razorpay/verify-payment
// @desc    Verify Razorpay payment signature
router.post('/verify-payment', async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            eventId 
        } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !eventId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required payment verification parameters' 
            });
        }
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        const secret = event.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
        
        // Create signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');
        
        // Verify signature
        const isValid = expectedSignature === razorpay_signature;
        
        if (isValid) {
            res.json({ 
                success: true, 
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid payment signature' 
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Verification failed', 
            message: error.message 
        });
    }
});

// @route   GET /api/razorpay/payment-status/:paymentId
// @desc    Get payment status from Razorpay
router.get('/payment-status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { eventId } = req.query;
        
        if (!eventId) {
            return res.status(400).json({ error: 'Event ID is required' });
        }
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const razorpay = new Razorpay({
            key_id: event.razorpayKeyId || process.env.RAZORPAY_KEY_ID,
            key_secret: event.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET
        });
        
        const payment = await razorpay.payments.fetch(paymentId);
        
        res.json({
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount / 100,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                createdAt: payment.created_at
            }
        });
    } catch (error) {
        console.error('Payment status fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch payment status', 
            message: error.message 
        });
    }
});

// @route   POST /api/razorpay/refund
// @desc    Initiate refund for a payment
router.post('/refund', async (req, res) => {
    try {
        const { paymentId, amount, eventId } = req.body;
        
        if (!paymentId || !eventId) {
            return res.status(400).json({ error: 'Payment ID and Event ID are required' });
        }
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const razorpay = new Razorpay({
            key_id: event.razorpayKeyId || process.env.RAZORPAY_KEY_ID,
            key_secret: event.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET
        });
        
        const refundOptions = amount ? { amount: Math.round(amount * 100) } : {};
        const refund = await razorpay.payments.refund(paymentId, refundOptions);
        
        res.json({
            success: true,
            message: 'Refund initiated successfully',
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            }
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ 
            error: 'Failed to process refund', 
            message: error.message 
        });
    }
});

module.exports = router;
