const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    college: { type: String },
    idNumber: { type: String },
    department: { type: String },
    year: { type: String },
    age: { type: Number },
    state: { type: String },
    city: { type: String },
    idCardUrl: { type: String }
});

const registrationSchema = new mongoose.Schema({
    teamName: { type: String },
    country: { type: String },
    institutionName: { type: String },
    department: { type: String },
    yearOfStudy: { type: String },
    members: [participantSchema],
    paid: { type: Boolean, default: false },
    paymentId: { type: String },
    registeredAt: { type: Date, default: Date.now },
    // Payment Verification Fields
    paymentStatus: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'rejected'],
        default: 'pending'
    },
    paymentProof: {
        screenshotData: { type: String },  // Base64 encoded image
        utrNumber: { type: String },
        transactionDate: { type: Date },
        amountPaid: { type: Number },
        paidFrom: { type: String },
        submittedAt: { type: Date },
        userNotes: { type: String }
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    rejectionReason: { type: String }
});

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true }, // Event Date
    startTime: { type: String, required: true },
    endTime: { type: String }, // Optional
    location: { type: String },
    images: [{ type: String }], // Gallery images

    // Event Type & Category
    eventType: {
        type: String,
        enum: ['Inter-College', 'Intra-College', 'Open', 'Workshop'],
        default: 'Inter-College'
    },
    category: {
        type: String,
        enum: ['Technical', 'Cultural', 'Sports', 'Gaming'],
        default: 'Technical'
    },

    // Pricing
    price: { type: Number, default: 0 },
    teamPricing: {
        perTeam: { type: Boolean, default: true }, // true = flat team price, false = per member
        pricePerMember: { type: Number, default: 0 }
    },
    earlyBirdDiscount: {
        enabled: { type: Boolean, default: false },
        discountPercent: { type: Number, default: 0 },
        validUntil: { type: Date },
        limitedTo: { type: Number, default: 0 } // 0 = unlimited
    },

    // Capacity & Team
    capacity: { type: Number, default: 0 }, // 0 for unlimited
    registrationType: {
        type: String,
        enum: ['Solo', 'Duo', 'Team'],
        default: 'Solo'
    },
    minTeamSize: { type: Number, default: 1 },
    maxTeamSize: { type: Number, default: 1 },

    // Registration Window
    registrationOpens: { type: Date },
    registrationCloses: { type: Date },
    autoCloseOnCapacity: { type: Boolean, default: true },
    enableWaitlist: { type: Boolean, default: true },

    // Eligibility & College Restrictions
    eligibility: {
        participants: [{ type: String }], // 'College Students', 'School Students', 'Professionals', 'Open to All'
        minAge: { type: Number },
        maxAge: { type: Number },
        requiredDocs: [{ type: String }] // 'College ID', 'Govt ID', 'Resume'
    },
    allowedCollege: { type: String }, // For intra-college events

    // Organizer
    organizer: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        department: { type: String }
    },

    // Rules & Tags
    rules: { type: String }, // Markdown/rich text
    rulebookUrl: { type: String }, // PDF link
    tags: [{ type: String }],

    // Payment & Fee Collection
    paymentGateway: { type: String, enum: ['UPI', 'Offline'], default: 'UPI' },
    upiId: { type: String },
    upiQrCode: { type: String },
    paymentReceiverName: { type: String },
    offlineInstructions: { type: String },
    enableOfflinePayment: { type: Boolean, default: true },
    // Offline payment methods (when paymentGateway is 'Offline')
    offlineMethods: [{ type: String }], // ['upi', 'bank', 'cash']
    bankDetails: {
        bankName: { type: String },
        accountName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        branchName: { type: String }
    },
    cashDetails: {
        location: { type: String },
        timings: { type: String },
        contactPerson: { type: String },
        contactPhone: { type: String }
    },
    gstEnabled: { type: Boolean, default: false },
    gstPercent: { type: Number, default: 18 },
    gstNumber: { type: String },
    coupons: [{
        code: { type: String },
        discountPercent: { type: Number },
        flatDiscount: { type: Number },
        validUntil: { type: Date },
        maxUses: { type: Number, default: 0 },
        usedCount: { type: Number, default: 0 }
    }],

    // Phase 3: Event Rounds/Stages
    isMultiRound: { type: Boolean, default: false },
    rounds: [{
        roundNumber: { type: Number },
        name: { type: String },
        date: { type: Date },
        venue: { type: String },
        format: { type: String, enum: ['Elimination', 'Scoring', 'Showcase'], default: 'Elimination' },
        advancingCount: { type: Number }
    }],

    // Phase 3: Judging Criteria
    judgingCriteria: [{
        name: { type: String },
        maxPoints: { type: Number },
        description: { type: String }
    }],

    // Phase 3: Prize Structure
    prizes: [{
        position: { type: String }, // '1st', '2nd', '3rd', 'Special'
        cashAmount: { type: Number, default: 0 },
        description: { type: String },
        trophy: { type: Boolean, default: false }
    }],
    participationCertificate: { type: Boolean, default: true },
    winnerCertificate: { type: Boolean, default: true },

    // Phase 4: Social Media & Sponsors
    socialLinks: {
        website: { type: String },
        facebook: { type: String },
        instagram: { type: String },
        whatsapp: { type: String },
        linkedin: { type: String }
    },
    sponsors: [{
        name: { type: String },
        tier: { type: String, enum: ['Title', 'Platinum', 'Gold', 'Silver'], default: 'Gold' },
        logoUrl: { type: String }
    }],

    // Phase 4: FAQs
    faqs: [{
        question: { type: String },
        answer: { type: String }
    }],

    // Phase 5: Check-in & Certificates
    enableQrCheckin: { type: Boolean, default: false },
    certificateTemplate: { type: String }, // URL to certificate template

    // Registrations & Waitlist
    registrations: [registrationSchema],
    waitlist: [registrationSchema],
    ticketsSold: { type: Number, default: 0 },

    // Feedback
    feedback: [{
        studentId: String,
        name: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],

    // Status
    status: {
        type: String,
        enum: ['draft', 'published', 'completed'],
        default: 'published'
    },
    createdAt: { type: Date, default: Date.now }
});

// Add indexes for performance optimization
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
