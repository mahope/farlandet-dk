import pg from 'pg';
const { Pool } = pg;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Or use individual settings:
  // host: process.env.DB_HOST || 'localhost',
  // port: parseInt(process.env.DB_PORT) || 5432,
  // database: process.env.DB_NAME || 'farlandet',
  // user: process.env.DB_USER || 'postgres',
  // password: process.env.DB_PASSWORD || '',

  // Pool configuration
  max: 20,                    // Maximum connections in pool
  idleTimeoutMillis: 30000,   // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection available
});

// Test connection on startup
pool.on('connect', () => {
  console.log('📦 Database pool: New client connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Helper function to execute queries
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
}

// Get a client from pool for transactions
export async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);

  // Monkey-patch to log queries
  client.query = async (text, params) => {
    const start = Date.now();
    const result = await originalQuery(text, params);
    const duration = Date.now() - start;
    console.log('📊 Transaction query:', { duration: `${duration}ms`, rows: result.rowCount });
    return result;
  };

  // Set a timeout of 5 seconds, after which we log a warning
  const timeout = setTimeout(() => {
    console.warn('⚠️ Client has been checked out for more than 5 seconds');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    return release();
  };

  return client;
}

// Test database connection
export async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✅ Database connected:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Gracefully close pool
export async function closePool() {
  await pool.end();
  console.log('📦 Database pool closed');
}

export default {
  query,
  getClient,
  testConnection,
  closePool,
  pool
};
