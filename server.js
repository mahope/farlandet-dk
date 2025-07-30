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
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Setup DOMPurify for server-side HTML sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-jwt-secret-change-in-production';

// In-memory storage for development (in production, use database)
let resources = [];
let resourceIdCounter = 1;

// Mock admin users (in production, this would be in a database)
const adminUsers = [
  {
    id: '1',
    email: 'admin@farlandet.dk',
    password: 'admin123', // For development - in production use bcrypt hash
    name: 'Administrator',
    createdAt: new Date().toISOString()
  }
];

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

// Submission rate limiting - more lenient in development
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 100 in dev, 10 in prod
  message: {
    success: false,
    error: 'For mange indsendelser. Prøv igen om en time.'
  }
});

app.use(limiter);
app.use('/api/', apiLimiter);

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token påkrævet'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Ugyldig eller udløbet token'
      });
    }
    req.user = user;
    next();
  });
};

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

// Admin Authentication Endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email og adgangskode påkrævet'
      });
    }

    // Find admin user
    const admin = adminUsers.find(user => user.email === email);
    if (!admin) {
      console.log('Admin not found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'Ugyldig email eller adgangskode'
      });
    }

    // For development, allow both plaintext and hashed passwords
    let isValidPassword = false;
    if (admin.password === 'admin123') {
      // Direct plaintext comparison for development
      isValidPassword = password === 'admin123';
    } else {
      // Try bcrypt comparison
      try {
        isValidPassword = await bcrypt.compare(password, admin.password);
      } catch (error) {
        console.log('Bcrypt comparison error:', error);
        // Fallback to plaintext if bcrypt fails
        isValidPassword = password === admin.password;
      }
    }

    console.log('Login attempt:', { email, passwordProvided: !!password, isValidPassword });

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Ugyldig email eller adgangskode'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        name: admin.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    admin.lastLogin = new Date().toISOString();

    // Return user info and token
    res.json({
      success: true,
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          createdAt: admin.createdAt,
          lastLogin: admin.lastLogin
        },
        token
      }
    });

    console.log(`Admin login successful: ${admin.email}`);
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login fejlede'
    });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // For JWT, we don't need to do anything server-side
  // Token will be removed from client-side storage
  res.json({
    success: true,
    message: 'Logget ud'
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  // Find user info from token
  const admin = adminUsers.find(user => user.id === req.user.id);
  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'Admin ikke fundet'
    });
  }

  res.json({
    success: true,
    data: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin
    }
  });
});

// Admin Dashboard and Management Endpoints
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  // Calculate real statistics from stored resources
  const pending = resources.filter(r => r.status === 'pending').length;
  const approved = resources.filter(r => r.status === 'approved').length;
  const rejected = resources.filter(r => r.status === 'rejected').length;
  const total = resources.length;
  
  // Get unique tags count
  const allTags = resources.flatMap(r => r.tags || []);
  const uniqueTags = [...new Set(allTags)];
  
  // Get recent resources (last 5)
  const recentResources = resources
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      stats: {
        pending,
        approved,
        rejected,
        total,
        categories: 8, // Static for now
        tags: uniqueTags.length,
        admins: 1
      },
      recentResources
    }
  });
});

app.get('/api/admin/resources', authenticateToken, (req, res) => {
  const { status = 'all', limit = 20, offset = 0 } = req.query;
  
  // Filter resources by status
  let filteredResources = resources;
  if (status !== 'all') {
    filteredResources = resources.filter(r => r.status === status);
  }

  // Sort by creation date (newest first)
  filteredResources = filteredResources.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Apply pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedResources = filteredResources.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedResources,
    meta: {
      total: filteredResources.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
});

app.put('/api/admin/resources/:id/moderate', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Status skal være "approved" eller "rejected"'
    });
  }

  // Find and update the resource
  const resourceIndex = resources.findIndex(r => r.id === id);
  if (resourceIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Ressource ikke fundet'
    });
  }

  // Update resource status
  resources[resourceIndex] = {
    ...resources[resourceIndex],
    status: status,
    approved_by: req.user.email,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log(`Admin ${req.user.email} ${status} resource ${id}: "${resources[resourceIndex].title}"`);
  
  res.json({
    success: true,
    data: resources[resourceIndex]
  });
});

app.delete('/api/admin/resources/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Find and remove the resource
  const resourceIndex = resources.findIndex(r => r.id === id);
  if (resourceIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Ressource ikke fundet'
    });
  }

  const deletedResource = resources[resourceIndex];
  resources.splice(resourceIndex, 1);
  
  console.log(`Admin ${req.user.email} deleted resource ${id}: "${deletedResource.title}"`);
  
  res.json({
    success: true,
    message: 'Ressource slettet'
  });
});

// Public API endpoints
app.get('/api/resources', (req, res) => {
  // Only return approved resources for public consumption
  const approvedResources = resources.filter(r => r.status === 'approved');
  
  // Sort by creation date (newest first)
  const sortedResources = approvedResources.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  res.json({
    success: true,
    data: sortedResources,
    meta: {
      total: sortedResources.length,
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
    .isLength({ min: 10, max: 2000 })
    .withMessage('Beskrivelse skal være mellem 10 og 2000 tegn')
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
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email adresse er ikke gyldig')
    .normalizeEmail(),
  body('tags')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value, { req }) => {
      // Skip validation if no tags provided
      if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
        return true;
      }
      
      let tagsToValidate = [];
      
      if (Array.isArray(value)) {
        tagsToValidate = value.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
      } else if (typeof value === 'string') {
        tagsToValidate = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
      } else {
        throw new Error('Tags skal være en tekst eller en liste');
      }
      
      if (tagsToValidate.length > 10) {
        throw new Error('Maksimalt 10 tags tilladt');
      }
      
      const invalidTag = tagsToValidate.find(tag => tag.length > 50);
      if (invalidTag) {
        throw new Error(`Tag "${invalidTag}" er for lang (max 50 tegn)`);
      }
      
      return true;
    }),
];

app.post('/api/resources', submitLimiter, validateResourceSubmission, (req, res) => {
  try {
    // Log incoming request for debugging
    console.log('Resource submission request:', {
      body: req.body,
      headers: req.headers['content-type'],
      timestamp: new Date().toISOString()
    });

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
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
    
    // Process tags - simplified and consistent handling
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags
          .filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
          .map(tag => tag.trim().toLowerCase())
          .slice(0, 10); // Limit to max 10 tags
      } else if (typeof tags === 'string' && tags.trim().length > 0) {
        processedTags = tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .map(tag => tag.toLowerCase())
          .slice(0, 10); // Limit to max 10 tags
      }
    }
    
    const newResource = {
      id: resourceIdCounter++,
      title: sanitizedTitle,
      description: sanitizedDescription,
      url: url.trim(),
      type: type.trim(),
      submitter_email: submitter_email ? submitter_email.trim() : null,
      submitted_by: submitter_email ? submitter_email.trim() : 'anonymous',
      tags: processedTags,
      status: 'pending',
      votes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store resource in memory array
    resources.push(newResource);
    
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