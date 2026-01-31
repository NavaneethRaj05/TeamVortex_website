import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, AlertCircle, Eye, X,
    Search, Filter, ChevronDown, CreditCard, User, Calendar,
    Mail, Phone, ExternalLink, RefreshCw, Download, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_BASE_URL from '../../apiConfig';



/**
 * PaymentVerificationPanel Component
 * Admin panel to view and verify pending payments for events
 * 
 * Props:
 * - selectedEventId: Optional - filter by specific event
 */
const PaymentVerificationPanel = ({ selectedEventId = null }) => {
    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(selectedEventId || '');
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewingPayment, setViewingPayment] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, submitted
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [paymentLogs, setPaymentLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);

    // Fetch all events
    useEffect(() => {
        fetchEvents();
    }, []);

    // Fetch pending payments when event changes
    useEffect(() => {
        if (currentEvent) {
            fetchPendingPayments();
            fetchPaymentLogs();
        }
    }, [currentEvent]);

    const fetchPaymentLogs = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/events/${currentEvent}/payment-logs`);
            const data = await res.json();
            setPaymentLogs(data || []);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/events`);
            const data = await res.json();
            setEvents(data.filter(e => e.price > 0)); // Only paid events
            if (selectedEventId) {
                setCurrentEvent(selectedEventId);
            } else if (data.length > 0) {
                const paidEvents = data.filter(e => e.price > 0);
                if (paidEvents.length > 0) {
                    setCurrentEvent(paidEvents[0]._id);
                }
            }
        } catch (err) {
            setError('Failed to fetch events');
        }
    };

    const fetchPendingPayments = async () => {
        if (!currentEvent) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/events/${currentEvent}/pending-payments`);
            const data = await res.json();
            setPendingPayments(data.pendingPayments || []);
        } catch (err) {
            setError('Failed to fetch pending payments');
            setPendingPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const exportPaymentsPDF = () => {
        if (!currentEvent || filteredPayments.length === 0) {
            alert('No payments to export');
            return;
        }

        const selectedEvent = events.find(e => e._id === currentEvent);
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setTextColor(147, 51, 234); // Purple
        doc.text('TEAM VORTEX - PAYMENT REPORT', 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Event: ${selectedEvent?.title || 'Unknown Event'}`, 14, 32);
        doc.text(`Total Payments: ${filteredPayments.length}`, 14, 38);
        doc.text(`Status Filter: ${statusFilter.toUpperCase()}`, 14, 44);
        doc.text(`Exported On: ${new Date().toLocaleString()}`, 14, 50);

        const tableColumn = ["Participant/Team", "Email", "UTR Number", "Amount", "Status"];
        const tableRows = [];

        filteredPayments.forEach(p => {
            const rowData = [
                p.teamName || p.members?.[0]?.name || 'N/A',
                p.members?.[0]?.email || 'N/A',
                p.paymentProof?.utrNumber || 'N/A',
                `INR ${p.paymentProof?.amountPaid || selectedEvent?.price || 0}`,
                p.paymentStatus.toUpperCase()
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'striped',
            headStyles: { fillColor: [147, 51, 234], textColor: 255 },
            margin: { top: 60 },
        });

        doc.save(`${selectedEvent?.title.replace(/\s+/g, '_')}_Payments.pdf`);
    };

    const handleVerifyPayment = async (regIndex, action) => {
        setActionLoading(true);
        try {
            const body = { action };
            if (action === 'reject') {
                body.rejectionReason = rejectionReason || 'Payment verification failed';
            }

            const res = await fetch(`${API_BASE_URL}/api/events/${currentEvent}/verify-payment/${regIndex}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            // Refresh list
            fetchPendingPayments();
            setViewingPayment(null);
            setShowRejectModal(false);
            setRejectionReason('');
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Filter payments
    const filteredPayments = pendingPayments.filter(payment => {
        const matchesSearch = searchQuery === '' ||
            payment.members?.[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.members?.[0]?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.paymentProof?.utrNumber?.includes(searchQuery) ||
            payment.teamName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || payment.paymentStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Stats
    const stats = {
        pending: pendingPayments.filter(p => p.paymentStatus === 'pending').length,
        submitted: pendingPayments.filter(p => p.paymentStatus === 'submitted').length,
        total: pendingPayments.length
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} /> Verified</span>;
            case 'rejected':
                return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
            case 'submitted':
                return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1"><Clock size={12} /> Awaiting Review</span>;
            default:
                return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs flex items-center gap-1"><AlertCircle size={12} /> Pending Payment</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard size={24} /> Payment Verification
                </h2>
                <div className="flex gap-2">
                    {currentEvent && filteredPayments.length > 0 && (
                        <button
                            onClick={exportPaymentsPDF}
                            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FileText size={16} />
                            Download PDF
                        </button>
                    )}
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showLogs ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                        <Clock size={16} />
                        {showLogs ? 'Hide History' : 'View History'}
                    </button>
                    <button
                        onClick={fetchPendingPayments}
                        disabled={loading}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Event Selector */}
            <div className="bg-white/5 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Event</label>
                <select
                    value={currentEvent}
                    onChange={(e) => setCurrentEvent(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                >
                    <option value="">-- Select an Event --</option>
                    {events.map(event => (
                        <option key={event._id} value={event._id}>
                            {event.title} (₹{event.price})
                        </option>
                    ))}
                </select>
            </div>

            {/* Stats Cards */}
            {currentEvent && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-4 border border-yellow-500/20">
                        <div className="text-3xl font-bold text-yellow-400">{stats.submitted}</div>
                        <div className="text-yellow-200/70 text-sm">Awaiting Review</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-white/10">
                        <div className="text-3xl font-bold text-gray-300">{stats.pending}</div>
                        <div className="text-gray-400 text-sm">Payment Pending</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/20 col-span-2 sm:col-span-1">
                        <div className="text-3xl font-bold text-purple-400">{stats.total}</div>
                        <div className="text-purple-200/70 text-sm">Total Registrations</div>
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            {currentEvent && pendingPayments.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, UTR..."
                            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="all">All Status</option>
                        <option value="submitted">Awaiting Review</option>
                        <option value="pending">Payment Pending</option>
                    </select>
                </div>
            )}

            {/* Logs View */}
            {showLogs && currentEvent && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white/5 rounded-2xl border border-purple-500/20 overflow-hidden"
                >
                    <div className="p-4 border-b border-white/5 bg-purple-500/10 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Audit Log</h3>
                        <span className="text-[10px] text-white/40">{paymentLogs.length} entries</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {paymentLogs.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/20 text-[10px] text-white/30 uppercase tracking-widest font-black">
                                    <tr>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Team/Lead</th>
                                        <th className="p-3">Action</th>
                                        <th className="p-3">Performed By</th>
                                        <th className="p-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white/60 text-xs">
                                    {paymentLogs.map((log, li) => (
                                        <tr key={li} className="border-t border-white/5 hover:bg-white/[0.02]">
                                            <td className="p-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="p-3">
                                                <div className="font-bold text-white/80">{log.teamName || 'Solo'}</div>
                                                <div className="text-[10px] opacity-40">{log.leadEmail}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${log.action === 'verified' ? 'bg-green-500/20 text-green-400' :
                                                    log.action === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-3">{log.performedBy}</td>
                                            <td className="p-3 italic">
                                                {log.rejectionReason || (log.utrNumber ? `UTR: ${log.utrNumber}` : '---')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-white/20 italic text-sm">No transaction logs found for this event.</div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-400" />
                    <span className="text-red-200">{error}</span>
                </div>
            )}

            {/* Payments List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
            ) : currentEvent && filteredPayments.length > 0 ? (
                <div className="grid gap-4">
                    {filteredPayments.map((payment, idx) => (
                        <motion.div
                            key={payment.registrationIndex ?? idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-white font-semibold">
                                            {payment.teamName || payment.members?.[0]?.name || 'Unknown'}
                                        </h4>
                                        {getStatusBadge(payment.paymentStatus)}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User size={14} />
                                            <span>{payment.members?.[0]?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} />
                                            <span>{payment.members?.[0]?.email}</span>
                                        </div>
                                        {payment.paymentProof?.utrNumber && (
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={14} />
                                                <span>UTR: {payment.paymentProof.utrNumber}</span>
                                            </div>
                                        )}
                                        {payment.paymentProof?.amountPaid && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-400">₹{payment.paymentProof.amountPaid}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => setViewingPayment(payment)}
                                        className="flex-1 sm:flex-initial px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Eye size={16} /> View
                                    </button>
                                    {payment.paymentStatus === 'submitted' && (
                                        <>
                                            <button
                                                onClick={() => handleVerifyPayment(payment.registrationIndex, 'approve')}
                                                disabled={actionLoading}
                                                className="flex-1 sm:flex-initial px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setViewingPayment(payment);
                                                    setShowRejectModal(true);
                                                }}
                                                className="flex-1 sm:flex-initial px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : currentEvent ? (
                <div className="text-center py-12 text-gray-400">
                    <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No pending payments to verify</p>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-400">
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select an event to view pending payments</p>
                </div>
            )}

            {/* Payment Detail Modal */}
            <AnimatePresence>
                {viewingPayment && !showRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setViewingPayment(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Payment Details</h3>
                                    <button
                                        onClick={() => setViewingPayment(null)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                {/* Screenshot */}
                                {viewingPayment.paymentProof?.screenshotData && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-400 mb-2">Payment Screenshot</h4>
                                        <div className="bg-black rounded-xl p-2">
                                            <img
                                                src={viewingPayment.paymentProof.screenshotData}
                                                alt="Payment screenshot"
                                                className="max-w-full max-h-96 mx-auto rounded-lg"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Participant</div>
                                        <div className="text-white">{viewingPayment.members?.[0]?.name}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Email</div>
                                        <div className="text-white text-sm break-all">{viewingPayment.members?.[0]?.email}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">UTR Number</div>
                                        <div className="text-white font-mono">{viewingPayment.paymentProof?.utrNumber || 'N/A'}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Amount Paid</div>
                                        <div className="text-green-400 font-semibold">₹{viewingPayment.paymentProof?.amountPaid || 'N/A'}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Transaction Date</div>
                                        <div className="text-white">
                                            {viewingPayment.paymentProof?.transactionDate
                                                ? new Date(viewingPayment.paymentProof.transactionDate).toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Paid From</div>
                                        <div className="text-white">{viewingPayment.paymentProof?.paidFrom || 'N/A'}</div>
                                    </div>
                                    {viewingPayment.paymentProof?.userNotes && (
                                        <div className="bg-white/5 rounded-lg p-3 col-span-2">
                                            <div className="text-xs text-gray-400 mb-1">User Notes</div>
                                            <div className="text-white text-sm">{viewingPayment.paymentProof.userNotes}</div>
                                        </div>
                                    )}
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Status</div>
                                        {getStatusBadge(viewingPayment.paymentStatus)}
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Registered At</div>
                                        <div className="text-white text-sm">{new Date(viewingPayment.registeredAt).toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Team Members */}
                                {viewingPayment.members?.length > 1 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-400 mb-2">Team Members</h4>
                                        <div className="space-y-2">
                                            {viewingPayment.members.map((member, i) => (
                                                <div key={i} className="bg-white/5 rounded-lg p-3 flex justify-between">
                                                    <span className="text-white">{member.name}</span>
                                                    <span className="text-gray-400 text-sm">{member.email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                {viewingPayment.paymentStatus === 'submitted' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleVerifyPayment(viewingPayment.registrationIndex, 'approve')}
                                            disabled={actionLoading}
                                            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle size={18} /> Approve Payment
                                        </button>
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowRejectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 rounded-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Reject Payment</h3>
                            <p className="text-gray-400 mb-4">
                                Please provide a reason for rejection. This will be sent to the participant.
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                rows={3}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleVerifyPayment(viewingPayment?.registrationIndex, 'reject')}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <XCircle size={18} /> Confirm Reject
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentVerificationPanel;
