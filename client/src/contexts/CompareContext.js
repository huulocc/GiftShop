import React, { createContext, useState, useCallback } from 'react'

/**
 * CompareContext - Manages product comparison list
 * Users can add/remove products to compare side by side
 */
export const CompareContext = createContext()

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([])

  /**
   * Add product to compare list (max 4 items)
   * @param {Object} product - Product to add
   */
  const addToCompare = useCallback((product) => {
    setCompareList((prev) => {
      // Check if already in list
      if (prev.some((p) => p.productId === product.productId)) {
        return prev
      }
      // Max 4 items
      if (prev.length >= 4) {
        return prev
      }
      return [...prev, product]
    })
  }, [])

  /**
   * Remove product from compare list
   * @param {number|string} productId - Product ID to remove
   */
  const removeFromCompare = useCallback((productId) => {
    setCompareList((prev) => prev.filter((p) => p.productId !== productId))
  }, [])

  /**
   * Check if product is in compare list
   * @param {number|string} productId - Product ID to check
   */
  const isInCompare = useCallback(
    (productId) => {
      return compareList.some((p) => p.productId === productId)
    },
    [compareList]
  )

  /**
   * Clear all products from compare list
   */
  const clearCompare = useCallback(() => {
    setCompareList([])
  }, [])

  /**
   * Get compare count
   */
  const getCompareCount = useCallback(() => {
    return compareList.length
  }, [compareList])

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        getCompareCount,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

/**
 * Hook to use CompareContext
 */
export function useCompare() {
  const context = React.useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}
