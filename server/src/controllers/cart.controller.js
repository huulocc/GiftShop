const cartService = require('../services/cart.service')

/**
 * CartController - Handles HTTP requests for Cart endpoints
 *
 * All endpoints require customerId (passed via header or param).
 * Once auth is implemented, customerId will come from the JWT token.
 */
class CartController {
  /**
   * GET /api/cart/:customerId
   * Get the active cart for a customer
   */
  async getCart(req, res) {
    try {
      const cart = await cartService.getCart(req.params.customerId)
      return res.status(200).json({
        success: true,
        data: cart,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * POST /api/cart/:customerId/items
   * Add an item to the cart
   * Body: { productId, quantity, unitPrice }
   */
  async addItem(req, res) {
    try {
      const cart = await cartService.addItem(req.params.customerId, req.body)
      return res.status(200).json({
        success: true,
        data: cart,
        message: 'Item added to cart',
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
   * PATCH /api/cart/:customerId/items/:productId
   * Update quantity of a cart item
   * Body: { quantity }
   */
  async updateItemQuantity(req, res) {
    try {
      const { quantity } = req.body
      const cart = await cartService.updateItemQuantity(
        req.params.customerId,
        req.params.productId,
        quantity
      )
      return res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart updated',
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
   * DELETE /api/cart/:customerId/items/:productId
   * Remove an item from the cart
   */
  async removeItem(req, res) {
    try {
      const cart = await cartService.removeItem(
        req.params.customerId,
        req.params.productId
      )
      return res.status(200).json({
        success: true,
        data: cart,
        message: 'Item removed from cart',
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
   * DELETE /api/cart/:customerId
   * Clear all items from the cart
   */
  async clearCart(req, res) {
    try {
      const cart = await cartService.clearCart(req.params.customerId)
      return res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart cleared',
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }
}

module.exports = new CartController()
