/**
 * Payment Gateway Service
 * Supports: Razorpay, Cashfree
 * 
 * To activate a gateway:
 *   Razorpay  → set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in .env
 *   Cashfree  → set CASHFREE_APP_ID + CASHFREE_SECRET_KEY in .env
 * 
 * ACTIVE_PAYMENT_GATEWAY controls which one is used at runtime.
 */

const GATEWAY = (process.env.ACTIVE_PAYMENT_GATEWAY || 'razorpay').toLowerCase();

// ─── Razorpay ─────────────────────────────────────────────────────────────────
const getRazorpayInstance = () => {
    const Razorpay = require('razorpay');
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    const instance = getRazorpayInstance();
    const order = await instance.orders.create({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt,
        notes,
    });
    return {
        gateway: 'razorpay',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        raw: order,
    };
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
    const crypto = require('crypto');
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
    return expected === signature;
};

const fetchRazorpayPayment = async (paymentId) => {
    const instance = getRazorpayInstance();
    return await instance.payments.fetch(paymentId);
};

const refundRazorpayPayment = async (paymentId, amount) => {
    const instance = getRazorpayInstance();
    return await instance.payments.refund(paymentId, {
        amount: Math.round(amount * 100),
    });
};

// ─── Cashfree ─────────────────────────────────────────────────────────────────
const getCashfreeHeaders = () => {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
        throw new Error('Cashfree credentials not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env');
    }
    return {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
    };
};

const CASHFREE_BASE = process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

const createCashfreeOrder = async ({ amount, currency = 'INR', orderId, customerName, customerEmail, customerPhone, returnUrl }) => {
    const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
    const res = await (await fetch(`${CASHFREE_BASE}/orders`, {
        method: 'POST',
        headers: getCashfreeHeaders(),
        body: JSON.stringify({
            order_id: orderId,
            order_amount: amount,
            order_currency: currency,
            customer_details: {
                customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, '_'),
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone || '9999999999',
            },
            order_meta: {
                return_url: returnUrl || `${process.env.FRONTEND_URL}/payment-callback?order_id={order_id}`,
            },
        }),
    })).json();

    if (res.message && res.message !== 'OK') throw new Error(res.message);

    return {
        gateway: 'cashfree',
        orderId: res.order_id,
        paymentSessionId: res.payment_session_id,
        amount: res.order_amount,
        currency: res.order_currency,
        appId: process.env.CASHFREE_APP_ID,
        env: process.env.CASHFREE_ENV || 'sandbox',
        raw: res,
    };
};

const verifyCashfreeSignature = ({ orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime, signature }) => {
    const crypto = require('crypto');
    const data = `${orderId}${orderAmount}${referenceId}${txStatus}${paymentMode}${txMsg}${txTime}`;
    const expected = crypto
        .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
        .update(data)
        .digest('base64');
    return expected === signature;
};

const fetchCashfreeOrder = async (orderId) => {
    const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
    return await (await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
        headers: getCashfreeHeaders(),
    })).json();
};

const refundCashfreePayment = async ({ orderId, refundId, amount, note = 'Refund' }) => {
    const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
    return await (await fetch(`${CASHFREE_BASE}/orders/${orderId}/refunds`, {
        method: 'POST',
        headers: getCashfreeHeaders(),
        body: JSON.stringify({
            refund_id: refundId,
            refund_amount: amount,
            refund_note: note,
        }),
    })).json();
};

// ─── Unified API ──────────────────────────────────────────────────────────────

/**
 * Create a payment order with the active gateway.
 * Returns a normalized object the frontend can use.
 */
const createOrder = async (params) => {
    if (GATEWAY === 'cashfree') return createCashfreeOrder(params);
    return createRazorpayOrder(params);
};

/**
 * Verify webhook/callback signature.
 */
const verifySignature = (params) => {
    if (GATEWAY === 'cashfree') return verifyCashfreeSignature(params);
    return verifyRazorpaySignature(params);
};

/**
 * Fetch payment details from gateway.
 */
const fetchPayment = async (id) => {
    if (GATEWAY === 'cashfree') return fetchCashfreeOrder(id);
    return fetchRazorpayPayment(id);
};

/**
 * Issue a refund.
 */
const refundPayment = async (params) => {
    if (GATEWAY === 'cashfree') return refundCashfreePayment(params);
    return refundRazorpayPayment(params.paymentId, params.amount);
};

/**
 * Returns which gateway is currently active.
 */
const getActiveGateway = () => GATEWAY;

/**
 * Returns whether a gateway is configured (env vars present).
 */
const getGatewayStatus = () => ({
    razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    cashfree: !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY),
    active: GATEWAY,
});

module.exports = {
    createOrder,
    verifySignature,
    fetchPayment,
    refundPayment,
    getActiveGateway,
    getGatewayStatus,
    // Expose individual gateway functions for direct use if needed
    razorpay: { createOrder: createRazorpayOrder, verifySignature: verifyRazorpaySignature, fetchPayment: fetchRazorpayPayment, refundPayment: refundRazorpayPayment },
    cashfree: { createOrder: createCashfreeOrder, verifySignature: verifyCashfreeSignature, fetchOrder: fetchCashfreeOrder, refundPayment: refundCashfreePayment },
};
