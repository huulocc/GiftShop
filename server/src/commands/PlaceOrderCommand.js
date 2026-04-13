const Command = require('./Command')
const { OrderStatus } = require('../models/order.model')

/**
 * PlaceOrderCommand - Command Pattern
 *
 * Encapsulates the action of placing an order.
 * Transitions order status from 'pending' → 'placed'.
 * Supports undo by reverting status back to 'pending'.
 */
class PlaceOrderCommand extends Command {
  /**
   * @param {Object} orderService - The order service (receiver)
   * @param {string} orderId - The order ID to place
   */
  constructor(orderService, orderId) {
    super()
    this.orderService = orderService
    this.orderId = orderId
    this.previousStatus = null
  }

  /**
   * Execute: Place the order (pending → placed)
   * @returns {Promise<Object>} updated order
   */
  async execute() {
    const order = await this.orderService.getOrderById(this.orderId)
    if (order) {
      this.previousStatus = order.status
    }

    return this.orderService.updateOrderStatus(this.orderId, OrderStatus.PLACED)
  }

  /**
   * Undo: Revert back to previous status
   * @returns {Promise<Object>} reverted order
   */
  async undo() {
    if (this.previousStatus) {
      return this.orderService.updateOrderStatus(this.orderId, this.previousStatus)
    }
    throw new Error('Cannot undo: no previous state recorded')
  }
}

module.exports = PlaceOrderCommand
