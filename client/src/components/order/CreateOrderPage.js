import React, { useState, useEffect } from 'react'
import OrderForm from './OrderForm'
import OrderList from './OrderList'
import { useCheckout } from '../../contexts/CheckoutContext'
import './CreateOrderPage.scss'

/**
 * CreateOrderPage - Main page wrapper for Order features
 *
 * Contains tabs to switch between Create Order form and Order List.
 * Auto-switches to Create Order tab if coming from cart checkout.
 */
function CreateOrderPage() {
  const { checkoutData } = useCheckout()
  const [activeTab, setActiveTab] = useState('list')
  const [refreshKey, setRefreshKey] = useState(0)

  // Auto-switch to create tab if there's checkout data
  useEffect(() => {
    if (checkoutData?.items && checkoutData.items.length > 0) {
      setActiveTab('create')
    }
  }, [checkoutData])

  /**
   * Called when a new order is created successfully
   * Switches to list tab and triggers refresh
   */
  const handleOrderCreated = (newOrder) => {
    setActiveTab('list')
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="order-page">
      {/* Page Hero */}
      <div className="order-page-hero">
        <div className="order-page-hero-inner">
          <div className="order-page-hero-text">
            <h1 className="order-page-title">
              <svg className="order-page-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Order Management
            </h1>
            <p className="order-page-subtitle">Manage and track all your gift shop orders in one place.</p>
          </div>
          <div className="order-page-hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="order-tabs-wrapper">
        <div className="order-tabs">
          <button
            className={`order-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
            id="tab-order-list"
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Order List
          </button>
          <button
            className={`order-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
            id="tab-create-order"
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Create Order
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="order-tab-content">
        {activeTab === 'list' && <OrderList key={refreshKey} />}
        {activeTab === 'create' && <OrderForm onOrderCreated={handleOrderCreated} />}
      </div>
    </div>
  )
}

export default CreateOrderPage
