const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team_vortex')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

const Event = require('./models/Event');

async function updatePrayogSubEvents() {
  try {
    console.log('🔍 Finding PRAYOG 1.0 event...');
    
    // Find PRAYOG 1.0 event
    const prayogEvent = await Event.findOne({ 
      title: { $regex: /prayog/i } 
    });

    if (!prayogEvent) {
      console.log('❌ PRAYOG 1.0 event not found');
      process.exit(1);
    }

    console.log('✅ Found event:', prayogEvent.title);
    console.log('📝 Current sub-events:', prayogEvent.subEvents?.length || 0);

    // Update sub-events with correct data
    prayogEvent.subEvents = [
      {
        title: 'Champions League',
        description: 'Branch-wise competitive event where teams represented their respective departments.',
        details: 'Champions League was a branch-wise competitive event where teams represented their respective departments. It focused on testing participants\' technical knowledge, logical thinking, and teamwork through multiple challenging rounds, fostering healthy competition among branches.',
        icon: 'Trophy',
        color: 'from-yellow-500 to-orange-500',
        duration: 'Full Day',
        participants: 'Branch-wise Teams'
      },
      {
        title: 'Hackathon',
        description: 'Inter-college team-based coding and innovation challenge.',
        details: 'The Hackathon was an inter-college team-based coding and innovation challenge. Teams worked intensively to develop practical solutions to real-world problems within a limited time. This event emphasized innovation, problem-solving, coding skills, and collaboration.',
        icon: 'Code',
        color: 'from-vortex-blue to-cyan-400',
        duration: 'Full Day',
        participants: 'Inter-College Teams'
      },
      {
        title: 'Eureka',
        description: 'Idea and innovation-based event conducted within the college.',
        details: 'Eureka was an idea and innovation-based event conducted within the college. Teams presented creative solutions and project ideas to real-world or technical problems, focusing on original thinking, feasibility, and impact.',
        icon: 'Key',
        color: 'from-purple-500 to-pink-500',
        duration: 'Full Day',
        participants: 'Intra-College Teams'
      },
      {
        title: 'Gameathon',
        description: 'Fun yet competitive inter-college event centered around strategic games.',
        details: 'Gameathon was a fun yet competitive inter-college event centered around strategic and skill-based games. It tested participants\' decision-making, coordination, and analytical skills, making it both engaging and intellectually stimulating.',
        icon: 'Gamepad2',
        color: 'from-red-500 to-vortex-orange',
        duration: 'Full Day',
        participants: 'Inter-College Teams'
      }
    ];

    await prayogEvent.save();

    console.log('✅ Successfully updated PRAYOG 1.0 sub-events!');
    console.log('📊 Updated sub-events:');
    prayogEvent.subEvents.forEach((se, idx) => {
      console.log(`   ${idx + 1}. ${se.title} - ${se.duration} - ${se.participants}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating sub-events:', error);
    process.exit(1);
  }
}

updatePrayogSubEvents();
