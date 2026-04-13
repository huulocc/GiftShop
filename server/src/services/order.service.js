const orderRepository = require('../repositories/order.repository')
const { OrderBuilder, OrderStatus } = require('../models/order.model')

/**
 * OrderService - Business Logic Layer
 *
 * Handles all business logic for orders.
 * Depends on repository for data access (not directly on data source).
 * All methods are async since the repository now uses PostgreSQL.
 */
class OrderService {
  /**
   * Create a new order using the Builder pattern
   * @param {Object} orderData - Raw order data from request
   * @returns {Promise<Object>} created order
   */
  async createOrder(orderData) {
    const {
      customerId,
      customerName,
      email,
      phone,
      shippingAddress,
      items,
      note,
      giftMessage,
      paymentMethod,
      discountAmount,
    } = orderData

    // Use Builder pattern to construct the order step by step
    const builder = new OrderBuilder()

    const order = builder
      .setCustomerId(customerId)
      .setCustomerName(customerName)
      .setEmail(email)
      .setPhone(phone)
      .setShippingAddress(shippingAddress)
      .setItems(items)
      .setNote(note || '')
      .setGiftMessage(giftMessage || '')
      .setPaymentMethod(paymentMethod)
      .setDiscountAmount(discountAmount || 0)
      .build()

    // Persist through repository
    const created = await orderRepository.create(order.toJSON())
    return created
  }

  /**
   * Get all orders with optional filtering
   * @param {Object} options - { status, page, limit }
   * @returns {Promise<{ orders: Array, total: number }>}
   */
  async getAllOrders(options) {
    return orderRepository.findAll(options)
  }

  /**
   * Get a single order by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getOrderById(id) {
    return orderRepository.findById(id)
  }

  /**
   * Update order status
   * @param {string} id
   * @param {string} newStatus
   * @returns {Promise<Object>} updated order
   * @throws {Error} if order not found or invalid transition
   */
  async updateOrderStatus(id, newStatus) {
    const order = await orderRepository.findById(id)
    if (!order) {
      const error = new Error('Order not found')
      error.statusCode = 404
      throw error
    }

    // Validate status transition
    this._validateStatusTransition(order.status, newStatus)

    return orderRepository.update(id, {
      status: newStatus,
      _previousStatus: order.status,
    })
  }

  /**
   * Update order details (items, address, etc.)
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object>} updated order
   * @throws {Error} if order not found or cancelled
   */
  async updateOrderDetails(id, updateData) {
    const order = await orderRepository.findById(id)
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

    // Map request fields to DB-compatible fields
    const mapped = {}

    if (updateData.customerName) mapped.customerNameSnapshot = updateData.customerName
    if (updateData.email) mapped.customerEmailSnapshot = updateData.email
    if (updateData.phone) mapped.customerPhoneSnapshot = updateData.phone
    if (updateData.shippingAddress) {
      mapped.shippingAddressSnapshot =
        typeof updateData.shippingAddress === 'string'
          ? updateData.shippingAddress
          : JSON.stringify(updateData.shippingAddress)
    }
    if (updateData.note !== undefined) mapped.note = updateData.note
    if (updateData.giftMessage !== undefined) mapped.giftMessage = updateData.giftMessage
    if (updateData.paymentMethod) mapped.paymentMethodSelected = updateData.paymentMethod

    // If items are updated, recalculate totals
    if (updateData.items) {
      mapped.items = updateData.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.price),
      }))
      const subtotal = mapped.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      mapped.subtotal = subtotal
      mapped.totalAmount = subtotal - (updateData.discountAmount || order.discountAmount || 0)
    }

    return orderRepository.update(id, mapped)
  }

  /**
   * Validate status transition rules
   * @param {string} currentStatus
   * @param {string} newStatus
   * @throws {Error} if transition is invalid
   */
  _validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PLACED, OrderStatus.CANCELLED],
      [OrderStatus.PLACED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    }

    const allowed = validTransitions[currentStatus] || []
    if (!allowed.includes(newStatus)) {
      const error = new Error(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`
      )
      error.details = `Current status: ${currentStatus}. Allowed: ${allowed.join(', ') || 'none'}`
      error.statusCode = 400
      throw error
    }
  }
}

module.exports = new OrderService()
