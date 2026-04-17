const pool = require('../config/db')

/**
 * CategoryRepository - Data Access Layer
 *
 * Uses PostgreSQL (Supabase) via pg Pool.
 * Manages the `categories` table.
 * Follows the same pattern as CartRepository / AuthRepository.
 *
 * Methods: findAll(), findById(), create(), update(), softDelete(), countProducts()
 */
class CategoryRepository {
  /**
   * Get all active categories
   * @returns {Promise<Array>} list of categories
   */
  async findAll() {
    const result = await pool.query(
      `SELECT c.*, u1.full_name AS created_by_name, u2.full_name AS updated_by_name
       FROM categories c
       LEFT JOIN users u1 ON c.created_by = u1.user_id
       LEFT JOIN users u2 ON c.updated_by = u2.user_id
       WHERE c.is_active = TRUE
       ORDER BY c.category_name ASC`
    )
    return result.rows.map((row) => this._mapRow(row))
  }

  /**
   * Get a single category by ID
   * @param {string} categoryId - UUID
   * @returns {Promise<Object|null>}
   */
  async findById(categoryId) {
    const result = await pool.query(
      `SELECT c.*, u1.full_name AS created_by_name, u2.full_name AS updated_by_name
       FROM categories c
       LEFT JOIN users u1 ON c.created_by = u1.user_id
       LEFT JOIN users u2 ON c.updated_by = u2.user_id
       WHERE c.category_id = $1`,
      [categoryId]
    )
    if (result.rows.length === 0) return null
    return this._mapRow(result.rows[0])
  }

  /**
   * Find a category by name (for uniqueness checks)
   * @param {string} categoryName
   * @returns {Promise<Object|null>}
   */
  async findByName(categoryName) {
    const result = await pool.query(
      `SELECT * FROM categories WHERE LOWER(category_name) = LOWER($1) AND is_active = TRUE`,
      [categoryName]
    )
    if (result.rows.length === 0) return null
    return this._mapRow(result.rows[0])
  }

  /**
   * Create a new category
   * @param {{ categoryName: string, description: string, createdBy: string }} data
   * @returns {Promise<Object>} the created category
   */
  async create({ categoryName, description, createdBy }) {
    const result = await pool.query(
      `INSERT INTO categories (category_name, description, created_by, updated_by)
       VALUES ($1, $2, $3, $3)
       RETURNING *`,
      [categoryName, description || null, createdBy]
    )
    return this._mapRow(result.rows[0])
  }

  /**
   * Update a category
   * @param {string} categoryId
   * @param {{ categoryName: string, description: string, updatedBy: string }} data
   * @returns {Promise<Object|null>}
   */
  async update(categoryId, { categoryName, description, updatedBy }) {
    const result = await pool.query(
      `UPDATE categories
       SET category_name = COALESCE($1, category_name),
           description = COALESCE($2, description),
           updated_by = $3,
           updated_at = NOW()
       WHERE category_id = $4 AND is_active = TRUE
       RETURNING *`,
      [categoryName, description, updatedBy, categoryId]
    )
    if (result.rows.length === 0) return null
    return this._mapRow(result.rows[0])
  }

  /**
   * Soft-delete a category (set is_active = false)
   * @param {string} categoryId
   * @returns {Promise<boolean>} true if deleted
   */
  async softDelete(categoryId) {
    const result = await pool.query(
      `UPDATE categories SET is_active = FALSE, updated_at = NOW()
       WHERE category_id = $1 AND is_active = TRUE
       RETURNING category_id`,
      [categoryId]
    )
    return result.rows.length > 0
  }

  /**
   * Count active products referencing a category
   * @param {string} categoryId
   * @returns {Promise<number>}
   */
  async countProducts(categoryId) {
    const result = await pool.query(
      `SELECT COUNT(*) AS cnt FROM products WHERE category_id = $1 AND is_active = TRUE`,
      [categoryId]
    )
    return parseInt(result.rows[0].cnt, 10)
  }

  // ── Private Helpers ────────────────────────────────────

  _mapRow(row) {
    return {
      categoryId: row.category_id,
      categoryName: row.category_name,
      description: row.description,
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

module.exports = new CategoryRepository()
