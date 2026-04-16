import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Cart API Service
 * Handles all HTTP calls to the cart endpoints
 *
 * Endpoints:
 *   GET    /cart/:customerId
 *   POST   /cart/:customerId/items
 *   PATCH  /cart/:customerId/items/:productId
 *   DELETE /cart/:customerId/items/:productId
 *   DELETE /cart/:customerId
 */
const cartService = {
  /**
   * Get the active cart for a customer
   * @param {string} customerId
   * @returns {Promise<Object>} cart data
   */
  async getCart(customerId) {
    const response = await apiClient.get(`/cart/${customerId}`)
    return response.data
  },

  /**
   * Add an item to the cart
   * @param {string} customerId
   * @param {{ productId: string, quantity: number, unitPrice: number }} itemData
   * @returns {Promise<Object>} updated cart
   */
  async addItem(customerId, itemData) {
    const response = await apiClient.post(`/cart/${customerId}/items`, itemData)
    return response.data
  },

  /**
   * Update the quantity of a cart item
   * @param {string} customerId
   * @param {string} productId
   * @param {number} quantity
   * @returns {Promise<Object>} updated cart
   */
  async updateItemQuantity(customerId, productId, quantity) {
    const response = await apiClient.patch(
      `/cart/${customerId}/items/${productId}`,
      { quantity }
    )
    return response.data
  },

  /**
   * Remove an item from the cart
   * @param {string} customerId
   * @param {string} productId
   * @returns {Promise<Object>} updated cart
   */
  async removeItem(customerId, productId) {
    const response = await apiClient.delete(
      `/cart/${customerId}/items/${productId}`
    )
    return response.data
  },

  /**
   * Clear the entire cart
   * @param {string} customerId
   * @returns {Promise<Object>} empty cart
   */
  async clearCart(customerId) {
    const response = await apiClient.delete(`/cart/${customerId}`)
    return response.data
  },
}

export default cartService
