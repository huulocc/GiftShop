const bcrypt = require('bcryptjs')
const authRepository = require('../repositories/auth.repository')

const SALT_ROUNDS = 10

/**
 * AuthService - Business Logic Layer for authentication
 *
 * Handles registration, login, and user lookup.
 * Depends on AuthRepository for data access.
 * Follows the same pattern as CartService / OrderService.
 */
class AuthService {
  /**
   * Register a new customer account
   * @param {{ fullName: string, username: string, email: string, password: string, address: string }} data
   * @returns {Promise<Object>} sanitised user (no password hash)
   * @throws {Error} 409 if email or username already exists
   */
  async register({ fullName, username, email, password, phone, address }) {
    // Check email uniqueness
    const existingEmail = await authRepository.findByEmail(email)
    if (existingEmail) {
      const error = new Error('This email is already registered.')
      error.statusCode = 409
      throw error
    }

    // Check username uniqueness
    const existingUsername = await authRepository.findByUsername(username)
    if (existingUsername) {
      const error = new Error('Username already taken')
      error.statusCode = 409
      throw error
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Create user with role 'customer'
    const user = await authRepository.createUser({
      fullName,
      username,
      email,
      passwordHash,
      phone: phone || null,
      address,
      roleCode: 'customer',
    })

    return this._sanitise(user)
  }

  /**
   * Authenticate a user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} sanitised user
   * @throws {Error} 401 if credentials invalid, 403 if account deactivated
   */
  async login(email, password) {
    const user = await authRepository.findByEmail(email)
    if (!user) {
      const error = new Error('Invalid email or password.')
      error.statusCode = 401
      throw error
    }

    // Compare password
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      const error = new Error('Invalid email or password.')
      error.statusCode = 401
      throw error
    }

    // Check active status
    if (!user.isActive) {
      const error = new Error('Account has been deactivated')
      error.statusCode = 403
      throw error
    }

    return this._sanitise(user)
  }

  /**
   * Get a user by ID (for session re-hydration)
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getUserById(userId) {
    const user = await authRepository.findById(userId)
    if (!user) return null
    return this._sanitise(user)
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findById(userId)
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!match) {
      const error = new Error('Current password is incorrect')
      error.statusCode = 400
      throw error
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await authRepository.updatePassword(userId, passwordHash)
  }

  /**
   * Get all active customers (for manager order creation)
   * @param {string} [search] - Optional name/email search
   * @returns {Promise<Array>}
   */
  async getCustomers(search = '') {
    return authRepository.getCustomers(search)
  }

  // ── Private Helpers ────────────────────────────────────

  /**
   * Remove sensitive fields (password hash) from user object
   */
  _sanitise(user) {
    const { passwordHash, ...safe } = user
    return safe
  }
}

module.exports = new AuthService()
