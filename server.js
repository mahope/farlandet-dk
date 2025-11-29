import 'dotenv/config';
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
import db from './lib/db.js';

// Setup DOMPurify for server-side HTML sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-jwt-secret-change-in-production';

console.log('🚀 Starting Farlandet.dk server...');
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Test database connection on startup
(async () => {
  const dbConnected = await db.testConnection();
  if (!dbConnected) {
    console.error('⚠️ Warning: Database not connected. Some features may not work.');
  }
})();

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

    // Find admin user in database
    const result = await db.query(
      `SELECT id, email, username, password_hash, role, created_at
       FROM users
       WHERE email = $1 AND role IN ('admin', 'moderator')`,
      [email.toLowerCase()]
    );

    const admin = result.rows[0];
    if (!admin) {
      console.log('Admin not found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'Ugyldig email eller adgangskode'
      });
    }

    // Verify password with bcrypt
    let isValidPassword = false;
    if (admin.password_hash) {
      try {
        isValidPassword = await bcrypt.compare(password, admin.password_hash);
      } catch (error) {
        console.log('Bcrypt comparison error:', error);
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
        name: admin.username || admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [admin.id]
    );

    // Return user info and token
    res.json({
      success: true,
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.username || admin.email,
          role: admin.role,
          createdAt: admin.created_at,
          lastLogin: new Date().toISOString()
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

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    // Find user info from database
    const result = await db.query(
      `SELECT id, email, username, role, created_at, last_login
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    const admin = result.rows[0];
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
        name: admin.username || admin.email,
        role: admin.role,
        createdAt: admin.created_at,
        lastLogin: admin.last_login
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente brugerdata'
    });
  }
});

// Admin Dashboard and Management Endpoints
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get statistics from database
    const statsResult = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) as total
      FROM resources
    `);

    const categoriesResult = await db.query('SELECT COUNT(*) as count FROM categories');
    const tagsResult = await db.query('SELECT COUNT(*) as count FROM tags');
    const adminsResult = await db.query(`SELECT COUNT(*) as count FROM users WHERE role IN ('admin', 'moderator')`);

    // Get recent resources (last 5) with category info
    const recentResult = await db.query(`
      SELECT r.*, c.name as category_name, c.slug as category_slug
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        stats: {
          pending: parseInt(stats.pending) || 0,
          approved: parseInt(stats.approved) || 0,
          rejected: parseInt(stats.rejected) || 0,
          total: parseInt(stats.total) || 0,
          categories: parseInt(categoriesResult.rows[0]?.count) || 0,
          tags: parseInt(tagsResult.rows[0]?.count) || 0,
          admins: parseInt(adminsResult.rows[0]?.count) || 0
        },
        recentResources: recentResult.rows
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente dashboard data'
    });
  }
});

app.get('/api/admin/resources', authenticateToken, async (req, res) => {
  try {
    const { status = 'all', limit = 20, offset = 0, search } = req.query;

    let query = `
      SELECT r.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by status
    if (status !== 'all') {
      query += ` WHERE r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Search filter
    if (search) {
      const whereClause = status !== 'all' ? ' AND' : ' WHERE';
      query += `${whereClause} (r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY r.id, c.id ORDER BY r.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM resources';
    const countParams = [];
    if (status !== 'all') {
      countQuery += ' WHERE status = $1';
      countParams.push(status);
    }
    const countResult = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0]?.total) || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching admin resources:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente ressourcer'
    });
  }
});

