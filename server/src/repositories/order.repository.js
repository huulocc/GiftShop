const mockOrders = require('../data/mockOrders')

/**
 * OrderRepository - Data Access Layer
 *
 * Currently uses in-memory array (mockOrders).
 * To integrate with a real database later:
 *   - Replace the method implementations with DB queries
 *   - Keep the same method signatures (interface contract)
 *   - No changes needed in service/controller layers
 *
 * Methods ready for DB integration:
 *   findAll(), findById(), create(), update(), deleteById()
 */
class OrderRepository {
  constructor() {
    // In-memory data store — will be replaced by DB connection
    this.orders = mockOrders
  }

  /**
   * Find all orders with optional filtering and pagination
   * @param {Object} options - { status, page, limit }
   * @returns {{ orders: Array, total: number }}
   */
  findAll({ status, page = 1, limit = 10 } = {}) {
    let filtered = [...this.orders]

    // Filter by status if provided
    if (status) {
      filtered = filtered.filter((order) => order.status === status)
    }

    // Sort by createdAt descending (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = filtered.length
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    return { orders: paginated, total }
  }

  /**
   * Find a single order by ID
   * @param {string} id
   * @returns {Object|null}
   */
  findById(id) {
    return this.orders.find((order) => order.id === id) || null
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order plain object
   * @returns {Object} created order
   */
  create(orderData) {
    this.orders.push(orderData)
    return orderData
  }

  /**
   * Update an existing order by ID
   * @param {string} id
   * @param {Object} updateData - Fields to update
   * @returns {Object|null} updated order or null if not found
   */
  update(id, updateData) {
    const index = this.orders.findIndex((order) => order.id === id)
    if (index === -1) return null

    this.orders[index] = {
      ...this.orders[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    return this.orders[index]
  }

  /**
   * Delete an order by ID
   * @param {string} id
   * @returns {boolean} true if deleted, false if not found
   */
  deleteById(id) {
    const index = this.orders.findIndex((order) => order.id === id)
    if (index === -1) return false

    this.orders.splice(index, 1)
    return true
  }
}

module.exports = new OrderRepository()
