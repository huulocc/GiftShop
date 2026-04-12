import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

/**
 * Category API Service
 * Handles all HTTP calls to the category endpoints
 */
const categoryService = {
  async getAll() {
    const response = await apiClient.get('/categories')
    return response.data
  },

  async getById(categoryId) {
    const response = await apiClient.get(`/categories/${categoryId}`)
    return response.data
  },

  async create(data) {
    const response = await apiClient.post('/categories', data)
    return response.data
  },

  async update(categoryId, data) {
    const response = await apiClient.put(`/categories/${categoryId}`, data)
    return response.data
  },

  async delete(categoryId) {
    const response = await apiClient.delete(`/categories/${categoryId}`)
    return response.data
  },
}

export default categoryService
