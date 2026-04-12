const express = require('express')
const productController = require('../controllers/product.controller')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')

const router = express.Router()

/**
 * Product Routes
 *
 * GET    /api/products              — public: list with filters
 * GET    /api/products/:id          — public: detail
 * POST   /api/products              — manager only: create
 * PUT    /api/products/:id          — manager only: update
 * DELETE /api/products/:id          — manager only: soft-delete
 * PATCH  /api/products/:id/stock    — manager only: update stock
 */

// Public
router.get('/', (req, res) => productController.getAll(req, res))
router.get('/:id', (req, res) => productController.getById(req, res))

// Manager only
router.post('/', requireAuth, requireRole('manager'), (req, res) => productController.create(req, res))
router.put('/:id', requireAuth, requireRole('manager'), (req, res) => productController.update(req, res))
router.delete('/:id', requireAuth, requireRole('manager'), (req, res) => productController.delete(req, res))
router.patch('/:id/stock', requireAuth, requireRole('manager'), (req, res) => productController.updateStock(req, res))

module.exports = router
