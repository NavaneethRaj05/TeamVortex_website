const serverless = require('serverless-http');
const app = require('../../server/server'); // Path to your existing express app

module.exports.handler = serverless(app);
