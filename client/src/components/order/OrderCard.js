import React from 'react'
import './OrderCard.scss'
import OrderActions from './OrderActions'

/**
 * OrderCard - Displays a single order with status badge and action buttons
 */
function OrderCard({ order, onOrderUpdated }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'placed': return 'status-placed'
      case 'cancelled': return 'status-cancelled'
      default: return ''
    }
  }

  const getStatusIcon = (status) => {
    return ''
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

  return (
    <div className={`order-card ${getStatusClass(order.status)}`}>
      <div className="order-card-header">
        <div className="order-card-id">
          <span className="order-id-label">Order</span>
          <span className="order-id-value">#{order.id.slice(0, 8)}</span>
        </div>
        <span className={`order-status-badge ${getStatusClass(order.status)}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      <div className="order-card-body">
        <div className="order-card-info">
          <div className="info-row">
            <span className="info-label">Customer</span>
            <span className="info-value">{order.customerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{order.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone</span>
            <span className="info-value">{order.phone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Address</span>
            <span className="info-value">
              {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment</span>
            <span className="info-value">{formatPayment(order.paymentMethod)}</span>
          </div>
          {order.giftMessage && (
            <div className="info-row">
              <span className="info-label">Gift</span>
              <span className="info-value gift-message">"{order.giftMessage}"</span>
            </div>
          )}
        </div>

        <div className="order-card-items">
          <h4>Items ({order.items.length})</h4>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                <span className="item-name">{item.productName}</span>
                <span className="item-detail">
                  {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="order-card-footer">
        <div className="order-card-meta">
          <span className="meta-date">Created: {formatDate(order.createdAt)}</span>
          <span className="order-total">${parseFloat(order.totalAmount).toFixed(2)}</span>
        </div>

        <OrderActions order={order} onOrderUpdated={onOrderUpdated} />
      </div>
    </div>
  )
}

export default OrderCard
