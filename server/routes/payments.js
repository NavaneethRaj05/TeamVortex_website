const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const PaymentLog = require('../models/PaymentLog');
const { 
    createOrder, 
    verifyPaymentSignature, 
    fetchPayment,
    createRefund,
    calculatePartialPaymentDeadline,
    calculateRefundAmount
} = require('../utils/razorpayService');
const { sendNotification } = require('../utils/notificationService');

// ============================================
// RAZORPAY PAYMENT ROUTES
// ============================================

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a Razorpay order for event registration
 * @access  Public
 */
router.post('/create-order', async (req, res) => {
    try {
        const { 
            eventId, 
            amount, 
            userEmail, 
            teamName,
            registrationIndex,
            isPartialPayment = false,
            multiEventGroupId = null
        } = req.body;

        // Validate required fields
        if (!eventId || !amount || !userEmail) {
            return res.status(400).json({ 
                message: 'Event ID, amount, and user email are required' 
            });
        }

        // Fetch event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Generate unique receipt ID
        const receipt = `rcpt_${eventId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create order notes
        const notes = {
            eventId,
            eventTitle: event.title,
            userEmail,
            teamName: teamName || 'N/A',
            isPartialPayment: isPartialPayment.toString(),
            multiEventGroupId: multiEventGroupId || 'N/A',
            registrationIndex: registrationIndex !== undefined ? registrationIndex.toString() : 'N/A'
        };

        // Create Razorpay order
        const orderResult = await createOrder({
            amount,
            currency: 'INR',
            receipt,
            notes
        });

        if (!orderResult.success) {
            return res.status(500).json({ 
                message: 'Failed to create payment order',
                error: orderResult.error
            });
        }

        // Log order creation
        console.log(`✅ Order created for ${userEmail}: ${orderResult.order.id} (₹${amount})`);

        res.json({
            success: true,
            order: orderResult.order,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({ 
            message: 'Server error while creating order',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Razorpay webhook for payment verification
 * @access  Public (but signature verified)
 */
router.post('/webhook', async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookBody = JSON.stringify(req.body);

        // Verify webhook signature
        const expectedSignature = require('crypto')
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(webhookBody)
            .digest('hex');

        if (webhookSignature !== expectedSignature) {
            console.error('❌ Invalid webhook signature');
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload.payment.entity;

        console.log(`📥 Webhook received: ${event}`);

        // Handle payment.captured event
        if (event === 'payment.captured') {
            await handlePaymentCaptured(payload);
        }

        // Handle payment.failed event
        if (event === 'payment.failed') {
            await handlePaymentFailed(payload);
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
});

/**
 * Handle successful payment capture
 */
const handlePaymentCaptured = async (payment) => {
    try {
        const { id: paymentId, order_id: orderId, amount, method, notes } = payment;
        const amountInINR = amount / 100; // Convert paise to INR

        console.log(`✅ Payment captured: ${paymentId} (₹${amountInINR})`);

        // Extract event and user details from notes
        const eventId = notes.eventId;
        const userEmail = notes.userEmail;
        const isPartialPayment = notes.isPartialPayment === 'true';
        const multiEventGroupId = notes.multiEventGroupId !== 'N/A' ? notes.multiEventGroupId : null;

        // Fetch event
        const event = await Event.findById(eventId);
        if (!event) {
            console.error(`❌ Event not found: ${eventId}`);
            return;
        }

        // Find registration by email or multiEventGroupId
        let registration;
        let registrationIndex;

        if (multiEventGroupId) {
            registrationIndex = event.registrations.findIndex(
                reg => reg.multiEventGroupId === multiEventGroupId
            );
        } else {
            registrationIndex = event.registrations.findIndex(
                reg => reg.members[0]?.email?.toLowerCase() === userEmail.toLowerCase()
            );
        }

        if (registrationIndex === -1) {
            console.error(`❌ Registration not found for ${userEmail}`);
            return;
        }

        registration = event.registrations[registrationIndex];

        // Add payment to history
        registration.payments.push({
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            amount: amountInINR,
            currency: 'INR',
            method,
            status: 'captured',
            timestamp: new Date()
        });

        // Update payment summary
        registration.amountPaid = (registration.amountPaid || 0) + amountInINR;
        registration.amountDue = (registration.totalAmount || 0) - registration.amountPaid;

        // Update payment status
        if (registration.amountDue <= 0) {
            registration.paymentStatus = 'full_paid';
            registration.registrationStatus = 'confirmed';
            registration.paid = true;
        } else if (registration.amountPaid > 0) {
            registration.paymentStatus = 'partial';
            registration.registrationStatus = 'pending';
            // Set partial payment deadline if not already set
            if (!registration.partialPaymentDeadline) {
                registration.partialPaymentDeadline = calculatePartialPaymentDeadline(72);
            }
        }

        // Check for overpayment
        if (registration.amountPaid > registration.totalAmount) {
            registration.paymentStatus = 'overpaid';
        }

        await event.save();

        // Create payment log
        await PaymentLog.create({
            eventId: event._id,
            registrationIndex,
            teamName: registration.teamName,
            leadEmail: userEmail,
            action: 'payment_captured',
            previousStatus: 'pending',
            newStatus: registration.paymentStatus,
            amount: amountInINR,
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId
        });

        // Send notification
        const primaryMember = registration.members[0];
        const notificationData = {
            name: primaryMember.name,
            eventTitle: event.title,
            amount: amountInINR,
            date: new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
            location: event.location
        };

        if (registration.paymentStatus === 'full_paid') {
            // Send payment approved email
            await sendNotification(
                ['email'],
                { email: userEmail },
                'paymentApproved',
                notificationData
            );
        } else if (registration.paymentStatus === 'partial') {
            // Send partial payment confirmation
            notificationData.amountDue = registration.amountDue;
            notificationData.deadline = registration.partialPaymentDeadline;
            await sendNotification(
                ['email'],
                { email: userEmail },
                'registrationConfirmation',
                { ...notificationData, paymentPending: true }
            );
        }

        console.log(`✅ Payment processed successfully for ${userEmail}`);

    } catch (error) {
        console.error('❌ Error handling payment capture:', error);
    }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (payment) => {
    try {
        const { id: paymentId, order_id: orderId, notes, error_description } = payment;

        console.log(`❌ Payment failed: ${paymentId} - ${error_description}`);

        const userEmail = notes.userEmail;
        const eventId = notes.eventId;

        // Log failed payment
        await PaymentLog.create({
            eventId,
            leadEmail: userEmail,
            action: 'payment_failed',
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId,
            notes: error_description
        });

        // Optionally send failure notification
        // await sendNotification(['email'], { email: userEmail }, 'paymentFailed', { reason: error_description });

    } catch (error) {
        console.error('❌ Error handling payment failure:', error);
    }
};

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment signature (frontend callback)
 * @access  Public
 */
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification data' });
        }

        // Verify signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ 
                success: false,
                message: 'Payment verification failed' 
            });
        }

        res.json({
            success: true,
            message: 'Payment verified successfully'
        });

    } catch (error) {
        console.error('❌ Error verifying payment:', error);
        res.status(500).json({ 
            message: 'Server error during payment verification',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/payments/refund
 * @desc    Initiate a refund
 * @access  Admin only (add auth middleware)
 */
router.post('/refund', async (req, res) => {
    try {
        const { paymentId, amount, reason, eventId, userEmail } = req.body;

        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        // Create refund
        const refundResult = await createRefund(paymentId, amount, { reason });

        if (!refundResult.success) {
            return res.status(500).json({ 
                message: 'Failed to create refund',
                error: refundResult.error
            });
        }

        // Update event registration
        if (eventId && userEmail) {
            const event = await Event.findById(eventId);
            if (event) {
                const registrationIndex = event.registrations.findIndex(
                    reg => reg.members[0]?.email?.toLowerCase() === userEmail.toLowerCase()
                );

                if (registrationIndex !== -1) {
                    const registration = event.registrations[registrationIndex];
                    
                    // Update payment status
                    registration.paymentStatus = 'refunded';
                    registration.registrationStatus = 'cancelled';

                    // Add refund to payment history
                    const paymentEntry = registration.payments.find(p => p.razorpayPaymentId === paymentId);
                    if (paymentEntry) {
                        paymentEntry.refundId = refundResult.refund.id;
                        paymentEntry.refundAmount = refundResult.refund.amount / 100;
                        paymentEntry.refundReason = reason;
                        paymentEntry.status = 'refunded';
                    }

                    // Add admin action
                    registration.adminActions.push({
                        action: 'refund',
                        reason,
                        amount: refundResult.refund.amount / 100,
                        timestamp: new Date()
                    });

                    await event.save();

                    // Log refund
                    await PaymentLog.create({
                        eventId: event._id,
                        registrationIndex,
                        teamName: registration.teamName,
                        leadEmail: userEmail,
                        action: 'refund_initiated',
                        amount: refundResult.refund.amount / 100,
                        razorpayPaymentId: paymentId,
                        notes: reason
                    });
                }
            }
        }

        res.json({
            success: true,
            refund: refundResult.refund,
            message: 'Refund initiated successfully'
        });

    } catch (error) {
        console.error('❌ Error creating refund:', error);
        res.status(500).json({ 
            message: 'Server error while creating refund',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/payments/status/:eventId/:email
 * @desc    Get payment status for a registration
 * @access  Public
 */
router.get('/status/:eventId/:email', async (req, res) => {
    try {
        const { eventId, email } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const registration = event.registrations.find(
            reg => reg.members[0]?.email?.toLowerCase() === email.toLowerCase()
        );

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.json({
            paymentStatus: registration.paymentStatus,
            registrationStatus: registration.registrationStatus,
            totalAmount: registration.totalAmount || 0,
            amountPaid: registration.amountPaid || 0,
            amountDue: registration.amountDue || 0,
            payments: registration.payments,
            partialPaymentDeadline: registration.partialPaymentDeadline
        });

    } catch (error) {
        console.error('❌ Error fetching payment status:', error);
        res.status(500).json({ 
            message: 'Server error while fetching payment status',
            error: error.message
        });
    }
});

module.exports = router;
