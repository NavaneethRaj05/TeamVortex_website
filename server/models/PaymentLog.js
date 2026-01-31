const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    registrationIndex: { type: Number, required: true },
    teamName: { type: String },
    leadEmail: { type: String, required: true },
    action: {
        type: String,
        enum: ['submitted', 'verified', 'rejected', 'reset'],
        required: true
    },
    previousStatus: { type: String },
    newStatus: { type: String },
    amount: { type: Number },
    utrNumber: { type: String },
    rejectionReason: { type: String },
    performedBy: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String }
});

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
