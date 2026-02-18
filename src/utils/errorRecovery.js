/**
 * Error Recovery Utilities
 * Handles form data backup, retry logic, and graceful error handling
 */

const STORAGE_KEY_PREFIX = 'teamvortex_recovery_';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Save form data to localStorage for recovery
 */
export const saveFormData = (formId, data) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${formId}`;
    const payload = {
      data,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Failed to save form data:', error);
    return false;
  }
};

/**
 * Recover form data from localStorage
 */
export const recoverFormData = (formId, maxAgeMs = 3600000) => { // Default 1 hour
  try {
    const key = `${STORAGE_KEY_PREFIX}${formId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;
    
    const payload = JSON.parse(stored);
    const age = Date.now() - payload.timestamp;
    
    // Check if data is too old
    if (age > maxAgeMs) {
      clearFormData(formId);
      return null;
    }
    
    return payload.data;
  } catch (error) {
    console.error('Failed to recover form data:', error);
    return null;
  }
};

/**
 * Clear saved form data
 */
export const clearFormData = (formId) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${formId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear form data:', error);
    return false;
  }
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async (
  fn,
  maxAttempts = MAX_RETRY_ATTEMPTS,
  baseDelay = RETRY_DELAY_MS
) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxAttempts - 1) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxAttempts} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check if error is recoverable (network error, timeout, etc.)
 */
export const isRecoverableError = (error) => {
  // Network errors
  if (error.message.includes('Failed to fetch')) return true;
  if (error.message.includes('Network request failed')) return true;
  if (error.message.includes('timeout')) return true;
  
  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) return true;
  
  // Rate limiting
  if (error.status === 429) return true;
  
  return false;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyError = (error) => {
  // Network errors
  if (error.message.includes('Failed to fetch')) {
    return 'Network connection lost. Please check your internet and try again.';
  }
  
  if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Server errors
  if (error.status === 500) {
    return 'Server error occurred. Our team has been notified. Please try again later.';
  }
  
  if (error.status === 503) {
    return 'Service temporarily unavailable. Please try again in a few minutes.';
  }
  
  if (error.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Client errors
  if (error.status === 400) {
    return error.message || 'Invalid request. Please check your information and try again.';
  }
  
  if (error.status === 404) {
    return 'Resource not found. Please refresh the page and try again.';
  }
  
  if (error.status === 409) {
    return error.message || 'Conflict detected. You may already be registered.';
  }
  
  // Default
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Handle API request with automatic retry and error recovery
 */
export const apiRequestWithRecovery = async (url, options = {}, formId = null) => {
  // Save form data before request if formId provided
  if (formId && options.body) {
    try {
      const data = JSON.parse(options.body);
      saveFormData(formId, data);
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  const makeRequest = async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = new Error();
      error.status = response.status;
      
      try {
        const data = await response.json();
        error.message = data.message || response.statusText;
      } catch (e) {
        error.message = response.statusText;
      }
      
      throw error;
    }
    
    return response.json();
  };
  
  try {
    const result = await retryWithBackoff(makeRequest);
    
    // Clear saved form data on success
    if (formId) {
      clearFormData(formId);
    }
    
    return result;
  } catch (error) {
    // Add user-friendly message
    error.userMessage = getUserFriendlyError(error);
    error.isRecoverable = isRecoverableError(error);
    throw error;
  }
};

/**
 * Debounce function for input validation
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if browser supports required features
 */
export const checkBrowserSupport = () => {
  const support = {
    localStorage: false,
    fetch: false,
    promises: false,
    fileReader: false
  };
  
  try {
    support.localStorage = typeof localStorage !== 'undefined';
    support.fetch = typeof fetch !== 'undefined';
    support.promises = typeof Promise !== 'undefined';
    support.fileReader = typeof FileReader !== 'undefined';
  } catch (e) {
    console.error('Browser support check failed:', e);
  }
  
  return support;
};

/**
 * Show toast notification (requires toast library or custom implementation)
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  // This is a placeholder - implement with your toast library
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // You can implement a custom toast here or use a library like react-toastify
  // For now, we'll use a simple alert for critical errors
  if (type === 'error') {
    // Don't use alert in production - use a proper toast notification
    // alert(message);
  }
};

/**
 * Log error to monitoring service (placeholder)
 */
export const logError = (error, context = {}) => {
  console.error('Error logged:', {
    message: error.message,
    stack: error.stack,
    status: error.status,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
  
  // In production, send to error monitoring service like Sentry
  // Sentry.captureException(error, { extra: context });
};

export default {
  saveFormData,
  recoverFormData,
  clearFormData,
  retryWithBackoff,
  isRecoverableError,
  getUserFriendlyError,
  apiRequestWithRecovery,
  debounce,
  checkBrowserSupport,
  showToast,
  logError
};
