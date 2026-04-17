import React, { createContext, useState, useCallback } from 'react'

/**
 * CheckoutContext - Manages checkout data when transitioning from cart to order form
 * Allows cart items to be pre-filled in the order form
 */
export const CheckoutContext = createContext()

export function CheckoutProvider({ children }) {
  const [checkoutData, setCheckoutData] = useState(null)

  /**
   * Store cart items for checkout
   * @param {Array} items - Cart items to checkout with
   */
  const setCheckoutItems = useCallback((items) => {
    setCheckoutData({
      items: items || [],
      timestamp: Date.now(),
    })
  }, [])

  /**
   * Clear checkout data
   */
  const clearCheckout = useCallback(() => {
    setCheckoutData(null)
  }, [])

  /**
   * Get checkout items
   */
  const getCheckoutItems = useCallback(() => {
    return checkoutData?.items || []
  }, [checkoutData])

  return (
    <CheckoutContext.Provider
      value={{
        checkoutData,
        setCheckoutItems,
        clearCheckout,
        getCheckoutItems,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

/**
 * Hook to use CheckoutContext
 */
export function useCheckout() {
  const context = React.useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider')
  }
  return context
}
