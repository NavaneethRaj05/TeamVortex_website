import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

/**
 * RazorpayCheckout Component
 * Handles Razorpay payment integration for event registrations
 * 
 * Props:
 * - eventId: MongoDB event ID
 * - eventTitle: Event title for display
 * - amount: Total amount to pay (in INR)
 * - userEmail: Registered user's email
 * - teamName: Team name (optional)
 * - registrationIndex: Index of registration in event.registrations array
 * - isPartialPayment: Boolean indicating if this is a partial payment
 * - multiEventGroupId: Group ID for multi-event registrations
 * - onSuccess: Callback when payment succeeds
 * - onFailure: Callback when payment fails
 * - onClose: Callback to close the checkout
 */
const RazorpayCheckout = ({
    eventId,
    eventTitle,
    amount,
    userEmail,
    teamName = '',
    registrationIndex,
    isPartialPayment = false,
    multiEventGroupId = null,
    onSuccess,
    onFailure,
    onClose
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed

    /**
     * Load Razorpay script dynamically
     */
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    /**
     * Handle payment initiation
     */
    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');
        setPaymentStatus('processing');

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
            }

            // Create order on backend
            const orderResponse = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    amount,
                    userEmail,
                    teamName,
                    registrationIndex,
                    isPartialPayment,
                    multiEventGroupId
                })
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.message || 'Failed to create payment order');
            }

            const { order, key } = await orderResponse.json();

            // Configure Razorpay options
            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: 'Team Vortex',
                description: `Payment for ${eventTitle}`,
                order_id: order.id,
                prefill: {
                    email: userEmail,
                    name: teamName || ''
                },
                theme: {
                    color: '#00D9FF' // Vortex blue
                },
                handler: async function (response) {
                    // Payment successful - verify on backend
                    await handlePaymentSuccess(response);
                },
                modal: {
                    ondismiss: function () {
                        // User closed the payment modal
                        setIsProcessing(false);
                        setPaymentStatus('idle');
                        setError('Payment cancelled by user');
                    }
                }
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                handlePaymentFailure(response.error);
            });
            razorpay.open();

        } catch (err) {
            console.error('Payment initiation error:', err);
            setError(err.message || 'Failed to initiate payment');
            setPaymentStatus('failed');
            setIsProcessing(false);
            
            if (onFailure) {
                onFailure(err);
            }
        }
    };

    /**
     * Handle successful payment
     */
    const handlePaymentSuccess = async (response) => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

            // Verify payment signature on backend
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature
                })
            });

            if (!verifyResponse.ok) {
                throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
                setPaymentStatus('success');
                setIsProcessing(false);
                
                // Call success callback
                if (onSuccess) {
                    onSuccess({
                        orderId: razorpay_order_id,
                        paymentId: razorpay_payment_id,
                        amount
                    });
                }
            } else {
                throw new Error('Payment verification failed');
            }

        } catch (err) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed. Please contact support.');
            setPaymentStatus('failed');
            setIsProcessing(false);
            
            if (onFailure) {
                onFailure(err);
            }
        }
    };

    /**
     * Handle payment failure
     */
    const handlePaymentFailure = (error) => {
        console.error('Payment failed:', error);
        setError(error.description || 'Payment failed. Please try again.');
        setPaymentStatus('failed');
        setIsProcessing(false);
        
        if (onFailure) {
            onFailure(error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            {isPartialPayment ? 'Pay Remaining Amount' : 'Complete Payment'}
                        </h3>
                        <p className="text-white/60 text-sm">{eventTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        disabled={isProcessing}
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                {/* Payment Status */}
                {paymentStatus === 'idle' && (
                    <div className="space-y-6">
                        {/* Amount Display */}
                        <div className="bg-gradient-to-br from-vortex-blue/20 to-purple-500/20 border border-vortex-blue/30 rounded-xl p-6 text-center">
                            <p className="text-white/70 text-sm mb-2">Amount to Pay</p>
                            <p className="text-4xl font-bold text-white">₹{amount}</p>
                            {isPartialPayment && (
                                <p className="text-yellow-400 text-sm mt-2">Remaining balance payment</p>
                            )}
                        </div>

                        {/* Payment Methods Info */}
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-white/70 text-sm mb-3">Accepted Payment Methods:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2 text-white/60">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    UPI (Google Pay, PhonePe)
                                </div>
                                <div className="flex items-center gap-2 text-white/60">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    Credit/Debit Cards
                                </div>
                                <div className="flex items-center gap-2 text-white/60">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    Net Banking
                                </div>
                                <div className="flex items-center gap-2 text-white/60">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    Wallets
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <span className="text-red-200 text-sm">{error}</span>
                            </div>
                        )}

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-vortex-blue to-purple-500 text-black font-bold hover:from-vortex-blue/80 hover:to-purple-500/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay ₹{amount}
                        </button>

                        {/* Security Note */}
                        <p className="text-white/40 text-xs text-center">
                            🔒 Secure payment powered by Razorpay
                        </p>
                    </div>
                )}

                {/* Processing State */}
                {paymentStatus === 'processing' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-vortex-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader className="w-8 h-8 text-vortex-blue animate-spin" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Processing Payment...</h4>
                        <p className="text-white/60 text-sm">Please do not close this window</p>
                    </div>
                )}

                {/* Success State */}
                {paymentStatus === 'success' && (
                    <div className="text-center py-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </motion.div>
                        <h4 className="text-lg font-bold text-white mb-2">Payment Successful!</h4>
                        <p className="text-white/60 text-sm mb-6">
                            Your payment of ₹{amount} has been confirmed
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* Failed State */}
                {paymentStatus === 'failed' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Payment Failed</h4>
                        <p className="text-white/60 text-sm mb-6">{error}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setPaymentStatus('idle');
                                    setError('');
                                }}
                                className="flex-1 px-6 py-2 bg-vortex-blue/20 text-vortex-blue rounded-lg hover:bg-vortex-blue/30 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-2 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default RazorpayCheckout;
