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
    max: 500, // Allow more requests for 1000 concurrent users
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
        ? true // Allow all origins in production (Netlify handles this)
        : true,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '25mb' })); // Body parser, reading data from body into req.body
app.use(express.urlencoded({ limit: '25mb', extended: true }));

app.use(xss()); // Data sanitization against XSS
app.use('/api/', globalLimiter); // Apply to all API routes
app.use('/api/auth/login', authLimiter);
app.use('/api/events/:id/register', authLimiter);

// Optimized Database Connection with retry + serverless connection caching
mongoose.set('strictQuery', false);
let mongoConnectPromise = null;
const connectDB = async (retries = 5) => {
    // Reuse existing connection in serverless warm invocations
    if (mongoose.connection.readyState === 1) return;
    if (mongoConnectPromise) return mongoConnectPromise;

    mongoConnectPromise = (async () => {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team_vortex', {
                maxPoolSize: 10,
                minPoolSize: 1,
                serverSelectionTimeoutMS: 8000,
                socketTimeoutMS: 45000,
                maxIdleTimeMS: 60000,
                compressors: 'zlib',
                waitQueueTimeoutMS: 10000,
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

            mongoose.connection.on('error', (err) => { console.error('❌ MongoDB connection error:', err); mongoConnectPromise = null; });
            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected — retrying in 5s...');
                mongoConnectPromise = null;
                setTimeout(() => connectDB(3), 5000);
            });
            mongoose.connection.on('reconnected', () => { console.log('✅ MongoDB reconnected'); });

        } catch (error) {
            mongoConnectPromise = null;
            console.error('❌ MongoDB Connection Error:', error.message);
            if (retries > 0) {
                console.log(`⏳ Retrying in 5 seconds... (${retries} attempts left)`);
                setTimeout(() => connectDB(retries - 1), 5000);
            } else {
                console.error('❌ MongoDB connection failed after all retries.');
            }
        }
    })();
    return mongoConnectPromise;
};

connectDB();

// Start Event Scheduler for automated notifications (only in non-serverless environment)
if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.NETLIFY) {
    const { startScheduler } = require('./utils/eventScheduler');
    startScheduler();
}

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

// Ensure DB is connected before handling API requests (critical for serverless cold starts)
app.use('/api', async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        try { await connectDB(); } catch (e) { /* will retry */ }
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
const chatbotRoutes = require('./routes/chatbot');
const clubStatsRoutes = require('./routes/clubStats');
const paymentRoutes = require('./routes/payments');

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/team', teamRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/sponsors', sponsorRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/chatbot', chatbotRoutes);
apiRouter.use('/club-stats', clubStatsRoutes);
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

// Start Server (only if not in serverless environment)
if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.NETLIFY) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    });
}

module.exports = app;
