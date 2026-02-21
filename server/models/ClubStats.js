const mongoose = require('mongoose');

const clubStatsSchema = new mongoose.Schema({
    // Editable stats for dashboard
    stats: {
        activeMembers: { type: String, default: "25+" },
        projectsBuilt: { type: String, default: "50+" },
        awardsWon: { type: String, default: "12" },
        majorEvents: { type: String, default: "5" },
        totalEvents: { type: Number, default: 0 }, // Auto-calculated from events
        activeContests: { type: Number, default: 0 }, // Auto-calculated
        totalRegistrations: { type: Number, default: 0 } // Auto-calculated
    },

    // Custom stats (admin can add more)
    customStats: [{
        label: { type: String, required: true },
        value: { type: String, required: true },
        icon: { type: String, default: 'Activity' }, // Lucide icon name
        color: { type: String, default: 'text-vortex-blue' }
    }],

    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
clubStatsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ClubStats', clubStatsSchema);
