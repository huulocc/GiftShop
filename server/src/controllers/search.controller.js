const pool = require('../config/db')
const { ProductFactory } = require('../models/product.model')

/**
 * SearchController
 * Provides unified search functionality for categories and products
 */
class SearchController {
  /**
   * GET /api/search?q=keyword
   */
  async search(req, res) {
    try {
      const { q } = req.query

      if (!q || q.trim().length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            categories: [],
            products: [],
          },
        })
      }

      const queryTerm = q.trim()
      
      // UUID regex
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(queryTerm)

      let categories = []
      let rawProducts = []

      if (isUUID) {
        // Search by UUID exactly
        const categoryRes = await pool.query(
          `SELECT c.*, u1.full_name AS created_by_name, u2.full_name AS updated_by_name
           FROM categories c
           LEFT JOIN users u1 ON c.created_by = u1.user_id
           LEFT JOIN users u2 ON c.updated_by = u2.user_id
           WHERE c.category_id = $1 AND c.is_active = TRUE`,
          [queryTerm]
        )
        const productRes = await pool.query(
          `SELECT p.*, c.category_name,
                  u1.full_name AS created_by_name, u2.full_name AS updated_by_name
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.category_id
           LEFT JOIN users u1 ON p.created_by = u1.user_id
           LEFT JOIN users u2 ON p.updated_by = u2.user_id
           WHERE p.product_id = $1 AND p.is_active = TRUE`,
          [queryTerm]
        )
        categories = categoryRes.rows
        rawProducts = productRes.rows
      } else {
        // Search by name ILIKE
        const searchPattern = `%${queryTerm}%`
        const categoryRes = await pool.query(
          `SELECT c.*, u1.full_name AS created_by_name, u2.full_name AS updated_by_name
           FROM categories c
           LEFT JOIN users u1 ON c.created_by = u1.user_id
           LEFT JOIN users u2 ON c.updated_by = u2.user_id
           WHERE c.category_name ILIKE $1 AND c.is_active = TRUE
           ORDER BY c.category_name ASC
           LIMIT 20`,
          [searchPattern]
        )
        const productRes = await pool.query(
          `SELECT p.*, c.category_name,
                  u1.full_name AS created_by_name, u2.full_name AS updated_by_name
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.category_id
           LEFT JOIN users u1 ON p.created_by = u1.user_id
           LEFT JOIN users u2 ON p.updated_by = u2.user_id
           WHERE p.product_name ILIKE $1 AND p.is_active = TRUE
           ORDER BY p.product_name ASC
           LIMIT 50`,
          [searchPattern]
        )
        categories = categoryRes.rows
        rawProducts = productRes.rows
      }

      // Map categories
      const mappedCategories = categories.map((row) => ({
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
      }))

      // Map products using Factory
      const mappedProducts = rawProducts.map((row) => {
        const mappedData = {
          productId: row.product_id,
          categoryId: row.category_id,
          categoryName: row.category_name || null,
          productName: row.product_name,
          productType: row.product_type,
          description: row.description,
          price: parseFloat(row.price),
          stockQuantity: row.stock_quantity,
          imageUrl: row.image_url,
          isActive: row.is_active,
          createdBy: row.created_by,
          createdByName: row.created_by_name || null,
          updatedBy: row.updated_by,
          updatedByName: row.updated_by_name || null,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
        return ProductFactory.create(row.product_type, mappedData).toJSON()
      })

      return res.status(200).json({
        success: true,
        data: {
          categories: mappedCategories,
          products: mappedProducts,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }
}

module.exports = new SearchController()
