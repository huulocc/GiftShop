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
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  // Payment method options
  const paymentOptions = [
    {
      value: 'credit_card',
      label: 'Credit Card',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      value: 'debit_card',
      label: 'Debit Card',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          <line x1="6" y1="15" x2="10" y2="15"/>
        </svg>
      ),
    },
    {
      value: 'paypal',
      label: 'PayPal',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 11C4 11 3 9 3 7c0-3 2-5 7-5h5c3 0 5 1.5 5 4 0 4-3 5-6 5H7z"/>
          <path d="M7 11l-1 7h4c3 0 6-1 7-5 0-2-1-3-3-3H7z"/>
        </svg>
      ),
    },
    {
      value: 'cod',
      label: 'Cash on Delivery',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
    },
  ]

  // Visual step tracker
  const steps = [
    { label: 'Customer', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )},
    { label: 'Address', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    )},
    { label: 'Products', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      </svg>
    )},
    { label: 'Payment', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )},
  ]

  // Determine which steps are "filled" for visual progress
  const stepDone = [
    !!(customerName && email && phone),
    !!(street && city && state && zipCode),
    selectedItems.length > 0,
    true, // payment always has a default
  ]

  return (
    <div className="order-form-wrapper">
      {/* Main Form Area */}
      <div className="order-form-container">

        {/* Visual Step Indicator */}
        <div className="order-stepper" aria-label="Form progress">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`stepper-step ${stepDone[i] ? 'done' : ''}`}
            >
              <div className="stepper-circle">
                {stepDone[i] ? (
                  <svg className="stepper-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span className="stepper-label">{step.label}</span>
              {i < steps.length - 1 && <div className={`stepper-line ${stepDone[i] ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {errors.length > 0 && (
          <div className="order-form-errors" role="alert">
            <div className="error-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <strong>Please fix the following errors:</strong>
            </div>
            <ul>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="order-form" noValidate>

          {/* ── Section 1: Customer Information ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <h3 className="form-section-title">Customer Information</h3>
                <p className="form-section-subtitle">Who is placing this order?</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <input
                  id="customerName"
                  type="text"
                  className="form-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label" htmlFor="customerName">Full Name *</label>
              </div>
              <div className="form-field">
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label" htmlFor="email">Email Address *</label>
              </div>
              <div className="form-field">
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label" htmlFor="phone">Phone Number *</label>
              </div>
            </div>
          </div>

          {/* ── Section 2: Shipping Address ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <h3 className="form-section-title">Shipping Address</h3>
                <p className="form-section-subtitle">Where should we deliver?</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-field form-field--full">
                <input
                  id="street"
                  type="text"
                  className="form-input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label" htmlFor="street">Street Address *</label>
              </div>
              <div className="form-field">
                <input
                  id="city"
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label" htmlFor="city">City *</label>
              </div>
              <div className="form-field">
                <input
                  id="state"
                  type="text"
                  className="form-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label" htmlFor="state">State / Province *</label>
              </div>
              <div className="form-field">
                <input
                  id="zipCode"
                  type="text"
                  className="form-input"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label" htmlFor="zipCode">Zip Code *</label>
              </div>
            </div>
          </div>

          {/* ── Section 3: Product Selection ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <div>
                <h3 className="form-section-title">Select Products</h3>
                <p className="form-section-subtitle">
                  {selectedItems.length > 0
                    ? `${selectedItems.length} item(s) selected`
                    : 'Click a product to add it to your order'}
                </p>
              </div>
            </div>

            {/* Product Grid */}
            <div className="product-selector">
              {ProductData.map((product) => {
                const selectedItem = selectedItems.find((item) => item.productId === product.id)
                const isSelected = !!selectedItem
                return (
                  <div
                    key={product.id}
                    className={`product-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => !isSelected && handleAddProduct(product)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && !isSelected && handleAddProduct(product)}
                  >
                    {isSelected && (
                      <div className="product-option-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                    <div className="product-option-category-tag">
                      {product.categories.name}
                    </div>
                    <span className="product-option-name">{product.name}</span>
                    <span className="product-option-price">${parseFloat(product.price).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>

            {/* Selected Items Table */}
            {selectedItems.length > 0 && (
              <div className="selected-items">
                <div className="selected-items-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                  <h4>Cart Summary</h4>
                </div>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="th-center">Qty</th>
                      <th className="th-right">Price</th>
                      <th className="th-right">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item) => (
                      <tr key={item.productId}>
                        <td className="td-product">{item.productName}</td>
                        <td className="td-center">
                          <div className="qty-control">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            >−</button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                              className="qty-input"
                            />
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            >+</button>
                          </div>
                        </td>
                        <td className="td-right td-muted">${item.price.toFixed(2)}</td>
                        <td className="td-right td-subtotal">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => handleRemoveProduct(item.productId)}
                            title="Remove item"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Order Total</td>
                      <td className="total-amount">${orderPreview.totalAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ── Section 4: Payment & Gift ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <h3 className="form-section-title">Payment & Options</h3>
                <p className="form-section-subtitle">Choose how you'd like to pay</p>
              </div>
            </div>

            {/* Payment Radio Cards */}
            <div className="payment-grid">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`payment-card ${paymentMethod === opt.value ? 'selected' : ''}`}
                  htmlFor={`pay-${opt.value}`}
                >
                  <input
                    type="radio"
                    id={`pay-${opt.value}`}
                    name="paymentMethod"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="payment-radio"
                  />
                  <span className="payment-card-icon">{opt.icon}</span>
                  <span className="payment-card-label">{opt.label}</span>
                  <span className="payment-card-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                </label>
              ))}
            </div>

            {/* Gift Message */}
            <div className="form-field form-field--gift">
              <div className="gift-label-row">
                <label htmlFor="giftMessage" className="gift-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
                    <path d="M12 22V7m0 0a2.5 2.5 0 010-5 2.5 2.5 0 010 5zm0 0a2.5 2.5 0 000-5 2.5 2.5 0 000 5z"/>
                  </svg>
                  Gift Message <span className="optional-tag">(Optional)</span>
                </label>
                <span className="char-counter">{giftMessage.length}/200</span>
              </div>
              <textarea
                id="giftMessage"
                className="form-textarea"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value.slice(0, 200))}
                placeholder="Write a personal message for the recipient..."
                rows="3"
              />
            </div>
          </div>

          {/* ── Submit Button ── */}
          <button type="submit" className="btn-submit" disabled={loading} id="btn-create-order">
            {loading ? (
              <>
                <svg className="btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
                </svg>
                Creating Order...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Place Order
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Live Order Summary Sidebar ── */}
      <aside className="order-summary-sidebar" aria-label="Live order summary">
        <div className="sidebar-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <h3>Order Summary</h3>
        </div>

        <div className="sidebar-body">
          <div className="sidebar-row">
            <span className="sidebar-label">Customer</span>
            <span className="sidebar-value">{orderPreview.customerName || <em>—</em>}</span>
          </div>
          <div className="sidebar-row">
            <span className="sidebar-label">Email</span>
            <span className="sidebar-value">{orderPreview.email || <em>—</em>}</span>
          </div>
          <div className="sidebar-row">
            <span className="sidebar-label">Phone</span>
            <span className="sidebar-value">{orderPreview.phone || <em>—</em>}</span>
          </div>
          <div className="sidebar-row">
            <span className="sidebar-label">Address</span>
            <span className="sidebar-value">
              {orderPreview.shippingAddress.street
                ? `${orderPreview.shippingAddress.street}, ${orderPreview.shippingAddress.city}`
                : <em>—</em>}
            </span>
          </div>

          {orderPreview.items.length > 0 && (
            <div className="sidebar-items">
              <span className="sidebar-label sidebar-label--section">Items</span>
              {orderPreview.items.map((item) => (
                <div key={item.productId} className="sidebar-item-row">
                  <span className="sidebar-item-name">{item.productName}</span>
                  <span className="sidebar-item-subtotal">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="sidebar-row">
            <span className="sidebar-label">Payment</span>
            <span className="sidebar-value">
              {orderPreview.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          </div>

          {orderPreview.giftMessage && (
            <div className="sidebar-row">
              <span className="sidebar-label">Gift</span>
              <span className="sidebar-value sidebar-value--italic">"{orderPreview.giftMessage}"</span>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-total-label">Total</span>
          <span className="sidebar-total">${orderPreview.totalAmount.toFixed(2)}</span>
        </div>
      </aside>
    </div>
  )
}

export default OrderForm
