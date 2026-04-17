import React, { useState, useEffect } from 'react'
import './BestSellers.scss'
import { Link } from 'react-router-dom'
import ProductDetailsItems from '../products/ProductDetailsCard/ProductDetailsItems'
import productService from '../../services/productService'

function BestSellers() {
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const result = await productService.getAll({ sort: 'best_seller', limit: 8 })
        if (result.success) {
          setTopProducts(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch best sellers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBestSellers()
  }, [])

  if (loading) return null; // or a spinner if desired

  return (
    <section className='bestsellers' aria-label="Best Sellers">
      <div className="bestsellers-header">
        <div className="bestsellers-header-text">
          <h2 className="bestsellers-title">Best Sellers</h2>
          <p className="bestsellers-subtitle">Our most loved gifts, curated for you</p>
        </div>
        <Link to="/search" className="bestsellers-more">
          View All
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className='bestsellers-grid'>
        {topProducts.map((items) => (
          <div className='bestsellers-grid-item' key={items.productId}>
            <ProductDetailsItems
              id={items.productId}
              name={items.productName}
              price={items.price}
              status={items.typeInfo?.label || 'General'}
              images={items.imageUrl || "/data/placeholder.jpg"}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default BestSellers