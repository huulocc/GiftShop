import { v4 as uuidv4 } from 'uuid'
import cartService from './cartService'

const STORAGE_KEY = 'giftshop_cart'

/**
 * CartManager — Singleton Pattern
 *
 * Ensures a single cart instance across the entire application.
 * Manages cart state (items, quantities), persists to localStorage,
 * and notifies subscribers (React components) on every change.
 *
 * When a customerId is set (user logged in), operations sync with
 * the backend API. Otherwise, falls back to localStorage only.
 *
 * Usage:
 *   const cart = CartManager.getInstance()
 *   cart.setCustomerId('uuid')   // enables backend sync
 *   cart.addItem(product, 1)
 *   cart.subscribe(callback)
 */
class CartManager {
  /** @type {CartManager|null} */
  static _instance = null

  /**
   * Get the singleton instance (creates one if it doesn't exist)
   * @returns {CartManager}
   */
  static getInstance() {
    if (!CartManager._instance) {
      CartManager._instance = new CartManager()
    }
    return CartManager._instance
  }

  /** Private-ish constructor — always use getInstance() */
  constructor() {
    if (CartManager._instance) {
      throw new Error('CartManager is a Singleton. Use CartManager.getInstance()')
    }

    this._listeners = []
    this._syncing = false
    this._cart = this._loadFromStorage()
  }

  // ── Public API ──────────────────────────────────────────

  /**
   * Set the customerId and sync cart from backend
   * Call this after user login
   * @param {string} customerId - UUID from the users table
   */
  async setCustomerId(customerId) {
    this._cart.customerId = customerId
    this._saveLocal()

    // Sync with backend
    await this._syncFromBackend()
  }

  /** @returns {string|null} customerId */
  getCustomerId() {
    return this._cart.customerId
  }

  /**
   * Add a product to the cart (or increase quantity if already present)
   * @param {{ id: number|string, name: string, price: string|number, images: Array|string }} product
   * @param {number} quantity
   */
  async addItem(product, quantity = 1) {
    const productId = String(product.id)
    const price = parseFloat(product.price)
    const image = typeof product.images === 'string'
      ? product.images
      : product.images?.[0]?.path || product.image || ''

    // Update local state immediately (optimistic)
    const existing = this._cart.items.find((i) => String(i.productId) === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      this._cart.items.push({
        productId,
        productName: product.name,
        price,
        quantity,
        image,
      })
    }
    this._saveLocal()

    // Sync with backend if logged in
    if (this._cart.customerId) {
      try {
        const result = await cartService.addItem(this._cart.customerId, {
          productId,
          quantity,
          unitPrice: price,
        })
        if (result.success) {
          this._applyBackendCart(result.data)
        }
      } catch (err) {
        console.warn('[CartManager] Backend sync failed (addItem):', err.message)
        // Local state is already updated — still works offline
      }
    }
  }

  /**
   * Update the quantity for an item (removes if qty <= 0)
   * @param {string|number} productId
   * @param {number} newQuantity
   */
  async updateQuantity(productId, newQuantity) {
    const id = String(productId)

    if (newQuantity <= 0) {
      return this.removeItem(id)
    }

    // Update local state immediately
    const item = this._cart.items.find((i) => String(i.productId) === id)
    if (item) {
      item.quantity = newQuantity
      this._saveLocal()
    }

    // Sync with backend
    if (this._cart.customerId) {
      try {
        const result = await cartService.updateItemQuantity(
          this._cart.customerId,
          id,
          newQuantity
        )
        if (result.success) {
          this._applyBackendCart(result.data)
        }
      } catch (err) {
        console.warn('[CartManager] Backend sync failed (updateQuantity):', err.message)
      }
    }
  }

  /**
   * Remove an item entirely
   * @param {string|number} productId
   */
  async removeItem(productId) {
    const id = String(productId)

    // Remove from local state
    this._cart.items = this._cart.items.filter((i) => String(i.productId) !== id)
    this._saveLocal()

    // Sync with backend
    if (this._cart.customerId) {
      try {
        const result = await cartService.removeItem(this._cart.customerId, id)
        if (result.success) {
          this._applyBackendCart(result.data)
        }
      } catch (err) {
        console.warn('[CartManager] Backend sync failed (removeItem):', err.message)
      }
    }
  }

  /** Clear the entire cart */
  async clearCart() {
    this._cart.items = []
    this._saveLocal()

    if (this._cart.customerId) {
      try {
        const result = await cartService.clearCart(this._cart.customerId)
        if (result.success) {
          this._applyBackendCart(result.data)
        }
      } catch (err) {
        console.warn('[CartManager] Backend sync failed (clearCart):', err.message)
      }
    }
  }

  /** @returns {Array} cart items */
  getItems() {
    return [...this._cart.items]
  }

  /** @returns {string} cart ID */
  getCartId() {
    return this._cart.cartId
  }

  /** @returns {number} total number of items (sum of quantities) */
  getTotalCount() {
    return this._cart.items.reduce((sum, i) => sum + i.quantity, 0)
  }

  /** @returns {number} total price */
  getTotalPrice() {
    return this._cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  }

  // ── Observer / Subscriber Pattern ───────────────────────

  /**
   * Subscribe to cart changes
   * @param {Function} callback — called with no args on every change
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this._listeners.push(callback)
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback)
    }
  }

  // ── Private Helpers ─────────────────────────────────────

  /**
   * Fetch cart from backend and merge into local state
   */
  async _syncFromBackend() {
    if (!this._cart.customerId || this._syncing) return

    this._syncing = true
    try {
      const result = await cartService.getCart(this._cart.customerId)
      if (result.success) {
        this._applyBackendCart(result.data)
      }
    } catch (err) {
      console.warn('[CartManager] Backend sync failed:', err.message)
      // Keep using local data
    } finally {
      this._syncing = false
    }
  }

  /**
   * Apply backend cart data to local state
   * @param {Object} backendCart - cart object from API response
   */
  _applyBackendCart(backendCart) {
    this._cart.cartId = backendCart.cartId
    this._cart.items = (backendCart.items || []).map((item) => ({
      productId: item.productId,
      productName: item.productName || '',
      price: item.unitPrice || item.price || 0,
      quantity: item.quantity,
      image: item.image || '',
    }))
    this._saveLocal()
  }

  /** Persist cart to localStorage and notify listeners */
  _saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cart))
    } catch {
      // localStorage quota exceeded — silently ignore
    }
    this._notify()
  }

  /** Notify all subscribers */
  _notify() {
    this._listeners.forEach((cb) => {
      try {
        cb()
      } catch {
        // ignore subscriber errors
      }
    })
  }

  /** Load cart from localStorage (or create a fresh one) */
  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.items)) {
          return parsed
        }
      }
    } catch {
      // corrupted data — start fresh
    }

    return {
      cartId: uuidv4(),
      customerId: null,
      items: [],
    }
  }
}

export default CartManager
