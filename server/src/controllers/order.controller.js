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
  async createOrder(req, res) {
    try {
      const sessionUser = req.session && req.session.user
      let orderData = { ...req.body }

      if (sessionUser) {
        if (sessionUser.roleCode === 'customer') {
          // Customers always create orders for themselves
          orderData.customerId = sessionUser.userId
        } else if (sessionUser.roleCode === 'manager') {
          // Managers must supply a customerId in the body
          // (already validated by middleware, no override needed)
          orderData.staffId = sessionUser.userId
        }
      }

      const order = await orderService.createOrder(orderData)
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
  async getAllOrders(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query
      const sessionUser = req.session && req.session.user

      // Customers can only see their own orders
      const customerId =
        sessionUser && sessionUser.roleCode === 'customer'
          ? sessionUser.userId
          : req.query.customerId || undefined

      const result = await orderService.getAllOrders({
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        customerId,
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
  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id)
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
  async placeOrder(req, res) {
    try {
      const command = new PlaceOrderCommand(orderService, req.params.id)
      const result = await orderCommandInvoker.executeCommand(command)

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
  async cancelOrder(req, res) {
    try {
      const command = new CancelOrderCommand(orderService, req.params.id)
      const result = await orderCommandInvoker.executeCommand(command)

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
  async updateOrder(req, res) {
    try {
      const command = new UpdateOrderCommand(orderService, req.params.id, req.body)
      const result = await orderCommandInvoker.executeCommand(command)

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
