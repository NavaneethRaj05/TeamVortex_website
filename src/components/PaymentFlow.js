import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode, Copy, Check, Upload, X, ArrowRight, ArrowLeft,
    Phone, Building2, Wallet, Clock, AlertCircle, CheckCircle,
    Image as ImageIcon, CreditCard, Banknote
} from 'lucide-react';
import API_BASE_URL from '../apiConfig';



/**
 * PaymentFlow Component
 * A 3-step payment flow: Payment Info → Proof Upload → Confirmation
 * 
 * Props:
 * - eventId: MongoDB event ID
 * - eventTitle: Event title for display
 * - amount: Total amount to pay
 * - paymentInfo: Object containing UPI ID, QR code, bank details, etc.
 * - userEmail: Registered user's email
 * - onComplete: Callback when payment proof submitted
 * - onCancel: Callback to cancel payment flow
 */
const PaymentFlow = ({
    eventId,
    eventTitle,
    amount,
    paymentInfo,
    userEmail,
    onComplete,
    onCancel
}) => {
    const [step, setStep] = useState(1); // 1: Payment Info, 2: Upload Proof, 3: Confirmation
    const [copied, setCopied] = useState(false);
    const [activePaymentTab, setActivePaymentTab] = useState('upi');
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Form fields for proof upload
    const [proofData, setProofData] = useState({
        utrNumber: '',
        transactionDate: new Date().toISOString().split('T')[0],
        amountPaid: amount || '',
        paidFrom: '',
        userNotes: ''
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file (PNG, JPG, etc.)');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setError('');
            setScreenshot(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setScreenshotPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProof = async () => {
        if (!screenshot) {
            setError('Please upload a payment screenshot');
            return;
        }
        if (!proofData.utrNumber.trim()) {
            setError('Please enter the UTR/Transaction ID');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            console.log('Submitting payment proof to:', `${API_BASE_URL}/api/events/${eventId}/submit-payment-proof`);
            console.log('API_BASE_URL:', API_BASE_URL);
            console.log('Event ID:', eventId);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/submit-payment-proof`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    screenshotData: screenshotPreview,
                    utrNumber: proofData.utrNumber,
                    transactionDate: proofData.transactionDate,
                    amountPaid: parseFloat(proofData.amountPaid) || amount,
                    paidFrom: proofData.paidFrom,
                    userNotes: proofData.userNotes
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If not JSON, get text response for debugging
                const textResponse = await response.text();
                console.error('Non-JSON response:', textResponse);
                
                // Check if it's an HTML error page
                if (textResponse.includes('<!DOCTYPE') || textResponse.includes('<html>')) {
                    throw new Error('Server is not responding properly. Please check if the backend is running and try again.');
                } else {
                    throw new Error(`Server returned unexpected response: ${textResponse.substring(0, 100)}...`);
                }
            }

            if (!response.ok) {
                throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
            }

            setStep(3); // Move to confirmation
        } catch (err) {
            console.error('Payment proof submission error:', err);
            
            if (err.name === 'AbortError') {
                setError('Request timed out. Please check your internet connection and try again.');
            } else if (err.message.includes('Failed to fetch')) {
                setError('Network error. Please check your internet connection and ensure the server is running.');
            } else {
                setError(err.message || 'Failed to submit payment proof. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const slideVariants = {
        enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
    };

    // Step 1: Payment Information Display
    const PaymentScreen = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Complete Your Payment</h3>
                <p className="text-gray-400">Pay ₹{amount} for {eventTitle}</p>
            </div>

            {/* Payment Method Tabs (for Offline mode with multiple options) */}
            {paymentInfo?.paymentGateway === 'Offline' && paymentInfo?.offlineMethods?.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {paymentInfo.offlineMethods.includes('upi') && (
                        <button
                            onClick={() => setActivePaymentTab('upi')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activePaymentTab === 'upi'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Phone size={16} /> UPI
                        </button>
                    )}
                    {paymentInfo.offlineMethods.includes('bank') && (
                        <button
                            onClick={() => setActivePaymentTab('bank')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activePaymentTab === 'bank'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Building2 size={16} /> Bank Transfer
                        </button>
                    )}
                    {paymentInfo.offlineMethods.includes('cash') && (
                        <button
                            onClick={() => setActivePaymentTab('cash')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activePaymentTab === 'cash'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Banknote size={16} /> Cash
                        </button>
                    )}
                </div>
            )}

            {/* UPI Payment */}
            {(paymentInfo?.paymentGateway === 'UPI' || activePaymentTab === 'upi') && (
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/20">
                    <div className="flex flex-col items-center">
                        {/* QR Code */}
                        {paymentInfo?.upiQrCode ? (
                            <div className="bg-white p-4 rounded-xl mb-4">
                                <img
                                    src={paymentInfo.upiQrCode}
                                    alt="UPI QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                        ) : (
                            <div className="bg-white/10 p-4 rounded-xl mb-4 flex items-center justify-center w-48 h-48">
                                <QrCode size={64} className="text-gray-400" />
                            </div>
                        )}

                        {/* UPI ID */}
                        {paymentInfo?.upiId && (
                            <div className="w-full">
                                <p className="text-gray-400 text-sm mb-2 text-center">Or pay using UPI ID:</p>
                                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-3">
                                    <Wallet size={18} className="text-purple-400" />
                                    <span className="flex-1 font-mono text-white">{paymentInfo.upiId}</span>
                                    <button
                                        onClick={() => copyToClipboard(paymentInfo.upiId)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {paymentInfo?.paymentReceiverName && (
                            <p className="text-gray-400 text-sm mt-3">
                                Pay to: <span className="text-white">{paymentInfo.paymentReceiverName}</span>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Bank Transfer */}
            {activePaymentTab === 'bank' && paymentInfo?.bankDetails && (
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/20 space-y-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                        <Building2 size={18} /> Bank Transfer Details
                    </h4>
                    <div className="grid gap-3 text-sm">
                        {paymentInfo.bankDetails.bankName && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Bank Name:</span>
                                <span className="text-white font-medium">{paymentInfo.bankDetails.bankName}</span>
                            </div>
                        )}
                        {paymentInfo.bankDetails.accountName && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Account Name:</span>
                                <span className="text-white font-medium">{paymentInfo.bankDetails.accountName}</span>
                            </div>
                        )}
                        {paymentInfo.bankDetails.accountNumber && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Account No:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono">{paymentInfo.bankDetails.accountNumber}</span>
                                    <button onClick={() => copyToClipboard(paymentInfo.bankDetails.accountNumber)} className="p-1 hover:bg-white/10 rounded">
                                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {paymentInfo.bankDetails.ifscCode && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">IFSC Code:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono">{paymentInfo.bankDetails.ifscCode}</span>
                                    <button onClick={() => copyToClipboard(paymentInfo.bankDetails.ifscCode)} className="p-1 hover:bg-white/10 rounded">
                                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {paymentInfo.bankDetails.branchName && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Branch:</span>
                                <span className="text-white">{paymentInfo.bankDetails.branchName}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cash Payment */}
            {activePaymentTab === 'cash' && paymentInfo?.cashDetails && (
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/20 space-y-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                        <Banknote size={18} /> Cash Payment Details
                    </h4>
                    <div className="grid gap-3 text-sm">
                        {paymentInfo.cashDetails.location && (
                            <div>
                                <span className="text-gray-400">Location:</span>
                                <p className="text-white mt-1">{paymentInfo.cashDetails.location}</p>
                            </div>
                        )}
                        {paymentInfo.cashDetails.timings && (
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" />
                                <span className="text-white">{paymentInfo.cashDetails.timings}</span>
                            </div>
                        )}
                        {paymentInfo.cashDetails.contactPerson && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Contact Person:</span>
                                <span className="text-white">{paymentInfo.cashDetails.contactPerson}</span>
                            </div>
                        )}
                        {paymentInfo.cashDetails.contactPhone && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Phone:</span>
                                <a href={`tel:${paymentInfo.cashDetails.contactPhone}`} className="text-purple-400 hover:underline">
                                    {paymentInfo.cashDetails.contactPhone}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Instructions */}
            {paymentInfo?.offlineInstructions && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-200 text-sm whitespace-pre-wrap">{paymentInfo.offlineInstructions}</p>
                </div>
            )}

            {/* Amount Badge */}
            <div className="flex justify-center">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-6 py-3">
                    <span className="text-green-400 font-bold text-lg">Pay Exactly: ₹{amount}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                >
                    I Have Paid <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );

    // Step 2: Proof Upload
    const ProofUploadScreen = () => (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Upload Payment Proof</h3>
                <p className="text-gray-400">Upload screenshot and enter transaction details</p>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-400" />
                    <span className="text-red-200 text-sm">{error}</span>
                </div>
            )}

            {/* Screenshot Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Screenshot *
                </label>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {screenshotPreview ? (
                    <div className="relative bg-black/40 rounded-xl p-4">
                        <img
                            src={screenshotPreview}
                            alt="Payment screenshot"
                            className="max-h-64 mx-auto rounded-lg"
                        />
                        <button
                            onClick={() => {
                                setScreenshot(null);
                                setScreenshotPreview(null);
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                        >
                            <X size={16} className="text-white" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-8 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-500/50 hover:bg-white/5 transition-all flex flex-col items-center gap-3"
                    >
                        <div className="p-4 bg-purple-500/20 rounded-full">
                            <ImageIcon size={32} className="text-purple-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-medium">Click to upload screenshot</p>
                            <p className="text-gray-400 text-sm">PNG, JPG up to 5MB</p>
                        </div>
                    </button>
                )}
            </div>

            {/* UTR/Transaction ID */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    UTR / Transaction ID *
                </label>
                <input
                    type="text"
                    value={proofData.utrNumber}
                    onChange={(e) => setProofData({ ...proofData, utrNumber: e.target.value })}
                    placeholder="Enter 12-digit UTR number"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
            </div>

            {/* Transaction Date */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction Date
                </label>
                <input
                    type="date"
                    value={proofData.transactionDate}
                    onChange={(e) => setProofData({ ...proofData, transactionDate: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                />
            </div>

            {/* Amount Paid */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount Paid (₹)
                </label>
                <input
                    type="number"
                    value={proofData.amountPaid}
                    onChange={(e) => setProofData({ ...proofData, amountPaid: e.target.value })}
                    placeholder={amount}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
            </div>

            {/* Paid From (Optional) */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Paid From (UPI ID / Phone / Name) <span className="text-gray-500">Optional</span>
                </label>
                <input
                    type="text"
                    value={proofData.paidFrom}
                    onChange={(e) => setProofData({ ...proofData, paidFrom: e.target.value })}
                    placeholder="yourname@upi or 9876543210"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
            </div>

            {/* Notes (Optional) */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes <span className="text-gray-500">Optional</span>
                </label>
                <textarea
                    value={proofData.userNotes}
                    onChange={(e) => setProofData({ ...proofData, userNotes: e.target.value })}
                    placeholder="Any additional information..."
                    rows={2}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <button
                    onClick={handleSubmitProof}
                    disabled={isSubmitting || !screenshot || !proofData.utrNumber}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>Submit Proof</>
                    )}
                </button>
            </div>
        </div>
    );

    // Step 3: Confirmation
    const ConfirmationScreen = () => (
        <div className="text-center py-8 space-y-6">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
            >
                <CheckCircle size={40} className="text-white" />
            </motion.div>

            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Payment Proof Submitted!</h3>
                <p className="text-gray-400">Your payment is pending verification</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 text-left space-y-3">
                <div className="flex items-center gap-3 text-sm">
                    <Clock size={18} className="text-yellow-400" />
                    <span className="text-gray-300">Verification usually takes 24-48 hours</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <CreditCard size={18} className="text-purple-400" />
                    <span className="text-gray-300">UTR: {proofData.utrNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <CheckCircle size={18} className="text-blue-400" />
                    <span className="text-gray-300">You'll receive an email once verified</span>
                </div>
            </div>

            <button
                onClick={onComplete}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
            >
                Done
            </button>
        </div>
    );

    return (
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 p-6 max-w-lg mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'bg-white/10 text-gray-500'
                            }`}>
                            {s}
                        </div>
                        {s < 3 && (
                            <div className={`w-12 h-1 rounded transition-colors ${step > s ? 'bg-purple-500' : 'bg-white/10'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait" custom={step}>
                <motion.div
                    key={step}
                    custom={step}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    {step === 1 && <PaymentScreen />}
                    {step === 2 && <ProofUploadScreen />}
                    {step === 3 && <ConfirmationScreen />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default PaymentFlow;