app.put('/api/admin/resources/:id/moderate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status skal være "approved" eller "rejected"'
      });
    }

    // Update resource in database
    const result = await db.query(
      `UPDATE resources
       SET status = $1,
           approved_by = $2,
           approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE approved_at END,
           rejection_reason = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, req.user.email, rejection_reason || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ressource ikke fundet'
      });
    }

    console.log(`Admin ${req.user.email} ${status} resource ${id}: "${result.rows[0].title}"`);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke moderere ressource'
    });
  }
});

app.delete('/api/admin/resources/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get resource info before deleting
    const resourceResult = await db.query('SELECT title FROM resources WHERE id = $1', [id]);
    if (resourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ressource ikke fundet'
      });
    }

    const title = resourceResult.rows[0].title;

    // Delete resource (cascade will handle resource_tags)
    await db.query('DELETE FROM resources WHERE id = $1', [id]);

    console.log(`Admin ${req.user.email} deleted resource ${id}: "${title}"`);

    res.json({
      success: true,
      message: 'Ressource slettet'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke slette ressource'
    });
  }
});

// Get popular tags
app.get('/api/tags', async (req, res) => {
  try {
    const { limit = 15 } = req.query;

    const result = await db.query(`
      SELECT t.id, t.name, t.slug,
             COUNT(rt.resource_id) as resource_count
      FROM tags t
      JOIN resource_tags rt ON t.id = rt.tag_id
      JOIN resources r ON rt.resource_id = r.id
      WHERE r.status = 'approved'
      GROUP BY t.id
      HAVING COUNT(rt.resource_id) > 0
      ORDER BY resource_count DESC, t.name ASC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente tags'
    });
  }
});

// Tag search endpoint for autocomplete
app.get('/api/tags/search', async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;

    if (!q || q.length < 1) {
      // Return popular tags if no query
      const result = await db.query(`
        SELECT t.id, t.name, t.slug,
               COUNT(rt.resource_id) as resource_count
        FROM tags t
        LEFT JOIN resource_tags rt ON t.id = rt.tag_id
        LEFT JOIN resources r ON rt.resource_id = r.id AND r.status = 'approved'
        GROUP BY t.id
        ORDER BY resource_count DESC, t.name ASC
        LIMIT $1
      `, [parseInt(limit)]);

      return res.json({
        success: true,
        data: result.rows
      });
    }

    // Search tags matching query
    const searchTerm = `%${q.toLowerCase()}%`;
    const result = await db.query(`
      SELECT t.id, t.name, t.slug,
             COUNT(rt.resource_id) as resource_count
      FROM tags t
      LEFT JOIN resource_tags rt ON t.id = rt.tag_id
      LEFT JOIN resources r ON rt.resource_id = r.id AND r.status = 'approved'
      WHERE LOWER(t.name) LIKE $1 OR LOWER(t.slug) LIKE $1
      GROUP BY t.id
      ORDER BY
        CASE WHEN LOWER(t.name) LIKE $2 THEN 0 ELSE 1 END,
        resource_count DESC,
        t.name ASC
      LIMIT $3
    `, [searchTerm, `${q.toLowerCase()}%`, parseInt(limit)]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error searching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke søge i tags'
    });
  }
});

// Public API endpoints
app.get('/api/resources', async (req, res) => {
  try {
    const { category, type, tag, sort = 'newest', limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT r.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      WHERE r.status = 'approved'
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by category
    if (category) {
      query += ` AND c.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Filter by type
    if (type) {
      query += ` AND r.resource_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Filter by tag
    if (tag) {
      query += ` AND r.id IN (
        SELECT rt2.resource_id FROM resource_tags rt2
        JOIN tags t2 ON rt2.tag_id = t2.id
        WHERE t2.name ILIKE $${paramIndex} OR t2.slug = $${paramIndex}
      )`;
      params.push(tag);
      paramIndex++;
    }

    query += ' GROUP BY r.id, c.id';

    // Sorting
    switch (sort) {
      case 'popular':
        query += ' ORDER BY r.vote_score DESC, r.created_at DESC';
        break;
      case 'oldest':
        query += ' ORDER BY r.created_at ASC';
        break;
      default: // newest
        query += ' ORDER BY r.created_at DESC';
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // Get total count with all filters
    let countQuery = `
      SELECT COUNT(DISTINCT r.id) as total FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      WHERE r.status = 'approved'
    `;
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND c.slug = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }
    if (type) {
      countQuery += ` AND r.resource_type = $${countParamIndex}`;
      countParams.push(type);
      countParamIndex++;
    }
    if (tag) {
      countQuery += ` AND r.id IN (
        SELECT rt2.resource_id FROM resource_tags rt2
        JOIN tags t2 ON rt2.tag_id = t2.id
        WHERE t2.name ILIKE $${countParamIndex} OR t2.slug = $${countParamIndex}
      )`;
      countParams.push(tag);
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0]?.total) || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters: { category, type, tag, sort }
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente ressourcer'
    });
  }
});

