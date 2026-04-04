import React, { useState, useRef, useCallback } from 'react';
import {
    QrCode, Copy, Check, X, ArrowRight, ArrowLeft,
    Phone, Building2, Wallet, Clock, AlertCircle, CheckCircle,
    Image as ImageIcon, CreditCard, Banknote
} from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const PaymentFlow = ({
    eventId,
    eventTitle,
    amount,
    paymentInfo,
    userEmail,
    onComplete,
    onCancel
}) => {
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);
    const [activePaymentTab, setActivePaymentTab] = useState('upi');
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitAttempts, setSubmitAttempts] = useState(0);
    const [canSubmit, setCanSubmit] = useState(true);
    const fileInputRef = useRef(null);

    // Guard against iOS screenshot gesture firing phantom taps on buttons
    // iOS screenshot (side + volume) briefly triggers touchstart/touchend on whatever is under the finger
    const lastTapRef = useRef(0);
    const safeTap = useCallback((fn) => (e) => {
        // Ignore taps that fire within 300ms of each other (screenshot gesture pattern)
        const now = Date.now();
        if (now - lastTapRef.current < 300) return;
        lastTapRef.current = now;
        fn(e);
    }, []);

    const [proofData, setProofData] = useState({
        utrNumber: '',
        transactionDate: new Date().toISOString().split('T')[0],
        amountPaid: amount || '',
        paidFrom: '',
        userNotes: ''
    });

    const setUtr = useCallback((val) => {
        const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setProofData(prev => ({ ...prev, utrNumber: clean }));
    }, []);

    const utrValue = proofData.utrNumber;
    const utrLen = utrValue.length;
    const utrValid = utrLen >= 12 && utrLen <= 22;
    const utrHint = utrLen === 0 ? '' :
        utrLen < 12 ? `Too short — min 12 characters (${utrLen}/12)` :
        utrLen === 12 ? '✓ Valid — UPI/IMPS/RRN (12 digits)' :
        utrLen === 16 ? '✓ Valid — NEFT/UTR (16 characters)' :
        utrLen === 22 ? '✓ Valid — RTGS (22 characters)' :
        utrLen <= 18 ? '✓ Valid — Card payment reference' :
        'Too long — max 22 characters';

    const copyToClipboard = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fallbackCopy = (text) => {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
        document.body.appendChild(el);
        el.focus(); el.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(el);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Please upload an image file (PNG, JPG, etc.)'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('File size must be less than 5MB'); return; }
        setError('');
        setScreenshot(file);
        // Compress before base64 encode
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 1200;
                let { width, height } = img;
                if (width > MAX || height > MAX) {
                    if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
                    else { width = Math.round(width * MAX / height); height = MAX; }
                }
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                setScreenshotPreview(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitProof = async () => {
        if (isSubmitting || !canSubmit) return;
        if (!screenshot) { setError('Please upload a payment screenshot'); return; }
        if (!proofData.utrNumber.trim()) { setError('Please enter the UTR/Transaction ID'); return; }
        if (submitAttempts >= 3) { setError('Too many attempts. Please refresh and try again.'); setCanSubmit(false); return; }

        setIsSubmitting(true);
        setCanSubmit(false);
        setError('');
        setSubmitAttempts(prev => prev + 1);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

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

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
                    throw new Error('Server is not responding properly. Please try again.');
                }
                throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
            }

            if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);

            setStep(3);
            setCanSubmit(false);
        } catch (err) {
            if (err.name === 'AbortError') {
                setError('Request timed out. Please check your connection and try again.');
            } else if (err.message.includes('Failed to fetch')) {
                setError('Network error. Please check your connection and try again.');
            } else if (err.message.includes('already verified')) {
                setError('Your payment has already been verified.'); setCanSubmit(false);
            } else if (err.message.includes('already submitted')) {
                setError('Payment proof already submitted. Please wait for admin approval.'); setCanSubmit(false);
            } else if (err.message.includes('UTR number has already been used')) {
                setError('This UTR/Transaction ID has already been used. Please check your transaction details.');
            } else {
                setError(err.message || 'Failed to submit. Please try again.');
            }
            if (submitAttempts < 3) setTimeout(() => setCanSubmit(true), 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Step 1: Payment Info ──────────────────────────────────────────────────
    const PaymentScreen = () => (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-1">Complete Your Payment</h3>
                <p className="text-white/50 text-sm">Pay ₹{amount} for {eventTitle}</p>
            </div>

            {/* Payment Method Tabs */}
            {paymentInfo?.paymentGateway === 'Offline' && paymentInfo?.offlineMethods?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {paymentInfo.offlineMethods.includes('upi') && (
                        <button onClick={() => setActivePaymentTab('upi')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${activePaymentTab === 'upi' ? 'bg-vortex-blue text-black font-bold' : 'bg-white/10 text-white/60'}`}>
                            <Phone size={14} /> UPI
                        </button>
                    )}
                    {paymentInfo.offlineMethods.includes('bank') && (
                        <button onClick={() => setActivePaymentTab('bank')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${activePaymentTab === 'bank' ? 'bg-vortex-blue text-black font-bold' : 'bg-white/10 text-white/60'}`}>
                            <Building2 size={14} /> Bank
                        </button>
                    )}
                    {paymentInfo.offlineMethods.includes('cash') && (
                        <button onClick={() => setActivePaymentTab('cash')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${activePaymentTab === 'cash' ? 'bg-vortex-blue text-black font-bold' : 'bg-white/10 text-white/60'}`}>
                            <Banknote size={14} /> Cash
                        </button>
                    )}
                </div>
            )}

            {/* UPI */}
            {(paymentInfo?.paymentGateway === 'UPI' || activePaymentTab === 'upi') && (
                <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/10">
                    <div className="flex flex-col items-center gap-3">
                        {paymentInfo?.upiQrCode ? (
                            <div className="bg-white p-3 rounded-xl">
                                <img src={paymentInfo.upiQrCode} alt="UPI QR Code" className="w-44 h-44 object-contain" />
                            </div>
                        ) : (
                            <div className="bg-white/10 p-4 rounded-xl flex items-center justify-center w-44 h-44">
                                <QrCode size={56} className="text-white/30" />
                            </div>
                        )}
                        {paymentInfo?.upiId && (
                            <div className="w-full">
                                <p className="text-white/40 text-xs mb-1.5 text-center">Or pay using UPI ID:</p>
                                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2.5">
                                    <Wallet size={16} className="text-vortex-blue flex-shrink-0" />
                                    <span className="flex-1 font-mono text-white text-sm">{paymentInfo.upiId}</span>
                                    <button onClick={() => copyToClipboard(paymentInfo.upiId)}
                                        className="p-1.5 rounded-lg active:bg-white/10 touch-manipulation">
                                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-white/40" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {paymentInfo?.paymentReceiverName && (
                            <p className="text-white/40 text-xs">Pay to: <span className="text-white">{paymentInfo.paymentReceiverName}</span></p>
                        )}
                    </div>
                </div>
            )}

            {/* Bank */}
            {activePaymentTab === 'bank' && paymentInfo?.bankDetails && (
                <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/10 space-y-2.5">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2"><Building2 size={16} /> Bank Transfer</h4>
                    <div className="space-y-2 text-sm">
                        {paymentInfo.bankDetails.bankName && <div className="flex justify-between"><span className="text-white/50">Bank</span><span className="text-white font-medium">{paymentInfo.bankDetails.bankName}</span></div>}
                        {paymentInfo.bankDetails.accountName && <div className="flex justify-between"><span className="text-white/50">Name</span><span className="text-white font-medium">{paymentInfo.bankDetails.accountName}</span></div>}
                        {paymentInfo.bankDetails.accountNumber && (
                            <div className="flex justify-between items-center">
                                <span className="text-white/50">Account</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-white font-mono">{paymentInfo.bankDetails.accountNumber}</span>
                                    <button onClick={() => copyToClipboard(paymentInfo.bankDetails.accountNumber)} className="p-1 active:bg-white/10 rounded touch-manipulation">
                                        {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/40" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {paymentInfo.bankDetails.ifscCode && (
                            <div className="flex justify-between items-center">
                                <span className="text-white/50">IFSC</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-white font-mono">{paymentInfo.bankDetails.ifscCode}</span>
                                    <button onClick={() => copyToClipboard(paymentInfo.bankDetails.ifscCode)} className="p-1 active:bg-white/10 rounded touch-manipulation">
                                        {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/40" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {paymentInfo.bankDetails.branchName && <div className="flex justify-between"><span className="text-white/50">Branch</span><span className="text-white">{paymentInfo.bankDetails.branchName}</span></div>}
                    </div>
                </div>
            )}

            {/* Cash */}
            {activePaymentTab === 'cash' && paymentInfo?.cashDetails && (
                <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/10 space-y-2.5">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2"><Banknote size={16} /> Cash Payment</h4>
                    <div className="space-y-2 text-sm">
                        {paymentInfo.cashDetails.location && <div><span className="text-white/50 block">Location</span><p className="text-white">{paymentInfo.cashDetails.location}</p></div>}
                        {paymentInfo.cashDetails.timings && <div className="flex items-center gap-2"><Clock size={13} className="text-white/40" /><span className="text-white">{paymentInfo.cashDetails.timings}</span></div>}
                        {paymentInfo.cashDetails.contactPerson && <div className="flex justify-between"><span className="text-white/50">Contact</span><span className="text-white">{paymentInfo.cashDetails.contactPerson}</span></div>}
                        {paymentInfo.cashDetails.contactPhone && <div className="flex justify-between"><span className="text-white/50">Phone</span><a href={`tel:${paymentInfo.cashDetails.contactPhone}`} className="text-vortex-blue">{paymentInfo.cashDetails.contactPhone}</a></div>}
                    </div>
                </div>
            )}

            {paymentInfo?.offlineInstructions && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm whitespace-pre-wrap">{paymentInfo.offlineInstructions}</p>
                </div>
            )}

            <div className="text-center py-2">
                <span className="text-green-400 font-bold text-base">Pay Exactly: ₹{amount}</span>
            </div>

            <div className="flex gap-3">
                <button onClick={safeTap(onCancel)} className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 active:bg-white/10 touch-manipulation">Cancel</button>
                <button onClick={safeTap(() => setStep(2))} className="flex-1 py-3 rounded-xl bg-vortex-blue text-black font-bold active:opacity-80 touch-manipulation flex items-center justify-center gap-2">
                    I Have Paid <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );

    // ── Step 2: Proof Upload ──────────────────────────────────────────────────
    const ProofUploadScreen = () => (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-1">Upload Payment Proof</h3>
                <p className="text-white/50 text-sm">Screenshot + transaction ID required</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-200/80 space-y-0.5">
                <p className="font-bold text-blue-300 mb-1">Important:</p>
                <p>• Submit proof only once — verification takes 24-48 hours</p>
                <p>• You'll receive email confirmation once verified</p>
            </div>

            {error && (
                <div className="bg-red-500/15 border border-red-500/25 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-sm">{error}</span>
                </div>
            )}

            {/* Screenshot */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Payment Screenshot *</label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
                {screenshotPreview ? (
                    <div className="relative bg-black/40 rounded-xl p-3">
                        <img src={screenshotPreview} alt="Payment screenshot" className="max-h-48 mx-auto rounded-lg" />
                        <button onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full touch-manipulation">
                            <X size={14} className="text-white" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => fileInputRef.current?.click()}
                        className="w-full py-6 border-2 border-dashed border-white/15 rounded-xl active:bg-white/5 flex flex-col items-center gap-2 touch-manipulation">
                        <ImageIcon size={28} className="text-white/30" />
                        <span className="text-white/60 text-sm font-medium">Tap to upload screenshot</span>
                        <span className="text-white/30 text-xs">PNG, JPG up to 5MB</span>
                    </button>
                )}
            </div>

            {/* UTR */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">UTR / Transaction ID <span className="text-red-400">*</span></label>
                <input
                    type="text"
                    value={proofData.utrNumber}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="12–22 character transaction ID"
                    maxLength={22}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    inputMode="text"
                    style={{ WebkitTextFillColor: '#ffffff', color: '#ffffff', caretColor: '#ffffff' }}
                    className="w-full px-4 py-3 bg-[#111] border border-white/15 rounded-xl font-mono text-base placeholder-white/30 focus:outline-none focus:border-vortex-blue/60"
                />
                {utrLen > 0 && (
                    <p className={`text-xs mt-1 ${utrValid ? 'text-green-400' : 'text-red-400'}`}>{utrHint}</p>
                )}
                {utrLen === 0 && <p className="text-xs mt-1 text-white/30">UPI/IMPS: 12 digits · NEFT: 16 chars · RTGS: 22 chars</p>}
            </div>

            {/* Transaction Date */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Transaction Date</label>
                <input type="date" value={proofData.transactionDate}
                    onChange={(e) => setProofData({ ...proofData, transactionDate: e.target.value })}
                    style={{ WebkitTextFillColor: '#ffffff', color: '#ffffff', colorScheme: 'dark' }}
                    className="w-full px-4 py-3 bg-[#111] border border-white/15 rounded-xl focus:outline-none focus:border-vortex-blue/60" />
            </div>

            {/* Amount */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Amount Paid (₹)</label>
                <input type="text" inputMode="numeric" value={proofData.amountPaid}
                    onChange={(e) => setProofData({ ...proofData, amountPaid: e.target.value })}
                    placeholder={String(amount)}
                    style={{ WebkitTextFillColor: '#ffffff', color: '#ffffff', caretColor: '#ffffff' }}
                    className="w-full px-4 py-3 bg-[#111] border border-white/15 rounded-xl placeholder-white/30 focus:outline-none focus:border-vortex-blue/60" />
            </div>

            {/* Paid From */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Paid From <span className="text-white/30 font-normal">Optional</span></label>
                <input type="text" value={proofData.paidFrom}
                    onChange={(e) => setProofData({ ...proofData, paidFrom: e.target.value })}
                    placeholder="yourname@upi or 9876543210"
                    style={{ WebkitTextFillColor: '#ffffff', color: '#ffffff', caretColor: '#ffffff' }}
                    className="w-full px-4 py-3 bg-[#111] border border-white/15 rounded-xl placeholder-white/30 focus:outline-none focus:border-vortex-blue/60" />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Notes <span className="text-white/30 font-normal">Optional</span></label>
                <textarea value={proofData.userNotes}
                    onChange={(e) => setProofData({ ...proofData, userNotes: e.target.value })}
                    placeholder="Any additional information..."
                    rows={2}
                    style={{ WebkitTextFillColor: '#ffffff', color: '#ffffff', caretColor: '#ffffff' }}
                    className="w-full px-4 py-3 bg-[#111] border border-white/15 rounded-xl placeholder-white/30 focus:outline-none focus:border-vortex-blue/60 resize-none" />
            </div>

            <div className="flex gap-3">
                <button onClick={safeTap(() => setStep(1))} disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 active:bg-white/10 touch-manipulation flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleSubmitProof}
                    disabled={isSubmitting || !canSubmit || !screenshot || !proofData.utrNumber || !utrValid}
                    className="flex-1 py-3 rounded-xl bg-vortex-blue text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2 active:opacity-80">
                    {isSubmitting ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Submitting...</>
                    ) : !canSubmit ? 'Please Wait...' : 'Submit Proof'}
                </button>
            </div>
        </div>
    );

    // ── Step 3: Confirmation ──────────────────────────────────────────────────
    const ConfirmationScreen = () => (
        <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-400" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-1">Payment Proof Submitted!</h3>
                <p className="text-white/50 text-sm">Your payment is pending verification</p>
            </div>
            <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 text-left space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                    <Clock size={16} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-white/70">Verification usually takes 24-48 hours</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                    <CreditCard size={16} className="text-vortex-blue flex-shrink-0" />
                    <span className="text-white/70">UTR: <span className="font-mono text-white">{proofData.utrNumber}</span></span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-white/70">You'll receive an email once verified</span>
                </div>
            </div>
            <button onClick={onComplete}
                className="w-full py-3 rounded-xl bg-vortex-blue text-black font-bold active:opacity-80 touch-manipulation">
                Done
            </button>
        </div>
    );

    return (
        <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-5 max-w-lg mx-auto">
            {/* Step indicator — pure CSS, no animation */}
            <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step >= s ? 'bg-vortex-blue text-black' : 'bg-white/10 text-white/40'
                        }`}>{s}</div>
                        {s < 3 && <div className={`w-10 h-0.5 rounded ${step > s ? 'bg-vortex-blue' : 'bg-white/10'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && <PaymentScreen />}
            {step === 2 && <ProofUploadScreen />}
            {step === 3 && <ConfirmationScreen />}
        </div>
    );
};

export default React.memo(PaymentFlow);
