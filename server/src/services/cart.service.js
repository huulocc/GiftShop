const cartRepository = require('../repositories/cart.repository')

/**
 * CartService - Business Logic Layer
 *
 * Handles all business logic for cart operations.
 * Depends on CartRepository for data access.
 * All methods are async (PostgreSQL-backed).
 */
class CartService {
  /**
   * Get or create the active cart for a customer
   * @param {string} customerId
   * @returns {Promise<Object>} cart with items
   */
  async getCart(customerId) {
    return cartRepository.getActiveCart(customerId)
  }

  /**
   * Add a product to the customer's active cart
   * @param {string} customerId
   * @param {{ productId: string, quantity: number, unitPrice: number }} itemData
   * @returns {Promise<Object>} updated cart
   */
  async addItem(customerId, itemData) {
    const cart = await cartRepository.getActiveCart(customerId)

    await cartRepository.addItem(cart.cartId, {
      productId: itemData.productId,
      quantity: itemData.quantity || 1,
      unitPrice: itemData.unitPrice,
    })

    // Return the full updated cart
    return cartRepository.getActiveCart(customerId)
  }

  /**
   * Update quantity of an item in the cart
   * @param {string} customerId
   * @param {string} productId
   * @param {number} quantity
   * @returns {Promise<Object>} updated cart
   */
  async updateItemQuantity(customerId, productId, quantity) {
    const cart = await cartRepository.getActiveCart(customerId)

    if (quantity <= 0) {
      await cartRepository.removeItem(cart.cartId, productId)
    } else {
      const result = await cartRepository.updateItemQuantity(cart.cartId, productId, quantity)
      if (!result) {
        const error = new Error('Item not found in cart')
        error.statusCode = 404
        throw error
      }
    }

    return cartRepository.getActiveCart(customerId)
  }

  /**
   * Remove an item from the cart
   * @param {string} customerId
   * @param {string} productId
   * @returns {Promise<Object>} updated cart
   */
  async removeItem(customerId, productId) {
    const cart = await cartRepository.getActiveCart(customerId)

    const removed = await cartRepository.removeItem(cart.cartId, productId)
    if (!removed) {
      const error = new Error('Item not found in cart')
      error.statusCode = 404
      throw error
    }

    return cartRepository.getActiveCart(customerId)
  }

  /**
   * Clear all items from the cart
   * @param {string} customerId
   * @returns {Promise<Object>} empty cart
   */
  async clearCart(customerId) {
    const cart = await cartRepository.getActiveCart(customerId)
    await cartRepository.clearItems(cart.cartId)
    return cartRepository.getActiveCart(customerId)
  }
}

module.exports = new CartService()
