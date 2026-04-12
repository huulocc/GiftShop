import React from 'react'
import './BestSellers.scss'
import Products from '../products/Products/Products.json'
import { Link } from 'react-router-dom'
import ProductDetailsItems from '../products/ProductDetailsCard/ProductDetailsItems';

function BestSellers() {
  const topProducts = Products.filter((items) => items.top === 1).slice(0, 8);

  return (
    <section className='bestsellers' aria-label="Best Sellers">
      <div className="bestsellers-header">
        <div className="bestsellers-header-text">
          <h2 className="bestsellers-title">Best Sellers</h2>
          <p className="bestsellers-subtitle">Our most loved gifts, curated for you</p>
        </div>
        <Link to="/products" className="bestsellers-more">
          View All
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
      <div className='bestsellers-grid'>
        {topProducts.map((items, index) => (
          <div className='bestsellers-grid-item' key={index}>
            <ProductDetailsItems
              id={items.id}
              name={items.name}
              price={items.price}
              status={items.status}
              brand={items.brand.name}
              images={items.images[0].path}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default BestSellers