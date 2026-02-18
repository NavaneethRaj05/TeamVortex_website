const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');

const helmet = require('helmet');

const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable compression for all responses
app.use(compression({
    level: 6, // Compression level (0-9)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Rate Limiting - More lenient for better performance
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Increased limit for better performance
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    skip: (req) => {
        // Skip rate limiting for health checks and static assets
        return req.path === '/api/health' || req.path.startsWith('/static');
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Slightly increased for better UX
    message: 'Too many registration/login attempts, please try again later'
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for better performance in development
    crossOriginEmbedderPolicy: false
}));

// CORS with optimized settings
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com', 'https://your-netlify-domain.netlify.app'] 
        : true,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body (limited to 10kb for security)

app.use(xss()); // Data sanitization against XSS
app.use('/api/', globalLimiter); // Apply to all API routes
app.use('/api/auth/login', authLimiter);
app.use('/api/events/:id/register', authLimiter);

// Optimized Database Connection
mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team_vortex', {
            // Connection optimization options
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            // Additional performance optimizations
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            compressors: 'zlib', // Enable compression for network traffic
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Enable connection monitoring
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
        
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

connectDB();

// Add response compression and optimization headers
app.use((req, res, next) => {
    // Enable keep-alive connections
    res.set('Connection', 'keep-alive');
    
    // Add performance headers
    res.set('X-DNS-Prefetch-Control', 'on');
    res.set('X-Frame-Options', 'DENY');
    
    // Enable browser caching for static assets
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
    
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const teamRoutes = require('./routes/team');
const settingsRoutes = require('./routes/settings');
const sponsorRoutes = require('./routes/sponsors');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payments');

// Start Event Scheduler for automated notifications
const { startScheduler } = require('./utils/eventScheduler');
startScheduler();

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/team', teamRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/sponsors', sponsorRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/payments', paymentRoutes);

// Mount the router on both paths to support local dev and Netlify functions
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);

// Basic Route for router
apiRouter.get('/', (req, res) => {
    res.send('Team Vortex API is Running');
});

app.get('/api', (req, res) => {
    res.send('Team Vortex API is Running');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Serve React build in production (for Replit deployment)
if (process.env.NODE_ENV === 'production') {
    // Serve static files from React build
    app.use(express.static(path.join(__dirname, '../build')));
    
    // Handle React routing - return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;
