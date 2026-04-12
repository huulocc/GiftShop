import React, { useState, useEffect, useCallback } from 'react'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'
import './ProductManager.scss'

function ProductManager() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 })

  const emptyForm = {
    productName: '',
    categoryId: '',
    productType: 'general',
    description: '',
    price: '',
    stockQuantity: '0',
  }
  const [form, setForm] = useState(emptyForm)

  // Stock editing
  const [stockEdit, setStockEdit] = useState(null)
  const [stockValue, setStockValue] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const result = await productService.getAll({
        categoryId: filterCategory || undefined,
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit,
      })
      if (result.success) {
        setProducts(result.data)
        setPagination((prev) => ({ ...prev, total: result.pagination.total }))
      }
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filterCategory, searchTerm, pagination.page, pagination.limit])

  const fetchCategories = useCallback(async () => {
    try {
      const result = await categoryService.getAll()
      if (result.success) setCategories(result.data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, categoryId: categories[0]?.categoryId || '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (prod) => {
    setEditing(prod)
    setForm({
      productName: prod.productName,
      categoryId: prod.categoryId,
      productType: prod.productType,
      description: prod.description || '',
      price: String(prod.price),
      stockQuantity: String(prod.stockQuantity),
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = []
    if (!form.productName.trim()) errors.push('Product name is required')
    if (!form.categoryId) errors.push('Category is required')
    if (!form.price || parseFloat(form.price) < 0) errors.push('Price must be ≥ 0')

    if (errors.length > 0) {
      setError(errors.join('. '))
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload = {
        productName: form.productName.trim(),
        categoryId: form.categoryId,
        productType: form.productType,
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity, 10) || 0,
      }

      if (editing) {
        await productService.update(editing.productId, payload)
      } else {
        await productService.create(payload)
      }
      closeModal()
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    try {
      await productService.delete(productId)
      setDeleteConfirm(null)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed')
      setDeleteConfirm(null)
    }
  }

  const handleStockSave = async () => {
    if (stockEdit === null) return
    try {
      await productService.updateStock(stockEdit, parseInt(stockValue, 10) || 0)
      setStockEdit(null)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Stock update failed')
      setStockEdit(null)
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1

  return (
    <div className="prod-mgr">
      <div className="prod-mgr-header">
        <h2>Products</h2>
        <button className="mgr-btn mgr-btn--primary" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="prod-mgr-filters">
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPagination((p) => ({ ...p, page: 1 })) }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPagination((p) => ({ ...p, page: 1 })) }}
        />
      </div>

      {error && !showModal && (
        <div className="mgr-alert mgr-alert--error">{error}</div>
      )}

      {loading ? (
        <div className="mgr-loading"><span className="mgr-spinner" /> Loading products...</div>
      ) : (
        <>
          <div className="mgr-table-wrap">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="7" className="mgr-table-empty">No products found</td></tr>
                ) : (
                  products.map((prod, idx) => (
                    <tr key={prod.productId}>
                      <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                      <td className="mgr-table-name">{prod.productName}</td>
                      <td>{prod.categoryName || '—'}</td>
                      <td>
                        <span className={`mgr-badge mgr-badge--${prod.productType}`}>
                          {prod.typeInfo?.label || prod.productType}
                        </span>
                      </td>
                      <td className="mgr-table-price">${prod.price.toFixed(2)}</td>
                      <td className="mgr-table-stock">
                        {stockEdit === prod.productId ? (
                          <span className="mgr-stock-editor">
                            <input
                              type="number"
                              min="0"
                              value={stockValue}
                              onChange={(e) => setStockValue(e.target.value)}
                              className="mgr-stock-input"
                              autoFocus
                            />
                            <button className="mgr-btn-icon mgr-btn-icon--save" onClick={handleStockSave} title="Save">✓</button>
                            <button className="mgr-btn-icon mgr-btn-icon--cancel" onClick={() => setStockEdit(null)} title="Cancel">✕</button>
                          </span>
                        ) : (
                          <span
                            className={`mgr-stock-val ${prod.stockQuantity === 0 ? 'mgr-stock-val--zero' : ''}`}
                            onClick={() => { setStockEdit(prod.productId); setStockValue(String(prod.stockQuantity)) }}
                            title="Click to edit stock"
                          >
                            {prod.stockQuantity}
                          </span>
                        )}
                      </td>
                      <td className="mgr-table-actions">
                        <button className="mgr-btn-icon mgr-btn-icon--edit" onClick={() => openEdit(prod)} title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="mgr-btn-icon mgr-btn-icon--delete" onClick={() => setDeleteConfirm(prod.productId)} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mgr-pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              >← Prev</button>
              <span>Page {pagination.page} of {totalPages}</span>
              <button
                disabled={pagination.page >= totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              >Next →</button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="mgr-modal-overlay" onClick={closeModal}>
          <div className="mgr-modal mgr-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="mgr-modal-header">
              <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button className="mgr-modal-close" onClick={closeModal}>×</button>
            </div>
            {error && <div className="mgr-alert mgr-alert--error" style={{ margin: '0 1.25rem' }}>{error}</div>}
            <form className="mgr-modal-form" onSubmit={handleSubmit}>
              <div className="mgr-form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={form.productName}
                  onChange={(e) => { setForm({ ...form, productName: e.target.value }); setError('') }}
                  placeholder="Product name"
                  autoFocus
                />
              </div>
              <div className="mgr-form-row">
                <div className="mgr-form-group">
                  <label>Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
                <div className="mgr-form-group">
                  <label>Type</label>
                  <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
                    <option value="general">General</option>
                    <option value="handmade">Handmade</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
              </div>
              <div className="mgr-form-row">
                <div className="mgr-form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => { setForm({ ...form, price: e.target.value }); setError('') }}
                    placeholder="0.00"
                  />
                </div>
                <div className="mgr-form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mgr-form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description"
                  rows={3}
                />
              </div>
              <div className="mgr-modal-actions">
                <button type="button" className="mgr-btn mgr-btn--ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="mgr-btn mgr-btn--primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="mgr-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="mgr-modal mgr-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="mgr-modal-header">
              <h3>Delete Product?</h3>
            </div>
            <p style={{ padding: '0 1.25rem', color: '#4a5568', fontSize: '0.88rem' }}>
              This will deactivate the product. It will no longer appear in the store.
            </p>
            <div className="mgr-modal-actions">
              <button className="mgr-btn mgr-btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="mgr-btn mgr-btn--danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManager
