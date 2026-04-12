const pool = require('../config/db')

/**
 * ProductRepository - Data Access Layer
 *
 * Uses PostgreSQL (Supabase) via pg Pool.
 * Manages the `products` table.
 * Returns raw mapped objects — the service layer wraps them via ProductFactory.
 *
 * Methods: findAll(), findById(), create(), update(), softDelete(), updateStock()
 */
class ProductRepository {
  /**
   * Get products with optional filters
   * @param {{ categoryId?: string, search?: string, page?: number, limit?: number }} filters
   * @returns {Promise<{ products: Array, total: number }>}
   */
  async findAll({ categoryId, search, page = 1, limit = 50 } = {}) {
    const conditions = ['p.is_active = TRUE']
    const params = []
    let paramIdx = 1

    if (categoryId) {
      conditions.push(`p.category_id = $${paramIdx++}`)
      params.push(categoryId)
    }

    if (search) {
      conditions.push(`p.product_name ILIKE $${paramIdx++}`)
      params.push(`%${search}%`)
    }

    const whereClause = conditions.join(' AND ')
    const offset = (page - 1) * limit

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) AS cnt FROM products p WHERE ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].cnt, 10)

    // Fetch page
    const result = await pool.query(
      `SELECT p.*, c.category_name,
              u1.full_name AS created_by_name, u2.full_name AS updated_by_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN users u1 ON p.created_by = u1.user_id
       LEFT JOIN users u2 ON p.updated_by = u2.user_id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    )

    return {
      products: result.rows.map((row) => this._mapRow(row)),
      total,
    }
  }

  /**
   * Get a single product by ID
   * @param {string} productId - UUID
   * @returns {Promise<Object|null>}
   */
  async findById(productId) {
    const result = await pool.query(
      `SELECT p.*, c.category_name,
              u1.full_name AS created_by_name, u2.full_name AS updated_by_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN users u1 ON p.created_by = u1.user_id
       LEFT JOIN users u2 ON p.updated_by = u2.user_id
       WHERE p.product_id = $1`,
      [productId]
    )
    if (result.rows.length === 0) return null
    return this._mapRow(result.rows[0])
  }

  /**
   * Create a new product
   * @param {{ productName, categoryId, productType, description, price, stockQuantity, createdBy }} data
   * @returns {Promise<Object>}
   */
  async create({ productName, categoryId, productType, description, price, stockQuantity, createdBy }) {
    const result = await pool.query(
      `INSERT INTO products (product_name, category_id, product_type, description, price, stock_quantity, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING *`,
      [productName, categoryId, productType || 'general', description || null, price, stockQuantity || 0, createdBy]
    )
    // Re-fetch with joins
    return this.findById(result.rows[0].product_id)
  }

  /**
   * Update a product
   * @param {string} productId
   * @param {{ productName, categoryId, productType, description, price, stockQuantity, updatedBy }} data
   * @returns {Promise<Object|null>}
   */
  async update(productId, { productName, categoryId, productType, description, price, stockQuantity, updatedBy }) {
    const result = await pool.query(
      `UPDATE products
       SET product_name = COALESCE($1, product_name),
           category_id = COALESCE($2, category_id),
           product_type = COALESCE($3, product_type),
           description = COALESCE($4, description),
           price = COALESCE($5, price),
           stock_quantity = COALESCE($6, stock_quantity),
           updated_by = $7,
           updated_at = NOW()
       WHERE product_id = $8 AND is_active = TRUE
       RETURNING *`,
      [productName, categoryId, productType, description, price, stockQuantity, updatedBy, productId]
    )
    if (result.rows.length === 0) return null
    return this.findById(result.rows[0].product_id)
  }

  /**
   * Soft-delete (set is_active = false)
   * @param {string} productId
   * @returns {Promise<boolean>}
   */
  async softDelete(productId) {
    const result = await pool.query(
      `UPDATE products SET is_active = FALSE, updated_at = NOW()
       WHERE product_id = $1 AND is_active = TRUE
       RETURNING product_id`,
      [productId]
    )
    return result.rows.length > 0
  }

  /**
   * Update stock quantity
   * @param {string} productId
   * @param {number} quantity - new stock value
   * @returns {Promise<Object|null>}
   */
  async updateStock(productId, quantity) {
    const result = await pool.query(
      `UPDATE products SET stock_quantity = $1, updated_at = NOW()
       WHERE product_id = $2 AND is_active = TRUE
       RETURNING *`,
      [quantity, productId]
    )
    if (result.rows.length === 0) return null
    return this.findById(result.rows[0].product_id)
  }

  // ── Private Helpers ────────────────────────────────────

  _mapRow(row) {
    return {
      productId: row.product_id,
      categoryId: row.category_id,
      categoryName: row.category_name || null,
      productName: row.product_name,
      productType: row.product_type,
      description: row.description,
      price: parseFloat(row.price),
      stockQuantity: row.stock_quantity,
      isActive: row.is_active,
      createdBy: row.created_by,
      createdByName: row.created_by_name || null,
      updatedBy: row.updated_by,
      updatedByName: row.updated_by_name || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

module.exports = new ProductRepository()