// Get single resource by ID
app.get('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT r.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      WHERE r.id = $1 AND r.status = 'approved'
      GROUP BY r.id, c.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ressource ikke fundet'
      });
    }

    // Increment view count
    await db.query('UPDATE resources SET view_count = view_count + 1 WHERE id = $1', [id]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente ressource'
    });
  }
});

// Get related resources by tags (resources sharing tags with given resource)
app.get('/api/resources/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    // Find resources that share tags with the given resource
    // Ordered by number of matching tags (most relevant first)
    const result = await db.query(`
      WITH resource_tags_list AS (
        SELECT tag_id FROM resource_tags WHERE resource_id = $1
      ),
      related AS (
        SELECT r.id, r.title, r.description, r.resource_type, r.vote_score, r.created_at,
               c.name as category_name, c.slug as category_slug, c.color as category_color,
               COUNT(rt.tag_id) as matching_tags,
               ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
        FROM resources r
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN resource_tags rt ON r.id = rt.resource_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        WHERE r.status = 'approved'
          AND r.id != $1
          AND rt.tag_id IN (SELECT tag_id FROM resource_tags_list)
        GROUP BY r.id, c.id
        HAVING COUNT(rt.tag_id) >= 1
      )
      SELECT * FROM related
      ORDER BY matching_tags DESC, vote_score DESC
      LIMIT $2
    `, [id, parseInt(limit)]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching related resources:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente relaterede ressourcer'
    });
  }
});

// Search resources
app.get('/api/resources/search', async (req, res) => {
  try {
    const { q, category, type, tag, limit = 20, offset = 0 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Søgning kræver mindst 2 tegn'
      });
    }

    let query = `
      SELECT r.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
             ts_rank(to_tsvector('danish', r.title || ' ' || COALESCE(r.description, '')),
                     plainto_tsquery('danish', $1)) as rank
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      WHERE r.status = 'approved'
        AND (to_tsvector('danish', r.title || ' ' || COALESCE(r.description, ''))
             @@ plainto_tsquery('danish', $1)
             OR r.title ILIKE $2
             OR r.description ILIKE $2)
    `;
    const params = [q, `%${q}%`];
    let paramIndex = 3;

    // Filter by category
    if (category) {
      query += ` AND c.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Filter by type
    if (type) {
      query += ` AND r.resource_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Filter by tag
    if (tag) {
      query += ` AND r.id IN (
        SELECT rt2.resource_id FROM resource_tags rt2
        JOIN tags t2 ON rt2.tag_id = t2.id
        WHERE t2.name ILIKE $${paramIndex} OR t2.slug = $${paramIndex}
      )`;
      params.push(tag);
      paramIndex++;
    }

    query += ` GROUP BY r.id, c.id ORDER BY rank DESC, r.vote_score DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        query: q,
        total: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Søgning fejlede'
    });
  }
});

// Get categories with resource count
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*,
             COUNT(r.id) FILTER (WHERE r.status = 'approved') as resource_count
      FROM categories c
      LEFT JOIN resources r ON r.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente kategorier'
    });
  }
});

// Get resources by category slug
app.get('/api/categories/:slug/resources', async (req, res) => {
  try {
    const { slug } = req.params;
    const { sort = 'newest', limit = 20, offset = 0 } = req.query;

    // First get the category
    const categoryResult = await db.query(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Kategori ikke fundet'
      });
    }

    const category = categoryResult.rows[0];

    // Get resources for this category
    let orderBy = 'r.created_at DESC';
    if (sort === 'popular') orderBy = 'r.vote_score DESC, r.created_at DESC';
    if (sort === 'oldest') orderBy = 'r.created_at ASC';

    const result = await db.query(`
      SELECT r.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      WHERE r.status = 'approved' AND c.slug = $1
      GROUP BY r.id, c.id
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `, [slug, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total FROM resources r
      JOIN categories c ON r.category_id = c.id
      WHERE r.status = 'approved' AND c.slug = $1
    `, [slug]);

    res.json({
      success: true,
      data: {
        category,
        resources: result.rows
      },
      meta: {
        total: parseInt(countResult.rows[0]?.total) || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching category resources:', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente ressourcer'
    });
  }
});

