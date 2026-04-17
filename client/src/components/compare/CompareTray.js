import React from 'react'
import './CompareTray.scss'
import { useCompare } from '../../contexts/CompareContext'
import { Link } from 'react-router-dom'

export default function CompareTray() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()

  if (compareList.length === 0) return null

  return (
    <div className="compare-tray">
      <div className="compare-tray__inner">
        <div className="compare-tray__label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
          Comparing <strong>{compareList.length}</strong> product{compareList.length > 1 ? 's' : ''}
        </div>

        <div className="compare-tray__products">
          {compareList.map((p) => (
            <div key={p.productId} className="compare-tray__item">
              <img
                src={p.imageUrl || '/data/placeholder.jpg'}
                alt={p.productName}
                className="compare-tray__img"
              />
              <span className="compare-tray__name">{p.productName}</span>
              <button
                className="compare-tray__remove"
                onClick={() => removeFromCompare(p.productId)}
                aria-label={`Remove ${p.productName}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="compare-tray__actions">
          <button className="compare-tray__clear" onClick={clearCompare}>Clear all</button>
          <Link to="/compare" className="compare-tray__go">
            Compare now
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
