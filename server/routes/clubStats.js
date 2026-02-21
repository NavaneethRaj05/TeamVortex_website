const express = require('express');
const router = express.Router();
const ClubStats = require('../models/ClubStats');
const Event = require('../models/Event');

// @route   GET /api/club-stats
// @desc    Get club statistics
router.get('/', async (req, res) => {
    try {
        let stats = await ClubStats.findOne();
        
        // Create default if doesn't exist
        if (!stats) {
            stats = new ClubStats({
                stats: {
                    activeMembers: "25+",
                    projectsBuilt: "50+",
                    awardsWon: "12",
                    majorEvents: "5"
                }
            });
            await stats.save();
        }
        
        // Auto-calculate event-related stats
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const allEvents = await Event.find({ status: { $ne: 'draft' } });
        const upcomingEvents = allEvents.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate >= now;
        });
        
        stats.stats.totalEvents = allEvents.length;
        stats.stats.activeContests = upcomingEvents.length;
        stats.stats.totalRegistrations = upcomingEvents.reduce((acc, e) => acc + (e.registrationCount || 0), 0);
        
        await stats.save();
        
        res.json(stats);
    } catch (err) {
        console.error('Error fetching club stats:', err);
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/club-stats
// @desc    Update club statistics (admin only)
router.put('/', async (req, res) => {
    try {
        let stats = await ClubStats.findOne();
        
        if (!stats) {
            stats = new ClubStats(req.body);
        } else {
            // Update only the editable fields
            if (req.body.stats) {
                stats.stats.activeMembers = req.body.stats.activeMembers || stats.stats.activeMembers;
                stats.stats.projectsBuilt = req.body.stats.projectsBuilt || stats.stats.projectsBuilt;
                stats.stats.awardsWon = req.body.stats.awardsWon || stats.stats.awardsWon;
                stats.stats.majorEvents = req.body.stats.majorEvents || stats.stats.majorEvents;
            }
            
            if (req.body.customStats) {
                stats.customStats = req.body.customStats;
            }
        }
        
        await stats.save();
        
        res.json({ message: 'Club stats updated successfully', stats });
    } catch (err) {
        console.error('Error updating club stats:', err);
        res.status(400).json({ message: err.message });
    }
});

// @route   POST /api/club-stats/custom
// @desc    Add custom stat
router.post('/custom', async (req, res) => {
    try {
        const stats = await ClubStats.findOne();
        
        if (!stats) {
            return res.status(404).json({ message: 'Club stats not found' });
        }
        
        stats.customStats.push(req.body);
        await stats.save();
        
        res.json({ message: 'Custom stat added', stats });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/club-stats/custom/:id
// @desc    Delete custom stat
router.delete('/custom/:id', async (req, res) => {
    try {
        const stats = await ClubStats.findOne();
        
        if (!stats) {
            return res.status(404).json({ message: 'Club stats not found' });
        }
        
        stats.customStats = stats.customStats.filter(s => s._id.toString() !== req.params.id);
        await stats.save();
        
        res.json({ message: 'Custom stat deleted', stats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