// Input validation middleware
// Resource types where URL is optional
const URL_OPTIONAL_TYPES = ['book', 'tip'];

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
    .custom((value, { req }) => {
      const resourceType = req.body.type;
      const isUrlOptional = URL_OPTIONAL_TYPES.includes(resourceType);

      // If URL is optional and not provided, skip validation
      if (isUrlOptional && (!value || value.trim() === '')) {
        return true;
      }

      // If URL is required and not provided
      if (!isUrlOptional && (!value || value.trim() === '')) {
        throw new Error('URL er påkrævet for denne ressourcetype');
      }

      // If URL is provided, validate it
      if (value && value.trim() !== '') {
        try {
          const url = new URL(value);
          if (!url.protocol.startsWith('http')) {
            throw new Error('URL skal starte med http:// eller https://');
          }

          // Check blocked domains
          const blockedDomains = ['malware.com', 'phishing.com', 'spam.com'];
          const domain = url.hostname.toLowerCase();
          if (blockedDomains.some(blocked => domain.includes(blocked))) {
            throw new Error('Dette domæne er ikke tilladt');
          }
        } catch (e) {
          if (e.message.includes('Invalid URL')) {
            throw new Error('URL er ikke gyldig');
          }
          throw e;
        }
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

app.post('/api/resources', submitLimiter, validateResourceSubmission, async (req, res) => {
  const client = await db.getClient();

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
      client.release();
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        details: errors.array()
      });
    }

    const { title, description, url, type, submitter_email, tags, category_id } = req.body;

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
          .slice(0, 10);
      } else if (typeof tags === 'string' && tags.trim().length > 0) {
        processedTags = tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .map(tag => tag.toLowerCase())
          .slice(0, 10);
      }
    }

    // Start transaction
    await client.query('BEGIN');

    // Insert resource
    const resourceResult = await client.query(
      `INSERT INTO resources (title, description, url, resource_type, category_id, submitter_email, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [sanitizedTitle, sanitizedDescription, url.trim(), type.trim(), category_id || null, submitter_email?.trim() || null]
    );

    const newResource = resourceResult.rows[0];

    // Process and insert tags
    if (processedTags.length > 0) {
      for (const tagName of processedTags) {
        // Insert tag if not exists, get ID
        const tagResult = await client.query(
          `INSERT INTO tags (name, slug)
           VALUES ($1, $2)
           ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [tagName, tagName.replace(/\s+/g, '-').toLowerCase()]
        );

        const tagId = tagResult.rows[0].id;

        // Link tag to resource
        await client.query(
          `INSERT INTO resource_tags (resource_id, tag_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [newResource.id, tagId]
        );
      }
    }

    await client.query('COMMIT');

    // Secure logging
    console.log('New resource submission:', {
      id: newResource.id,
      title: newResource.title.substring(0, 50) + '...',
      type: newResource.resource_type,
      url_domain: new URL(newResource.url).hostname,
      tags_count: processedTags.length,
      has_email: !!newResource.submitter_email,
      timestamp: newResource.created_at
    });

    res.status(201).json({
      success: true,
      message: 'Ressource modtaget! Den vil blive gennemgået før publicering.',
      data: { ...newResource, tags: processedTags }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing resource submission:', error);
    res.status(500).json({
      success: false,
      error: 'Der opstod en fejl ved behandling af din indsendelse. Prøv igen senere.'
    });
  } finally {
    client.release();
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
process.on('SIGTERM', async () => {
  console.log('📴 Shutting down gracefully...');
  server.close(async () => {
    await db.closePool();
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('📴 Shutting down gracefully...');
  server.close(async () => {
    await db.closePool();
    console.log('✅ Server closed');
    process.exit(0);
  });
});