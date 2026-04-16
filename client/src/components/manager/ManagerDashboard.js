import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import CategoryManager from './CategoryManager'
import ProductManager from './ProductManager'
import './ManagerDashboard.scss'

/**
 * ManagerDashboard — Tab-based management interface
 *
 * Only accessible to users with roleCode === 'manager'.
 * Tabs: Categories | Products
 */
function ManagerDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('categories')

  // Wait for auth check
  if (loading) {
    return (
      <div className="mgr-page">
        <div className="mgr-loading"><span className="mgr-spinner" /> Checking access...</div>
      </div>
    )
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Not a manager
  if (user.roleCode !== 'manager') {
    return (
      <div className="mgr-page">
        <div className="mgr-denied">
          <div className="mgr-denied-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h2>Access Denied</h2>
          <p>This area is restricted to store managers only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mgr-page">
      <div className="mgr-container">
        {/* Header */}
        <div className="mgr-page-header">
          <div className="mgr-page-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <h1>Manager Dashboard</h1>
            <p>Manage your store's categories and products</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mgr-tabs">
          <button
            className={`mgr-tab ${activeTab === 'categories' ? 'mgr-tab--active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            Categories
          </button>
          <button
            className={`mgr-tab ${activeTab === 'products' ? 'mgr-tab--active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Products
          </button>
        </div>

        {/* Tab Content */}
        <div className="mgr-panel">
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'products' && <ProductManager />}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
