/**
 * Validation Utilities for Team Vortex Website
 * Provides robust, user-friendly validation functions
 */

/**
 * Enhanced Email Validation
 * - Less strict than before
 * - Provides warnings instead of blocking
 * - Better user experience
 */
export const validateEmail = (email, existingEmails = [], memberIndex = 0) => {
  const validationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Trim whitespace
  email = email.trim();

  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    validationResult.errors.push('Invalid email format. Please use format: user@domain.com');
    return validationResult;
  }

  // Extract domain and local part
  const [localPart, domain] = email.split('@');
  const domainLower = domain.toLowerCase();

  // Check for common typos in popular domains (BLOCKING)
  const commonDomains = {
    'gmail.com': ['gmai.com', 'gmial.com', 'gmail.co', 'gmaill.com', 'gmil.com', 'gmal.com'],
    'yahoo.com': ['yaho.com', 'yahoo.co', 'yahooo.com', 'yhoo.com', 'ymail.com'],
    'hotmail.com': ['hotmai.com', 'hotmial.com', 'hotmail.co', 'hotmal.com'],
    'outlook.com': ['outlok.com', 'outlook.co', 'outloo.com', 'outluk.com'],
    'icloud.com': ['iclod.com', 'icloud.co', 'icoud.com'],
    'protonmail.com': ['protonmail.co', 'protonmal.com']
  };

  let suggestedDomain = null;
  for (const [correct, typos] of Object.entries(commonDomains)) {
    if (typos.includes(domainLower)) {
      suggestedDomain = correct;
      break;
    }
  }

  if (suggestedDomain) {
    validationResult.errors.push(`Did you mean ${localPart}@${suggestedDomain}?`);
    validationResult.suggestions.push(`${localPart}@${suggestedDomain}`);
    return validationResult;
  }

  // Check for suspicious patterns (WARNING ONLY - NOT BLOCKING)
  const suspiciousPatterns = [
    { pattern: /test/i, message: 'Email contains "test" - please use your real email' },
    { pattern: /fake/i, message: 'Email contains "fake" - please use your real email' },
    { pattern: /dummy/i, message: 'Email contains "dummy" - please use your real email' },
    { pattern: /temp/i, message: 'Email contains "temp" - please use your real email' },
    { pattern: /example/i, message: 'Email contains "example" - please use your real email' },
    { pattern: /sample/i, message: 'Email contains "sample" - please use your real email' }
  ];

  for (const { pattern, message } of suspiciousPatterns) {
    if (pattern.test(email)) {
      validationResult.warnings.push(message);
      break; // Only show one warning
    }
  }

  // Validate domain format
  if (!domainLower.includes('.') || domainLower.endsWith('.') || domainLower.startsWith('.')) {
    validationResult.errors.push('Invalid domain format');
    return validationResult;
  }

  // Check for minimum length requirements
  if (localPart.length < 2) {
    validationResult.errors.push('Email username too short (minimum 2 characters)');
  }

  if (domain.length < 4) {
    validationResult.errors.push('Domain name too short (minimum 4 characters)');
  }

  // Check for consecutive dots or special characters
  if (email.includes('..') || email.includes('@@')) {
    validationResult.errors.push('Invalid email format (consecutive special characters)');
  }

  // Check for valid TLD (expanded list - WARNING ONLY for uncommon ones)
  const tld = domain.split('.').pop().toLowerCase();
  const commonTlds = [
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'in', 'uk', 'de', 'fr', 'jp', 'au', 
    'ca', 'br', 'ru', 'cn', 'it', 'es', 'nl', 'se', 'no', 'dk', 'fi', 'pl', 'be', 'ch', 'at', 
    'ie', 'nz', 'za', 'mx', 'ar', 'cl', 'pe', 'kr', 'th', 'sg', 'my', 'ph', 'id', 'vn', 'bd', 
    'pk', 'lk', 'np', 'mm', 'kh', 'la', 'bn', 'mv', 'ae', 'sa', 'eg', 'ng', 'ke', 'gh', 'tz',
    'ug', 'zm', 'zw', 'bw', 'mw', 'mu', 'sc', 'et', 'so', 'sd', 'dz', 'ma', 'tn', 'ly', 'ao',
    'mz', 'mg', 'rw', 'bi', 'dj', 'er', 'gm', 'gn', 'gw', 'lr', 'ml', 'mr', 'ne', 'sn', 'sl',
    'tg', 'bf', 'ci', 'cv', 'st', 'io', 'ac', 'ai', 'bz', 'cc', 'cx', 'gg', 'je', 'im', 'ms',
    'nu', 'nf', 'pn', 'sh', 'tc', 'vg', 'ws', 'tk', 'to', 'tv', 'vu', 'wf', 'yt', 'pm', 'tf'
  ];
  
  if (!commonTlds.includes(tld) && tld.length >= 2) {
    // Don't block, just warn
    validationResult.warnings.push(`Uncommon domain extension (.${tld}). Please verify your email is correct.`);
  }

  // Check for duplicate emails (BLOCKING)
  if (existingEmails && existingEmails.length > 0) {
    const emailLower = email.toLowerCase();
    const duplicates = existingEmails.filter((e, idx) => 
      e && e.toLowerCase() === emailLower && idx !== memberIndex
    );
    
    if (duplicates.length > 0) {
      validationResult.errors.push('This email is already used by another team member');
    }
  }

  // If no errors, mark as valid
  if (validationResult.errors.length === 0) {
    validationResult.isValid = true;
  }

  return validationResult;
};

