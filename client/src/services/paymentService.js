import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

const paymentService = {
  async createPayment(orderId, paymentMethod) {
    const response = await apiClient.post('/payments/create', {
      orderId,
      paymentMethod,
    })
    return response.data
  },
}

export default paymentService
