import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

/**
 * PaymentCallback — handles redirect-based payment returns (Cashfree, etc.)
 * Route: /payment-callback
 */
const PaymentCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying | success | failed

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order_id');
        const eventId = params.get('event_id') || sessionStorage.getItem('pending_payment_event');
        const email = params.get('email') || sessionStorage.getItem('pending_payment_email');

        if (!orderId) {
            setStatus('failed');
            return;
        }

        // Verify with backend
        fetch(`${API_BASE_URL}/api/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gateway: 'cashfree', eventId, registrationEmail: email, orderId }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                    sessionStorage.removeItem('pending_payment_event');
                    sessionStorage.removeItem('pending_payment_email');
                    setTimeout(() => navigate('/contests'), 3000);
                } else {
                    setStatus('failed');
                }
            })
            .catch(() => setStatus('failed'));
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card p-10 max-w-md w-full text-center space-y-6">
                {status === 'verifying' && (
                    <>
                        <Loader className="w-16 h-16 text-vortex-blue mx-auto animate-spin" />
                        <h2 className="text-2xl font-bold text-white">Verifying Payment...</h2>
                        <p className="text-white/60">Please wait while we confirm your payment.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                        <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                        <p className="text-white/60">Your registration is confirmed. Redirecting...</p>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                        <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
                        <p className="text-white/60">Something went wrong. Please try again or contact support.</p>
                        <button onClick={() => navigate('/contests')}
                            className="glass-button text-vortex-blue border border-vortex-blue/30 px-6 py-2">
                            Back to Events
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;
