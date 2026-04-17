import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './ProductDetailPage.scss'
import productService from '../../../services/productService'
import CartManager from '../../../services/CartManager'
import { useCompare } from '../../../contexts/CompareContext'
import { useAuth } from '../../../services/AuthContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [cartToast, setCartToast] = useState(null) // { msg, warn }
  const [compareLoading, setCompareLoading] = useState(false)
  const { addToCompare, removeFromCompare, isInCompare } = useCompare()
  const inCompare = !!product && isInCompare(product.productId)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await productService.getById(id)
        if (res.success && res.data) {
          setProduct(res.data)
        } else {
          setError('Product not found.')
        }
      } catch {
        setError('Failed to load product.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setCartToast({ msg: 'Please log in to add items to your cart.', warn: true })
      setTimeout(() => { setCartToast(null); navigate('/login') }, 1800)
      return
    }
    if (!product) return
    const cart = CartManager.getInstance()
    for (let i = 0; i < qty; i++) {
      cart.addItem({
        id: product.productId,
        name: product.productName,
        price: product.price,
        image: product.imageUrl || '/data/placeholder.jpg',
      })
    }
    setCartToast({ msg: `${qty > 1 ? qty + ' items' : 'Item'} added to cart!`, warn: false })
    setTimeout(() => setCartToast(null), 2500)
  }

  const handleCompare = async () => {
    if (!product) return
    if (inCompare) { removeFromCompare(product.productId); return }
    setCompareLoading(true)
    try {
      addToCompare(product)
    } finally {
      setCompareLoading(false)
    }
  }

  // ── Loading ──────────────────────────
  if (loading) return (
    <div className="pdp-loading">
      <div className="pdp-spinner" />
      <p>Loading product…</p>
    </div>
  )

  // ── Error ────────────────────────────
  if (error || !product) return (
    <div className="pdp-error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      <h2>{error || 'Product not found'}</h2>
      <Link to="/search" className="pdp-back-btn">← Back to products</Link>
    </div>
  )

  const stockLabel = product.isInStock ? `${product.stockQuantity} in stock` : 'Out of stock'

  return (
    <div className="pdp-page">
      <div className="pdp-container">

        {/* Breadcrumb */}
        <nav className="pdp-breadcrumb" aria-label="breadcrumb">
          <Link to="/" className="pdp-breadcrumb__link">Home</Link>
          <span className="pdp-breadcrumb__sep">›</span>
          <Link to="/search" className="pdp-breadcrumb__link">Products</Link>
          {product.categoryName && (
            <>
              <span className="pdp-breadcrumb__sep">›</span>
              <Link to={`/search?q=${product.categoryId}`} className="pdp-breadcrumb__link">
                {product.categoryName}
              </Link>
            </>
          )}
          <span className="pdp-breadcrumb__sep">›</span>
          <span className="pdp-breadcrumb__current">{product.productName}</span>
        </nav>

        {/* Main grid */}
        <div className="pdp-main">

          {/* Left — Image */}
          <div className="pdp-image-panel">
            <div className="pdp-image-wrap">
              <img
                src={product.imageUrl || '/data/placeholder.jpg'}
                alt={product.productName}
                className="pdp-image"
              />
              {product.typeInfo?.label && (
                <div className="pdp-image-badge">{product.typeInfo.label}</div>
              )}
              {!product.isInStock && (
                <div className="pdp-image-oos">Out of Stock</div>
              )}
            </div>
          </div>

          {/* Right — Details */}
          <div className="pdp-info">
            {product.categoryName && (
              <Link to={`/search?q=${product.categoryId}`} className="pdp-category-tag">
                {product.categoryName}
              </Link>
            )}

            <h1 className="pdp-title">{product.productName}</h1>

            <div className="pdp-price-row">
              <span className="pdp-price">${Number(product.price).toFixed(2)}</span>
              <span className={`pdp-stock-badge ${product.isInStock ? 'pdp-stock-badge--in' : 'pdp-stock-badge--out'}`}>
                {product.isInStock ? (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> In Stock</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Out of Stock</>
                )}
              </span>
            </div>

            {product.description && (
              <p className="pdp-description">{product.description}</p>
            )}

            {/* Metadata chips */}
            <div className="pdp-meta">
              <div className="pdp-meta-item">
                <span className="pdp-meta-label">Category</span>
                <span className="pdp-meta-value">{product.categoryName || '—'}</span>
              </div>
              <div className="pdp-meta-item">
                <span className="pdp-meta-label">Type</span>
                <span className="pdp-meta-value">{product.typeInfo?.label || product.productType || '—'}</span>
              </div>
              <div className="pdp-meta-item">
                <span className="pdp-meta-label">Stock</span>
                <span className="pdp-meta-value">{stockLabel}</span>
              </div>
            </div>

            {/* Quantity selector */}
            {product.isInStock && (
              <div className="pdp-qty-row">
                <span className="pdp-qty-label">Quantity</span>
                <div className="pdp-qty-control">
                  <button
                    className="pdp-qty-btn"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >−</button>
                  <span className="pdp-qty-value">{qty}</span>
                  <button
                    className="pdp-qty-btn"
                    onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}
                    disabled={qty >= product.stockQuantity}
                  >+</button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pdp-actions">
              <button
                className={`pdp-btn pdp-btn--primary ${!product.isInStock ? 'pdp-btn--disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.isInStock}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57L23 6H6"/>
                </svg>
                {cartToast && !cartToast.warn ? '✓ Added!' : 'Add to Cart'}
              </button>

              <button
                className={`pdp-btn pdp-btn--outline ${inCompare ? 'pdp-btn--active' : ''}`}
                onClick={handleCompare}
                disabled={compareLoading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
                {inCompare ? '✓ Comparing' : 'Compare'}
              </button>
            </div>

            {/* Toast */}
            {cartToast && (
              <div className={`pdp-toast${cartToast.warn ? ' pdp-toast--warn' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {cartToast.warn
                    ? <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>
                    : <path d="M20 6L9 17l-5-5"/>
                  }
                </svg>
                {cartToast.msg}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
