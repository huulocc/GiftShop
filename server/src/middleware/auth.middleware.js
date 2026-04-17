/**
 * Auth Middleware
 *
 * Provides route-level guards for authentication and role-based authorization.
 *
 * Usage:
 *   router.get('/protected', requireAuth, handler)
 *   router.get('/admin-only', requireAuth, requireRole('manager'), handler)
 */

/**
 * Ensure the user is authenticated (has a valid session)
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    })
  }
  next()
}

/**
 * Ensure the authenticated user has a specific role
 * @param {string} roleCode - e.g. 'manager', 'customer'
 * @returns {Function} Express middleware
 */
function requireRole(roleCode) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      })
    }

    if (req.session.user.roleCode !== roleCode) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
      })
    }

    next()
  }
}

module.exports = {
  requireAuth,
  requireRole,
}
