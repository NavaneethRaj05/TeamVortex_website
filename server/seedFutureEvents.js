const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

// Create events with future dates (2026)
const futureEvents = [
    {
        title: "AI & Machine Learning Workshop",
        description: "Dive deep into artificial intelligence and machine learning concepts. Learn to build your first ML model with Python and TensorFlow.",
        date: new Date('2026-02-15'),
        startTime: "10:00",
        endTime: "16:00",
        location: "Computer Lab A, NCE Hassan",
        eventType: "Workshop",
        category: "Technical",
        price: 150,
        capacity: 40,
        registrationType: "Solo",
        minTeamSize: 1,
        maxTeamSize: 1,
        registrationOpens: new Date('2026-01-29'),
        registrationCloses: new Date('2026-02-10'),
        autoCloseOnCapacity: true,
        enableWaitlist: true,
        organizer: {
            name: "Team Vortex",
            email: "teamvortexnce@gmail.com",
            phone: "+91 78922 04388",
            department: "Computer Science"
        },
        rules: "Bring your laptop with Python installed. Basic programming knowledge required.",
        tags: ["AI", "machine learning", "python", "tensorflow", "workshop"],
        images: [
            "https://via.placeholder.com/800x400/6366F1/FFFFFF?text=AI+ML+Workshop"
        ],
        registrations: [],
        waitlist: [],
        feedback: []
    },
    {
        title: "CodeStorm 2026 - Programming Contest",
        description: "The ultimate competitive programming challenge! Solve algorithmic problems, compete with the best coders, and win exciting prizes.",
        date: new Date('2026-03-05'),
        startTime: "09:00",
        endTime: "17:00",
        location: "Main Auditorium, NCE Hassan",
        eventType: "Inter-College",
        category: "Technical",
        price: 100,
        capacity: 150,
        registrationType: "Solo",
        minTeamSize: 1,
        maxTeamSize: 1,
        registrationOpens: new Date('2026-01-29'),
        registrationCloses: new Date('2026-02-28'),
        autoCloseOnCapacity: true,
        enableWaitlist: true,
        organizer: {
            name: "Team Vortex",
            email: "teamvortexnce@gmail.com",
            phone: "+91 78922 04388",
            department: "Computer Science"
        },
        rules: "Individual contest. Bring your laptop, valid ID, and competitive spirit! No external help allowed.",
        tags: ["programming", "contest", "algorithms", "competitive coding", "prizes"],
        prizes: [
            { position: "1st", cashAmount: 10000, description: "Winner Trophy + Certificate + Cash Prize", trophy: true },
            { position: "2nd", cashAmount: 7000, description: "Runner-up Trophy + Certificate + Cash Prize", trophy: true },
            { position: "3rd", cashAmount: 5000, description: "Second Runner-up Trophy + Certificate + Cash Prize", trophy: true }
        ],
        images: [
            "https://via.placeholder.com/800x400/10B981/FFFFFF?text=CodeStorm+2026"
        ],
        registrations: [],
        waitlist: [],
        feedback: []
    },
    {
        title: "Web3 & Blockchain Hackathon",
        description: "Build the future of decentralized applications! 48-hour hackathon focused on blockchain technology, smart contracts, and DeFi solutions.",
        date: new Date('2026-03-20'),
        startTime: "18:00",
        endTime: "18:00",
        location: "Innovation Hub, NCE Hassan",
        eventType: "Inter-College",
        category: "Technical",
        price: 200,
        capacity: 80,
        registrationType: "Team",
        minTeamSize: 2,
        maxTeamSize: 4,
        registrationOpens: new Date('2026-01-29'),
        registrationCloses: new Date('2026-03-15'),
        autoCloseOnCapacity: true,
        enableWaitlist: true,
        organizer: {
            name: "Team Vortex",
            email: "teamvortexnce@gmail.com",
            phone: "+91 78922 04388",
            department: "Computer Science"
        },
        rules: "Teams of 2-4 members. 48-hour continuous hackathon. Accommodation and meals provided.",
        tags: ["blockchain", "web3", "hackathon", "smart contracts", "defi"],
        prizes: [
            { position: "1st", cashAmount: 25000, description: "Winning Team Trophy + Certificates + Cash Prize", trophy: true },
            { position: "2nd", cashAmount: 15000, description: "Runner-up Team Trophy + Certificates + Cash Prize", trophy: true },
            { position: "3rd", cashAmount: 10000, description: "Third Place Team Trophy + Certificates + Cash Prize", trophy: true }
        ],
        images: [
            "https://via.placeholder.com/800x400/8B5CF6/FFFFFF?text=Web3+Hackathon"
        ],
        registrations: [],
        waitlist: [],
        feedback: []
    },
    {
        title: "Free Python Bootcamp",
        description: "Learn Python programming from scratch! Perfect for beginners who want to start their coding journey. Completely free event with certificates.",
        date: new Date('2026-02-08'),
        startTime: "14:00",
        endTime: "17:00",
        location: "Computer Lab B, NCE Hassan",
        eventType: "Open",
        category: "Technical",
        price: 0,
        capacity: 60,
        registrationType: "Solo",
        minTeamSize: 1,
        maxTeamSize: 1,
        registrationOpens: new Date('2026-01-29'),
        registrationCloses: new Date('2026-02-05'),
        autoCloseOnCapacity: true,
        enableWaitlist: true,
        organizer: {
            name: "Team Vortex",
            email: "teamvortexnce@gmail.com",
            phone: "+91 78922 04388",
            department: "Computer Science"
        },
        rules: "No prior programming experience required. Bring your laptop and enthusiasm to learn!",
        tags: ["python", "bootcamp", "free", "beginners", "programming"],
        participationCertificate: true,
        images: [
            "https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Python+Bootcamp"
        ],
        registrations: [],
        waitlist: [],
        feedback: []
    }
];

// Connect to MongoDB and seed data
const seedFutureEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team_vortex');
        console.log('✅ Connected to MongoDB');

        // Clear existing events
        if (process.env.SEED_CLEAR === 'true') {
            await Event.deleteMany({});
            console.log('🗑️  Cleared existing events');
        }

        // Insert future events
        const createdEvents = await Event.insertMany(futureEvents);
        console.log('✅ Future events created successfully');

        console.log(`📊 Created ${createdEvents.length} events:`);
        createdEvents.forEach(event => {
            console.log(`   📅 ${event.title} - ${event.date.toLocaleDateString()} at ${event.startTime}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding future events:', error);
        process.exit(1);
    }
};

seedFutureEvents();