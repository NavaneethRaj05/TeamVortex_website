const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sponsor = require('./models/Sponsor');

dotenv.config();

// Sample sponsors data
const sampleSponsors = [
    {
        name: "TechCorp Solutions",
        description: "Leading technology solutions provider specializing in cloud infrastructure and AI-powered applications for modern enterprises.",
        type: "title",
        logo: "https://via.placeholder.com/200x100/4F46E5/FFFFFF?text=TechCorp",
        website: "https://techcorp.example.com",
        contactEmail: "partnerships@techcorp.com",
        contactPerson: "Sarah Johnson",
        phone: "+1 (555) 123-4567",
        industry: "Technology",
        sponsorshipAmount: 50000,
        benefits: [
            "Logo placement on all event materials",
            "Keynote speaking opportunity",
            "Premium booth space",
            "Social media promotion"
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        socialLinks: {
            linkedin: "https://linkedin.com/company/techcorp",
            twitter: "https://twitter.com/techcorp",
            instagram: "https://instagram.com/techcorp"
        },
        events: ["Tech Summit 2024", "Innovation Workshop"],
        notes: "Excellent long-term partner, very supportive of student initiatives"
    },
    {
        name: "InnovateLab",
        description: "Innovation hub and startup incubator focused on emerging technologies and entrepreneurship development.",
        type: "platinum",
        logo: "https://via.placeholder.com/200x100/10B981/FFFFFF?text=InnovateLab",
        website: "https://innovatelab.example.com",
        contactEmail: "hello@innovatelab.com",
        contactPerson: "Michael Chen",
        phone: "+1 (555) 234-5678",
        industry: "Startup Incubation",
        sponsorshipAmount: 25000,
        benefits: [
            "Workshop hosting rights",
            "Mentorship program access",
            "Recruitment opportunities",
            "Brand visibility"
        ],
        startDate: new Date('2024-03-01'),
        isActive: true,
        socialLinks: {
            linkedin: "https://linkedin.com/company/innovatelab",
            website: "https://innovatelab.example.com"
        },
        events: ["Startup Pitch Competition"],
        notes: "Great for providing mentorship and startup guidance"
    },
    {
        name: "DataFlow Analytics",
        description: "Advanced data analytics and business intelligence solutions for enterprise-level decision making.",
        type: "gold",
        logo: "https://via.placeholder.com/200x100/F59E0B/FFFFFF?text=DataFlow",
        website: "https://dataflow.example.com",
        contactEmail: "partnerships@dataflow.com",
        contactPerson: "Emily Rodriguez",
        industry: "Data Analytics",
        sponsorshipAmount: 15000,
        benefits: [
            "Data science workshop sponsorship",
            "Internship opportunities",
            "Technical resources access"
        ],
        startDate: new Date('2024-02-15'),
        isActive: true,
        events: ["Data Science Bootcamp"],
        notes: "Provides excellent internship opportunities for students"
    },
    {
        name: "CloudSecure Systems",
        description: "Cybersecurity and cloud security solutions provider ensuring digital safety for businesses worldwide.",
        type: "silver",
        logo: "https://via.placeholder.com/200x100/6B7280/FFFFFF?text=CloudSecure",
        website: "https://cloudsecure.example.com",
        contactEmail: "events@cloudsecure.com",
        contactPerson: "David Kim",
        industry: "Cybersecurity",
        sponsorshipAmount: 8000,
        benefits: [
            "Security workshop sponsorship",
            "Certification program support",
            "Guest speaker sessions"
        ],
        startDate: new Date('2024-04-01'),
        isActive: true,
        events: ["Cybersecurity Awareness Week"],
        notes: "Focuses on cybersecurity education and awareness"
    },
    {
        name: "DevTools Pro",
        description: "Professional development tools and software solutions for modern software development teams.",
        type: "bronze",
        logo: "https://via.placeholder.com/200x100/DC2626/FFFFFF?text=DevTools",
        website: "https://devtools.example.com",
        contactEmail: "community@devtools.com",
        contactPerson: "Lisa Wang",
        industry: "Software Development",
        sponsorshipAmount: 5000,
        benefits: [
            "Free software licenses",
            "Developer workshop support",
            "Technical documentation"
        ],
        startDate: new Date('2024-01-15'),
        isActive: true,
        events: ["Coding Bootcamp"],
        notes: "Provides valuable development tools and resources"
    },
    {
        name: "EduTech Partners",
        description: "Educational technology solutions and learning management systems for academic institutions.",
        type: "partner",
        logo: "https://via.placeholder.com/200x100/3B82F6/FFFFFF?text=EduTech",
        website: "https://edutech.example.com",
        contactEmail: "partnerships@edutech.com",
        contactPerson: "Robert Thompson",
        industry: "Education Technology",
        sponsorshipAmount: 3000,
        benefits: [
            "Educational platform access",
            "Learning resource sharing",
            "Student project support"
        ],
        startDate: new Date('2024-05-01'),
        isActive: true,
        events: ["EdTech Innovation Fair"],
        notes: "Great partner for educational initiatives"
    },
    {
        name: "TechNews Daily",
        description: "Leading technology news and media platform covering the latest trends in tech and innovation.",
        type: "media",
        logo: "https://via.placeholder.com/200x100/8B5CF6/FFFFFF?text=TechNews",
        website: "https://technews.example.com",
        contactEmail: "events@technews.com",
        contactPerson: "Jennifer Adams",
        industry: "Media & Publishing",
        sponsorshipAmount: 0,
        benefits: [
            "Event coverage and promotion",
            "Press release distribution",
            "Social media amplification"
        ],
        startDate: new Date('2024-01-01'),
        isActive: true,
        socialLinks: {
            twitter: "https://twitter.com/technewsdaily",
            linkedin: "https://linkedin.com/company/technews"
        },
        events: ["All major events"],
        notes: "Provides excellent media coverage and promotion"
    }
];

// Connect to MongoDB and seed data
const seedSponsors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team_vortex');
        console.log('✅ Connected to MongoDB');

        // Clear existing sponsors
        await Sponsor.deleteMany({});
        console.log('🗑️  Cleared existing sponsors');

        // Insert sample sponsors
        await Sponsor.insertMany(sampleSponsors);
        console.log('✅ Sample sponsors added successfully');

        console.log(`📊 Added ${sampleSponsors.length} sponsors:`);
        sampleSponsors.forEach(sponsor => {
            console.log(`   - ${sponsor.name} (${sponsor.type})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding sponsors:', error);
        process.exit(1);
    }
};

seedSponsors();