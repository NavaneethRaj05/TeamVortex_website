// Set this to localhost for development and the production URL for deployment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// TODO: Update this with your production API URL before deploying
// Examples:
// - Netlify Functions: 'https://your-site.netlify.app/.netlify/functions'
// - Heroku: 'https://your-app.herokuapp.com'
// - Custom domain: 'https://api.teamvortex.com'
const API_BASE_URL = isLocal ? 'http://localhost:5001' : 'https://your-production-api-url.com';

export default API_BASE_URL;
