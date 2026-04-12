const categoryRepository = require('../repositories/category.repository')

/**
 * CategoryService - Business Logic Layer
 *
 * Handles all business rules for category CRUD.
 * Depends on CategoryRepository for data access.
 */
class CategoryService {
  /**
   * Get all active categories
   * @returns {Promise<Array>}
   */
  async getAll() {
    return categoryRepository.findAll()
  }

  /**
   * Get a single category by ID
   * @param {string} categoryId
   * @returns {Promise<Object>}
   * @throws {Error} 404 if not found
   */
  async getById(categoryId) {
    const category = await categoryRepository.findById(categoryId)
    if (!category) {
      const error = new Error('Category not found')
      error.statusCode = 404
      throw error
    }
    return category
  }

  /**
   * Create a new category
   * @param {{ categoryName: string, description: string }} data
   * @param {string} userId - manager's user_id
   * @returns {Promise<Object>}
   * @throws {Error} 409 if name already exists
   */
  async create({ categoryName, description }, userId) {
    // Check name uniqueness
    const existing = await categoryRepository.findByName(categoryName)
    if (existing) {
      const error = new Error('A category with this name already exists')
      error.statusCode = 409
      throw error
    }

    return categoryRepository.create({
      categoryName,
      description,
      createdBy: userId,
    })
  }

  /**
   * Update a category
   * @param {string} categoryId
   * @param {{ categoryName: string, description: string }} data
   * @param {string} userId
   * @returns {Promise<Object>}
   * @throws {Error} 404 if not found, 409 if duplicate name
   */
  async update(categoryId, { categoryName, description }, userId) {
    // Check exists
    const existing = await categoryRepository.findById(categoryId)
    if (!existing) {
      const error = new Error('Category not found')
      error.statusCode = 404
      throw error
    }

    // Check name uniqueness (if name changed)
    if (categoryName && categoryName !== existing.categoryName) {
      const dup = await categoryRepository.findByName(categoryName)
      if (dup) {
        const error = new Error('A category with this name already exists')
        error.statusCode = 409
        throw error
      }
    }

    return categoryRepository.update(categoryId, {
      categoryName,
      description,
      updatedBy: userId,
    })
  }

  /**
   * Soft-delete a category
   * @param {string} categoryId
   * @throws {Error} 404 if not found, 400 if has active products
   */
  async delete(categoryId) {
    const existing = await categoryRepository.findById(categoryId)
    if (!existing) {
      const error = new Error('Category not found')
      error.statusCode = 404
      throw error
    }

    // Check if category has active products
    const productCount = await categoryRepository.countProducts(categoryId)
    if (productCount > 0) {
      const error = new Error(
        `Cannot delete category: ${productCount} active product(s) still reference it`
      )
      error.statusCode = 400
      throw error
    }

    const deleted = await categoryRepository.softDelete(categoryId)
    if (!deleted) {
      const error = new Error('Failed to delete category')
      error.statusCode = 500
      throw error
    }

    return { message: 'Category deleted successfully' }
  }
}

module.exports = new CategoryService()
