const { Pool } = require('pg')

/**
 * PostgreSQL connection pool via Supabase Transaction Pooler
 * Transaction pooler (port 6543) is stateless — suitable for serverless/short-lived connections.
 *
 * Config:
 *   - Connection string is read from DATABASE_URL in .env
 *   - SSL is required by Supabase; rejectUnauthorized: false handles self-signed certs in dev
 */
const connectionString = process.env.DATABASE_URL
const dbSslEnv = (process.env.DB_SSL || '').toLowerCase()
const isSupabaseConnection = /supabase\.com/.test(connectionString || '')
const useSsl = dbSslEnv ? dbSslEnv === 'true' : isSupabaseConnection

const pool = new Pool({
  connectionString,
  ...(useSsl
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
})

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Failed to connect to database:', err.message)
    return
  }
  console.log('[DB] Connected to database ✓')
  release()
})

module.exports = pool
