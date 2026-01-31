const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['title', 'platinum', 'gold', 'silver', 'bronze', 'partner', 'media']
    },
    logo: { type: String, required: true }, // URL to logo image
    website: { type: String },
    contactEmail: { type: String },
    contactPerson: { type: String },
    phone: { type: String },
    industry: { type: String }, // Tech, Finance, Education, etc.
    sponsorshipAmount: { type: Number, default: 0 },
    benefits: [{ type: String }], // Array of benefits provided
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    socialLinks: {
        linkedin: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        facebook: { type: String }
    },
    events: [{ type: String }], // Events they're sponsoring
    notes: { type: String }, // Internal notes
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
sponsorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Sponsor', sponsorSchema);