/**
 * Phone Number Validation
 * Supports multiple formats
 */
export const validatePhone = (phone) => {
  const validationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // Check length (10-15 digits is standard for most countries)
  if (digitsOnly.length < 10) {
    validationResult.errors.push('Phone number too short (minimum 10 digits)');
  } else if (digitsOnly.length > 15) {
    validationResult.errors.push('Phone number too long (maximum 15 digits)');
  }

  // Check for valid Indian phone number format (if starts with +91 or 91)
  if (phone.startsWith('+91') || phone.startsWith('91')) {
    if (digitsOnly.length !== 12 && digitsOnly.length !== 10) {
      validationResult.warnings.push('Indian phone numbers should be 10 digits (without country code)');
    }
  }

  // Check for repeated digits (like 1111111111)
  const allSame = /^(\d)\1+$/.test(digitsOnly);
  if (allSame) {
    validationResult.errors.push('Phone number appears invalid (all same digits)');
  }

  if (validationResult.errors.length === 0) {
    validationResult.isValid = true;
  }

  return validationResult;
};

/**
 * Age Validation
 */
export const validateAge = (age) => {
  const validationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  const ageNum = parseInt(age);

  if (isNaN(ageNum)) {
    validationResult.errors.push('Please enter a valid age');
    return validationResult;
  }

  if (ageNum < 13) {
    validationResult.errors.push('Minimum age is 13 years');
  } else if (ageNum > 100) {
    validationResult.errors.push('Please enter a valid age');
  } else if (ageNum < 16) {
    validationResult.warnings.push('Participants under 16 may need parental consent');
  }

  if (validationResult.errors.length === 0) {
    validationResult.isValid = true;
  }

  return validationResult;
};

/**
 * ID Number Validation
 * Basic format check
 */
export const validateIdNumber = (idNumber) => {
  const validationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  if (!idNumber || idNumber.trim().length === 0) {
    // ID is optional, so empty is valid
    validationResult.isValid = true;
    return validationResult;
  }

  // Remove whitespace
  const id = idNumber.trim();

  // Check minimum length
  if (id.length < 3) {
    validationResult.errors.push('ID number too short (minimum 3 characters)');
  }

  // Check maximum length
  if (id.length > 50) {
    validationResult.errors.push('ID number too long (maximum 50 characters)');
  }

  // Check for valid characters (alphanumeric, dash, slash)
  if (!/^[a-zA-Z0-9\-\/]+$/.test(id)) {
    validationResult.errors.push('ID number contains invalid characters');
  }

  if (validationResult.errors.length === 0) {
    validationResult.isValid = true;
  }

  return validationResult;
};

/**
 * Name Validation
 */
export const validateName = (name) => {
  const validationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  if (!name || name.trim().length === 0) {
    validationResult.errors.push('Name is required');
    return validationResult;
  }

  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < 2) {
    validationResult.errors.push('Name too short (minimum 2 characters)');
  }

  // Check maximum length
  if (trimmedName.length > 100) {
    validationResult.errors.push('Name too long (maximum 100 characters)');
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-'\.]+$/.test(trimmedName)) {
    validationResult.errors.push('Name contains invalid characters');
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    validationResult.errors.push('Name must contain at least one letter');
  }

  if (validationResult.errors.length === 0) {
    validationResult.isValid = true;
  }

  return validationResult;
};

/**
 * Team Name Validation
 */
export const validateTeamName = (teamName) => {
  const validationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  if (!teamName || teamName.trim().length === 0) {
    validationResult.errors.push('Team name is required');
    return validationResult;
  }

  const trimmedName = teamName.trim();

  // Check minimum length
  if (trimmedName.length < 3) {
    validationResult.errors.push('Team name too short (minimum 3 characters)');
  }

  // Check maximum length
  if (trimmedName.length > 50) {
    validationResult.errors.push('Team name too long (maximum 50 characters)');
  }

  // Check for profanity or inappropriate words (basic check)
  const inappropriateWords = ['fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'bastard'];
  const lowerName = trimmedName.toLowerCase();
  for (const word of inappropriateWords) {
    if (lowerName.includes(word)) {
      validationResult.errors.push('Team name contains inappropriate language');
      break;
    }
  }

  if (validationResult.errors.length === 0) {
    validationResult.isValid = true;
  }

  return validationResult;
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Indian format: +91 XXXXX XXXXX
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+91 ${digitsOnly.slice(2, 7)} ${digitsOnly.slice(7)}`;
  }
  
  // 10 digit format: XXXXX XXXXX
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
  }
  
  return phone;
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export default {
  validateEmail,
  validatePhone,
  validateAge,
  validateIdNumber,
  validateName,
  validateTeamName,
  formatPhoneNumber,
  sanitizeInput
};
