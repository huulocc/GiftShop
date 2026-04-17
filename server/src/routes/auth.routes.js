const express = require('express')
const authController = require('../controllers/auth.controller')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')

const router = express.Router()

/**
 * Auth Routes
 *
 * POST   /api/auth/register  — Create a new customer account
 * POST   /api/auth/login     — Authenticate and create session
 * POST   /api/auth/logout    — Destroy session
 * GET    /api/auth/me        — Get current session user
 */

router.post('/register', (req, res) => authController.register(req, res))
router.post('/login', (req, res) => authController.login(req, res))
router.post('/logout', (req, res) => authController.logout(req, res))
router.get('/me', (req, res) => authController.getMe(req, res))
router.post('/change-password', (req, res) => authController.changePassword(req, res))

// Manager-only: list customers for order assignment
router.get('/customers', requireAuth, requireRole('manager'), (req, res) => authController.getCustomers(req, res))

module.exports = router
