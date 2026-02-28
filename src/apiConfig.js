// Set this to localhost for development and the production URL for deployment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// For Netlify deployment, use relative path to Netlify Functions
// For local development, use localhost:5001
const API_BASE_URL = isLocal ? 'http://localhost:5001' : '';

export default API_BASE_URL;
