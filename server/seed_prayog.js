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
            description: "Prayog 1.0 was a flagship technical event organized by Team Vortex at Navkis College of Engineering, Hassan, held on 25th March 2025. Designed to foster innovation, collaboration, and tech-oriented problem-solving, Prayog 1.0 showcased the club's commitment to hands-on learning and student engagement through its four key sub-events.\n\nThe event drew over 150 participants, reflecting strong interest across disciplines. Prayog 1.0 not only provided a platform for skill development and networking but also celebrated the diversity and enthusiasm of the tech community at Navkis College of Engineering. The success and energetic response to Prayog 1.0 have laid a strong foundation for it to become a recurring highlight in the annual calendar of Team Vortex.",
            date: new Date('2025-03-25T09:00:00'),
            startTime: '09:00',
            endTime: '17:00',
            location: 'Navkis College of Engineering',
            status: 'completed',
            eventType: 'Inter-College',
            category: 'Technical',
            galleryDriveLink: '', // Left empty as per original
            images: [], // Left empty
            priority: 10, // High priority to show first/top
            organizer: {
                name: 'Team Vortex',
                email: 'teamvortex@navkis.edu.in'
            },
            subEvents: [
                {
                    title: 'Champions League',
                    description: 'Branch-wise competitive event where teams represented their respective departments.',
                    details: 'Champions League was a branch-wise competitive event where teams represented their respective departments. It focused on testing participants\' technical knowledge, logical thinking, and teamwork through multiple challenging rounds, fostering healthy competition among branches.',
                    icon: 'Trophy',
                    color: 'from-yellow-500 to-orange-500',
                    duration: 'Full Day',
                    participants: 'Branch-wise Teams',
                    images: []
                },
                {
                    title: 'Hackathon',
                    description: 'Inter-college team-based coding and innovation challenge.',
                    details: 'The Hackathon was an inter-college team-based coding and innovation challenge. Teams worked intensively to develop practical solutions to real-world problems within a limited time. This event emphasized innovation, problem-solving, coding skills, and collaboration.',
                    icon: 'Code',
                    color: 'from-vortex-blue to-cyan-400',
                    duration: 'Full Day',
                    participants: 'Inter-College Teams',
                    images: []
                },
                {
                    title: 'Eureka',
                    description: 'Idea and innovation-based event conducted within the college.',
                    details: 'Eureka was an idea and innovation-based event conducted within the college. Teams presented creative solutions and project ideas to real-world or technical problems, focusing on original thinking, feasibility, and impact.',
                    icon: 'Key',
                    color: 'from-purple-500 to-pink-500',
                    duration: 'Half Day',
                    participants: 'Intra-College Teams',
                    images: []
                },
                {
                    title: 'Gameathon',
                    description: 'Fun yet competitive intra-college event centered around strategic games.',
                    details: 'Gameathon was a fun yet competitive intra-college event centered around strategic and skill-based games. It tested participants\' decision-making, coordination, and analytical skills, making it both engaging and intellectually stimulating.',
                    icon: 'Gamepad2',
                    color: 'from-red-500 to-vortex-orange',
                    duration: 'Half Day',
                    participants: 'Intra-College Teams',
                    images: []
                }
            ]
        };

        // Check if it already exists to avoid duplicates
        const existing = await Event.findOne({ title: 'PRAYOG 1.0' });
        if (existing) {
            console.log('⚠️ PRAYOG 1.0 already exists. Updating with sub-events...');
            await Event.findOneAndUpdate({ title: 'PRAYOG 1.0' }, prayogData);
            console.log('✅ PRAYOG 1.0 updated with sub-events successfully.');
        } else {
            console.log('🌱 Seeding PRAYOG 1.0 with sub-events...');
            await Event.create(prayogData);
            console.log('✅ PRAYOG 1.0 created with sub-events successfully.');
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
