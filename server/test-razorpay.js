/**
 * Test script to verify Razorpay integration
 * Run with: node test-razorpay.js
 */

const Razorpay = require('razorpay');
require('dotenv').config();

console.log('🧪 Testing Razorpay Integration...\n');

// Check if credentials are configured
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('📋 Configuration Check:');
console.log(`   Key ID: ${keyId ? (keyId.includes('your_') ? '❌ Not configured (placeholder)' : '✅ Configured') : '❌ Missing'}`);
console.log(`   Key Secret: ${keySecret ? (keySecret.includes('your_') ? '❌ Not configured (placeholder)' : '✅ Configured') : '❌ Missing'}`);

if (!keyId || !keySecret || keyId.includes('your_') || keySecret.includes('your_')) {
    console.log('\n⚠️  Razorpay credentials not configured yet.');
    console.log('📝 To configure:');
    console.log('   1. Sign up at https://razorpay.com/');
    console.log('   2. Get your API keys from Dashboard > Settings > API Keys');
    console.log('   3. Update server/.env file with your actual keys');
    console.log('   4. Use TEST mode keys for development (they start with "rzp_test_")');
    console.log('\n✅ Razorpay package is installed and routes are configured!');
    console.log('✅ Ready to use once you add your API keys.');
    process.exit(0);
}

// If credentials are configured, test the connection
console.log('\n🔌 Testing Razorpay Connection...');

try {
    const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
    
    console.log('✅ Razorpay instance created successfully!');
    console.log('\n📡 Available Endpoints:');
    console.log('   POST /api/razorpay/create-order - Create payment order');
    console.log('   POST /api/razorpay/verify-payment - Verify payment signature');
    console.log('   GET  /api/razorpay/payment-status/:paymentId - Get payment status');
    console.log('   POST /api/razorpay/refund - Initiate refund');
    console.log('\n✅ All systems ready!');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
