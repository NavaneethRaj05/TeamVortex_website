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
        const info = await ClubInfo.findOneAndUpdate(
            {},
            { $set: req.body },
            { new: true, upsert: true, strict: false }
        );
        res.json(info);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   POST /api/settings/test-email
// @desc    Send a test email to verify SMTP config
router.post('/test-email', async (req, res) => {
    const { to } = req.body;
    if (!to) return res.status(400).json({ message: 'Provide a "to" email address' });

    const { sendEmail } = require('../utils/notificationService');
    const result = await sendEmail(to, 'paymentApproved', {
        name: 'Test User',
        eventTitle: 'Test Event',
        amount: 100,
        utrNumber: '123456789012',
        date: new Date().toLocaleDateString(),
        time: '10:00 AM',
        location: 'Test Venue'
    });

    if (result.success) {
        res.json({ message: `✅ Test email sent to ${to}`, messageId: result.messageId });
    } else {
        res.status(500).json({ message: `❌ Failed: ${result.error}` });
    }
});

module.exports = router;
