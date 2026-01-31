const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['faculty', 'core', 'technical', 'creative', 'editorial', 'alumni']
    },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    achievements: [{ type: String }],
    linkedin: { type: String },
    instagram: { type: String },
    discord: { type: String },
    email: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    joinedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);
