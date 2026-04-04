const express = require('express')
const router = express.Router()
const orderController = require('../controllers/order.controller')
const {
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderId,
} = require('../middleware/validation.middleware')

/**
 * Order Routes
 *
 * POST   /api/orders          - Create a new order (Builder pattern)
 * GET    /api/orders          - Get all orders
 * GET    /api/orders/:id      - Get order by ID
 * PATCH  /api/orders/:id/place  - Place an order (Command pattern)
 * PATCH  /api/orders/:id/cancel - Cancel an order (Command pattern)
 * PUT    /api/orders/:id      - Update an order (Command pattern)
 */

// Create order - Builder pattern
router.post('/', validateCreateOrder, (req, res) => orderController.createOrder(req, res))

// Get all orders
router.get('/', (req, res) => orderController.getAllOrders(req, res))

// Get order by ID
router.get('/:id', validateOrderId, (req, res) => orderController.getOrderById(req, res))

// Place order - Command pattern
router.patch('/:id/place', validateOrderId, (req, res) => orderController.placeOrder(req, res))

// Cancel order - Command pattern
router.patch('/:id/cancel', validateOrderId, (req, res) => orderController.cancelOrder(req, res))

// Update order - Command pattern
router.put('/:id', validateOrderId, validateUpdateOrder, (req, res) =>
  orderController.updateOrder(req, res)
)

module.exports = router
