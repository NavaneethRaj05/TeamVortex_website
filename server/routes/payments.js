/**
 * Payment Gateway Routes
 * 
 * POST /api/payments/create-order       → Create order (Razorpay or Cashfree)
 * POST /api/payments/verify             → Verify payment after callback
 * POST /api/payments/webhook/razorpay   → Razorpay webhook
 * POST /api/payments/webhook/cashfree   → Cashfree webhook
 * POST /api/payments/refund             → Issue refund (admin only)
 * GET  /api/payments/status             → Gateway config status
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Event = require('../models/Event');
const { createOrder, verifySignature, fetchPayment, refundPayment, getGatewayStatus } = require('../utils/paymentService');

// ─── Create Order ─────────────────────────────────────────────────────────────
// Called after registration to initiate online payment
router.post('/create-order', async (req, res) => {
    try {
        const { eventId, registrationId, customerName, customerEmail, customerPhone } = req.body;

        if (!eventId || !customerEmail) {
            return res.status(400).json({ message: 'eventId and customerEmail are required' });
        }

        const event = await Event.findById(eventId).select('title price gstEnabled gstPercent');
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const baseAmount = event.price;
        const totalAmount = event.gstEnabled
            ? Math.round(baseAmount * (1 + (event.gstPercent || 18) / 100))
            : baseAmount;

        const receipt = `tvx_${eventId.slice(-6)}_${Date.now()}`;

        const order = await createOrder({
            amount: totalAmount,
            currency: 'INR',
            orderId: receipt,
            receipt,
            customerName: customerName || 'Participant',
            customerEmail,
            customerPhone,
            notes: { eventId, eventTitle: event.title, registrationId: registrationId || '' },
            returnUrl: `${process.env.FRONTEND_URL || ''}/payment-callback`,
        });

        res.json({ success: true, order });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── Verify Payment ───────────────────────────────────────────────────────────
// Called from frontend after payment completes
router.post('/verify', async (req, res) => {
    try {
        const { eventId, registrationEmail, gateway, ...signatureParams } = req.body;

        const isValid = verifySignature(signatureParams);
        if (!isValid) {
            return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
        }

        // Update registration payment status
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const reg = event.registrations.find(r =>
            r.members.some(m => m.email.toLowerCase() === registrationEmail.toLowerCase())
        );

        if (reg) {
            reg.paymentStatus = 'full_paid';
            reg.registrationStatus = 'confirmed';
            reg.paid = true;
            reg.paymentId = signatureParams.paymentId || signatureParams.referenceId || '';
            await event.save();
        }

        res.json({ success: true, message: 'Payment verified successfully' });
    } catch (err) {
        console.error('Verify payment error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── Razorpay Webhook ─────────────────────────────────────────────────────────
router.post('/webhook/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (webhookSecret) {
            const signature = req.headers['x-razorpay-signature'];
            const body = req.body.toString();
            const expected = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');
            if (expected !== signature) {
                return res.status(400).json({ message: 'Invalid webhook signature' });
            }
        }

        const payload = JSON.parse(req.body.toString());
        const event = payload.event;
        const paymentEntity = payload.payload?.payment?.entity;

        console.log('Razorpay webhook:', event, paymentEntity?.id);

        if (event === 'payment.captured' && paymentEntity) {
            const { notes } = paymentEntity;
            if (notes?.eventId) {
                const dbEvent = await Event.findById(notes.eventId);
                if (dbEvent) {
                    const reg = dbEvent.registrations.find(r =>
                        r.members.some(m => m.email.toLowerCase() === (notes.email || '').toLowerCase())
                    );
                    if (reg) {
                        reg.paymentStatus = 'full_paid';
                        reg.registrationStatus = 'confirmed';
                        reg.paid = true;
                        reg.paymentId = paymentEntity.id;
                        await dbEvent.save();
                    }
                }
            }
        }

        res.json({ status: 'ok' });
    } catch (err) {
        console.error('Razorpay webhook error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── Cashfree Webhook ─────────────────────────────────────────────────────────
router.post('/webhook/cashfree', async (req, res) => {
    try {
        const { data, type } = req.body;
        console.log('Cashfree webhook:', type, data?.order?.order_id);

        if (type === 'PAYMENT_SUCCESS_WEBHOOK' && data?.order) {
            const orderId = data.order.order_id;
            // orderId format: tvx_{eventId6chars}_{timestamp}
            // Look up event by matching receipt in registrations or use notes
            const payment = data.payment;
            console.log('Cashfree payment success:', orderId, payment?.cf_payment_id);
            // TODO: match to registration via orderId stored at create-order time
        }

        res.json({ status: 'ok' });
    } catch (err) {
        console.error('Cashfree webhook error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── Refund (Admin) ───────────────────────────────────────────────────────────
router.post('/refund', async (req, res) => {
    try {
        const { paymentId, orderId, amount, reason, eventId, registrationId } = req.body;
        if (!amount) return res.status(400).json({ message: 'amount is required' });

        const result = await refundPayment({ paymentId, orderId, amount, refundId: `ref_${Date.now()}`, note: reason || 'Admin refund' });

        // Update registration status
        if (eventId && registrationId) {
            const event = await Event.findById(eventId);
            if (event) {
                const reg = event.registrations.id(registrationId);
                if (reg) {
                    reg.paymentStatus = 'refunded';
                    reg.adminActions.push({ action: 'refund', amount, reason: reason || 'Admin refund', performedBy: 'admin', timestamp: new Date() });
                    await event.save();
                }
            }
        }

        res.json({ success: true, refund: result });
    } catch (err) {
        console.error('Refund error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── Gateway Status ───────────────────────────────────────────────────────────
router.get('/status', (req, res) => {
    res.json(getGatewayStatus());
});

module.exports = router;
