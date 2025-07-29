import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

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

// Health check endpoint
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

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
  
  try {
    // Test database connection
    console.log('🔍 Testing database connection...')
    const connected = await testDatabaseConnection()
    if (!connected) {
      console.error('❌ Could not connect to database. Please check your configuration.')
      process.exit(1)
    }
    
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
    
    // Start the server
    app.listen(PORT, () => {
      console.log('🎉 Farlandet API server is ready!')
      console.log(`📍 Server running on: http://localhost:${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
      console.log(`📝 API endpoints:`)
      console.log(`   - GET  /api/resources (list resources)`)
      console.log(`   - POST /api/resources (submit resource)`)
      console.log(`   - GET  /api/categories (list categories)`)
      console.log('\n🔧 Next steps:')
      console.log('   - Start frontend: npm run dev (from root directory)')
      console.log('   - Visit admin panel: http://localhost:5173/admin')
      console.log('   - Default admin: admin@farlandet.dk / admin123')
    })
    
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message)
    console.error('\n💡 Troubleshooting tips:')
    console.error('   - Check database is running: pg_ctl status')
    console.error('   - Verify database exists: psql -l | grep farlandet')
    console.error('   - Check environment variables in .env file')
    process.exit(1)
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