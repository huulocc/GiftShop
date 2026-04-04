import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Order API Service
 * Handles all HTTP calls to the order endpoints
 */
const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order data from the form
   * @returns {Promise<Object>} created order
   */
  async createOrder(orderData) {
    const response = await apiClient.post('/orders', orderData)
    return response.data
  },

  /**
   * Get all orders with optional filters
   * @param {Object} params - { status, page, limit }
   * @returns {Promise<Object>} { data, pagination }
   */
  async getAllOrders(params = {}) {
    const response = await apiClient.get('/orders', { params })
    return response.data
  },

  /**
   * Get a single order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} order data
   */
  async getOrderById(id) {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  /**
   * Place an order (pending → placed)
   * @param {string} id - Order ID
   * @returns {Promise<Object>} updated order
   */
  async placeOrder(id) {
    const response = await apiClient.patch(`/orders/${id}/place`)
    return response.data
  },

  /**
   * Cancel an order (placed → cancelled)
   * @param {string} id - Order ID
   * @returns {Promise<Object>} updated order
   */
  async cancelOrder(id) {
    const response = await apiClient.patch(`/orders/${id}/cancel`)
    return response.data
  },

  /**
   * Update an order's details
   * @param {string} id - Order ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} updated order
   */
  async updateOrder(id, updateData) {
    const response = await apiClient.put(`/orders/${id}`, updateData)
    return response.data
  },
}

export default orderService
