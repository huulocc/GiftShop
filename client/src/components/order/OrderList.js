import React, { useState, useEffect, useCallback } from 'react'
import orderService from '../../services/orderService'
import OrderCard from './OrderCard'
import './OrderList.scss'

/**
 * OrderList - Displays all orders with status filtering
 */
function OrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  /**
   * Fetch orders from API
   */
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      }
      if (statusFilter) {
        params.status = statusFilter
      }

      const result = await orderService.getAllOrders(params)
      if (result.success) {
        setOrders(result.data)
        setPagination((prev) => ({ ...prev, total: result.pagination.total }))
      }
    } catch (err) {
      setError('Failed to load orders. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, pagination.page, pagination.limit])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  /**
   * Handle order update (from OrderActions)
   * Replace the updated order in the list
   */
  const handleOrderUpdated = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    )
  }

  /**
   * Handle status filter change
   */
  const handleFilterChange = (status) => {
    setStatusFilter(status)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const statusFilters = [
    { value: '', label: 'All', icon: '' },
    { value: 'pending', label: 'Pending', icon: '' },
    { value: 'placed', label: 'Placed', icon: '' },
    { value: 'cancelled', label: 'Cancelled', icon: '' },
  ]

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2 className="order-list-title">
          <span></span> Order Management
        </h2>
        <button className="btn-refresh" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      {/* Status Filters */}
      <div className="status-filters">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            className={`filter-btn ${statusFilter === filter.value ? 'active' : ''}`}
            onClick={() => handleFilterChange(filter.value)}
          >
            {filter.icon} {filter.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="order-list-error">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="order-list-loading">
          <div className="spinner"></div>
          <span>Loading orders...</span>
        </div>
      )}

      {/* Orders */}
      {!loading && !error && orders.length === 0 && (
        <div className="order-list-empty">
          <span className="empty-icon"></span>
          <p>No orders found</p>
          <span className="empty-hint">Create a new order to get started!</span>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOrderUpdated={handleOrderUpdated}
            />
          ))}
        </div>
      )}

      {/* Pagination info */}
      {!loading && pagination.total > 0 && (
        <div className="order-list-pagination">
          Showing {orders.length} of {pagination.total} order(s)
        </div>
      )}
    </div>
  )
}

export default OrderList
