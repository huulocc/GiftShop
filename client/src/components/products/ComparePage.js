import React from 'react'
import { Link } from 'react-router-dom'
import { useCompare } from '../../contexts/CompareContext'
import CartManager from '../../services/CartManager'
import './ComparePage.scss'

/**
 * ComparePage - Display side-by-side comparison of selected products
 *
 * Users can:
 * - View detailed comparison of products
 * - Add products to cart
 * - Remove from comparison
 */
function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()
  const cart = CartManager.getInstance()

  const handleAddToCart = (product) => {
    cart.addItem({
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      quantity: 1,
      image: product.image || '/placeholder.png',
    })
  }

  // ── Empty State ──
  if (compareList.length === 0) {
    return (
      <div className="compare-page">
        <div className="compare-empty">
          <div className="compare-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
            </svg>
          </div>
          <h2 className="compare-empty-title">No Products to Compare</h2>
          <p className="compare-empty-text">Add products from our catalog to compare their features and prices side by side.</p>
          <Link to="/" className="compare-empty-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  // Get all unique properties across products
  const allProperties = new Set()
  compareList.forEach((product) => {
    if (product.categoryName) allProperties.add('Category')
    if (product.price) allProperties.add('Price')
    if (product.stockQuantity !== undefined) allProperties.add('Stock')
    if (product.description) allProperties.add('Description')
  })

  const properties = Array.from(allProperties)

  return (
    <div className="compare-page">
      {/* Hero */}
      <div className="compare-hero">
        <div className="compare-hero-inner">
          <div className="compare-hero-text">
            <h1 className="compare-hero-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="12 3 20 9 20 21 4 21 4 9 12 3"/>
              </svg>
              Product Comparison
            </h1>
            <p className="compare-hero-subtitle">Compare {compareList.length} product{compareList.length !== 1 ? 's' : ''} side by side</p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="compare-wrapper">
        <div className="compare-container">
          <div className="compare-controls">
            <button onClick={clearCompare} className="compare-clear-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              Clear All
            </button>
          </div>

          <div className="compare-table">
            {/* Property names column */}
            <div className="compare-column compare-column--labels">
              <div className="compare-cell compare-cell--header">Features</div>
              {properties.map((prop) => (
                <div key={prop} className="compare-cell compare-cell--property">
                  {prop}
                </div>
              ))}
              <div className="compare-cell compare-cell--action">Action</div>
            </div>

            {/* Product columns */}
            {compareList.map((product) => (
              <div key={product.productId} className="compare-column">
                {/* Product header */}
                <div className="compare-cell compare-cell--header">
                  <div className="compare-product-header">
                    {product.image && (
                      <img src={product.image} alt={product.productName} className="compare-product-img" />
                    )}
                    <div className="compare-product-info">
                      <h3 className="compare-product-name">{product.productName}</h3>
                    </div>
                    <button
                      onClick={() => removeFromCompare(product.productId)}
                      className="compare-remove-btn"
                      aria-label={`Remove ${product.productName} from comparison`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product properties */}
                {properties.map((prop) => (
                  <div key={`${product.productId}-${prop}`} className="compare-cell">
                    {prop === 'Price' && <span className="compare-price">${product.price?.toFixed(2)}</span>}
                    {prop === 'Category' && <span>{product.categoryName || 'N/A'}</span>}
                    {prop === 'Stock' && (
                      <span className={product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                      </span>
                    )}
                    {prop === 'Description' && (
                      <span className="compare-description">{product.description || 'N/A'}</span>
                    )}
                  </div>
                ))}

                {/* Add to cart action */}
                <div className="compare-cell compare-cell--action">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="compare-add-to-cart"
                    disabled={product.stockQuantity <= 0}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="compare-footer">
        <Link to="/" className="compare-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default ComparePage
