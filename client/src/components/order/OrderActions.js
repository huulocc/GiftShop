import React, { useState } from 'react'
import orderService from '../../services/orderService'
import './OrderActions.scss'

/**
 * OrderActions - Place/Cancel/Update action buttons for an order
 *
 * Each action triggers the corresponding Command on the backend
 * via the API service.
 */
function OrderActions({ order, onOrderUpdated }) {
  const orderId = order.orderId || order.id || ''
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    customerName: order.customerNameSnapshot || order.customerName || '',
    email: order.customerEmailSnapshot || order.email || '',
    phone: order.customerPhoneSnapshot || order.phone || '',
    giftMessage: order.giftMessage || '',
  })

  const showSuccess = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 2500)
  }

  /**
   * Place order action (Command: PlaceOrderCommand)
   */
  const handlePlace = async () => {
    setLoading('place')
    setError('')
    try {
      const result = await orderService.placeOrder(orderId)
      if (result.success && onOrderUpdated) {
        onOrderUpdated(result.data)
        showSuccess('Order placed successfully!')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading('')
    }
  }

  /**
   * Cancel order action (Command: CancelOrderCommand)
   */
  const handleCancel = async () => {
    setLoading('cancel')
    setError('')
    try {
      const result = await orderService.cancelOrder(orderId)
      if (result.success && onOrderUpdated) {
        onOrderUpdated(result.data)
        showSuccess('Order cancelled.')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel order')
    } finally {
      setLoading('')
    }
  }

  /**
   * Update order action (Command: UpdateOrderCommand)
   */
  const handleUpdate = async () => {
    setLoading('update')
    setError('')
    try {
      const result = await orderService.updateOrder(orderId, {
        customerNameSnapshot: editData.customerName,
        customerEmailSnapshot: editData.email,
        customerPhoneSnapshot: editData.phone,
        giftMessage: editData.giftMessage,
      })
      if (result.success && onOrderUpdated) {
        onOrderUpdated(result.data)
        setIsEditing(false)
        showSuccess('Order updated successfully!')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order')
    } finally {
      setLoading('')
    }
  }

  // Inline SVG spinner
  const Spinner = () => (
    <svg className="action-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
    </svg>
  )

  return (
    <div className="order-actions">

      {/* Success Toast */}
      {success && (
        <div className="action-success" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {success}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="action-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Edit Form (toggle) */}
      {isEditing && (
        <div className="edit-form">
          <div className="edit-form-grid">
            <div className="edit-field">
              <label htmlFor={`edit-name-${orderId}`}>Name</label>
              <input
                id={`edit-name-${orderId}`}
                type="text"
                value={editData.customerName}
                onChange={(e) => setEditData({ ...editData, customerName: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div className="edit-field">
              <label htmlFor={`edit-email-${orderId}`}>Email</label>
              <input
                id={`edit-email-${orderId}`}
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            <div className="edit-field">
              <label htmlFor={`edit-phone-${orderId}`}>Phone</label>
              <input
                id={`edit-phone-${orderId}`}
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="edit-field">
              <label htmlFor={`edit-gift-${orderId}`}>Gift Message</label>
              <input
                id={`edit-gift-${orderId}`}
                type="text"
                value={editData.giftMessage}
                onChange={(e) => setEditData({ ...editData, giftMessage: e.target.value })}
                placeholder="Optional gift message"
              />
            </div>
          </div>
          <div className="edit-form-buttons">
            <button
              className="btn-action btn-save"
              onClick={handleUpdate}
              disabled={loading === 'update'}
            >
              {loading === 'update' ? <Spinner /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
              )}
              {loading === 'update' ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className="btn-action btn-cancel-edit"
              onClick={() => setIsEditing(false)}
              disabled={!!loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        {/* Place: only when pending */}
        {order.status === 'pending' && (
          <button
            className="btn-action btn-place"
            onClick={handlePlace}
            disabled={!!loading}
          >
            {loading === 'place' ? <Spinner /> : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            {loading === 'place' ? 'Placing...' : 'Place Order'}
          </button>
        )}

        {/* Cancel: only when placed */}
        {order.status === 'placed' && (
          <button
            className="btn-action btn-cancel"
            onClick={handleCancel}
            disabled={!!loading}
          >
            {loading === 'cancel' ? <Spinner /> : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
            {loading === 'cancel' ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        {/* Edit: when not cancelled */}
        {order.status !== 'cancelled' && (
          <button
            className={`btn-action btn-edit ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
            disabled={!!loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {isEditing ? 'Close Edit' : 'Edit Order'}
          </button>
        )}
      </div>
    </div>
  )
}

export default OrderActions
