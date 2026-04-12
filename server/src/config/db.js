const { Pool } = require('pg')

/**
 * PostgreSQL connection pool via Supabase Transaction Pooler
 * Transaction pooler (port 6543) is stateless — suitable for serverless/short-lived connections.
 *
 * Config:
 *   - Connection string is read from DATABASE_URL in .env
 *   - SSL is required by Supabase; rejectUnauthorized: false handles self-signed certs in dev
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase pooler
  },
})

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Failed to connect to Supabase:', err.message)
    return
  }
  console.log('[DB] Connected to Supabase (transaction pooler) ✓')
  release()
})

module.exports = pool
