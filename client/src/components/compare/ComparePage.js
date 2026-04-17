import React from 'react'
import './ComparePage.scss'
import { useCompare } from '../../contexts/CompareContext'
import { Link } from 'react-router-dom'

// Rows to compare — label + accessor function
const ROWS = [
  { label: 'Image',        render: (p) => (
    <img src={p.imageUrl || '/data/placeholder.jpg'} alt={p.productName} className="compare-table__img" />
  )},
  { label: 'Name',         render: (p) => <strong>{p.productName}</strong> },
  { label: 'Category',     render: (p) => p.categoryName || '—' },
  { label: 'Type',         render: (p) => p.typeInfo?.label || p.productType || '—' },
  { label: 'Price',        render: (p) => (
    <span className="compare-table__price">${Number(p.price).toFixed(2)}</span>
  )},
  { label: 'In Stock',     render: (p) => p.isInStock
      ? <span className="compare-badge compare-badge--green">✓ In Stock</span>
      : <span className="compare-badge compare-badge--red">✗ Out of Stock</span>
  },
  { label: 'Stock Qty',    render: (p) => p.stockQuantity ?? '—' },
  { label: 'Description',  render: (p) => (
    <span className="compare-table__desc">{p.description || '—'}</span>
  )},
]

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, MAX_COMPARE } = useCompare()
  const empty = compareList.length === 0

  return (
    <div className="compare-page">
      <div className="compare-container">

        {/* Header */}
        <div className="compare-header">
          <div className="compare-header__text">
            <h1 className="compare-header__title">Product Comparison</h1>
            <p className="compare-header__sub">
              {empty
                ? 'Add products from the shop to compare them side by side.'
                : `Comparing ${compareList.length} of ${MAX_COMPARE} products`}
            </p>
          </div>
          {!empty && (
            <button className="compare-clear-btn" onClick={clearCompare}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
              Clear all
            </button>
          )}
        </div>

        {/* Empty state */}
        {empty && (
          <div className="compare-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <h2>Nothing to compare yet</h2>
            <p>Browse products and click the <strong>Compare</strong> button to add up to {MAX_COMPARE} items here.</p>
            <Link to="/search" className="compare-empty__btn">Browse Products</Link>
          </div>
        )}

        {/* Comparison table */}
        {!empty && (
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-table__row-label" />
                  {compareList.map((p) => (
                    <th key={p.productId} className="compare-table__col-head">
                      <button
                        className="compare-table__remove"
                        onClick={() => removeFromCompare(p.productId)}
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </th>
                  ))}
                  {/* Empty-slot placeholders */}
                  {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="compare-table__col-head compare-table__col-head--empty">
                      <Link to="/search" className="compare-table__add-slot">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add product
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="compare-table__row">
                    <td className="compare-table__row-label">{row.label}</td>
                    {compareList.map((p) => (
                      <td key={p.productId} className="compare-table__cell">
                        {row.render(p)}
                      </td>
                    ))}
                    {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                      <td key={`empty-cell-${i}`} className="compare-table__cell compare-table__cell--empty">—</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
