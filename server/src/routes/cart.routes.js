const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cart.controller')

/**
 * Cart Routes
 *
 * GET    /api/cart/:customerId              - Get active cart
 * POST   /api/cart/:customerId/items        - Add item to cart
 * PATCH  /api/cart/:customerId/items/:productId  - Update item quantity
 * DELETE /api/cart/:customerId/items/:productId  - Remove item from cart
 * DELETE /api/cart/:customerId              - Clear entire cart
 */

// Validate customerId is UUID
function validateCustomerId(req, res, next) {
  const { customerId } = req.params
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!customerId || !uuidRegex.test(customerId)) {
    return res.status(400).json({
      success: false,
      error: 'customerId must be a valid UUID',
    })
  }
  next()
}

// Validate add-item request body
function validateAddItem(req, res, next) {
  const errors = []
  const { productId, quantity, unitPrice } = req.body

  if (!productId || typeof productId !== 'string') {
    errors.push('productId is required (UUID string)')
  }
  if (quantity !== undefined && (typeof quantity !== 'number' || quantity <= 0)) {
    errors.push('quantity must be a positive number')
  }
  if (unitPrice === undefined || typeof unitPrice !== 'number' || unitPrice < 0) {
    errors.push('unitPrice is required and must be >= 0')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors,
    })
  }
  next()
}

// Validate update-quantity request body
function validateUpdateQuantity(req, res, next) {
  const { quantity } = req.body
  if (quantity === undefined || typeof quantity !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'quantity is required and must be a number',
    })
  }
  next()
}

// Validate productId param
function validateProductId(req, res, next) {
  const { productId } = req.params
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!productId || !uuidRegex.test(productId)) {
    return res.status(400).json({
      success: false,
      error: 'productId must be a valid UUID',
    })
  }
  next()
}

// Get active cart
router.get(
  '/:customerId',
  validateCustomerId,
  (req, res) => cartController.getCart(req, res)
)

// Add item to cart
router.post(
  '/:customerId/items',
  validateCustomerId,
  validateAddItem,
  (req, res) => cartController.addItem(req, res)
)

// Update item quantity
router.patch(
  '/:customerId/items/:productId',
  validateCustomerId,
  validateProductId,
  validateUpdateQuantity,
  (req, res) => cartController.updateItemQuantity(req, res)
)

// Remove item from cart
router.delete(
  '/:customerId/items/:productId',
  validateCustomerId,
  validateProductId,
  (req, res) => cartController.removeItem(req, res)
)

// Clear entire cart
router.delete(
  '/:customerId',
  validateCustomerId,
  (req, res) => cartController.clearCart(req, res)
)

module.exports = router
