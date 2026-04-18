import React, { useState, useMemo, useEffect, useCallback } from 'react'
import OrderBuilder from '../../builders/OrderBuilder'
import orderService from '../../services/orderService'
import paymentService from '../../services/paymentService'
import productService from '../../services/productService'
import { useAuth } from '../../services/AuthContext'
import { useCheckout } from '../../contexts/CheckoutContext'
import { PriceComponent, PercentageDiscount } from '../../patterns/Decorator'
import './OrderForm.scss'

/**
 * OrderForm - Single-page form for creating a new order
 *
 * Role-aware behaviour:
 *  - customer  → customer info auto-filled from session, read-only
 *  - manager   → searchable customer picker to select whose order this is
 *
 * Products are fetched from the database via /api/products (not a static JSON).
 * Uses the Builder pattern (OrderBuilder) to construct the payload.
 * 
 * Also supports pre-filling items from CheckoutContext (when coming from cart).
 */
function OrderForm({ onOrderCreated }) {
  const { user } = useAuth()
  const { getCheckoutItems, clearCheckout } = useCheckout()
  const isManager = user?.roleCode === 'manager'

  // ── Customer info ───────────────────────────────────────
  const [customerId, setCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Manager customer picker state
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerList, setCustomerList] = useState([])
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // ── Shipping address ─────────────────────────────────────
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')

  // ── Products from DB ─────────────────────────────────────
  const [dbProducts, setDbProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productSearch, setProductSearch] = useState('')

  // ── Items ────────────────────────────────────────────────
  const [selectedItems, setSelectedItems] = useState([])

  // ── Options ──────────────────────────────────────────────
  const [giftMessage, setGiftMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  // ── Discount ─────────────────────────────────────────────
  const [discountCodeInput, setDiscountCodeInput] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [discountMessage, setDiscountMessage] = useState('')

  // ── UI state ─────────────────────────────────────────────
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // ── Auto-fill for customers ───────────────────────────────
  useEffect(() => {
    if (!isManager && user) {
      setCustomerId(user.userId || '')
      setCustomerName(user.fullName || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
    }
  }, [isManager, user])

  // ── Fetch products from DB ─────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const loadProducts = async () => {
      setProductsLoading(true)
      try {
        const result = await productService.getAll({ limit: 200 })
        if (!cancelled && result.success) {
          setDbProducts(result.data)
        }
      } catch {
        if (!cancelled) setDbProducts([])
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    loadProducts()
    return () => { cancelled = true }
  }, [])

  // ── Pre-fill from checkout (cart items) ──────────────────
  useEffect(() => {
    const checkoutItems = getCheckoutItems()
    if (checkoutItems && checkoutItems.length > 0) {
      // Transform cart items to order items format
      const formattedItems = checkoutItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        maxStock: 9999, // Default since we don't have stock info from cart
      }))
      setSelectedItems(formattedItems)
      clearCheckout()
    }
  }, [])

  // ── Filter products by search term ────────────────────────
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return dbProducts
    const q = productSearch.toLowerCase()
    return dbProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
    )
  }, [dbProducts, productSearch])

  // ── Fetch customers for manager picker ────────────────────
  const fetchCustomers = useCallback(async (search) => {
    setCustomerLoading(true)
    try {
      const result = await orderService.getCustomers(search)
      if (result.success) setCustomerList(result.data)
    } catch {
      setCustomerList([])
    } finally {
      setCustomerLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isManager) return
    const timer = setTimeout(() => {
      fetchCustomers(customerSearch)
    }, 280)
    return () => clearTimeout(timer)
  }, [isManager, customerSearch, fetchCustomers])

  // Load full customer list on mount for managers
  useEffect(() => {
    if (isManager) fetchCustomers('')
  }, [isManager, fetchCustomers])

  const handleSelectCustomer = (c) => {
    setSelectedCustomer(c)
    setCustomerId(c.userId)
    setCustomerName(c.fullName)
    setEmail(c.email)
    setPhone(c.phone || '')
    setCustomerSearch(c.fullName)
    setCustomerDropdownOpen(false)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerId('')
    setCustomerName('')
    setEmail('')
    setPhone('')
    setCustomerSearch('')
  }

  // ── Product helpers (uses DB product shape) ────────────────
  const handleAddProduct = (product) => {
    if (product.stockQuantity <= 0) return
    const exists = selectedItems.find((item) => item.productId === product.productId)
    if (exists) {
      if (exists.quantity >= product.stockQuantity) return
      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.productId,
          productName: product.productName,
          quantity: 1,
          price: parseFloat(product.price),
          maxStock: product.stockQuantity,
        },
      ])
    }
  }

  const handleRemoveProduct = (productId) => {
    setSelectedItems(selectedItems.filter((item) => item.productId !== productId))
  }

  const handleQuantityChange = (productId, quantity) => {
    const qty = parseInt(quantity, 10)
    if (qty <= 0) {
      handleRemoveProduct(productId)
      return
    }
    setSelectedItems(
      selectedItems.map((item) => {
        if (item.productId !== productId) return item
        const clamped = Math.min(qty, item.maxStock || 9999)
        return { ...item, quantity: clamped }
      })
    )
  }

  // ── Discount Logic ─────────────────────────────────────────
  const subtotalBeforeDiscount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [selectedItems])

  const handleApplyDiscount = () => {
    const code = discountCodeInput.trim()

    // Logic gỡ mã (Remove mode)
    if (appliedDiscount) {
      setAppliedDiscount(null)
      setDiscountCodeInput('')
      setDiscountMessage('Discount removed.')
      return
    }

    // Validate apply
    if (!code) {
      setDiscountMessage('Please enter a valid code.')
      return
    }

    // Áp dụng logic threshold xác định
    if (subtotalBeforeDiscount < 50) {
      setDiscountMessage('Subtotal must be at least $50 to apply discounts.')
      setAppliedDiscount(null)
      return
    }

    setAppliedDiscount(code)
    setDiscountMessage('Code applied successfully!')
  }

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const errs = []
    if (!customerId) errs.push('Please select a customer')
    if (!customerName.trim()) errs.push('Customer name is required')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.push('Valid email is required')
    // Phone is optional
    if (!street.trim()) errs.push('Street is required')
    if (!city.trim()) errs.push('City is required')
    if (!state.trim()) errs.push('State is required')
    if (!zipCode.trim()) errs.push('Zip code is required')
    if (selectedItems.length === 0) errs.push('At least one item is required')
    return errs
  }

  // ── Discount Calculation ──────────────────────────────────
  const { finalDiscountAmount, finalDiscountCode, finalDiscountPercentage, finalDiscountDescription } = useMemo(() => {
    let finalDiscountAmount = 0
    let finalDiscountCode = ''
    let finalDiscountPercentage = 0
    let finalDiscountDescription = ''

    if (appliedDiscount) {
      let priceCalc = new PriceComponent(subtotalBeforeDiscount)

      if (subtotalBeforeDiscount >= 200) finalDiscountPercentage = 25
      else if (subtotalBeforeDiscount >= 100) finalDiscountPercentage = 12
      else if (subtotalBeforeDiscount >= 50) finalDiscountPercentage = 5

      if (finalDiscountPercentage > 0) {
        priceCalc = new PercentageDiscount(priceCalc, finalDiscountPercentage, appliedDiscount)
        finalDiscountAmount = subtotalBeforeDiscount - priceCalc.getPrice()
        finalDiscountCode = appliedDiscount
        finalDiscountDescription = priceCalc.getDescription()
      }
    }

    return { finalDiscountAmount, finalDiscountCode, finalDiscountPercentage, finalDiscountDescription }
  }, [subtotalBeforeDiscount, appliedDiscount])

  // ── Live order preview ────────────────────────────────────
  const orderPreview = useMemo(() => {
    const builder = new OrderBuilder()
    return builder
      .setCustomerId(customerId)
      .setCustomerName(customerName)
      .setEmail(email)
      .setPhone(phone)
      .setShippingAddress({ street, city, state, zipCode })
      .setItems(selectedItems)
      .setGiftMessage(giftMessage)
      .setPaymentMethod(paymentMethod)
      .setDiscountAmount(finalDiscountAmount)
      .setDiscountCode(finalDiscountCode)
      .getPreview()
  }, [
    customerId, customerName, email, phone, street, city, state, zipCode,
    selectedItems, giftMessage, paymentMethod, finalDiscountAmount, finalDiscountCode
  ])

  // ── Form submission ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg('')

    const validationErrors = validate()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setErrors([])
    setLoading(true)

    try {
      const builder = new OrderBuilder()
      const orderPayload = builder
        .setCustomerId(customerId)
        .setCustomerName(customerName)
        .setEmail(email)
        .setPhone(phone)
        .setShippingAddress({ street, city, state, zipCode })
        .setItems(selectedItems)
        .setGiftMessage(giftMessage)
        .setPaymentMethod(paymentMethod)
        .setDiscountAmount(finalDiscountAmount)
        .setDiscountCode(finalDiscountCode)
        .build()

      const result = await orderService.createOrder(orderPayload)

      if (result.success) {
        const createdOrder = result.data
        const onlineMethods = ['credit_card', 'paypal']

        if (onlineMethods.includes(paymentMethod)) {
          const paymentResult = await paymentService.createPayment(createdOrder.orderId, paymentMethod)
          const payUrl = paymentResult?.data?.payUrl

          if (payUrl) {
            window.location.href = payUrl
            return
          }
        }

        // Reset form
        if (isManager) handleClearCustomer()
        setStreet('')
        setCity('')
        setState('')
        setZipCode('')
        setSelectedItems([])
        setGiftMessage('')
        setPaymentMethod('credit_card')
        setProductSearch('')
        setDiscountCodeInput('')
        setAppliedDiscount(null)
        setDiscountMessage('')

        setSuccessMsg(`Order ${createdOrder?.orderNumber || ''} created successfully!`)
        setTimeout(() => setSuccessMsg(''), 5000)

        if (onOrderCreated) onOrderCreated(createdOrder)
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

  // ── Payment options ───────────────────────────────────────
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
      value: 'cash',
      label: 'Cash',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
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
      value: 'bank_transfer',
      label: 'Bank Transfer',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          <line x1="6" y1="15" x2="10" y2="15"/>
        </svg>
      ),
    },
  ]

  // ── Visual step tracker ───────────────────────────────────
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

  const stepDone = [
    !!(customerId && customerName && email),
    !!(street && city && state && zipCode),
    selectedItems.length > 0,
    true,
  ]

  return (
    <div className="order-form-wrapper">
      {/* Main Form Area */}
      <div className="order-form-container">

        {/* Success Toast */}
        {successMsg && (
          <div className="order-success-toast" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{successMsg}</span>
            <button type="button" className="toast-close" onClick={() => setSuccessMsg('')}>×</button>
          </div>
        )}

        {/* Visual Step Indicator */}
        <div className="order-stepper" aria-label="Form progress">
          {steps.map((step, i) => (
            <div key={i} className={`stepper-step ${stepDone[i] ? 'done' : ''}`}>
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
                <p className="form-section-subtitle">
                  {isManager ? 'Search and select a customer for this order' : 'Your account information'}
                </p>
              </div>
            </div>

            {/* Manager: Customer Search Picker */}
            {isManager ? (
              <div className="customer-picker">
                {selectedCustomer ? (
                  <div className="selected-customer-card">
                    <div className="selected-customer-avatar">
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="selected-customer-info">
                      <span className="selected-customer-name">{customerName}</span>
                      <span className="selected-customer-email">{email}</span>
                      {phone && <span className="selected-customer-phone">{phone}</span>}
                    </div>
                    <button type="button" className="btn-clear-customer" onClick={handleClearCustomer} title="Change customer">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="customer-search-wrapper">
                    <div className="customer-search-field">
                      <svg className="customer-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        id="customerSearch"
                        type="text"
                        className="customer-search-input"
                        placeholder="Search by name or email…"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value)
                          setCustomerDropdownOpen(true)
                        }}
                        onFocus={() => setCustomerDropdownOpen(true)}
                        autoComplete="off"
                      />
                      {customerLoading && (
                        <svg className="customer-search-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                          <path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    {customerDropdownOpen && customerList.length > 0 && (
                      <ul className="customer-dropdown" role="listbox">
                        {customerList
                          .filter((c) =>
                            !customerSearch ||
                            c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.email.toLowerCase().includes(customerSearch.toLowerCase())
                          )
                          .map((c) => (
                            <li
                              key={c.userId}
                              className="customer-dropdown-item"
                              role="option"
                              onClick={() => handleSelectCustomer(c)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSelectCustomer(c)}
                              tabIndex={0}
                            >
                              <div className="customer-dropdown-avatar">{c.fullName.charAt(0).toUpperCase()}</div>
                              <div className="customer-dropdown-details">
                                <span className="customer-dropdown-name">{c.fullName}</span>
                                <span className="customer-dropdown-email">{c.email}</span>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                    {customerDropdownOpen && !customerLoading && customerList.filter((c) =>
                      !customerSearch ||
                      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(customerSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="customer-dropdown customer-dropdown--empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        No customers found
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Customer: auto-filled read-only fields */
              <div className="form-grid">
                <div className="form-field">
                  <input id="customerName" type="text" className="form-input form-input--readonly" value={customerName} readOnly placeholder=" " />
                  <label className="form-label" htmlFor="customerName">Full Name</label>
                  <span className="form-field-badge">Auto-filled</span>
                </div>
                <div className="form-field">
                  <input id="email" type="email" className="form-input form-input--readonly" value={email} readOnly placeholder=" " />
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <span className="form-field-badge">Auto-filled</span>
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
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                </div>
              </div>
            )}
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
                <input id="street" type="text" className="form-input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder=" " />
                <label className="form-label" htmlFor="street">Street Address *</label>
              </div>
              <div className="form-field">
                <input id="city" type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder=" " />
                <label className="form-label" htmlFor="city">City *</label>
              </div>
              <div className="form-field">
                <input id="state" type="text" className="form-input" value={state} onChange={(e) => setState(e.target.value)} placeholder=" " />
                <label className="form-label" htmlFor="state">State / Province *</label>
              </div>
              <div className="form-field">
                <input id="zipCode" type="text" className="form-input" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder=" " />
                <label className="form-label" htmlFor="zipCode">Zip Code *</label>
              </div>
            </div>
          </div>

          {/* ── Section 3: Product Selection (from DB) ── */}
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
                    ? `${selectedItems.length} item(s) selected · $${orderPreview.totalAmount.toFixed(2)} total`
                    : productsLoading ? 'Loading products from catalog...' : `${dbProducts.length} products available`}
                </p>
              </div>
            </div>

            {/* Product Search Bar */}
            <div className="product-search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search products by name or category…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="product-search-input"
                id="productSearch"
              />
              {productSearch && (
                <button type="button" className="product-search-clear" onClick={() => setProductSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className="product-selector">
                {[1,2,3,4,5,6].map((k) => (
                  <div key={k} className="product-option product-skeleton">
                    <div className="skeleton-category" />
                    <div className="skeleton-name" />
                    <div className="skeleton-price" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="product-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                </svg>
                <span>No products found{productSearch ? ` for "${productSearch}"` : ''}</span>
              </div>
            ) : (
              <div className="product-selector">
                {filteredProducts.map((product) => {
                  const selectedItem = selectedItems.find((item) => item.productId === product.productId)
                  const isSelected = !!selectedItem
                  const outOfStock = product.stockQuantity <= 0
                  return (
                    <div
                      key={product.productId}
                      className={`product-option ${isSelected ? 'selected' : ''} ${outOfStock ? 'out-of-stock' : ''}`}
                      onClick={() => !isSelected && !outOfStock && handleAddProduct(product)}
                      role="button"
                      tabIndex={outOfStock ? -1 : 0}
                      onKeyDown={(e) => e.key === 'Enter' && !isSelected && !outOfStock && handleAddProduct(product)}
                      aria-disabled={outOfStock}
                    >
                      {isSelected && (
                        <div className="product-option-check">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                      {outOfStock && (
                        <div className="product-option-badge-oos">Out of Stock</div>
                      )}
                      <div className="product-option-category-tag">
                        {product.categoryName || 'General'}
                      </div>
                      <span className="product-option-name">{product.productName}</span>
                      <div className="product-option-footer">
                        <span className="product-option-price">${parseFloat(product.price).toFixed(2)}</span>
                        {!outOfStock && (
                          <span className={`product-option-stock ${product.stockQuantity <= 5 ? 'low' : ''}`}>
                            {product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : `${product.stockQuantity} in stock`}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Selected Items Table */}
            {selectedItems.length > 0 && (
              <div className="selected-items">
                <div className="selected-items-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                  <h4>Cart Summary · {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}</h4>
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
                            <button type="button" className="qty-btn" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>−</button>
                            <input
                              type="number"
                              min="1"
                              max={item.maxStock || 9999}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                              className="qty-input"
                            />
                            <button type="button" className="qty-btn" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>+</button>
                          </div>
                        </td>
                        <td className="td-right td-muted">${item.price.toFixed(2)}</td>
                        <td className="td-right td-subtotal">${(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <button type="button" className="btn-remove" onClick={() => handleRemoveProduct(item.productId)} title="Remove item">
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
                      <td colSpan="3" className="total-label">Subtotal</td>
                      <td className="total-amount">${subtotalBeforeDiscount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    {finalDiscountAmount > 0 && (
                      <tr>
                        <td colSpan="3" className="total-label discount-label">
                          Discount ({finalDiscountPercentage}% OFF)
                          <div className="discount-desc">{finalDiscountDescription}</div>
                        </td>
                        <td className="total-amount discount-amount">-${finalDiscountAmount.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    )}
                    <tr className="final-total-row">
                      <td colSpan="3" className="total-label">Order Total</td>
                      <td className="total-amount">${orderPreview.totalAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ── Section 3.5: Discount Code ── */}
          <div className="form-section discount-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <div>
                <h3 className="form-section-title">Discount Code</h3>
                <p className="form-section-subtitle">Apply a promo code to get discounts (orders over $50, $100, $200 qualify)</p>
              </div>
            </div>
            
            <div className="discount-input-group">
              <div className="form-field form-field--inline">
                <input 
                  id="discountCode"
                  type="text" 
                  className="form-input"
                  placeholder=" " 
                  value={discountCodeInput}
                  onChange={(e) => setDiscountCodeInput(e.target.value)}
                  disabled={appliedDiscount !== null} 
                />
                <label className="form-label" htmlFor="discountCode">Enter promo code</label>
              </div>
              <button 
                type="button" 
                className={`btn btn-secondary ${appliedDiscount ? 'btn-remove-discount' : ''}`}
                onClick={handleApplyDiscount}
              >
                {appliedDiscount ? "Remove" : "Apply"}
              </button>
            </div>
            
            {discountMessage && (
              <div className={`discount-msg ${appliedDiscount ? 'success' : 'error'}`}>
                {appliedDiscount ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                )}
                <span>{discountMessage}</span>
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
                <h3 className="form-section-title">Payment &amp; Options</h3>
                <p className="form-section-subtitle">Choose how you'd like to pay</p>
              </div>
            </div>

            <div className="payment-grid">
              {paymentOptions.map((opt) => (
                <label key={opt.value} className={`payment-card ${paymentMethod === opt.value ? 'selected' : ''}`} htmlFor={`pay-${opt.value}`}>
                  <input type="radio" id={`pay-${opt.value}`} name="paymentMethod" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="payment-radio" />
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
