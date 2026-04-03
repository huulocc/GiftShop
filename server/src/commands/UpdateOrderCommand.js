const Command = require('./Command')

/**
 * UpdateOrderCommand - Command Pattern
 *
 * Encapsulates the action of updating order details.
 * Updates fields like items, address, gift message, etc.
 * Supports undo by storing the previous state snapshot.
 */
class UpdateOrderCommand extends Command {
  /**
   * @param {Object} orderService - The order service (receiver)
   * @param {string} orderId - The order ID to update
   * @param {Object} updateData - The fields to update
   */
  constructor(orderService, orderId, updateData) {
    super()
    this.orderService = orderService
    this.orderId = orderId
    this.updateData = updateData
    this.previousState = null
  }

  /**
   * Execute: Update the order details
   * @returns {Object} updated order
   */
  execute() {
    // Save current state for undo
    const currentOrder = this.orderService.getOrderById(this.orderId)
    if (currentOrder) {
      this.previousState = { ...currentOrder }
    }

    return this.orderService.updateOrderDetails(this.orderId, this.updateData)
  }

  /**
   * Undo: Revert to previous state
   * @returns {Object} reverted order
   */
  undo() {
    if (this.previousState) {
      const { id, createdAt, ...restoreData } = this.previousState
      return this.orderService.updateOrderDetails(this.orderId, restoreData)
    }
    throw new Error('Cannot undo: no previous state recorded')
  }
}

module.exports = UpdateOrderCommand
