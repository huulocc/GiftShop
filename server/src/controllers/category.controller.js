const categoryService = require('../services/category.service')

/**
 * CategoryController - Handles HTTP requests for Category endpoints
 *
 * GET    /api/categories       — list all (public)
 * GET    /api/categories/:id   — detail (public)
 * POST   /api/categories       — create (manager)
 * PUT    /api/categories/:id   — update (manager)
 * DELETE /api/categories/:id   — soft-delete (manager)
 */
class CategoryController {
  /**
   * GET /api/categories
   */
  async getAll(req, res) {
    try {
      const categories = await categoryService.getAll()
      return res.status(200).json({
        success: true,
        data: categories,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * GET /api/categories/:id
   */
  async getById(req, res) {
    try {
      const category = await categoryService.getById(req.params.id)
      return res.status(200).json({
        success: true,
        data: category,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * POST /api/categories
   * Body: { categoryName, description }
   */
  async create(req, res) {
    try {
      const { categoryName, description } = req.body

      // Validation
      if (!categoryName || categoryName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'categoryName is required',
        })
      }

      const userId = req.session.user.userId
      const category = await categoryService.create(
        { categoryName: categoryName.trim(), description: description?.trim() || null },
        userId
      )

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * PUT /api/categories/:id
   * Body: { categoryName, description }
   */
  async update(req, res) {
    try {
      const { categoryName, description } = req.body
      const userId = req.session.user.userId

      const category = await categoryService.update(
        req.params.id,
        { categoryName: categoryName?.trim(), description: description?.trim() },
        userId
      )

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * DELETE /api/categories/:id
   */
  async delete(req, res) {
    try {
      const result = await categoryService.delete(req.params.id)
      return res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }
}

module.exports = new CategoryController()
