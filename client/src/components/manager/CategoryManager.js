import React, { useState, useEffect, useCallback } from 'react'
import categoryService from '../../services/categoryService'
import './CategoryManager.scss'

function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ categoryName: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const result = await categoryService.getAll()
      if (result.success) setCategories(result.data)
    } catch (err) {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openAdd = () => {
    setEditing(null)
    setForm({ categoryName: '', description: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ categoryName: cat.categoryName, description: cat.description || '' })
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
    if (!form.categoryName.trim()) {
      setError('Category name is required')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        await categoryService.update(editing.categoryId, form)
      } else {
        await categoryService.create(form)
      }
      closeModal()
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId) => {
    try {
      await categoryService.delete(categoryId)
      setDeleteConfirm(null)
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed')
      setDeleteConfirm(null)
    }
  }

  if (loading) {
    return <div className="mgr-loading"><span className="mgr-spinner" /> Loading categories...</div>
  }

  return (
    <div className="cat-mgr">
      <div className="cat-mgr-header">
        <h2>Categories</h2>
        <button className="mgr-btn mgr-btn--primary" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Category
        </button>
      </div>

      {error && !showModal && (
        <div className="mgr-alert mgr-alert--error">{error}</div>
      )}

      <div className="mgr-table-wrap">
        <table className="mgr-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="5" className="mgr-table-empty">No categories yet</td></tr>
            ) : (
              categories.map((cat, idx) => (
                <tr key={cat.categoryId}>
                  <td>{idx + 1}</td>
                  <td className="mgr-table-name">{cat.categoryName}</td>
                  <td className="mgr-table-desc">{cat.description || '—'}</td>
                  <td className="mgr-table-date">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  <td className="mgr-table-actions">
                    <button className="mgr-btn-icon mgr-btn-icon--edit" onClick={() => openEdit(cat)} title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="mgr-btn-icon mgr-btn-icon--delete" onClick={() => setDeleteConfirm(cat.categoryId)} title="Delete">
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="mgr-modal-overlay" onClick={closeModal}>
          <div className="mgr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mgr-modal-header">
              <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button className="mgr-modal-close" onClick={closeModal}>×</button>
            </div>
            {error && <div className="mgr-alert mgr-alert--error" style={{ margin: '0 1.25rem' }}>{error}</div>}
            <form className="mgr-modal-form" onSubmit={handleSubmit}>
              <div className="mgr-form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={form.categoryName}
                  onChange={(e) => { setForm({ ...form, categoryName: e.target.value }); setError('') }}
                  placeholder="e.g. Mugs, Cards, Bracelets"
                  autoFocus
                />
              </div>
              <div className="mgr-form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
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
              <h3>Delete Category?</h3>
            </div>
            <p style={{ padding: '0 1.25rem', color: '#4a5568', fontSize: '0.88rem' }}>
              This action cannot be undone. Categories with active products cannot be deleted.
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

export default CategoryManager
