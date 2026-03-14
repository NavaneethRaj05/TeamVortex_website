/**
 * Frontend Payment Gateway Utility
 * 
 * Handles both Razorpay and Cashfree checkout flows.
 * The backend tells us which gateway is active via /api/payments/create-order response.
 * 
 * Usage:
 *   import { initiateOnlinePayment } from '../utils/paymentGateway';
 *   await initiateOnlinePayment({ eventId, amount, userEmail, userName, userPhone, onSuccess, onFailure });
 */

import API_BASE_URL from '../apiConfig';

/**
 * Dynamically load Razorpay checkout script.
 */
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

/**
 * Dynamically load Cashfree checkout script.
 */
const loadCashfreeScript = (env = 'sandbox') =>
    new Promise((resolve) => {
        if (window.Cashfree) return resolve(true);
        const script = document.createElement('script');
        script.src = env === 'production'
            ? 'https://sdk.cashfree.com/js/v3/cashfree.js'
            : 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

/**
 * Open Razorpay checkout modal.
 */
const openRazorpay = async ({ order, eventId, userEmail, userName, userPhone, onSuccess, onFailure }) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) return onFailure('Failed to load Razorpay. Please check your internet connection.');

    const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Team Vortex',
        description: 'Event Registration',
        order_id: order.orderId,
        prefill: {
            name: userName || '',
            email: userEmail || '',
            contact: userPhone || '',
        },
        theme: { color: '#00d4ff' },
        handler: async (response) => {
            try {
                // Verify on backend
                const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gateway: 'razorpay',
                        eventId,
                        registrationEmail: userEmail,
                        orderId: response.razorpay_order_id,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                    }),
                });
                const data = await verifyRes.json();
                if (verifyRes.ok) onSuccess(data);
                else onFailure(data.message || 'Verification failed');
            } catch (err) {
                onFailure('Payment verification error: ' + err.message);
            }
        },
        modal: {
            ondismiss: () => onFailure('Payment cancelled'),
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
        onFailure(response.error?.description || 'Payment failed');
    });
    rzp.open();
};

/**
 * Open Cashfree checkout.
 */
const openCashfree = async ({ order, eventId, userEmail, onSuccess, onFailure }) => {
    const loaded = await loadCashfreeScript(order.env);
    if (!loaded) return onFailure('Failed to load Cashfree. Please check your internet connection.');

    try {
        const cashfree = window.Cashfree({ mode: order.env === 'production' ? 'production' : 'sandbox' });
        const result = await cashfree.checkout({
            paymentSessionId: order.paymentSessionId,
            redirectTarget: '_modal',
        });

        if (result.error) return onFailure(result.error.message || 'Payment failed');
        if (result.paymentDetails) {
            // Verify on backend
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gateway: 'cashfree',
                    eventId,
                    registrationEmail: userEmail,
                    orderId: order.orderId,
                    referenceId: result.paymentDetails.paymentMessage,
                }),
            });
            const data = await verifyRes.json();
            if (verifyRes.ok) onSuccess(data);
            else onFailure(data.message || 'Verification failed');
        }
    } catch (err) {
        onFailure('Cashfree checkout error: ' + err.message);
    }
};

/**
 * Main entry point — creates order then opens the appropriate gateway.
 * 
 * @param {object} params
 * @param {string} params.eventId
 * @param {number} params.amount
 * @param {string} params.userEmail
 * @param {string} params.userName
 * @param {string} params.userPhone
 * @param {string} [params.registrationId]
 * @param {function} params.onSuccess  - called with server response on success
 * @param {function} params.onFailure  - called with error message string on failure
 */
export const initiateOnlinePayment = async ({
    eventId, amount, userEmail, userName, userPhone,
    registrationId, onSuccess, onFailure,
}) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, registrationId, customerName: userName, customerEmail: userEmail, customerPhone: userPhone }),
        });
        const data = await res.json();
        if (!res.ok) return onFailure(data.message || 'Failed to create payment order');

        const { order } = data;

        if (order.gateway === 'cashfree') {
            await openCashfree({ order, eventId, userEmail, onSuccess, onFailure });
        } else {
            await openRazorpay({ order, eventId, userEmail, userName, userPhone, onSuccess, onFailure });
        }
    } catch (err) {
        onFailure('Payment initiation error: ' + err.message);
    }
};

/**
 * Check which gateway is active (for UI display).
 */
export const getGatewayStatus = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/payments/status`);
        return await res.json();
    } catch {
        return { active: 'none', razorpay: false, cashfree: false };
    }
};
