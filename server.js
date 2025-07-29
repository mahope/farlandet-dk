import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Farlandet.dk server...');
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoints
app.get('/api/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Farlandet.dk server is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'All systems operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple API endpoints (mock data for now)
app.get('/api/resources', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Eksempel ressource",
        description: "Dette er en test ressource",
        type: "link",
        url: "https://example.com",
        status: "approved",
        created_at: new Date().toISOString()
      }
    ],
    meta: {
      total: 1,
      page: 1
    }
  });
});

app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: "Bøger", slug: "boger" },
      { id: 2, name: "Podcasts", slug: "podcasts" },
      { id: 3, name: "Artikler", slug: "artikler" }
    ]
  });
});

app.post('/api/resources', (req, res) => {
  console.log('Resource submission:', req.body);
  res.status(201).json({
    success: true,
    message: 'Ressource modtaget! Den vil blive gennemgået før publicering.',
    data: {
      id: Date.now(),
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    }
  });
});

// Serve static frontend files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Handle React Router (catch-all for non-API routes)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.path
    });
  } else {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server is running successfully!');
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`🎯 API endpoints: http://0.0.0.0:${PORT}/api/*`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`💥 Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});