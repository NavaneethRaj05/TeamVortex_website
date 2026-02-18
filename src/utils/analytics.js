import API_BASE_URL from '../apiConfig';

// Generate or retrieve session ID
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
};

// Track analytics event
export const trackEvent = async (eventType, data = {}) => {
    try {
        const sessionId = getSessionId();
        
        const payload = {
            sessionId,
            eventType,
            data: {
                ...data,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                referrer: document.referrer
            }
        };

        // Send to backend (non-blocking)
        fetch(`${API_BASE_URL}/api/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.warn('Analytics tracking failed:', err));

        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Analytics:', eventType, data);
        }
    } catch (error) {
        console.warn('Analytics error:', error);
    }
};

// Track registration flow
export const trackRegistrationFlow = {
    started: (eventId, eventTitle) => {
        trackEvent('registration_started', {
            eventId,
            eventTitle,
            currentStep: 'selection'
        });
    },

    step1Completed: (eventId, selectedSubEvents) => {
        trackEvent('registration_step_1_completed', {
            eventId,
            currentStep: 'selection',
            selectedSubEvents,
            subEventCount: selectedSubEvents?.length || 0
        });
    },

    step2Started: (eventId) => {
        trackEvent('registration_step_2_started', {
            eventId,
            currentStep: 'form'
        });
    },

    step2Completed: (eventId, memberCount) => {
        trackEvent('registration_step_2_completed', {
            eventId,
            currentStep: 'form',
            memberCount
        });
    },

    step3Started: (eventId, amount) => {
        trackEvent('registration_step_3_started', {
            eventId,
            currentStep: 'payment',
            totalAmount: amount
        });
    },

    completed: (eventId, data) => {
        trackEvent('registration_completed', {
            eventId,
            ...data
        });
    },

    abandoned: (eventId, currentStep, reason) => {
        trackEvent('registration_abandoned', {
            eventId,
            currentStep,
            reason
        });
    }
};

// Track form interactions
export const trackFormField = {
    focused: (eventId, fieldName) => {
        trackEvent('form_field_focused', {
            eventId,
            fieldName
        });
    },

    completed: (eventId, fieldName) => {
        trackEvent('form_field_completed', {
            eventId,
            fieldName
        });
    },

    error: (eventId, fieldName, errorMessage) => {
        trackEvent('form_field_error', {
            eventId,
            fieldName,
            errorMessage
        });
    },

    validationFailed: (eventId, errors) => {
        trackEvent('form_validation_failed', {
            eventId,
            errors: Object.keys(errors),
            errorCount: Object.keys(errors).length
        });
    }
};

// Track multi-event interactions
export const trackMultiEvent = {
    modalOpened: (eventId, subEventCount) => {
        trackEvent('multi_event_modal_opened', {
            eventId,
            subEventCount
        });
    },

    subEventSelected: (eventId, subEventId, totalSelected) => {
        trackEvent('sub_event_selected', {
            eventId,
            subEventId,
            totalSelected
        });
    },

    subEventDeselected: (eventId, subEventId, totalSelected) => {
        trackEvent('sub_event_deselected', {
            eventId,
            subEventId,
            totalSelected
        });
    },

    discountApplied: (eventId, discountAmount, discountPercentage) => {
        trackEvent('discount_applied', {
            eventId,
            discountAmount,
            discountPercentage
        });
    }
};

// Track payment flow
export const trackPayment = {
    initiated: (eventId, amount) => {
        trackEvent('payment_initiated', {
            eventId,
            totalAmount: amount
        });
    },

    proofUploaded: (eventId, amount) => {
        trackEvent('payment_proof_uploaded', {
            eventId,
            totalAmount: amount
        });
    },

    completed: (eventId, amount) => {
        trackEvent('payment_completed', {
            eventId,
            totalAmount: amount
        });
    },

    failed: (eventId, errorMessage) => {
        trackEvent('payment_failed', {
            eventId,
            errorMessage
        });
    },

    abandoned: (eventId, amount) => {
        trackEvent('payment_abandoned', {
            eventId,
            totalAmount: amount
        });
    }
};

// Track page views
export const trackPageView = {
    eventPage: (eventId, eventTitle) => {
        trackEvent('event_page_viewed', {
            eventId,
            eventTitle
        });
    },

    eventDetails: (eventId, eventTitle) => {
        trackEvent('event_details_viewed', {
            eventId,
            eventTitle
        });
    },

    registrationModal: (eventId, action) => {
        trackEvent(action === 'open' ? 'registration_modal_opened' : 'registration_modal_closed', {
            eventId
        });
    }
};

// Track errors
export const trackError = {
    api: (endpoint, errorMessage) => {
        trackEvent('api_error', {
            endpoint,
            errorMessage
        });
    },

    validation: (formName, errors) => {
        trackEvent('validation_error', {
            formName,
            errors
        });
    },

    network: (errorMessage) => {
        trackEvent('network_error', {
            errorMessage
        });
    }
};

// Time tracking utility
export class StepTimer {
    constructor(eventId, stepName) {
        this.eventId = eventId;
        this.stepName = stepName;
        this.startTime = Date.now();
    }

    complete() {
        const timeSpent = Date.now() - this.startTime;
        trackEvent('step_time_tracked', {
            eventId: this.eventId,
            currentStep: this.stepName,
            timeSpent
        });
        return timeSpent;
    }
}

// Batch tracking for better performance
let eventQueue = [];
let batchTimeout = null;

export const trackEventBatch = (eventType, data = {}) => {
    const sessionId = getSessionId();
    
    eventQueue.push({
        sessionId,
        eventType,
        data: {
            ...data,
            timestamp: new Date().toISOString()
        }
    });

    // Clear existing timeout
    if (batchTimeout) {
        clearTimeout(batchTimeout);
    }

    // Send batch after 5 seconds or when queue reaches 10 events
    if (eventQueue.length >= 10) {
        sendBatch();
    } else {
        batchTimeout = setTimeout(sendBatch, 5000);
    }
};

const sendBatch = async () => {
    if (eventQueue.length === 0) return;

    const events = [...eventQueue];
    eventQueue = [];

    try {
        await fetch(`${API_BASE_URL}/api/analytics/track-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events })
        });
    } catch (error) {
        console.warn('Batch analytics failed:', error);
    }
};

// Send any remaining events before page unload
window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
        sendBatch();
    }
});

export default {
    trackEvent,
    trackRegistrationFlow,
    trackFormField,
    trackMultiEvent,
    trackPayment,
    trackPageView,
    trackError,
    StepTimer,
    trackEventBatch
};
