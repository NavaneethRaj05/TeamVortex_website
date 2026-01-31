const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');

// @route   GET /api/team
// @desc    Get all team members
router.get('/', async (req, res) => {
    try {
        const members = await TeamMember.find();
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/team
// @desc    Add a new team member
router.post('/', async (req, res) => {
    const member = new TeamMember(req.body);
    try {
        const newMember = await member.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/team/:id
// @desc    Update a team member
router.put('/:id', async (req, res) => {
    try {
        const member = await TeamMember.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        Object.assign(member, req.body);
        await member.save();
        res.json(member);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/team/:id
// @desc    Delete a team member
router.delete('/:id', async (req, res) => {
    try {
        const member = await TeamMember.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        await member.deleteOne();
        res.json({ message: 'Member removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
