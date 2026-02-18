const mongoose = require('mongoose');

// Analytics Event Schema for tracking user behavior and drop-offs
const analyticsEventSchema = new mongoose.Schema({
    // Event Identification
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event',
        index: true 
    },
    eventTitle: { type: String },
    
    // User Identification (anonymous tracking)
    sessionId: { 
        type: String, 
        required: true,
        index: true 
    },
    userId: { type: String }, // If logged in
    ipAddress: { type: String },
    userAgent: { type: String },
    
    // Event Type
    eventType: {
        type: String,
        required: true,
        enum: [
            // Registration Flow
            'registration_started',
            'registration_step_1_completed', // Event selection (multi-event)
            'registration_step_2_started', // Form started
            'registration_step_2_completed', // Form completed
            'registration_step_3_started', // Payment started
            'registration_completed',
            'registration_abandoned',
            
            // Form Field Interactions
            'form_field_focused',
            'form_field_completed',
            'form_field_error',
            'form_validation_failed',
            
            // Payment Flow
            'payment_initiated',
            'payment_proof_uploaded',
            'payment_completed',
            'payment_failed',
            'payment_abandoned',
            
            // Multi-Event Specific
            'multi_event_modal_opened',
            'sub_event_selected',
            'sub_event_deselected',
            'discount_applied',
            
            // Page Views
            'event_page_viewed',
            'event_details_viewed',
            'registration_modal_opened',
            'registration_modal_closed',
            
            // Errors
            'api_error',
            'validation_error',
            'network_error'
        ],
        index: true
    },
    
    // Event Data
    data: {
        // Registration step info
        currentStep: { type: String },
        completedSteps: [{ type: String }],
        
        // Form field info
        fieldName: { type: String },
        fieldValue: { type: String }, // Don't store sensitive data
        errorMessage: { type: String },
        
        // Multi-event info
        selectedSubEvents: [{ type: String }],
        subEventCount: { type: Number },
        discountApplied: { type: Number },
        totalAmount: { type: Number },
        
        // Time tracking
        timeSpent: { type: Number }, // milliseconds
        
        // Additional context
        metadata: { type: mongoose.Schema.Types.Mixed }
    },
    
    // Timestamps
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true 
    },
    
    // Session tracking
    sessionStartTime: { type: Date },
    sessionEndTime: { type: Date }
});

// Indexes for efficient queries
analyticsEventSchema.index({ eventId: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1 });

// Static methods for analytics queries

// Get registration funnel data
analyticsEventSchema.statics.getRegistrationFunnel = async function(eventId, startDate, endDate) {
    const pipeline = [
        {
            $match: {
                eventId: mongoose.Types.ObjectId(eventId),
                timestamp: { $gte: startDate, $lte: endDate },
                eventType: {
                    $in: [
                        'registration_started',
                        'registration_step_2_started',
                        'registration_step_2_completed',
                        'registration_step_3_started',
                        'registration_completed'
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$eventType',
                count: { $sum: 1 },
                uniqueSessions: { $addToSet: '$sessionId' }
            }
        },
        {
            $project: {
                eventType: '$_id',
                count: 1,
                uniqueCount: { $size: '$uniqueSessions' }
            }
        }
    ];
    
    return await this.aggregate(pipeline);
};

// Get drop-off points
analyticsEventSchema.statics.getDropOffPoints = async function(eventId, startDate, endDate) {
    const pipeline = [
        {
            $match: {
                eventId: mongoose.Types.ObjectId(eventId),
                timestamp: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$sessionId',
                events: { $push: { type: '$eventType', timestamp: '$timestamp' } },
                lastEvent: { $last: '$eventType' }
            }
        },
        {
            $match: {
                lastEvent: { $ne: 'registration_completed' }
            }
        },
        {
            $group: {
                _id: '$lastEvent',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ];
    
    return await this.aggregate(pipeline);
};

// Get form field errors
analyticsEventSchema.statics.getFormFieldErrors = async function(eventId, startDate, endDate) {
    return await this.aggregate([
        {
            $match: {
                eventId: mongoose.Types.ObjectId(eventId),
                timestamp: { $gte: startDate, $lte: endDate },
                eventType: 'form_field_error'
            }
        },
        {
            $group: {
                _id: {
                    fieldName: '$data.fieldName',
                    errorMessage: '$data.errorMessage'
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 20
        }
    ]);
};

// Get average time spent per step
analyticsEventSchema.statics.getAverageTimePerStep = async function(eventId, startDate, endDate) {
    return await this.aggregate([
        {
            $match: {
                eventId: mongoose.Types.ObjectId(eventId),
                timestamp: { $gte: startDate, $lte: endDate },
                'data.timeSpent': { $exists: true }
            }
        },
        {
            $group: {
                _id: '$data.currentStep',
                avgTime: { $avg: '$data.timeSpent' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { avgTime: -1 }
        }
    ]);
};

// Get multi-event analytics
analyticsEventSchema.statics.getMultiEventAnalytics = async function(eventId, startDate, endDate) {
    return await this.aggregate([
        {
            $match: {
                eventId: mongoose.Types.ObjectId(eventId),
                timestamp: { $gte: startDate, $lte: endDate },
                eventType: 'multi_event_modal_opened'
            }
        },
        {
            $lookup: {
                from: 'analyticsevents',
                let: { sessionId: '$sessionId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$sessionId', '$$sessionId'] },
                                    { $eq: ['$eventType', 'registration_completed'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                totalOpened: { $sum: 1 },
                totalCompleted: { $sum: { $cond: [{ $gt: [{ $size: '$completed' }, 0] }, 1, 0] } }
            }
        },
        {
            $project: {
                totalOpened: 1,
                totalCompleted: 1,
                conversionRate: {
                    $multiply: [
                        { $divide: ['$totalCompleted', '$totalOpened'] },
                        100
                    ]
                }
            }
        }
    ]);
};

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
