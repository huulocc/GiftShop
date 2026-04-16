const express = require('express')
const categoryController = require('../controllers/category.controller')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')

const router = express.Router()

/**
 * Category Routes
 *
 * GET    /api/categories       — public: list all active categories
 * GET    /api/categories/:id   — public: get category detail
 * POST   /api/categories       — manager only: create
 * PUT    /api/categories/:id   — manager only: update
 * DELETE /api/categories/:id   — manager only: soft-delete
 */

// Public
router.get('/', (req, res) => categoryController.getAll(req, res))
router.get('/:id', (req, res) => categoryController.getById(req, res))

// Manager only
router.post('/', requireAuth, requireRole('manager'), (req, res) => categoryController.create(req, res))
router.put('/:id', requireAuth, requireRole('manager'), (req, res) => categoryController.update(req, res))
router.delete('/:id', requireAuth, requireRole('manager'), (req, res) => categoryController.delete(req, res))

module.exports = router
