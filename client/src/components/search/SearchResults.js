import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import searchService from '../../services/searchService'
import ProductDetailsItems from '../products/ProductDetailsCard/ProductDetailsItems'
import './SearchResults.scss'

function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState({ categories: [], products: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError('')
      try {
        if (!query.trim()) {
          setResults({ categories: [], products: [] })
          return
        }
        
        const response = await searchService.search(query)
        if (response.success) {
          setResults(response.data)
        } else {
          setError('Failed to fetch search results')
        }
      } catch (err) {
        setError('An error occurred during search')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  if (loading) {
    return (
      <div className="search-page">
        <div className="search-loading"><span className="search-spinner" /> Searching...</div>
      </div>
    )
  }

  const hasCategories = results.categories && results.categories.length > 0
  const hasProducts = results.products && results.products.length > 0
  const noMatch = !hasCategories && !hasProducts

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1>Search Results</h1>
          <p>Showing results for: <strong>"{query}"</strong></p>
        </div>

        {error && <div className="search-alert search-alert--error">{error}</div>}

        {noMatch && !error && (
          <div className="search-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            <h2>No results found</h2>
            <p>We couldn't find anything matching your search. Please try another term.</p>
          </div>
        )}

        {hasCategories && (
          <section className="search-section">
            <h2 className="search-section-title">Categories</h2>
            <div className="search-categories-grid">
              {results.categories.map(cat => (
                <div key={cat.categoryId} className="search-category-card">
                  <h3>{cat.categoryName}</h3>
                  <p>{cat.description || 'No description available'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasProducts && (
          <section className="search-section">
            <h2 className="search-section-title">Products</h2>
            <div className="search-products-grid">
              {results.products.map(prod => (
                <div key={prod.productId} className="search-product-item">
                  <ProductDetailsItems
                    id={prod.productId}
                    name={prod.productName}
                    price={prod.price}
                    status={prod.typeInfo?.label || 'General'}
                    brand={prod.categoryName || 'No Category'}
                    images={prod.imageUrl || "/data/placeholder.jpg"}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default SearchResults
