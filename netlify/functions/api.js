const serverless = require('serverless-http');
const app = require('../../server/server');

// Cache the serverless handler across warm invocations to reuse MongoDB connection
let handler;
module.exports.handler = async (event, context) => {
    // Tell Lambda/Netlify not to wait for empty event loop (keeps MongoDB connection alive)
    context.callbackWaitsForEmptyEventLoop = false;
    if (!handler) handler = serverless(app);
    return handler(event, context);
};
