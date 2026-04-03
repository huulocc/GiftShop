const orderRepository = require('../repositories/order.repository')
const { OrderBuilder, OrderStatus } = require('../models/order.model')

/**
 * OrderService - Business Logic Layer
 *
 * Handles all business logic for orders.
 * Depends on repository for data access (not directly on data source).
 * This layer is database-agnostic and ready for DB integration.
 */
class OrderService {
  /**
   * Create a new order using the Builder pattern
   * @param {Object} orderData - Raw order data from request
   * @returns {Object} created order
   */
  createOrder(orderData) {
    const {
      customerName,
      email,
      phone,
      shippingAddress,
      items,
      giftMessage,
      paymentMethod,
    } = orderData

    // Use Builder pattern to construct the order step by step
    const builder = new OrderBuilder()

    const order = builder
      .setCustomerName(customerName)
      .setEmail(email)
      .setPhone(phone)
      .setShippingAddress(shippingAddress)
      .setItems(items)
      .setGiftMessage(giftMessage || '')
      .setPaymentMethod(paymentMethod)
      .build()

    // Persist through repository
    const created = orderRepository.create(order.toJSON())
    return created
  }

  /**
   * Get all orders with optional filtering
   * @param {Object} options - { status, page, limit }
   * @returns {{ orders: Array, total: number }}
   */
  getAllOrders(options) {
    return orderRepository.findAll(options)
  }

  /**
   * Get a single order by ID
   * @param {string} id
   * @returns {Object|null}
   */
  getOrderById(id) {
    return orderRepository.findById(id)
  }

  /**
   * Update order status
   * @param {string} id
   * @param {string} newStatus
   * @returns {Object} updated order
   * @throws {Error} if order not found or invalid transition
   */
  updateOrderStatus(id, newStatus) {
    const order = orderRepository.findById(id)
    if (!order) {
      const error = new Error('Order not found')
      error.statusCode = 404
      throw error
    }

    // Validate status transition
    this._validateStatusTransition(order.status, newStatus)

    return orderRepository.update(id, { status: newStatus })
  }

  /**
   * Update order details (items, address, etc.)
   * @param {string} id
   * @param {Object} updateData
   * @returns {Object} updated order
   * @throws {Error} if order not found or cancelled
   */
  updateOrderDetails(id, updateData) {
    const order = orderRepository.findById(id)
    if (!order) {
      const error = new Error('Order not found')
      error.statusCode = 404
      throw error
    }

    if (order.status === OrderStatus.CANCELLED) {
      const error = new Error('Order cannot be updated')
      error.details = 'Current status: cancelled'
      error.statusCode = 400
      throw error
    }

    // If items are updated, recalculate total
    if (updateData.items) {
      updateData.items = updateData.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.price),
      }))
      updateData.totalAmount = updateData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    }

    return orderRepository.update(id, updateData)
  }

  /**
   * Validate status transition rules
   * @param {string} currentStatus
   * @param {string} newStatus
   * @throws {Error} if transition is invalid
   */
  _validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PLACED],
      [OrderStatus.PLACED]: [OrderStatus.CANCELLED],
      [OrderStatus.CANCELLED]: [],
    }

    const allowed = validTransitions[currentStatus] || []
    if (!allowed.includes(newStatus)) {
      const error = new Error(
        `Order cannot be ${newStatus === OrderStatus.PLACED ? 'placed' : 'cancelled'}`
      )
      error.details = `Current status: ${currentStatus}`
      error.statusCode = 400
      throw error
    }
  }
}

module.exports = new OrderService()
