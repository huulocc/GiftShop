const productRepository = require('../repositories/product.repository')
const categoryRepository = require('../repositories/category.repository')
const { ProductFactory, ProductType, normalizeProductType } = require('../models/product.model')

/**
 * ProductService - Business Logic Layer
 *
 * Uses ProductFactory (Factory Method pattern) to wrap raw DB data
 * into the correct Product subtype before returning to the controller.
 */
class ProductService {
  _isAcceptedProductType(type) {
    const rawType = (type || '').toString().trim().toLowerCase()
    return ['book', 'clothes', 'electronics', 'general', 'handmade', 'digital'].includes(rawType)
  }

  _toCreatePayload(product, userId) {
    return {
      productName: product.productName,
      categoryId: product.categoryId,
      productType: product.productType,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      createdBy: userId,
    }
  }

  /**
   * Get products with filters, wrapped via Factory
   * @param {{ categoryId?: string, search?: string, sort?: string, page?: string|number, limit?: string|number }} options
   * @returns {Promise<{ products: Array, total: number, page: number, limit: number }>}
   */
  async getAll({ categoryId, search, sort, page = 1, limit = 50 } = {}) {
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 50

    const { products, total } = await productRepository.findAll({
      categoryId,
      search,
      sort,
      page: pageNum,
      limit: limitNum,
    })

    // Wrap each product via Factory Method
    const wrapped = products.map((p) => ProductFactory.create(p.productType, p).toJSON())

    return { products: wrapped, total, page, limit }
  }

  /**
   * Get a single product by ID, wrapped via Factory
   * @param {string} productId
   * @returns {Promise<Object>}
   * @throws {Error} 404
   */
  async getById(productId) {
    const raw = await productRepository.findById(productId)
    if (!raw) {
      const error = new Error('Product not found')
      error.statusCode = 404
      throw error
    }
    return ProductFactory.create(raw.productType, raw).toJSON()
  }

  /**
   * Create a new product
   * @param {{ productName, categoryId, productType, description, price, stockQuantity }} data
   * @param {string} userId
   * @returns {Promise<Object>}
   * @throws {Error} 400 if category not found, invalid type
   */
  async create(data, userId) {
    // Validate category exists
    const category = await categoryRepository.findById(data.categoryId)
    if (!category) {
      const error = new Error('Category not found')
      error.statusCode = 400
      throw error
    }

    // Validate product_type (accepts legacy aliases and normalizes them)
    if (data.productType && !this._isAcceptedProductType(data.productType)) {
      const error = new Error('Invalid product type. Must be one of: book, clothes, electronics')
      error.statusCode = 400
      throw error
    }

    // Factory Method: create concrete product subtype through common interface.
    const product = ProductFactory.create(normalizeProductType(data.productType), {
      ...data,
      productType: normalizeProductType(data.productType),
    })

    const raw = await productRepository.create(this._toCreatePayload(product, userId))

    return ProductFactory.create(raw.productType, raw).toJSON()
  }

  /**
   * Update a product
   * @param {string} productId
   * @param {Object} data
   * @param {string} userId
   * @returns {Promise<Object>}
   * @throws {Error} 404, 400
   */
  async update(productId, data, userId) {
    // Check product exists
    const existing = await productRepository.findById(productId)
    if (!existing) {
      const error = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    // If changing category, validate it exists
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await categoryRepository.findById(data.categoryId)
      if (!category) {
        const error = new Error('Category not found')
        error.statusCode = 400
        throw error
      }
    }

    // Validate product_type if changed
    if (data.productType) {
      if (!this._isAcceptedProductType(data.productType)) {
        const error = new Error('Invalid product type. Must be one of: book, clothes, electronics')
        error.statusCode = 400
        throw error
      }

      data.productType = normalizeProductType(data.productType)
    }

    const raw = await productRepository.update(productId, {
      ...data,
      updatedBy: userId,
    })

    return ProductFactory.create(raw.productType, raw).toJSON()
  }

  /**
   * Soft-delete a product
   * @param {string} productId
   * @throws {Error} 404
   */
  async delete(productId) {
    const existing = await productRepository.findById(productId)
    if (!existing) {
      const error = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    const deleted = await productRepository.softDelete(productId)
    if (!deleted) {
      const error = new Error('Failed to delete product')
      error.statusCode = 500
      throw error
    }

    return { message: 'Product deleted successfully' }
  }

  /**
   * Update stock quantity
   * @param {string} productId
   * @param {number} quantity
   * @returns {Promise<Object>}
   * @throws {Error} 400, 404
   */
  async updateStock(productId, quantity) {
    if (quantity < 0) {
      const error = new Error('Stock quantity cannot be negative')
      error.statusCode = 400
      throw error
    }

    const raw = await productRepository.updateStock(productId, quantity)
    if (!raw) {
      const error = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    return ProductFactory.create(raw.productType, raw).toJSON()
  }
}

module.exports = new ProductService()
