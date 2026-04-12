const Command = require('./Command')
const { OrderStatus } = require('../models/order.model')

/**
 * CancelOrderCommand - Command Pattern
 *
 * Encapsulates the action of cancelling an order.
 * Transitions order status from 'placed' → 'cancelled'.
 * Supports undo by reverting status back to 'placed'.
 */
class CancelOrderCommand extends Command {
  /**
   * @param {Object} orderService - The order service (receiver)
   * @param {string} orderId - The order ID to cancel
   */
  constructor(orderService, orderId) {
    super()
    this.orderService = orderService
    this.orderId = orderId
    this.previousStatus = null
  }

  /**
   * Execute: Cancel the order (placed → cancelled)
   * @returns {Promise<Object>} updated order
   */
  async execute() {
    const order = await this.orderService.getOrderById(this.orderId)
    if (order) {
      this.previousStatus = order.status
    }

    return this.orderService.updateOrderStatus(this.orderId, OrderStatus.CANCELLED)
  }

  /**
   * Undo: Revert back to placed status
   * @returns {Promise<Object>} reverted order
   */
  async undo() {
    if (this.previousStatus) {
      return this.orderService.updateOrderStatus(this.orderId, this.previousStatus)
    }
    throw new Error('Cannot undo: no previous state recorded')
  }
}

module.exports = CancelOrderCommand
