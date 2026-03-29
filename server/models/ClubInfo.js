const mongoose = require('mongoose');

const clubInfoSchema = new mongoose.Schema({
    email: { type: String, default: 'teamvortexnce@gmail.com' },
    phone: { type: String, default: '+91 78922 04388' },
    linkedinUrl: { type: String, default: '#' },
    instagramUrl: { type: String, default: 'https://www.instagram.com/vortex_nce?igsh=MXM1djkybGdwaXc5bw==' },
    copyrightYear: { type: Number, default: 2026 },
    associationLogos: [{
        url: { type: String, default: '' },
        label: { type: String, default: '' }
    }],
    associationSliderTitle: { type: String, default: 'In Association With' },
    associationSliderMinLogos: { type: Number, default: 3 }
}, { strict: false });

module.exports = mongoose.model('ClubInfo', clubInfoSchema);
