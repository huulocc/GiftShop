import React from 'react'
import './OrderCard.scss'
import OrderActions from './OrderActions'

/**
 * OrderCard - Displays a single order with status badge and action buttons
 */
function OrderCard({ order, onOrderUpdated, style }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':   return 'status-pending'
      case 'placed':    return 'status-placed'
      case 'cancelled': return 'status-cancelled'
      default: return ''
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPayment = (method) => {
    return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const statusIconMap = {
    pending: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    placed: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    cancelled: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  }

  return (
    <div
      className={`order-card ${getStatusClass(order.status)}`}
      style={style}
    >
      {/* Card Header */}
      <div className="order-card-header">
        <div className="order-card-id">
          <span className="order-id-label">Order</span>
          <span className="order-id-value">#{order.id.slice(0, 8)}</span>
        </div>
        <span className={`order-status-badge ${getStatusClass(order.status)}`}>
          <span className="status-icon">{statusIconMap[order.status]}</span>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Card Body */}
      <div className="order-card-body">
        {/* Customer Info */}
        <div className="order-card-info">
          <div className="info-row">
            <span className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <div className="info-content">
              <span className="info-label">Customer</span>
              <span className="info-value info-value--bold">{order.customerName}</span>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{order.email}</span>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </span>
            <div className="info-content">
              <span className="info-label">Phone</span>
              <span className="info-value">{order.phone}</span>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            <div className="info-content">
              <span className="info-label">Address</span>
              <span className="info-value">
                {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </span>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </span>
            <div className="info-content">
              <span className="info-label">Payment</span>
              <span className="info-value">{formatPayment(order.paymentMethod)}</span>
            </div>
          </div>
          {order.giftMessage && (
            <div className="info-row">
              <span className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7m0 0a2.5 2.5 0 010-5c1.5 0 2.5 1 2.5 2.5S13.5 7 12 7zm0 0a2.5 2.5 0 000-5C10.5 2 9.5 3 9.5 4.5S10.5 7 12 7z"/>
                </svg>
              </span>
              <div className="info-content">
                <span className="info-label">Gift</span>
                <span className="info-value gift-message">"{order.giftMessage}"</span>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="order-card-items">
          <div className="items-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span>Items ({order.items.length})</span>
          </div>
          <ul className="items-list">
            {order.items.map((item, idx) => (
              <li key={idx} className="items-list-row">
                <span className="item-name">{item.productName}</span>
                <span className="item-detail">
                  {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card Footer */}
      <div className="order-card-footer">
        <div className="order-card-meta">
          <span className="meta-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(order.createdAt)}
          </span>
          <div className="order-total-wrap">
            <span className="order-total-label">Total</span>
            <span className="order-total">${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        <OrderActions order={order} onOrderUpdated={onOrderUpdated} />
      </div>
    </div>
  )
}

export default OrderCard
