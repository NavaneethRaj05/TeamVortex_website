const Event = require('../models/Event');
const { sendNotification } = require('./notificationService');

// ============================================
// AUTOMATED EVENT REMINDERS (24 HOURS BEFORE)
// ============================================

const send24HourReminders = async () => {
    try {
        console.log('🔔 Running 24-hour reminder check...');
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Find events happening tomorrow
        const upcomingEvents = await Event.find({
            date: {
                $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
                $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
            },
            status: 'published'
        });

        console.log(`📅 Found ${upcomingEvents.length} events happening tomorrow`);

        for (const event of upcomingEvents) {
            // Send reminders to all verified registrations
            const verifiedRegistrations = event.registrations.filter(
                reg => reg.paymentStatus === 'verified' || event.price === 0
            );

            console.log(`📧 Sending reminders for "${event.title}" to ${verifiedRegistrations.length} participants`);

            for (const registration of verifiedRegistrations) {
                const primaryMember = registration.members[0];
                
                const notificationData = {
                    name: primaryMember.name,
                    eventTitle: event.title,
                    date: new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
                    location: event.location,
                    teamName: registration.teamName,
                    isMultiEvent: !!registration.multiEventGroupId,
                    selectedEvents: registration.selectedSubEvents?.map(subEventId => {
                        const subEvent = event.subEvents.find(se => se.id === subEventId || se.title === subEventId);
                        return subEvent?.title || subEventId;
                    }) || [],
                    requirements: event.eligibility?.requiredDocs || []
                };

                // Send via email only (free)
                await sendNotification(
                    ['email'],
                    { email: primaryMember.email },
                    'eventReminder24h',
                    notificationData
                );
            }
        }

        console.log('✅ 24-hour reminders sent successfully');
    } catch (error) {
        console.error('❌ Error sending 24-hour reminders:', error);
    }
};

// ============================================
// POST-EVENT FEEDBACK COLLECTION
// ============================================

const sendFeedbackRequests = async () => {
    try {
        console.log('📝 Running post-event feedback check...');
        
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Find events that ended yesterday
        const completedEvents = await Event.find({
            date: {
                $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
                $lt: new Date(yesterday.setHours(23, 59, 59, 999))
            },
            status: 'published'
        });

        console.log(`📊 Found ${completedEvents.length} events completed yesterday`);

        for (const event of completedEvents) {
            // Send feedback requests to all verified registrations
            const verifiedRegistrations = event.registrations.filter(
                reg => reg.paymentStatus === 'verified' || event.price === 0
            );

            console.log(`📧 Sending feedback requests for "${event.title}" to ${verifiedRegistrations.length} participants`);

            for (const registration of verifiedRegistrations) {
                const primaryMember = registration.members[0];
                
                // Generate feedback URL (adjust based on your frontend routing)
                const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events?feedback=${event._id}`;
                
                const notificationData = {
                    name: primaryMember.name,
                    eventTitle: event.title,
                    feedbackUrl: feedbackUrl
                };

                // Send via email only (free)
                await sendNotification(
                    ['email'],
                    { email: primaryMember.email },
                    'feedbackRequest',
                    notificationData
                );
            }

            // Mark event as completed
            event.status = 'completed';
            await event.save();
        }

        console.log('✅ Feedback requests sent successfully');
    } catch (error) {
        console.error('❌ Error sending feedback requests:', error);
    }
};

// ============================================
// PAYMENT REMINDER FOR PENDING PAYMENTS
// ============================================

const sendPaymentReminders = async () => {
    try {
        console.log('💰 Running payment reminder check...');
        
        const now = new Date();
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        // Find events with pending payments older than 3 days
        const events = await Event.find({
            'registrations.paymentStatus': 'pending',
            'registrations.registeredAt': { $lt: threeDaysAgo },
            status: 'published'
        });

        console.log(`💳 Found ${events.length} events with pending payments`);

        for (const event of events) {
            const pendingRegistrations = event.registrations.filter(
                reg => reg.paymentStatus === 'pending' && 
                       new Date(reg.registeredAt) < threeDaysAgo
            );

            for (const registration of pendingRegistrations) {
                const primaryMember = registration.members[0];
                
                const notificationData = {
                    name: primaryMember.name,
                    eventTitle: event.title,
                    amount: registration.pricing?.total || event.price,
                    date: new Date(event.date).toLocaleDateString(),
                    time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
                    location: event.location,
                    paymentPending: true
                };

                // Send reminder via email (free)
                await sendNotification(
                    ['email'],
                    { email: primaryMember.email },
                    'registrationConfirmation',
                    notificationData
                );
            }
        }

        console.log('✅ Payment reminders sent successfully');
    } catch (error) {
        console.error('❌ Error sending payment reminders:', error);
    }
};

// ============================================
// SIMPLE SCHEDULER (NO EXTERNAL DEPENDENCIES)
// ============================================

const startScheduler = () => {
    console.log('🚀 Starting event scheduler...');

    // Check every hour and run tasks at specific times
    setInterval(() => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        // Run 24-hour reminders at 10:00 AM
        if (hour === 10 && minute === 0) {
            console.log('⏰ Triggering 24-hour reminder job');
            send24HourReminders();
        }

        // Run feedback collection at 11:00 AM
        if (hour === 11 && minute === 0) {
            console.log('⏰ Triggering feedback collection job');
            sendFeedbackRequests();
        }

        // Run payment reminders at 6:00 PM
        if (hour === 18 && minute === 0) {
            console.log('⏰ Triggering payment reminder job');
            sendPaymentReminders();
        }
    }, 60000); // Check every minute

    console.log('✅ Event scheduler started successfully');
    console.log('📅 24-hour reminders: Daily at 10:00 AM');
    console.log('📝 Feedback requests: Daily at 11:00 AM');
    console.log('💰 Payment reminders: Daily at 6:00 PM');
};

// Manual trigger functions (for testing or admin dashboard)
const manualTriggers = {
    send24HourReminders,
    sendFeedbackRequests,
    sendPaymentReminders
};

module.exports = {
    startScheduler,
    manualTriggers
};
