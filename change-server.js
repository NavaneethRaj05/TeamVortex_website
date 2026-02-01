const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const cors = require('cors');

const app = express();
const PORT = process.env.CHANGE_PORT || 7778;

// Middleware
app.use(cors());
app.use(express.json());

// Store change history
const changeHistory = [];
const MAX_HISTORY = 100;

// File change statistics
const stats = {
    totalChanges: 0,
    fileTypes: {},
    lastChange: null,
    changesByHour: {}
};

// Watch for file changes
const watchPaths = [
    './src/**/*',
    './server/**/*',
    './public/**/*',
    './package.json',
    './tailwind.config.js',
    './postcss.config.js'
];

const ignoredPaths = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/*.log',
    '**/.DS_Store'
];

console.log('🔍 Starting file watcher...');

const watcher = chokidar.watch(watchPaths, {
    ignored: ignoredPaths,
    persistent: true,
    ignoreInitial: true
});

function recordChange(eventType, filePath) {
    const timestamp = new Date();
    const ext = path.extname(filePath).toLowerCase() || 'no-extension';
    const hour = timestamp.getHours();
    
    const change = {
        id: Date.now(),
        timestamp,
        eventType,
        filePath,
        extension: ext,
        size: getFileSize(filePath)
    };
    
    // Add to history
    changeHistory.unshift(change);
    if (changeHistory.length > MAX_HISTORY) {
        changeHistory.pop();
    }
    
    // Update statistics
    stats.totalChanges++;
    stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
    stats.lastChange = timestamp;
    stats.changesByHour[hour] = (stats.changesByHour[hour] || 0) + 1;
    
    // Log to console
    console.log(`📝 ${eventType.toUpperCase()}: ${filePath} (${ext})`);
    
    // Broadcast to connected clients (if WebSocket is added later)
    return change;
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (err) {
        return 0;
    }
}

// Watcher events
watcher
    .on('change', (filePath) => recordChange('change', filePath))
    .on('add', (filePath) => recordChange('add', filePath))
    .on('unlink', (filePath) => recordChange('delete', filePath))
    .on('error', (error) => console.error('❌ Watcher error:', error))
    .on('ready', () => console.log('✅ File watcher ready and monitoring changes'));

// API Routes
app.get('/api/changes', (req, res) => {
    const { limit = 50, type, extension } = req.query;
    
    let filtered = [...changeHistory];
    
    if (type) {
        filtered = filtered.filter(change => change.eventType === type);
    }
    
    if (extension) {
        filtered = filtered.filter(change => change.extension === extension);
    }
    
    res.json({
        changes: filtered.slice(0, parseInt(limit)),
        total: filtered.length,
        stats
    });
});

app.get('/api/stats', (req, res) => {
    res.json(stats);
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        watcher: {
            isWatching: watcher.getWatched(),
            paths: watchPaths
        },
        stats
    });
});

app.post('/api/clear-history', (req, res) => {
    changeHistory.length = 0;
    stats.totalChanges = 0;
    stats.fileTypes = {};
    stats.lastChange = null;
    stats.changesByHour = {};
    
    res.json({ message: 'History cleared successfully' });
});

// Get file content (for preview)
app.get('/api/file/:filePath(*)', (req, res) => {
    const filePath = req.params.filePath;
    const fullPath = path.resolve(filePath);
    
    // Security check - only allow files within project directory
    if (!fullPath.startsWith(path.resolve('.'))) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const stats = fs.statSync(fullPath);
        
        res.json({
            content,
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
        });
    } catch (err) {
        res.status(404).json({ error: 'File not found or cannot be read' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Change monitoring server running on http://localhost:${PORT}`);
    console.log(`📊 View changes: http://localhost:${PORT}/api/changes`);
    console.log(`📈 View stats: http://localhost:${PORT}/api/stats`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down file watcher...');
    watcher.close();
    process.exit(0);
});

module.exports = app;
