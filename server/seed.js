const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const TeamMember = require('./models/TeamMember');
const ClubInfo = require('./models/ClubInfo');

dotenv.config();

const teamMembers = [
    { name: 'Shashank L G', role: 'President', category: 'core', email: 'rankinghead@gmail.com' },
    { name: 'Pooja Venkatesh', role: 'Vice-President', category: 'core' },
    { name: 'Varsha Krishnamurthy', role: 'Secretary', category: 'core' },
    { name: 'Yashwanth H L', role: 'Secretary', category: 'core' },
    { name: 'Achala Shanubhog', role: 'Internal Affairs Head', category: 'core' },
    { name: 'Karthik Gowda C Y', role: 'Internal Affairs Head', category: 'core' },

    { name: 'Dr. Sathisha M.S', role: 'Convener - Head of the Department', category: 'faculty', email: 'teamvortexnce@gmail.com' },

    { name: 'Navaneeth Raj', role: 'Digital Head', category: 'technical' },
    { name: 'Preetham H A', role: 'Digital Head', category: 'technical' },
    { name: 'Namratha S Gowda', role: 'Project Director', category: 'technical' },
    { name: 'Smitha Shrinivas', role: 'Project Director', category: 'technical' },
    { name: 'Rashmi', role: 'Project Director', category: 'technical' },
    { name: 'B Yogesh', role: 'Technical Head', category: 'technical' },

    { name: 'Yashas H G', role: 'Event Manager', category: 'creative' },
    { name: 'Dharani', role: 'Media Director', category: 'creative' },

    { name: 'Charanya S', role: 'Editorial Head', category: 'editorial' },
    { name: 'Keerthana H S', role: 'Editorial Head', category: 'editorial' },
    { name: 'Manvith', role: 'Lead Editor', category: 'editorial' }
];

// Combine for User Login
const allowedUsers = [
    { name: 'Shashank L G', email: 'rankinghead@gmail.com', role: 'admin' },
    { name: 'Team Vortex', email: 'teamvortexnce@gmail.com', role: 'admin' },
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team_vortex')
    .then(async () => {
        console.log('Using database:', process.env.MONGODB_URI || 'local');

        // Seed Users
        await User.deleteMany({});
        for (const member of allowedUsers) {
            await User.create({
                name: member.name,
                email: member.email,
                password: 'vortex_member',
                role: member.role
            });
        }
        console.log('✅ Users Seeded');

        // Seed Team Members
        await TeamMember.deleteMany({});
        for (const member of teamMembers) {
            await TeamMember.create(member);
        }
        console.log('✅ Team Members Seeded');

        // Seed Club Info
        await ClubInfo.deleteMany({});
        await ClubInfo.create({});
        console.log('✅ Club Info Seeded');

        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
