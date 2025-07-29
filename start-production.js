#!/usr/bin/env node

/**
 * Production startup script for Farlandet.dk
 * This script ensures the server starts reliably in production environments
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Farlandet.dk production server...');
console.log(`📍 Node.js version: ${process.version}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📦 Port: ${process.env.PORT || '3001'}`);

// Check if server build exists
const serverDistPath = path.join(__dirname, 'server', 'dist');
if (!fs.existsSync(serverDistPath)) {
  console.error('❌ Server build not found. Building now...');
  try {
    process.chdir(path.join(__dirname, 'server'));
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Server build completed');
  } catch (error) {
    console.error('💥 Server build failed:', error.message);
    process.exit(1);
  }
}

// Check if frontend build exists
const frontendDistPath = path.join(__dirname, 'dist');
if (!fs.existsSync(frontendDistPath) && process.env.NODE_ENV === 'production') {
  console.log('⚠️  Frontend build not found, but continuing...');
}

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server
console.log('🎯 Starting server...');
const serverProcess = spawn('node', [path.join(serverDistPath, 'index.js')], {
  stdio: 'inherit',
  env: process.env
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error('💥 Server process error:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`📴 Server process exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down production server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n📴 Shutting down production server...');
  serverProcess.kill('SIGTERM');
});