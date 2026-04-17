const authService = require('../services/auth.service')

/**
 * AuthController - Handles HTTP requests for Auth endpoints
 *
 * Endpoints:
 *   POST /api/auth/register          - Create a new customer account
 *   POST /api/auth/login             - Authenticate and create session
 *   POST /api/auth/logout            - Destroy session
 *   GET  /api/auth/me                - Get current session user
 *   POST /api/auth/change-password   - Change password
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Body: { fullName, username, email, password, address }
   */
  async register(req, res) {
    try {
      const { fullName, username, email, password, address } = req.body

      if (!fullName || !fullName.trim() || !username || !username.trim() || !email || !email.trim() || !password) {
        return res.status(400).json({ success: false, error: 'Please fill in all required fields.' })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email) || password.length < 6) {
        return res.status(400).json({ success: false, error: 'Invalid input format. Please try again.' })
      }

      const user = await authService.register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        address: address ? address.trim() : null,
      })

      req.session.user = {
        userId: user.userId,
        roleCode: user.roleCode,
        roleName: user.roleName,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
      }

      return res.status(201).json({ success: true, message: 'Account created successfully', data: user })
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  /**
   * POST /api/auth/login
   * Body: { email, password }
   */
  async login(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !email.trim() || !password) {
        return res.status(400).json({ success: false, error: 'Please fill in all required fields.' })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: 'Invalid input format. Please try again.' })
      }

      const user = await authService.login(email.trim().toLowerCase(), password)

      req.session.user = {
        userId: user.userId,
        roleCode: user.roleCode,
        roleName: user.roleName,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
      }

      return res.status(200).json({ success: true, message: 'Login successful', data: user })
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  /**
   * POST /api/auth/logout
   * Destroys the session and clears the cookie
   */
  async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, error: 'Failed to logout' })
        res.clearCookie('connect.sid')
        return res.status(200).json({ success: true, message: 'Logged out successfully' })
      })
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  }

  /**
   * GET /api/auth/me
   * Returns the current session user or 401
   */
  async getMe(req, res) {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' })
      }
      const user = await authService.getUserById(req.session.user.userId)
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' })
      }
      return res.status(200).json({ success: true, data: user })
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  }

  /**
   * POST /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' })
      }
      const userId = req.session.user.userId
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Please fill in all required fields.' })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'Invalid input format. Please try again.' })
      }

      await authService.changePassword(userId, currentPassword, newPassword)

      return res.status(200).json({ success: true, message: 'Password changed successfully' })
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  /**
   * GET /api/auth/customers
   * Manager-only: returns list of all active customers for order creation
   * Query: ?search=name_or_email
   */
  async getCustomers(req, res) {
    try {
      const { search = '' } = req.query
      const customers = await authService.getCustomers(search)
      return res.status(200).json({ success: true, data: customers })
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  }
}

module.exports = new AuthController()