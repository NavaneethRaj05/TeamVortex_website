const mongoose = require('mongoose');
const Event = require('./models/Event');
const dotenv = require('dotenv');

dotenv.config();

const seedPrayog = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        // Use the same connection string logic as server.js
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/team_vortex';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        const prayogData = {
            title: 'PRAYOG 1.0',
            description: "Prayog 1.0 was a flagship technical event organized by Team Vortex at Navkis College of Engineering, Hassan, held on 25th March 2025. Designed to foster innovation, collaboration, and tech-oriented problem-solving, Prayog 1.0 showcased the club's commitment to hands-on learning and student engagement through its four key sub-events. The event drew over 150 participants, reflecting strong interest across disciplines. Prayog 1.0 not only provided a platform for skill development and networking but also celebrated the diversity and enthusiasm of the tech community at Navkis College of Engineering. The success and energetic response to Prayog 1.0 have laid a strong foundation for it to become a recurring highlight in the annual calendar of Team Vortex.",
            date: new Date('2025-03-25T09:00:00'),
            startTime: '09:00',
            endTime: '17:00',
            location: 'Navkis College of Engineering',
            status: 'completed',
            eventType: 'Inter-College',
            category: 'Technical',
            // galleryDriveLink: '', // Left empty as per original
            // images: [], // Left empty
            priority: 10, // High priority to show first/top
            organizer: {
                name: 'Team Vortex',
                email: 'teamvortex@navkis.edu.in'
            }
        };

        // Check if it already exists to avoid duplicates
        const existing = await Event.findOne({ title: 'PRAYOG 1.0' });
        if (existing) {
            console.log('⚠️ PRAYOG 1.0 already exists. Updating...');
            await Event.findOneAndUpdate({ title: 'PRAYOG 1.0' }, prayogData);
            console.log('✅ PRAYOG 1.0 updated.');
        } else {
            console.log('🌱 Seeding PRAYOG 1.0...');
            await Event.create(prayogData);
            console.log('✅ PRAYOG 1.0 created successfully.');
        }

        console.log('👋 Closing connection...');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedPrayog();
