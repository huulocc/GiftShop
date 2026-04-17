import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartManager from '../../services/CartManager'
import { useCheckout } from '../../contexts/CheckoutContext'
import './CartPage.scss'

/**
 * CartPage — Full cart view
 *
 * Subscribes to CartManager (Singleton) for live updates.
 * Allows quantity adjustment and item removal.
 */
function CartPage() {
  const cart = CartManager.getInstance()
  const navigate = useNavigate()
  const { setCheckoutItems } = useCheckout()
  const [items, setItems] = useState(cart.getItems())
  const [removingId, setRemovingId] = useState(null)

  const syncItems = useCallback(() => {
    setItems(cart.getItems())
  }, [cart])

  useEffect(() => {
    const unsubscribe = cart.subscribe(syncItems)
    return unsubscribe
  }, [cart, syncItems])

  const handleIncrement = (productId) => {
    const item = items.find((i) => i.productId === productId)
    if (item) cart.updateQuantity(productId, item.quantity + 1)
  }

  const handleDecrement = (productId) => {
    const item = items.find((i) => i.productId === productId)
    if (item && item.quantity > 1) {
      cart.updateQuantity(productId, item.quantity - 1)
    }
  }

  const handleRemove = (productId) => {
    setRemovingId(productId)
    setTimeout(() => {
      cart.removeItem(productId)
      setRemovingId(null)
    }, 300)
  }

  const handleClear = () => {
    cart.clearCart()
  }

  const handleProceedToCheckout = () => {
    // Store cart items in checkout context
    setCheckoutItems(items)
    // Navigate to orders page
    navigate('/orders')
  }

  const totalCount = cart.getTotalCount()
  const totalPrice = cart.getTotalPrice()

  // ── Empty State ──
  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
          </div>
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-text">Looks like you haven't added any gifts yet. Explore our collection!</p>
          <Link to="/" className="cart-empty-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  // ── Cart Content ──
  return (
    <div className="cart-page">
      {/* Hero */}
      <div className="cart-hero">
        <div className="cart-hero-inner">
          <div className="cart-hero-text">
            <h1 className="cart-hero-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              Shopping Cart
            </h1>
            <p className="cart-hero-subtitle">{totalCount} {totalCount === 1 ? 'item' : 'items'} in your cart</p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="cart-layout">
        {/* Items list */}
        <div className="cart-items">
          <div className="cart-items-header">
            <span className="cart-items-header-label">Product</span>
            <span className="cart-items-header-label">Price</span>
            <span className="cart-items-header-label">Quantity</span>
            <span className="cart-items-header-label">Total</span>
            <span className="cart-items-header-label"></span>
          </div>

          {items.map((item) => (
            <div
              className={`cart-item ${removingId === item.productId ? 'cart-item--removing' : ''}`}
              key={item.productId}
              id={`cart-item-${item.productId}`}
            >
              <div className="cart-item-product">
                <div className="cart-item-img">
                  <img src={item.image} alt={item.productName} />
                </div>
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.productName}</h4>
                </div>
              </div>

              <div className="cart-item-price">
                <span className="cart-item-label">Price</span>
                ${item.price.toFixed(2)}
              </div>

              <div className="cart-item-qty">
                <span className="cart-item-label">Qty</span>
                <div className="cart-item-stepper">
                  <button
                    className="cart-item-stepper-btn"
                    onClick={() => handleDecrement(item.productId)}
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span className="cart-item-stepper-val">{item.quantity}</span>
                  <button
                    className="cart-item-stepper-btn"
                    onClick={() => handleIncrement(item.productId)}
                    aria-label="Increase quantity"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>

              <div className="cart-item-total">
                <span className="cart-item-label">Total</span>
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                className="cart-item-remove"
                onClick={() => handleRemove(item.productId)}
                aria-label={`Remove ${item.productName}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>

            <div className="cart-summary-row">
              <span>Subtotal ({totalCount} items)</span>
              <span className="cart-summary-val">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span className="cart-summary-val cart-summary-free">FREE</span>
            </div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-row cart-summary-row--total">
              <span>Total</span>
              <span className="cart-summary-val">${totalPrice.toFixed(2)}</span>
            </div>

            <button onClick={handleProceedToCheckout} className="cart-summary-checkout">
              Proceed to Checkout
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <Link to="/" className="cart-summary-continue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
