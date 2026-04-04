import React, { useState } from 'react'
import OrderForm from './OrderForm'
import OrderList from './OrderList'
import './CreateOrderPage.scss'

/**
 * CreateOrderPage - Main page wrapper for Order features
 *
 * Contains tabs to switch between Create Order form and Order List.
 */
function CreateOrderPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [refreshKey, setRefreshKey] = useState(0)

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
      {/* Tab Navigation */}
      <div className="order-tabs">
        <button
          className={`order-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
          id="tab-order-list"
        >
          Order List
        </button>
        <button
          className={`order-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
          id="tab-create-order"
        >
          Create Order
        </button>
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
