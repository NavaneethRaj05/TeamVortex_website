try {
  const handler = require('./netlify/functions/api.js');
  console.log("Successfully required api.js");
  // Try to mock an invocation
  handler.handler({ httpMethod: 'GET', path: '/api/health' }, {}).then(res => {
    console.log("Response:", res.statusCode);
    process.exit(0);
  }).catch(err => {
    console.error("Handler error:", err);
    process.exit(1);
  });
} catch (e) {
  console.error("Require error:", e);
  process.exit(1);
}
