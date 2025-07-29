import { testDatabaseConnection, isDatabaseInitialized } from '../config/database'
import { initializeDatabase } from './init-db'
import { seedDatabase, isDatabaseSeeded } from './seed-db'

async function setupDatabase() {
  console.log('🎯 Farlandet Database Setup')
  console.log('========================\n')
  
  try {
    // Step 1: Test connection
    console.log('Step 1: Testing database connection...')
    const connected = await testDatabaseConnection()
    if (!connected) {
      throw new Error('Database connection failed')
    }
    console.log('✅ Database connection successful\n')
    
    // Step 2: Initialize schema
    console.log('Step 2: Checking database schema...')
    const initialized = await isDatabaseInitialized()
    if (!initialized) {
      console.log('⚡ Initializing database schema...')
      await initializeDatabase()
      console.log('✅ Database schema created\n')
    } else {
      console.log('✅ Database schema already exists\n')
    }
    
    // Step 3: Seed data
    console.log('Step 3: Checking database data...')
    const seeded = await isDatabaseSeeded()
    if (!seeded) {
      console.log('🌱 Seeding database with initial data...')
      await seedDatabase()
      console.log('✅ Database seeded with initial data\n')
    } else {
      console.log('✅ Database already contains data\n')
    }
    
    // Success summary
    console.log('🎉 Database setup complete!')
    console.log('\n📋 Setup Summary:')
    console.log('   ✅ Database connection verified')
    console.log('   ✅ Schema initialized')
    console.log('   ✅ Sample data loaded')
    console.log('\n🚀 Ready to start the server!')
    console.log('   Run: npm run dev')
    
  } catch (error: any) {
    console.error('\n❌ Database setup failed:', error.message)
    console.error('\n💡 Troubleshooting:')
    console.error('   1. Make sure PostgreSQL is running')
    console.error('   2. Create database: createdb farlandet')
    console.error('   3. Check .env configuration')
    console.error('   4. Verify database credentials')
    process.exit(1)
  }
}

if (require.main === module) {
  setupDatabase()
}

export { setupDatabase }