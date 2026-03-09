require('dotenv').config();
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  subEvents: [{
    title: String,
    description: String,
    details: String,
    icon: String,
    color: String,
    duration: String,
    participants: String
  }]
}, { collection: 'events' });

const Event = mongoose.model('Event', eventSchema);

async function verifyPrayogData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    console.log('🔍 Finding PRAYOG 1.0 event...');
    const prayogEvent = await Event.findOne({ 
      title: { $regex: /prayog\s*1\.0/i } 
    });

    if (!prayogEvent) {
      console.log('❌ PRAYOG 1.0 event not found in database');
      process.exit(1);
    }

    console.log('✅ PRAYOG 1.0 found!\n');
    console.log('📋 Current Sub-Events Data:\n');

    if (prayogEvent.subEvents && prayogEvent.subEvents.length > 0) {
      prayogEvent.subEvents.forEach((subEvent, index) => {
        console.log(`${index + 1}. ${subEvent.title}`);
        console.log(`   Duration: ${subEvent.duration || 'Not set'}`);
        console.log(`   Participants: ${subEvent.participants || 'Not set'}`);
        console.log(`   Description: ${subEvent.description?.substring(0, 50)}...`);
        console.log('');
      });

      // Verify expected data
      const expectedData = {
        'Champions League': { duration: 'Full Day', participants: 'Branch-wise Teams' },
        'Hackathon': { duration: 'Full Day', participants: 'Inter-College Teams' },
        'Eureka': { duration: 'Full Day', participants: 'Intra-College Teams' },
        'Gameathon': { duration: 'Full Day', participants: 'Inter-College Teams' }
      };

      console.log('🔍 Verification Results:\n');
      let allCorrect = true;

      for (const [title, expected] of Object.entries(expectedData)) {
        const subEvent = prayogEvent.subEvents.find(se => se.title === title);
        if (!subEvent) {
          console.log(`❌ ${title}: NOT FOUND`);
          allCorrect = false;
        } else if (subEvent.duration === expected.duration && subEvent.participants === expected.participants) {
          console.log(`✅ ${title}: Correct (${expected.duration}, ${expected.participants})`);
        } else {
          console.log(`⚠️  ${title}: MISMATCH`);
          console.log(`   Expected: ${expected.duration}, ${expected.participants}`);
          console.log(`   Found: ${subEvent.duration}, ${subEvent.participants}`);
          allCorrect = false;
        }
      }

      if (allCorrect) {
        console.log('\n✅ All sub-events data is correct in database!');
      } else {
        console.log('\n⚠️  Some sub-events need updating');
      }
    } else {
      console.log('❌ No sub-events found for PRAYOG 1.0');
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyPrayogData();
