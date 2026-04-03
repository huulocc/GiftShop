import React, { useState, useMemo } from 'react'
import OrderBuilder from '../../builders/OrderBuilder'
import orderService from '../../services/orderService'
import ProductData from '../products/Products/Products.json'
import './OrderForm.scss'

/**
 * OrderForm - Single-page form for creating a new order
 *
 * Uses the Builder pattern (OrderBuilder) to construct the order
 * payload step by step before submitting to the API.
 */
function OrderForm({ onOrderCreated }) {
  // Customer info
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Shipping address
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')

  // Items
  const [selectedItems, setSelectedItems] = useState([])

  // Options
  const [giftMessage, setGiftMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  // UI state
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  /**
   * Use Builder to construct a preview of the order
   */
  const orderPreview = useMemo(() => {
    const builder = new OrderBuilder()
    return builder
      .setCustomerName(customerName)
      .setEmail(email)
      .setPhone(phone)
      .setShippingAddress({ street, city, state, zipCode })
      .setItems(selectedItems)
      .setGiftMessage(giftMessage)
      .setPaymentMethod(paymentMethod)
      .getPreview()
  }, [customerName, email, phone, street, city, state, zipCode, selectedItems, giftMessage, paymentMethod])

  /**
   * Add a product to the order items
   */
  const handleAddProduct = (product) => {
    const exists = selectedItems.find((item) => item.productId === product.id)
    if (exists) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: parseFloat(product.price),
        },
      ])
    }
  }

  /**
   * Remove a product from the order items
   */
  const handleRemoveProduct = (productId) => {
    setSelectedItems(selectedItems.filter((item) => item.productId !== productId))
  }

  /**
   * Update item quantity
   */
  const handleQuantityChange = (productId, quantity) => {
    const qty = parseInt(quantity, 10)
    if (qty <= 0) {
      handleRemoveProduct(productId)
      return
    }
    setSelectedItems(
      selectedItems.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item
      )
    )
  }

  /**
   * Client-side validation
   */
  const validate = () => {
    const errs = []
    if (!customerName.trim()) errs.push('Customer name is required')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.push('Valid email is required')
    if (!phone.trim()) errs.push('Phone is required')
    if (!street.trim()) errs.push('Street is required')
    if (!city.trim()) errs.push('City is required')
    if (!state.trim()) errs.push('State is required')
    if (!zipCode.trim()) errs.push('Zip code is required')
    if (selectedItems.length === 0) errs.push('At least one item is required')
    return errs
  }

  /**
   * Handle form submission
   * Uses Builder pattern to construct the final order payload
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    setLoading(true)

    try {
      // Build the order using Builder pattern
      const builder = new OrderBuilder()
      const orderPayload = builder
        .setCustomerName(customerName)
        .setEmail(email)
        .setPhone(phone)
        .setShippingAddress({ street, city, state, zipCode })
        .setItems(selectedItems)
        .setGiftMessage(giftMessage)
        .setPaymentMethod(paymentMethod)
        .build()

      const result = await orderService.createOrder(orderPayload)

      if (result.success) {
        // Reset form
        setCustomerName('')
        setEmail('')
        setPhone('')
        setStreet('')
        setCity('')
        setState('')
        setZipCode('')
        setSelectedItems([])
        setGiftMessage('')
        setPaymentMethod('credit_card')
        setShowSummary(false)

        if (onOrderCreated) {
          onOrderCreated(result.data)
        }
      }
    } catch (error) {
      const errorData = error.response?.data
      if (errorData?.details) {
        setErrors(errorData.details)
      } else {
        setErrors([errorData?.error || 'Failed to create order'])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="order-form-container">
      <h2 className="order-form-title">
        <span className="order-form-title-icon"></span>
        Create New Order
      </h2>

      {errors.length > 0 && (
        <div className="order-form-errors">
          <strong>Please fix the following errors:</strong>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="order-form">
        {/* Customer Information */}
        <fieldset className="order-form-section">
          <legend>Customer Information</legend>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customerName">Full Name *</label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
              />
            </div>
          </div>
        </fieldset>

        {/* Shipping Address */}
        <fieldset className="order-form-section">
          <legend>Shipping Address</legend>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="street">Street *</label>
              <input
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Le Loi Street"
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ho Chi Minh"
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="HCM"
              />
            </div>
            <div className="form-group">
              <label htmlFor="zipCode">Zip Code *</label>
              <input
                id="zipCode"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="70000"
              />
            </div>
          </div>
        </fieldset>

        {/* Product Selection */}
        <fieldset className="order-form-section">
          <legend>Select Products</legend>
          <div className="product-selector">
            {ProductData.map((product) => {
              const isSelected = selectedItems.some((item) => item.productId === product.id)
              return (
                <div
                  key={product.id}
                  className={`product-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => !isSelected && handleAddProduct(product)}
                >
                  <div className="product-option-info">
                    <span className="product-option-name">{product.name}</span>
                    <span className="product-option-category">{product.categories.name}</span>
                  </div>
                  <span className="product-option-price">${product.price}</span>
                  {isSelected && <span className="product-option-check"></span>}
                </div>
              )
            })}
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="selected-items">
              <h4>Selected Items</h4>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.productName}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.productId, e.target.value)
                          }
                          className="qty-input"
                        />
                      </td>
                      <td className="subtotal">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemoveProduct(item.productId)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="total-label">Total:</td>
                    <td className="total-amount" colSpan="2">
                      ${orderPreview.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </fieldset>

        {/* Gift Message & Payment */}
        <fieldset className="order-form-section">
          <legend>Payment & Options</legend>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method *</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="giftMessage">Gift Message (Optional)</label>
              <textarea
                id="giftMessage"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows="3"
              />
            </div>
          </div>
        </fieldset>

        {/* Summary Toggle */}
        {selectedItems.length > 0 && (
          <button
            type="button"
            className="btn-preview"
            onClick={() => setShowSummary(!showSummary)}
          >
            {showSummary ? 'Hide Summary' : 'Preview Order Summary'}
          </button>
        )}

        {/* Order Summary Preview */}
        {showSummary && (
          <div className="order-summary-preview">
            <h4>Order Summary</h4>
            <div className="summary-row">
              <span>Customer:</span>
              <span>{orderPreview.customerName || '—'}</span>
            </div>
            <div className="summary-row">
              <span>Email:</span>
              <span>{orderPreview.email || '—'}</span>
            </div>
            <div className="summary-row">
              <span>Phone:</span>
              <span>{orderPreview.phone || '—'}</span>
            </div>
            <div className="summary-row">
              <span>Address:</span>
              <span>
                {orderPreview.shippingAddress.street
                  ? `${orderPreview.shippingAddress.street}, ${orderPreview.shippingAddress.city}, ${orderPreview.shippingAddress.state} ${orderPreview.shippingAddress.zipCode}`
                  : '—'}
              </span>
            </div>
            <div className="summary-row">
              <span>Items:</span>
              <span>{orderPreview.items.length} product(s)</span>
            </div>
            <div className="summary-row">
              <span>Payment:</span>
              <span>{orderPreview.paymentMethod.replace('_', ' ').toUpperCase()}</span>
            </div>
            {orderPreview.giftMessage && (
              <div className="summary-row">
                <span>Gift Message:</span>
                <span>"{orderPreview.giftMessage}"</span>
              </div>
            )}
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>${orderPreview.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>
    </div>
  )
}

export default OrderForm
