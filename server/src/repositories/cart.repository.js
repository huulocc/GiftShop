const pool = require('../config/db')

/**
 * CartRepository - Data Access Layer
 *
 * Uses PostgreSQL (Supabase) via pg Pool.
 * Manages `carts` and `cart_items` tables.
 * Follows the same pattern as OrderRepository.
 *
 * Methods: getActiveCart(), getCartById(), createCart(),
 *          addItem(), updateItemQuantity(), removeItem(), clearItems()
 */
class CartRepository {
  // ── Cart Operations ────────────────────────────────────

  /**
   * Get the active cart for a customer (creates one if none exists)
   * @param {string} customerId - UUID of the customer
   * @returns {Promise<Object>} cart with items
   */
  async getActiveCart(customerId) {
    // Try to find existing active cart
    const result = await pool.query(
      `SELECT * FROM carts WHERE customer_id = $1 AND status = 'active'`,
      [customerId]
    )

    if (result.rows.length > 0) {
      return this._attachItemsToCart(result.rows[0])
    }

    // No active cart — create one
    return this.createCart(customerId)
  }

  /**
   * Get a cart by its ID
   * @param {string} cartId
   * @returns {Promise<Object|null>}
   */
  async getCartById(cartId) {
    const result = await pool.query(
      `SELECT * FROM carts WHERE cart_id = $1`,
      [cartId]
    )

    if (result.rows.length === 0) return null
    return this._attachItemsToCart(result.rows[0])
  }

  /**
   * Create a new active cart for a customer
   * @param {string} customerId
   * @returns {Promise<Object>} new cart with empty items
   */
  async createCart(customerId) {
    const result = await pool.query(
      `INSERT INTO carts (customer_id, status) VALUES ($1, 'active') RETURNING *`,
      [customerId]
    )
    return this._mapCartRow(result.rows[0], [])
  }

  /**
   * Update cart status (e.g. 'active' → 'converted' when order is placed)
   * @param {string} cartId
   * @param {string} status
   * @returns {Promise<Object|null>}
   */
  async updateCartStatus(cartId, status) {
    const result = await pool.query(
      `UPDATE carts SET status = $1, updated_at = NOW() WHERE cart_id = $2 RETURNING *`,
      [status, cartId]
    )
    if (result.rows.length === 0) return null
    return this._attachItemsToCart(result.rows[0])
  }

  // ── Cart Item Operations ───────────────────────────────

  /**
   * Add an item to the cart (or update quantity if product already in cart)
   * Uses UPSERT via ON CONFLICT on (cart_id, product_id)
   * @param {string} cartId
   * @param {{ productId: string, quantity: number, unitPrice: number }} itemData
   * @returns {Promise<Object>} the cart item
   */
  async addItem(cartId, { productId, quantity, unitPrice }) {
    const result = await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
       RETURNING *`,
      [cartId, productId, quantity, unitPrice]
    )

    // Update cart timestamp
    await pool.query(
      `UPDATE carts SET updated_at = NOW() WHERE cart_id = $1`,
      [cartId]
    )

    return this._mapItemRow(result.rows[0])
  }

  /**
   * Set the quantity for a specific cart item
   * @param {string} cartId
   * @param {string} productId
   * @param {number} quantity
   * @returns {Promise<Object|null>} updated item or null
   */
  async updateItemQuantity(cartId, productId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(cartId, productId)
    }

    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1, updated_at = NOW()
       WHERE cart_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, cartId, productId]
    )

    if (result.rows.length === 0) return null

    await pool.query(
      `UPDATE carts SET updated_at = NOW() WHERE cart_id = $1`,
      [cartId]
    )

    return this._mapItemRow(result.rows[0])
  }

  /**
   * Remove an item from the cart
   * @param {string} cartId
   * @param {string} productId
   * @returns {Promise<boolean>} true if removed
   */
  async removeItem(cartId, productId) {
    const result = await pool.query(
      `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING cart_item_id`,
      [cartId, productId]
    )

    if (result.rows.length > 0) {
      await pool.query(
        `UPDATE carts SET updated_at = NOW() WHERE cart_id = $1`,
        [cartId]
      )
    }

    return result.rows.length > 0
  }

  /**
   * Clear all items from a cart
   * @param {string} cartId
   * @returns {Promise<number>} number of items removed
   */
  async clearItems(cartId) {
    const result = await pool.query(
      `DELETE FROM cart_items WHERE cart_id = $1`,
      [cartId]
    )

    await pool.query(
      `UPDATE carts SET updated_at = NOW() WHERE cart_id = $1`,
      [cartId]
    )

    return result.rowCount
  }

  // ── Private Helpers ────────────────────────────────────

  /**
   * Fetch cart_items + product info and attach to a cart row
   */
  async _attachItemsToCart(cartRow) {
    const itemsResult = await pool.query(
      `SELECT ci.*, p.product_name, p.price AS current_price,
              p.product_type, p.is_active AS product_active
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.added_at ASC`,
      [cartRow.cart_id]
    )

    const items = itemsResult.rows.map((row) => this._mapItemRow(row))
    return this._mapCartRow(cartRow, items)
  }

  /**
   * Map a raw cart DB row to a clean JS object
   */
  _mapCartRow(row, items = []) {
    return {
      cartId: row.cart_id,
      customerId: row.customer_id,
      status: row.status,
      items,
      totalCount: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  /**
   * Map a raw cart_item DB row to a clean JS object
   */
  _mapItemRow(row) {
    return {
      cartItemId: row.cart_item_id,
      cartId: row.cart_id,
      productId: row.product_id,
      productName: row.product_name || null,
      unitPrice: parseFloat(row.unit_price),
      currentPrice: row.current_price ? parseFloat(row.current_price) : null,
      quantity: row.quantity,
      lineTotal: parseFloat(row.unit_price) * row.quantity,
      addedAt: row.added_at,
      updatedAt: row.updated_at,
    }
  }
}

module.exports = new CartRepository()
