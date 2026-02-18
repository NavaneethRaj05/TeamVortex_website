const Razorpay = require('razorpay');
const crypto = require('crypto');

// ============================================
// RAZORPAY SERVICE - PAYMENT INTEGRATION
// ============================================

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order details
 * @param {Number} orderData.amount - Amount in INR (will be converted to paise)
 * @param {String} orderData.currency - Currency code (default: INR)
 * @param {String} orderData.receipt - Unique receipt ID
 * @param {Object} orderData.notes - Additional notes/metadata
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (orderData) => {
    try {
        const { amount, currency = 'INR', receipt, notes = {} } = orderData;

        // Validate amount
        if (!amount || amount <= 0) {
            throw new Error('Invalid amount. Amount must be greater than 0');
        }

        // Convert amount to paise (Razorpay requires amount in smallest currency unit)
        const amountInPaise = Math.round(amount * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt,
            notes,
            payment_capture: 1 // Auto-capture payment
        };

        const order = await razorpay.orders.create(options);
        console.log('✅ Razorpay order created:', order.id);
        
        return {
            success: true,
            order
        };
    } catch (error) {
        console.error('❌ Error creating Razorpay order:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Verify Razorpay payment signature
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Razorpay signature
 * @returns {Boolean} True if signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    try {
        const text = `${orderId}|${paymentId}`;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        const isValid = generatedSignature === signature;
        
        if (isValid) {
            console.log('✅ Payment signature verified successfully');
        } else {
            console.error('❌ Payment signature verification failed');
        }
        
        return isValid;
    } catch (error) {
        console.error('❌ Error verifying payment signature:', error);
        return false;
    }
};

/**
 * Fetch payment details from Razorpay
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const fetchPayment = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        console.log('✅ Payment details fetched:', paymentId);
        return {
            success: true,
            payment
        };
    } catch (error) {
        console.error('❌ Error fetching payment:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Initiate a refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Number} amount - Amount to refund in INR (optional, full refund if not provided)
 * @param {Object} notes - Additional notes for refund
 * @returns {Promise<Object>} Refund details
 */
const createRefund = async (paymentId, amount = null, notes = {}) => {
    try {
        const options = {
            notes
        };

        // If amount is specified, convert to paise
        if (amount) {
            options.amount = Math.round(amount * 100);
        }

        const refund = await razorpay.payments.refund(paymentId, options);
        console.log('✅ Refund initiated:', refund.id);
        
        return {
            success: true,
            refund
        };
    } catch (error) {
        console.error('❌ Error creating refund:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Fetch refund details
 * @param {String} refundId - Razorpay refund ID
 * @returns {Promise<Object>} Refund details
 */
const fetchRefund = async (refundId) => {
    try {
        const refund = await razorpay.refunds.fetch(refundId);
        console.log('✅ Refund details fetched:', refundId);
        return {
            success: true,
            refund
        };
    } catch (error) {
        console.error('❌ Error fetching refund:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Calculate partial payment deadline
 * @param {Number} hours - Hours from now (default: 72 hours)
 * @returns {Date} Deadline date
 */
const calculatePartialPaymentDeadline = (hours = 72) => {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);
    return deadline;
};

/**
 * Check if payment is overdue
 * @param {Date} deadline - Payment deadline
 * @returns {Boolean} True if overdue
 */
const isPaymentOverdue = (deadline) => {
    return new Date() > new Date(deadline);
};

/**
 * Calculate refund amount based on policy
 * @param {Number} totalAmount - Total payment amount
 * @param {Date} eventDate - Event date
 * @returns {Object} Refund details
 */
const calculateRefundAmount = (totalAmount, eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    const daysUntilEvent = Math.ceil((event - now) / (1000 * 60 * 60 * 24));

    let refundPercent = 0;
    let reason = '';

    if (daysUntilEvent >= 7) {
        refundPercent = 100;
        reason = 'Full refund (7+ days before event)';
    } else if (daysUntilEvent >= 3) {
        refundPercent = 50;
        reason = '50% refund (3-6 days before event)';
    } else {
        refundPercent = 0;
        reason = 'No refund (less than 3 days before event)';
    }

    const refundAmount = (totalAmount * refundPercent) / 100;

    return {
        refundPercent,
        refundAmount,
        reason,
        daysUntilEvent
    };
};

module.exports = {
    razorpay,
    createOrder,
    verifyPaymentSignature,
    fetchPayment,
    createRefund,
    fetchRefund,
    calculatePartialPaymentDeadline,
    isPaymentOverdue,
    calculateRefundAmount
};
