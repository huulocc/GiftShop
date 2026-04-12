const authService = require('../services/auth.service')

/**
 * AuthController - Handles HTTP requests for Auth endpoints
 *
 * Endpoints:
 *   POST /api/auth/register  — Create a new customer account
 *   POST /api/auth/login     — Authenticate and create session
 *   POST /api/auth/logout    — Destroy session
 *   GET  /api/auth/me        — Get current session user
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Body: { fullName, username, email, password, address }
   */
  async register(req, res) {
    try {
      const { fullName, username, email, password, address } = req.body

      // Basic validation
      const errors = []
      if (!fullName || fullName.trim().length === 0) errors.push('fullName is required')
      if (!username || username.trim().length === 0) errors.push('username is required')
      if (!email || email.trim().length === 0) errors.push('email is required')
      if (!password || password.length < 6) errors.push('password must be at least 6 characters')

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (email && !emailRegex.test(email)) {
        errors.push('email must be a valid email address')
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errors,
        })
      }

      const user = await authService.register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        address: address ? address.trim() : null,
      })

      // Set session
      req.session.user = {
        userId: user.userId,
        roleCode: user.roleCode,
        roleName: user.roleName,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
      }

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: user,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * POST /api/auth/login
   * Body: { email, password }
   */
  async login(req, res) {
    try {
      const { email, password } = req.body

      // Basic validation
      const errors = []
      if (!email || email.trim().length === 0) errors.push('email is required')
      if (!password || password.length === 0) errors.push('password is required')

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errors,
        })
      }

      const user = await authService.login(
        email.trim().toLowerCase(),
        password
      )

      // Set session
      req.session.user = {
        userId: user.userId,
        roleCode: user.roleCode,
        roleName: user.roleName,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: user,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * POST /api/auth/logout
   * Destroys the session and clears the cookie
   */
  async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to logout',
          })
        }

        res.clearCookie('connect.sid')
        return res.status(200).json({
          success: true,
          message: 'Logged out successfully',
        })
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  /**
   * GET /api/auth/me
   * Returns the current session user or 401
   */
  async getMe(req, res) {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        })
      }

      // Re-hydrate from DB to get fresh data
      const user = await authService.getUserById(req.session.user.userId)
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }
}

module.exports = new AuthController()
