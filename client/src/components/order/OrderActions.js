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
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    giftMessage: order.giftMessage || '',
  })

  /**
   * Place order action (Command: PlaceOrderCommand)
   */
  const handlePlace = async () => {
    setLoading('place')
    setError('')
    try {
      const result = await orderService.placeOrder(order.id)
      if (result.success && onOrderUpdated) {
        onOrderUpdated(result.data)
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
      const result = await orderService.cancelOrder(order.id)
      if (result.success && onOrderUpdated) {
        onOrderUpdated(result.data)
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
      const result = await orderService.updateOrder(order.id, editData)
      if (result.success && onOrderUpdated) {
        onOrderUpdated(result.data)
        setIsEditing(false)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order')
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="order-actions">
      {error && <div className="action-error">{error}</div>}

      {/* Edit Form (toggle) */}
      {isEditing && (
        <div className="edit-form">
          <div className="edit-form-grid">
            <div className="edit-field">
              <label>Name</label>
              <input
                type="text"
                value={editData.customerName}
                onChange={(e) =>
                  setEditData({ ...editData, customerName: e.target.value })
                }
              />
            </div>
            <div className="edit-field">
              <label>Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />
            </div>
            <div className="edit-field">
              <label>Phone</label>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
              />
            </div>
            <div className="edit-field">
              <label>Gift Message</label>
              <input
                type="text"
                value={editData.giftMessage}
                onChange={(e) =>
                  setEditData({ ...editData, giftMessage: e.target.value })
                }
              />
            </div>
          </div>
          <div className="edit-form-buttons">
            <button
              className="btn-action btn-save"
              onClick={handleUpdate}
              disabled={loading === 'update'}
            >
              {loading === 'update' ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className="btn-action btn-cancel-edit"
              onClick={() => setIsEditing(false)}
            >
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
            {loading === 'place' ? '...' : 'Place Order'}
          </button>
        )}

        {/* Cancel: only when placed */}
        {order.status === 'placed' && (
          <button
            className="btn-action btn-cancel"
            onClick={handleCancel}
            disabled={!!loading}
          >
            {loading === 'cancel' ? '...' : 'Cancel Order'}
          </button>
        )}

        {/* Update: when not cancelled */}
        {order.status !== 'cancelled' && (
          <button
            className="btn-action btn-edit"
            onClick={() => setIsEditing(!isEditing)}
            disabled={!!loading}
          >
            Edit Order
          </button>
        )}
      </div>
    </div>
  )
}

export default OrderActions
