import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables first
dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '3001')

console.log('🚀 Initializing Farlandet server...')
console.log(`📍 PORT: ${PORT}`)
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

// Basic middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid frontend issues
}))

app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

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
    // Dynamic import to avoid dependency issues
    const { testDatabaseConnection, isDatabaseInitialized } = await import('./config/database')
    const { isDatabaseSeeded } = await import('./scripts/seed-db')
    
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

// Try to load API routes with error handling
try {
  const resourceRoutes = require('./routes/resources').default
  const categoryRoutes = require('./routes/categories').default
  const authRoutes = require('./routes/auth').default
  const adminRoutes = require('./routes/admin').default
  
  app.use('/api/resources', resourceRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/admin', adminRoutes)
  
  console.log('✅ API routes loaded successfully')
} catch (error) {
  console.warn('⚠️  API routes failed to load:', error.message)
  console.warn('📝 API endpoints may not work until this is fixed')
}

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
  console.log('🚀 Starting Farlandet server...')
  
  // Start the server first - this is critical
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 Farlandet server is running!')
    console.log(`📍 Server listening on: 0.0.0.0:${PORT}`)
    console.log(`📊 Test endpoint: /api/ping`)
    console.log(`📊 Health check: /api/health`)
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
  })
  
  // Handle server errors
  server.on('error', (error: any) => {
    console.error('❌ Server error:', error)
    if (error.code === 'EADDRINUSE') {
      console.error(`💥 Port ${PORT} is already in use`)
    }
  })
  
  // Try database setup in background (completely non-blocking)
  setImmediate(async () => {
    try {
      console.log('🔍 Starting database setup in background...')
      
      // Import database functions only when needed
      const { testDatabaseConnection, isDatabaseInitialized } = await import('./config/database')
      const { seedDatabase, isDatabaseSeeded } = await import('./scripts/seed-db')
      const { initializeDatabase } = await import('./scripts/init-db')
      
      const connected = await testDatabaseConnection(1)
      
      if (!connected) {
        console.warn('⚠️  Database not available. Server running without database.')
        return
      }
      
      console.log('✅ Database connected successfully!')
      
      const initialized = await isDatabaseInitialized()
      if (!initialized) {
        console.log('⚡ Setting up database schema...')
        await initializeDatabase(false)
      }
      
      const seeded = await isDatabaseSeeded()
      if (!seeded) {
        console.log('🌱 Adding initial data...')
        await seedDatabase(false)
      }
      
      console.log('🎯 Database setup complete!')
      
    } catch (error: any) {
      console.warn('⚠️  Database setup failed:', error.message)
      console.warn('💡 Server running without database functionality')
    }
  })
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

// Start the server with error handling
async function main() {
  try {
    await startServer()
  } catch (error) {
    console.error('💥 Fatal error starting server:', error)
    console.error('🔍 Stack trace:', error.stack)
    process.exit(1)
  }
}

// Add uncaught exception handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  console.error('🔍 Stack trace:', error.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
main()

export default app