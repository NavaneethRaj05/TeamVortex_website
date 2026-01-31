const express = require('express');
const router = express.Router();
const Sponsor = require('../models/Sponsor');

// @route   GET /api/sponsors
// @desc    Get all sponsors
router.get('/', async (req, res) => {
    try {
        const sponsors = await Sponsor.find().sort({ type: 1, createdAt: -1 });
        res.json(sponsors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/sponsors/active
// @desc    Get all active sponsors
router.get('/active', async (req, res) => {
    try {
        const sponsors = await Sponsor.find({ isActive: true }).sort({ type: 1, createdAt: -1 });
        res.json(sponsors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/sponsors/:id
// @desc    Get single sponsor
router.get('/:id', async (req, res) => {
    try {
        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
        res.json(sponsor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/sponsors
// @desc    Create a sponsor
router.post('/', async (req, res) => {
    const sponsor = new Sponsor(req.body);
    try {
        const newSponsor = await sponsor.save();
        res.status(201).json(newSponsor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/sponsors/:id
// @desc    Update a sponsor
router.put('/:id', async (req, res) => {
    try {
        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });

        Object.assign(sponsor, req.body);
        await sponsor.save();
        res.json(sponsor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/sponsors/:id
// @desc    Delete a sponsor
router.delete('/:id', async (req, res) => {
    try {
        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });

        await sponsor.deleteOne();
        res.json({ message: 'Sponsor removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/sponsors/:id/toggle-status
// @desc    Toggle sponsor active status
router.put('/:id/toggle-status', async (req, res) => {
    try {
        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });

        sponsor.isActive = !sponsor.isActive;
        await sponsor.save();
        res.json(sponsor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;