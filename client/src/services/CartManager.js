import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'giftshop_cart'

/**
 * CartManager — Singleton Pattern
 *
 * Ensures a single cart instance across the entire application.
 * Manages cart state (items, quantities), persists to localStorage,
 * and notifies subscribers (React components) on every change.
 *
 * Usage:
 *   const cart = CartManager.getInstance()
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
    this._cart = this._loadFromStorage()
  }

  // ── Public API ──────────────────────────────────────────

  /**
   * Add a product to the cart (or increase quantity if already present)
   * @param {{ id: number|string, name: string, price: string|number, images: Array }} product
   * @param {number} quantity
   */
  addItem(product, quantity = 1) {
    const existing = this._cart.items.find((i) => String(i.productId) === String(product.id))

    if (existing) {
      existing.quantity += quantity
    } else {
      this._cart.items.push({
        productId: String(product.id),
        productName: product.name,
        price: parseFloat(product.price),
        quantity,
        image: product.images?.[0]?.path || product.image || '',
      })
    }

    this._save()
  }

  /**
   * Update the quantity for an item (removes if qty <= 0)
   * @param {string|number} productId
   * @param {number} newQuantity
   */
  updateQuantity(productId, newQuantity) {
    const id = String(productId)
    if (newQuantity <= 0) {
      this.removeItem(id)
      return
    }

    const item = this._cart.items.find((i) => String(i.productId) === id)
    if (item) {
      item.quantity = newQuantity
      this._save()
    }
  }

  /**
   * Remove an item entirely
   * @param {string|number} productId
   */
  removeItem(productId) {
    const id = String(productId)
    this._cart.items = this._cart.items.filter((i) => String(i.productId) !== id)
    this._save()
  }

  /** Clear the entire cart */
  clearCart() {
    this._cart.items = []
    this._save()
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

  /** Persist cart to localStorage and notify listeners */
  _save() {
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
