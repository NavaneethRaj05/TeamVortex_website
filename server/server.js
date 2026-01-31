const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Stricter limit for auth and registration
    message: 'Too many registration/login attempts, please try again later'
});

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body (limited to 10kb for security)
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use('/api/', globalLimiter); // Apply to all API routes
app.use('/api/auth/login', authLimiter);
app.use('/api/events/:id/register', authLimiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team_vortex')
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const teamRoutes = require('./routes/team');
const settingsRoutes = require('./routes/settings');
const sponsorRoutes = require('./routes/sponsors');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sponsors', sponsorRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Team Vortex API is Running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
