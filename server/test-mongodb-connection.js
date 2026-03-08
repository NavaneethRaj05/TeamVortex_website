const mongoose = require('mongoose');
require('dotenv').config();

// Test MongoDB Connection
async function testConnection() {
    console.log('🔍 Testing MongoDB Connection...\n');
    
    const uri = process.env.MONGODB_URI;
    
    // Hide password in logs for security
    const safeUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log('📝 Connection String:', safeUri);
    console.log('');
    
    try {
        console.log('⏳ Attempting to connect...');
        
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
        });
        
        console.log('✅ SUCCESS! MongoDB Connected');
        console.log('📊 Connection Details:');
        console.log('   - Host:', conn.connection.host);
        console.log('   - Database:', conn.connection.name);
        console.log('   - Port:', conn.connection.port);
        console.log('   - Ready State:', conn.connection.readyState === 1 ? 'Connected' : 'Not Connected');
        
        // Test database operations
        console.log('\n🧪 Testing database operations...');
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('✅ Collections found:', collections.length);
        collections.forEach(col => {
            console.log('   -', col.name);
        });
        
        await mongoose.connection.close();
        console.log('\n✅ Connection test completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ CONNECTION FAILED!');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        
        if (error.message.includes('bad auth')) {
            console.error('\n🔧 AUTHENTICATION ERROR - Possible fixes:');
            console.error('   1. Check username and password in .env file');
            console.error('   2. Verify user exists in MongoDB Atlas → Database Access');
            console.error('   3. Ensure password special characters are URL-encoded:');
            console.error('      @ → %40, # → %23, $ → %24, % → %25, & → %26');
            console.error('   4. Check user has proper permissions (readWriteAnyDatabase)');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
            console.error('\n🔧 NETWORK ERROR - Possible fixes:');
            console.error('   1. Check your internet connection');
            console.error('   2. Verify cluster URL is correct');
            console.error('   3. Add your IP to Network Access in MongoDB Atlas');
            console.error('   4. Try "Allow Access from Anywhere" (0.0.0.0/0)');
        } else if (error.message.includes('MongoServerSelectionError')) {
            console.error('\n🔧 SERVER SELECTION ERROR - Possible fixes:');
            console.error('   1. Check if MongoDB Atlas cluster is running');
            console.error('   2. Verify cluster URL in connection string');
            console.error('   3. Check Network Access settings in MongoDB Atlas');
        }
        
        console.error('\n📖 See MONGODB_AUTH_FIX.md for detailed troubleshooting');
        process.exit(1);
    }
}

// Run the test
testConnection();
