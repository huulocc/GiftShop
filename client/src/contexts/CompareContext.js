import React, { createContext, useContext, useState, useCallback } from 'react'

const CompareContext = createContext(null)

const MAX_COMPARE = 4

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([])

  const addToCompare = useCallback((product) => {
    setCompareList((prev) => {
      if (prev.find((p) => p.productId === product.productId)) return prev
      if (prev.length >= MAX_COMPARE) return prev // max 4
      return [...prev, product]
    })
  }, [])

  const removeFromCompare = useCallback((productId) => {
    setCompareList((prev) => prev.filter((p) => p.productId !== productId))
  }, [])

  const clearCompare = useCallback(() => setCompareList([]), [])

  const isInCompare = useCallback(
    (productId) => compareList.some((p) => p.productId === productId),
    [compareList]
  )

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare, MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider')
  return ctx
}
