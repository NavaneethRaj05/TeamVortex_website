const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
    // Welcome message
    welcomeMessage: {
        type: String,
        default: "Hi! I'm VortexBot ML. How can I help you today?"
    },

    // Custom FAQ responses (admin-defined)
    customFAQs: [{
        question: { type: String, required: true },
        answer: { type: String, required: true },
        keywords: [{ type: String }], // Keywords to match
        category: { 
            type: String, 
            enum: ['events', 'club', 'website', 'general', 'registration', 'payment'],
            default: 'general'
        },
        enabled: { type: Boolean, default: true },
        usageCount: { type: Number, default: 0 }, // Track how often this FAQ is used
        lastUsed: { type: Date }
    }],

    // ML Learning: User interactions that weren't matched
    learnedInteractions: [{
        userQuery: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        frequency: { type: Number, default: 1 }, // How many times this query was asked
        suggestedAnswer: { type: String }, // Admin can provide answer
        approved: { type: Boolean, default: false }, // Admin approval
        category: { type: String },
        relatedQueries: [{ type: String }] // Similar queries
    }],

    // ML Training Data: Successful interactions
    trainingData: [{
        query: { type: String },
        response: { type: String },
        wasHelpful: { type: Boolean },
        timestamp: { type: Date, default: Date.now }
    }],

    // Quick reply suggestions
    quickReplies: [{
        text: { type: String },
        category: { type: String }
    }],

    // Chatbot settings
    settings: {
        enabled: { type: Boolean, default: true },
        responseDelay: { type: Number, default: 800 }, // ms
        showSuggestions: { type: Boolean, default: true },
        maxSuggestions: { type: Number, default: 3 },
        fallbackMessage: {
            type: String,
            default: "I'm learning from your question! Our team will review it soon. Meanwhile, would you like to contact us directly?"
        },
        mlEnabled: { type: Boolean, default: true }, // Enable ML learning
        autoLearnThreshold: { type: Number, default: 3 }, // Auto-create FAQ after N similar queries
        similarityThreshold: { type: Number, default: 0.7 } // Similarity score for matching
    },

    // Analytics
    analytics: {
        totalQueries: { type: Number, default: 0 },
        resolvedQueries: { type: Number, default: 0 },
        unresolvedQueries: { type: Number, default: 0 },
        learnedQueries: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now }
    },

    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
chatbotSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    this.analytics.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Chatbot', chatbotSchema);
