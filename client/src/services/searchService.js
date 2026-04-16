import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

/**
 * Search API Service
 * Handles unified search calls for products and categories
 */
const searchService = {
  /**
   * Search across products and categories
   * @param {string} query - Keyword or UUID
   * @returns {Promise<{ categories: Array, products: Array }>}
   */
  async search(query) {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    
    const response = await apiClient.get(`/search?${params.toString()}`)
    return response.data
  },
}

export default searchService
