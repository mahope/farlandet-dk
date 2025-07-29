#!/usr/bin/env node

/**
 * Health check script for Farlandet.dk
 * This can be used to verify the server is running correctly
 */

const http = require('http');

const PORT = process.env.PORT || 3001;
const HOST = 'localhost';

console.log(`🏥 Running health check on ${HOST}:${PORT}...`);

const req = http.request({
  hostname: HOST,
  port: PORT,
  path: '/api/ping',
  method: 'GET',
  timeout: 5000
}, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`📄 Response: ${data}`);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error(`❌ Health check failed: ${error.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();