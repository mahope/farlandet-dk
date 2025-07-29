import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Setup DOMPurify for server-side HTML sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Farlandet.dk server...');
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'For mange forsøg. Prøv igen om 15 minutter.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 API requests per windowMs
  message: {
    success: false,
    error: 'For mange API kald. Prøv igen om 15 minutter.'
  }
});

// Even stricter for submissions
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 submissions per hour
  message: {
    success: false,
    error: 'For mange indsendelser. Prøv igen om en time.'
  }
});

app.use(limiter);
app.use('/api/', apiLimiter);

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

// Input validation middleware
const validateResourceSubmission = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Titel skal være mellem 5 og 255 tegn')
    .escape(),
  body('description')
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Beskrivelse må højst være 2000 tegn')
    .escape(),
  body('url')
    .isURL({ require_protocol: true })
    .withMessage('URL er ikke gyldig')
    .custom(value => {
      const blockedDomains = ['malware.com', 'phishing.com', 'spam.com'];
      try {
        const domain = new URL(value).hostname.toLowerCase();
        if (blockedDomains.some(blocked => domain.includes(blocked))) {
          throw new Error('Dette domæne er ikke tilladt');
        }
      } catch (e) {
        throw new Error('Ugyldig URL');
      }
      return true;
    }),
  body('type')
    .isIn(['link', 'article', 'podcast', 'book', 'video', 'movie', 'tv_series', 'tip'])
    .withMessage('Ugyldig ressource type'),
  body('submitter_email')
    .optional()
    .isEmail()
    .withMessage('Email adresse er ikke gyldig')
    .normalizeEmail(),
  body('tags')
    .optional()
    .custom(value => {
      if (Array.isArray(value)) {
        if (value.length > 10) {
          throw new Error('Maksimalt 10 tags tilladt');
        }
        return value.every(tag => typeof tag === 'string' && tag.length <= 50);
      } else if (typeof value === 'string') {
        const tags = value.split(',').map(t => t.trim());
        if (tags.length > 10) {
          throw new Error('Maksimalt 10 tags tilladt');
        }
        return tags.every(tag => tag.length <= 50);
      }
      return true;
    }),
];

app.post('/api/resources', submitLimiter, validateResourceSubmission, (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        details: errors.array()
      });
    }

    const { title, description, url, type, submitter_email, tags } = req.body;
    
    // Sanitize HTML content
    const sanitizedTitle = purify.sanitize(title.trim());
    const sanitizedDescription = purify.sanitize(description.trim());
    
    // Process tags
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.filter(tag => tag && tag.trim().length > 0).map(tag => tag.trim().toLowerCase());
    } else if (typeof tags === 'string' && tags.trim().length > 0) {
      processedTags = tags.split(',').filter(tag => tag && tag.trim().length > 0).map(tag => tag.trim().toLowerCase());
    }
    
    const newResource = {
      id: uuidv4(),
      title: sanitizedTitle,
      description: sanitizedDescription,
      url: url.trim(),
      type: type.trim(),
      submitter_email: submitter_email ? submitter_email.trim() : null,
      tags: processedTags,
      status: 'pending',
      votes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Secure logging - don't log sensitive data
    console.log('New resource submission:', {
      id: newResource.id,
      title: newResource.title.substring(0, 50) + '...',
      type: newResource.type,
      url_domain: new URL(newResource.url).hostname,
      tags_count: newResource.tags.length,
      has_email: !!newResource.submitter_email,
      timestamp: newResource.created_at
    });
    
    res.status(201).json({
      success: true,
      message: 'Ressource modtaget! Den vil blive gennemgået før publicering.',
      data: newResource
    });
  } catch (error) {
    console.error('Error processing resource submission:', error);
    res.status(500).json({
      success: false,
      error: 'Der opstod en fejl ved behandling af din indsendelse. Prøv igen senere.'
    });
  }
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