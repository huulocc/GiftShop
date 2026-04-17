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
   */
  const handleOrderUpdated = (updatedOrder) => {
    const updatedId = updatedOrder.orderId || updatedOrder.id
    setOrders((prev) =>
      prev.map((o) => ((o.orderId || o.id) === updatedId ? updatedOrder : o))
    )
  }

  /**
   * Handle status filter change
   */
  const handleFilterChange = (status) => {
    setStatusFilter(status)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Count orders by status for badges
  const countByStatus = (status) => {
    if (!status) return orders.length
    return orders.filter((o) => o.status === status).length
  }

  const statusFilters = [
    {
      value: '',
      label: 'All',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      ),
    },
    {
      value: 'pending',
      label: 'Pending',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      value: 'placed',
      label: 'Placed',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="order-list-container">

      {/* Header */}
      <div className="order-list-header">
        <div className="order-list-title-group">
          <h2 className="order-list-title">All Orders</h2>
          {!loading && (
            <span className="order-list-count">{pagination.total} total</span>
          )}
        </div>
        <button className="btn-refresh" onClick={fetchOrders} title="Refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Status Filters */}
      <div className="status-filters">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            className={`filter-btn filter-btn--${filter.value || 'all'} ${statusFilter === filter.value ? 'active' : ''}`}
            onClick={() => handleFilterChange(filter.value)}
          >
            <span className="filter-btn-icon">{filter.icon}</span>
            {filter.label}
            {!loading && (
              <span className="filter-btn-badge">{countByStatus(filter.value)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="order-list-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="order-list-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-header">
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-badge" />
              </div>
              <div className="skeleton-body">
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line--medium" />
                <div className="skeleton-line skeleton-line--short" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="order-list-empty">
          <div className="empty-illustration">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="56" fill="#eef2ff"/>
              <path d="M40 35h40a4 4 0 014 4v42a4 4 0 01-4 4H40a4 4 0 01-4-4V39a4 4 0 014-4z" fill="white" stroke="#c3dafe" strokeWidth="2"/>
              <path d="M48 52h24M48 60h16M48 68h20" stroke="#c3dafe" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="82" cy="82" r="16" fill="#667eea"/>
              <path d="M76 82h12M82 76v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="empty-title">No orders found</h3>
          <p className="empty-hint">
            {statusFilter
              ? `No ${statusFilter} orders yet.`
              : 'Create a new order to get started!'}
          </p>
        </div>
      )}

      {/* Orders Grid */}
      {!loading && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order, i) => (
            <OrderCard
              key={order.orderId || order.id}
              order={order}
              onOrderUpdated={handleOrderUpdated}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}

      {/* Pagination info */}
      {!loading && pagination.total > 0 && (
        <div className="order-list-pagination">
          Showing <strong>{orders.length}</strong> of <strong>{pagination.total}</strong> order(s)
        </div>
      )}
    </div>
  )
}

export default OrderList
