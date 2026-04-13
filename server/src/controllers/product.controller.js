const productService = require('../services/product.service')

/**
 * ProductController - Handles HTTP requests for Product endpoints
 *
 * GET    /api/products              — list (public, with filters)
 * GET    /api/products/:id          — detail (public)
 * POST   /api/products              — create (manager)
 * PUT    /api/products/:id          — update (manager)
 * DELETE /api/products/:id          — soft-delete (manager)
 * PATCH  /api/products/:id/stock    — update stock (manager)
 */
class ProductController {
  /**
   * GET /api/products?categoryId=&search=&page=&limit=
   */
  async getAll(req, res) {
    try {
      const { categoryId, search, page, limit } = req.query
      const result = await productService.getAll({ categoryId, search, page, limit })
      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * GET /api/products/:id
   */
  async getById(req, res) {
    try {
      const product = await productService.getById(req.params.id)
      return res.status(200).json({
        success: true,
        data: product,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * POST /api/products
   * Body: { productName, categoryId, productType, description, price, stockQuantity }
   */
  async create(req, res) {
    try {
      const { productName, categoryId, productType, description, price, stockQuantity } = req.body || {}

      // Validation
      const errors = []
      if (!productName || productName.trim().length === 0) errors.push('productName is required')
      if (!categoryId) errors.push('categoryId is required')
      if (price === undefined || price === null || parseFloat(price) < 0) errors.push('price must be a non-negative number')

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errors,
        })
      }

      const userId = req.session.user.userId
      const product = await productService.create(
        {
          productName: productName.trim(),
          categoryId,
          productType: productType || 'general',
          description: description?.trim() || null,
          price: parseFloat(price),
          stockQuantity: parseInt(stockQuantity, 10) || 0,
          imageUrl: req.file ? req.file.location : null,
        },
        userId
      )

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * PUT /api/products/:id
   */
  async update(req, res) {
    try {
      const { productName, categoryId, productType, description, price, stockQuantity } = req.body || {}
      const userId = req.session.user.userId

      const product = await productService.update(
        req.params.id,
        {
          productName: productName?.trim(),
          categoryId,
          productType,
          description: description?.trim(),
          price: price !== undefined ? parseFloat(price) : undefined,
          stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity, 10) : undefined,
          imageUrl: req.file ? req.file.location : undefined,
        },
        userId
      )

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }

  /**
   * DELETE /api/products/:id
   */
  async delete(req, res) {
    try {
      const result = await productService.delete(req.params.id)
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

  /**
   * PATCH /api/products/:id/stock
   * Body: { quantity }
   */
  async updateStock(req, res) {
    try {
      const { quantity } = req.body

      if (quantity === undefined || quantity === null) {
        return res.status(400).json({
          success: false,
          error: 'quantity is required',
        })
      }

      const product = await productService.updateStock(req.params.id, parseInt(quantity, 10))
      return res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: product,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      })
    }
  }
}

module.exports = new ProductController()
