const pool = require('../config/db')

/**
 * AuthRepository - Data Access Layer for authentication
 *
 * Uses PostgreSQL (Supabase) via pg Pool.
 * Manages `users` and `roles` tables for auth operations.
 * Follows the same pattern as CartRepository / OrderRepository.
 *
 * Methods: findByEmail(), findByUsername(), findById(), createUser()
 */
class AuthRepository {
  /**
   * Find a user by email address
   * @param {string} email
   * @returns {Promise<Object|null>} user row or null
   */
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT u.*, r.role_code, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = $1`,
      [email]
    )
    if (result.rows.length === 0) return null
    return this._mapUserRow(result.rows[0])
  }

  /**
   * Find a user by username
   * @param {string} username
   * @returns {Promise<Object|null>} user row or null
   */
  async findByUsername(username) {
    const result = await pool.query(
      `SELECT u.*, r.role_code, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.username = $1`,
      [username]
    )
    if (result.rows.length === 0) return null
    return this._mapUserRow(result.rows[0])
  }

  /**
   * Find a user by ID (for session re-hydration)
   * @param {string} userId - UUID
   * @returns {Promise<Object|null>}
   */
  async findById(userId) {
    const result = await pool.query(
      `SELECT u.*, r.role_code, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = $1`,
      [userId]
    )
    if (result.rows.length === 0) return null
    return this._mapUserRow(result.rows[0])
  }

  /**
   * Create a new user in the database
   * @param {{ fullName: string, username: string, email: string, passwordHash: string, address: string, roleCode: string }} data
   * @returns {Promise<Object>} the created user
   */
  async createUser({ fullName, username, email, passwordHash, address, roleCode = 'customer' }) {
    // Resolve role_id from role_code
    const roleResult = await pool.query(
      `SELECT role_id FROM roles WHERE role_code = $1`,
      [roleCode]
    )

    if (roleResult.rows.length === 0) {
      throw new Error(`Role "${roleCode}" not found`)
    }

    const roleId = roleResult.rows[0].role_id

    const result = await pool.query(
      `INSERT INTO users (role_id, full_name, username, email, password_hash, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [roleId, fullName, username, email, passwordHash, address || null]
    )

    // Re-fetch with role info
    return this.findById(result.rows[0].user_id)
  }

  // ── Private Helpers ────────────────────────────────────

  /**
   * Map a raw user DB row to a clean JS object
   */
  _mapUserRow(row) {
    return {
      userId: row.user_id,
      roleId: row.role_id,
      roleCode: row.role_code,
      roleName: row.role_name,
      fullName: row.full_name,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      phone: row.phone,
      address: row.address,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

module.exports = new AuthRepository()
