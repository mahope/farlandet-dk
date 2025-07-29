import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'

import resourceRoutes from './routes/resources'
import categoryRoutes from './routes/categories'
import authRoutes from './routes/auth'
import adminRoutes from './routes/admin'
import { testDatabaseConnection, isDatabaseInitialized } from './config/database'
import { seedDatabase, isDatabaseSeeded } from './scripts/seed-db'
import { initializeDatabase } from './scripts/init-db'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Simple ping endpoint (always works)
app.get('/api/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Farlandet server is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  })
})

// Health check endpoint (includes database status)
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testDatabaseConnection(1)
    const dbInitialized = await isDatabaseInitialized()
    const dbSeeded = await isDatabaseSeeded()
    
    res.json({
      success: true,
      message: 'Farlandet API is running',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        initialized: dbInitialized,
        seeded: dbSeeded
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
})

// API routes
app.use('/api/resources', resourceRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../../dist')
  app.use(express.static(frontendDistPath))
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'))
    } else {
      res.status(404).json({
        success: false,
        error: 'API endpoint not found'
      })
    }
  })
} else {
  // 404 handler for development (when frontend runs separately)
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    })
  })
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  })
})

// Database setup and server start
async function startServer() {
  console.log('🚀 Starting Farlandet API server...')
  
  // Always start the server first
  app.listen(PORT, () => {
    console.log('🎉 Farlandet server is running!')
    console.log(`📍 Server running on port: ${PORT}`)
    console.log(`📊 Health check: /api/health`)
    console.log(`🌐 Frontend: ${process.env.NODE_ENV === 'production' ? 'served at /' : 'run separately on port 5173'}`)
  })
  
  // Try database setup in background (non-blocking)
  try {
    console.log('🔍 Testing database connection...')
    const connected = await testDatabaseConnection()
    
    if (!connected) {
      console.warn('⚠️  Database not available. API endpoints will return errors until database is configured.')
      return
    }
    
    console.log('✅ Database connected successfully!')
    
    // Check if database is initialized
    const initialized = await isDatabaseInitialized()
    if (!initialized) {
      console.log('⚡ Database not initialized. Setting up schema...')
      await initializeDatabase(false)
      console.log('✅ Database schema created successfully!')
    }
    
    // Check if database is seeded
    const seeded = await isDatabaseSeeded()
    if (!seeded) {
      console.log('🌱 Database empty. Adding initial data...')
      await seedDatabase(false)
      console.log('✅ Database seeded successfully!')
    }
    
    console.log('🎯 Database setup complete! All API endpoints are ready.')
    
  } catch (error: any) {
    console.warn('⚠️  Database setup failed:', error.message)
    console.warn('💡 Server is running but API endpoints may not work without database.')
    console.warn('   - Set DATABASE_URL environment variable')
    console.warn('   - Or configure individual DB_* variables')
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down Farlandet API server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n📴 Shutting down Farlandet API server...')
  process.exit(0)
})

// Start the server
startServer()

export default app