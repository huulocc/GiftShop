import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

/**
 * Product API Service
 * Handles all HTTP calls to the product endpoints
 */
const productService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams()
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    const response = await apiClient.get(`/products?${params.toString()}`)
    return response.data
  },

  async getById(productId) {
    const response = await apiClient.get(`/products/${productId}`)
    return response.data
  },

  async create(data) {
    const isFormData = data instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': undefined } } : {}
    const response = await apiClient.post('/products', data, config)
    return response.data
  },

  async update(productId, data) {
    const isFormData = data instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': undefined } } : {}
    const response = await apiClient.put(`/products/${productId}`, data, config)
    return response.data
  },

  async delete(productId) {
    const response = await apiClient.delete(`/products/${productId}`)
    return response.data
  },

  async updateStock(productId, quantity) {
    const response = await apiClient.patch(`/products/${productId}/stock`, { quantity })
    return response.data
  },
}

export default productService
