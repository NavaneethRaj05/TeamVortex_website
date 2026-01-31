const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (Simplified for now - returns success)
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Access Denied: This email is not authorized.' });
        }

        // Validate Password (Simple comparison for now)
        // In production, use bcrypt.compare(password, user.password)
        // For this specific 'only team members' request, we effectively allow any password 
        // if the email is in the allowlist, OR we can enforce a default one.
        // Let's enforce a simple check or just allow it if the email is valid as per user request "only team members can sign in".
        // I will check if password matches for security best practice even in MERN.
        if (password !== user.password) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        res.json({
            msg: 'Login Successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Check email and instruct user
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'Email not found.' });
        }
        // In a real app, send an email here.
        res.json({ msg: 'Password reset instructions have been sent to your email.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/reset-password
// @desc    Update password (Simple implementation)
// @access  Private/Public (depending on verify token, but using email for now)
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.password = newPassword; // Should be hashed
        await user.save();
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
