const mongoose = require('mongoose');

const failedEmailSchema = new mongoose.Schema({
    emailType: {
        type: String,
        required: true,
        enum: [
            'registrationConfirmation', 'paymentProofReceived', 'paymentProofAlert',
            'paymentApproved', 'paymentRejected', 'eventReminder24h',
            'feedbackRequest', 'paymentNudge', 'waitlistPromotion'
        ]
    },
    recipients: [{ type: String }], // email addresses
    data: { type: Object },         // full template data
    error: { type: String },
    lastError: { type: String },
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed_permanently'],
        default: 'pending'
    }
}, { timestamps: true });

failedEmailSchema.index({ status: 1, retryCount: 1 });

module.exports = mongoose.model('FailedEmail', failedEmailSchema);
