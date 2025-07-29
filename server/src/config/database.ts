import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Use DATABASE_URL if available (common in production), otherwise use individual config
const databaseConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'farlandet',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }

const pool = new Pool({
  ...databaseConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export { pool }

// Connection monitoring
pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err.message)
  if (err.message.includes('database') && err.message.includes('does not exist')) {
    console.error('\n💡 Database setup required. Please run: npm run db:setup')
  }
})

// Test database connection with retry
export async function testDatabaseConnection(maxRetries = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect()
      await client.query('SELECT NOW()')
      client.release()
      console.log('✅ Database connection test successful')
      return true
    } catch (error: any) {
      console.log(`⚠️  Database connection attempt ${i + 1}/${maxRetries} failed:`, error.message)
      
      if (i === maxRetries - 1) {
        console.error('\n❌ Could not connect to database after', maxRetries, 'attempts')
        console.error('Please check your database configuration in .env file')
        console.error('Required environment variables:')
        console.error('- DB_HOST (default: localhost)')
        console.error('- DB_PORT (default: 5432)')
        console.error('- DB_NAME (default: farlandet)')
        console.error('- DB_USER (default: postgres)')
        console.error('- DB_PASSWORD (required)')
        return false
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  return false
}

// Check if database is initialized
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'resources', 'tags', 'resource_tags', 'admin_users')
    `)
    client.release()
    
    const tableCount = parseInt(result.rows[0].table_count)
    return tableCount === 5
  } catch (error) {
    return false
  }
}