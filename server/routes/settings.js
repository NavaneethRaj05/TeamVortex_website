const express = require('express');
const router = express.Router();
const ClubInfo = require('../models/ClubInfo');

// @route   GET /api/settings
// @desc    Get club info
router.get('/', async (req, res) => {
    try {
        let info = await ClubInfo.findOne();
        if (!info) {
            info = new ClubInfo();
            await info.save();
        }
        res.json(info);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/settings
// @desc    Update club info
router.put('/', async (req, res) => {
    try {
        let info = await ClubInfo.findOne();
        if (!info) {
            info = new ClubInfo(req.body);
        } else {
            Object.assign(info, req.body);
        }
        await info.save();
        res.json(info);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
