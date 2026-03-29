const Event = require('../models/Event');
const { sendToAllMembers } = require('./notificationService');

const fmt = (date) => new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ============================================
// TRIGGER 5: 24-HOUR REMINDER (10:00 AM daily)
// ============================================

const send24HourReminders = async () => {
    try {
        console.log('🔔 Running 24-hour reminder check...');

        const now = new Date();
        const tomorrowStart = new Date(now); tomorrowStart.setDate(tomorrowStart.getDate() + 1); tomorrowStart.setHours(0, 0, 0, 0);
        const tomorrowEnd   = new Date(tomorrowStart); tomorrowEnd.setHours(23, 59, 59, 999);

        const events = await Event.find({
            date: { $gte: tomorrowStart, $lt: tomorrowEnd },
            status: 'published'
        });

        console.log(`📅 Found ${events.length} events happening tomorrow`);

        for (const event of events) {
            let dirty = false;

            for (let i = 0; i < event.registrations.length; i++) {
                const reg = event.registrations[i];

                // Only confirmed/verified registrations; skip if already sent
                if (reg.reminderSent) continue;
                if (event.price > 0 && reg.paymentStatus !== 'verified') continue;

                await sendToAllMembers(reg.members, 'eventReminder24h', {
                    name: reg.members[0].name,
                    eventTitle: event.title,
                    date: fmt(event.date),
                    time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
                    location: event.location,
                    teamName: reg.teamName,
                    isMultiEvent: !!reg.multiEventGroupId,
                    selectedEvents: (reg.selectedSubEvents || []).map(id => {
                        const sub = event.subEvents?.find(s => s.id === id || s.title === id);
                        return sub?.title || id;
                    }),
                    requirements: event.eligibility?.requiredDocs || []
                });

                event.registrations[i].reminderSent = true;
                dirty = true;
            }

            if (dirty) {
                await Event.updateOne({ _id: event._id }, { $set: { registrations: event.registrations } });
            }
        }

        console.log('✅ 24-hour reminders done');
    } catch (err) {
        console.error('❌ 24-hour reminder job failed:', err);
    }
};

// ============================================
// TRIGGER 6: FEEDBACK REQUEST (11:00 AM daily)
// ============================================

const sendFeedbackRequests = async () => {
    try {
        console.log('📝 Running feedback request check...');

        const now = new Date();
        const yesterdayStart = new Date(now); yesterdayStart.setDate(yesterdayStart.getDate() - 1); yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd   = new Date(yesterdayStart); yesterdayEnd.setHours(23, 59, 59, 999);

        const events = await Event.find({
            date: { $gte: yesterdayStart, $lt: yesterdayEnd },
            status: 'published'
        });

        console.log(`📊 Found ${events.length} events completed yesterday`);

        for (const event of events) {
            let dirty = false;

            for (let i = 0; i < event.registrations.length; i++) {
                const reg = event.registrations[i];

                if (reg.feedbackEmailSent) continue;
                if (event.price > 0 && reg.paymentStatus !== 'verified') continue;

                const feedbackUrl = `${process.env.CLIENT_URL || 'https://teamvortexnce.netlify.app'}/events?feedback=${event._id}`;

                await sendToAllMembers(reg.members, 'feedbackRequest', {
                    name: reg.members[0].name,
                    eventTitle: event.title,
                    feedbackUrl
                });

                event.registrations[i].feedbackEmailSent = true;
                dirty = true;
            }

            if (dirty) {
                event.status = 'completed';
                await Event.updateOne({ _id: event._id }, {
                    $set: { registrations: event.registrations, status: 'completed' }
                });
            }
        }

        console.log('✅ Feedback requests done');
    } catch (err) {
        console.error('❌ Feedback request job failed:', err);
    }
};

// ============================================
// TRIGGER 7: PAYMENT NUDGE (6:00 PM daily)
// ============================================

const sendPaymentReminders = async () => {
    try {
        console.log('💰 Running payment nudge check...');

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const events = await Event.find({
            'registrations.paymentStatus': 'pending',
            status: 'published'
        });

        console.log(`💳 Found ${events.length} events with pending payments`);

        for (const event of events) {
            let dirty = false;

            for (let i = 0; i < event.registrations.length; i++) {
                const reg = event.registrations[i];

                if (reg.paymentNudgeSent) continue;
                if (reg.paymentStatus !== 'pending') continue;
                if (new Date(reg.registeredAt) >= threeDaysAgo) continue;

                const leader = reg.members[0];
                await sendToAllMembers([leader], 'paymentNudge', {
                    name: leader.name,
                    eventTitle: event.title,
                    amount: reg.pricing?.total || event.price,
                    date: fmt(event.date),
                    time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
                    location: event.location
                });

                event.registrations[i].paymentNudgeSent = true;
                dirty = true;
            }

            if (dirty) {
                await Event.updateOne({ _id: event._id }, { $set: { registrations: event.registrations } });
            }
        }

        console.log('✅ Payment nudges done');
    } catch (err) {
        console.error('❌ Payment nudge job failed:', err);
    }
};

// ============================================
// RETRY FAILED EMAILS (every 2 hours)
// ============================================

const retryFailedEmails = async () => {
    try {
        const FailedEmail = require('../models/FailedEmail');
        const { sendEmail } = require('./notificationService');

        const pending = await FailedEmail.find({ status: 'pending', retryCount: { $lt: 3 } });
        if (pending.length === 0) return;

        console.log(`🔄 Retrying ${pending.length} failed email(s)...`);

        for (const record of pending) {
            let allSent = true;
            for (const email of record.recipients) {
                try {
                    await sendEmail(email, record.emailType, { ...record.data, name: record.data.name });
                    console.log(`✅ Retry sent to ${email} (${record.emailType})`);
                } catch (err) {
                    console.error(`❌ Retry failed for ${email}:`, err.message);
                    allSent = false;
                    record.lastError = err.message;
                }
            }

            record.retryCount += 1;
            record.lastRetryAt = new Date();
            record.status = allSent ? 'sent' : (record.retryCount >= 3 ? 'failed_permanently' : 'pending');
            await record.save();
        }
    } catch (err) {
        console.error('❌ Email retry job error:', err.message);
    }
};

// ============================================
// SCHEDULER (checks every minute)
// ============================================

const startScheduler = () => {
    console.log('🚀 Starting event scheduler...');

    setInterval(() => {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();

        if (h === 10 && m === 0) { console.log('⏰ Triggering 24h reminder job');   send24HourReminders(); }
        if (h === 11 && m === 0) { console.log('⏰ Triggering feedback job');        sendFeedbackRequests(); }
        if (h === 18 && m === 0) { console.log('⏰ Triggering payment nudge job');   sendPaymentReminders(); }

        // Retry failed emails every 2 hours (at :00 of even hours)
        if (m === 0 && h % 2 === 0) { retryFailedEmails(); }
    }, 60000);

    console.log('📅 24h reminders:    10:00 AM daily');
    console.log('📝 Feedback:         11:00 AM daily');
    console.log('💰 Payment nudges:    6:00 PM daily');
    console.log('🔄 Email retries:    Every 2 hours');
};

module.exports = {
    startScheduler,
    manualTriggers: { send24HourReminders, sendFeedbackRequests, sendPaymentReminders, retryFailedEmails }
};
