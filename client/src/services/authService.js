import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send session cookies
})

/**
 * Auth API Service
 * Handles all HTTP calls to the auth endpoints
 *
 * Endpoints:
 *   POST /auth/register
 *   POST /auth/login
 *   POST /auth/logout
 *   GET  /auth/me
 */
const authService = {
  /**
   * Register a new account
   * @param {{ fullName: string, username: string, email: string, password: string, address: string }} data
   * @returns {Promise<Object>}
   */
  async register(data) {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  /**
   * Login with email and password
   * @param {{ email: string, password: string }} data
   * @returns {Promise<Object>}
   */
  async login(data) {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  /**
   * Logout - destroy session
   * @returns {Promise<Object>}
   */
  async logout() {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  /**
   * Get the current authenticated user from session
   * @returns {Promise<Object>}
   */
  async getMe() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  /**
   * Change user password (requires auth)
   * @param {{ currentPassword: string, newPassword: string }} data
   * @returns {Promise<Object>}
   */
  async changePassword(data) {
    const response = await apiClient.post('/auth/change-password', data)
    return response.data
  },

}

export default authService
