import { pool, testDatabaseConnection } from '../config/database'

async function initializeDatabase(verbose = true) {
  if (verbose) console.log('🚀 Initializing Farlandet database schema...')
  
  // Test connection first
  const connected = await testDatabaseConnection()
  if (!connected) {
    throw new Error('Could not establish database connection')
  }
  
  const client = await pool.connect()
  
  try {
    // Start transaction
    await client.query('BEGIN')
    
    if (verbose) console.log('📋 Creating categories table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    
    if (verbose) console.log('📝 Creating resources table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        url TEXT,
        type VARCHAR(50) DEFAULT 'link',
        category_id INTEGER REFERENCES categories(id),
        status VARCHAR(20) DEFAULT 'pending',
        votes INTEGER DEFAULT 0,
        submitted_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP,
        approved_by VARCHAR(100),
        CONSTRAINT valid_type CHECK (type IN ('link', 'pdf', 'article', 'podcast', 'tip', 'book', 'video', 'movie', 'tv_series')),
        CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
      )
    `)
    
    if (verbose) console.log('🏷️  Creating tags table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    
    if (verbose) console.log('🔗 Creating resource_tags junction table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS resource_tags (
        resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (resource_id, tag_id)
      )
    `)
    
    if (verbose) console.log('👤 Creating admin_users table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `)
    
    if (verbose) console.log('⚡ Creating performance indexes...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
      CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category_id);
      CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_resources_votes ON resources(votes DESC);
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    `)
    
    if (verbose) console.log('🔧 Adding helpful database functions...')
    // Function to automatically update approved_at when status changes to approved
    await client.query(`
      CREATE OR REPLACE FUNCTION set_approved_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
          NEW.approved_at = NOW();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)
    
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_set_approved_timestamp ON resources;
      CREATE TRIGGER trigger_set_approved_timestamp
        BEFORE UPDATE ON resources
        FOR EACH ROW
        EXECUTE FUNCTION set_approved_timestamp();
    `)
    
    // Commit transaction
    await client.query('COMMIT')
    
    if (verbose) {
      console.log('✅ Database schema initialized successfully!')
      console.log('\n📊 Created tables:')
      console.log('   - categories (for organizing resources)')
      console.log('   - resources (main content with moderation)')
      console.log('   - tags (flexible tagging system)')
      console.log('   - resource_tags (many-to-many relationship)')
      console.log('   - admin_users (for authentication)')
      console.log('\n🚀 Ready to seed database with initial data!')
    }
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error initializing database:', error)
    throw error
  } finally {
    client.release()
  }
}

// Verify database setup
async function verifyDatabaseSetup(): Promise<boolean> {
  try {
    const client = await pool.connect()
    
    // Check all required tables exist
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'resources', 'tags', 'resource_tags', 'admin_users')
      ORDER BY table_name
    `)
    
    client.release()
    
    const expectedTables = ['admin_users', 'categories', 'resource_tags', 'resources', 'tags']
    const actualTables = tableCheck.rows.map(row => row.table_name).sort()
    
    const isSetupComplete = expectedTables.every(table => actualTables.includes(table))
    
    if (isSetupComplete) {
      console.log('✅ Database verification successful - all tables present')
    } else {
      console.log('❌ Database verification failed')
      console.log('Expected tables:', expectedTables)
      console.log('Found tables:', actualTables)
    }
    
    return isSetupComplete
  } catch (error) {
    console.error('❌ Database verification failed:', error)
    return false
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => verifyDatabaseSetup())
    .then((verified) => {
      if (verified) {
        console.log('\n🎉 Database initialization complete and verified!')
        console.log('💡 Next step: npm run db:seed (to add sample data)')
        process.exit(0)
      } else {
        console.error('\n❌ Database setup verification failed')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('\n❌ Database initialization failed:', error.message)
      process.exit(1)
    })
}

export { initializeDatabase, verifyDatabaseSetup }