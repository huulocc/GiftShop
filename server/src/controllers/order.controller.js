const orderService = require('../services/order.service')
const PlaceOrderCommand = require('../commands/PlaceOrderCommand')
const CancelOrderCommand = require('../commands/CancelOrderCommand')
const UpdateOrderCommand = require('../commands/UpdateOrderCommand')
const orderCommandInvoker = require('../commands/OrderCommandInvoker')

/**
 * OrderController - Handles HTTP requests for Order endpoints
 *
 * - createOrder: Uses Builder pattern (via service) to create orders
 * - placeOrder, cancelOrder, updateOrder: Uses Command pattern
 */
class OrderController {
  /**
   * POST /api/orders
   * Create a new order using Builder pattern
   */
  createOrder(req, res) {
    try {
      const order = orderService.createOrder(req.body)
      return res.status(201).json({
        success: true,
        data: order,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
        details: error.details || undefined,
      })
    }
  }

  /**
   * GET /api/orders
   * Get all orders with optional filtering and pagination
   */
  getAllOrders(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query
      const result = orderService.getAllOrders({
        status,
        page: parseInt(page),
        limit: parseInt(limit),
      })

      return res.status(200).json({
        success: true,
        data: result.orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  /**
   * GET /api/orders/:id
   * Get a single order by ID
   */
  getOrderById(req, res) {
    try {
      const order = orderService.getOrderById(req.params.id)
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: order,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  /**
   * PATCH /api/orders/:id/place
   * Place an order using Command pattern
   */
  placeOrder(req, res) {
    try {
      const command = new PlaceOrderCommand(orderService, req.params.id)
      const result = orderCommandInvoker.executeCommand(command)

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Order placed successfully',
      })
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Internal server error',
        details: error.details || undefined,
      })
    }
  }

  /**
   * PATCH /api/orders/:id/cancel
   * Cancel an order using Command pattern
   */
  cancelOrder(req, res) {
    try {
      const command = new CancelOrderCommand(orderService, req.params.id)
      const result = orderCommandInvoker.executeCommand(command)

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Order cancelled successfully',
      })
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Internal server error',
        details: error.details || undefined,
      })
    }
  }

  /**
   * PUT /api/orders/:id
   * Update an order using Command pattern
   */
  updateOrder(req, res) {
    try {
      const command = new UpdateOrderCommand(orderService, req.params.id, req.body)
      const result = orderCommandInvoker.executeCommand(command)

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Order updated successfully',
      })
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Internal server error',
        details: error.details || undefined,
      })
    }
  }
}

module.exports = new OrderController()
