/**
 * Product Model + Factory Method Pattern
 *
 * Implements the Factory Method design pattern to create
 * different product subtypes based on `product_type`.
 *
 * Class hierarchy:
 *   Product (base)
 *   ├── GeneralProduct  — default product type
 *   ├── HandmadeProduct — handcrafted items with artisan info
 *   └── DigitalProduct  — downloadable/digital goods
 *
 * Usage:
 *   const product = ProductFactory.create('handmade', { ... })
 *   product.getTypeInfo()  // → { type: 'handmade', label: 'Handmade', ... }
 */

/**
 * Product — Base class
 * Contains shared properties aligned with the `products` DB table.
 */
class Product {
  constructor({
    productId,
    categoryId,
    categoryName,
    productName,
    productType,
    description,
    price,
    stockQuantity,
    imageUrl,
    isActive,
    createdBy,
    createdByName,
    updatedBy,
    updatedByName,
    createdAt,
    updatedAt,
  }) {
    this.productId = productId
    this.categoryId = categoryId
    this.categoryName = categoryName || null
    this.productName = productName
    this.productType = productType || 'general'
    this.description = description || null
    this.price = parseFloat(price) || 0
    this.stockQuantity = parseInt(stockQuantity, 10) || 0
    this.imageUrl = imageUrl || null
    this.isActive = isActive !== undefined ? isActive : true
    this.createdBy = createdBy || null
    this.createdByName = createdByName || null
    this.updatedBy = updatedBy || null
    this.updatedByName = updatedByName || null
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Get type-specific label and info (overridden by subtypes)
   * @returns {{ type: string, label: string, description: string }}
   */
  getTypeInfo() {
    return {
      type: this.productType,
      label: 'Product',
      description: 'Standard product',
    }
  }

  /**
   * Check if the product is in stock
   * @returns {boolean}
   */
  isInStock() {
    return this.stockQuantity > 0
  }

  /**
   * Serialise to JSON
   */
  toJSON() {
    return {
      productId: this.productId,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      productName: this.productName,
      productType: this.productType,
      description: this.description,
      price: this.price,
      stockQuantity: this.stockQuantity,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      isInStock: this.isInStock(),
      typeInfo: this.getTypeInfo(),
      createdBy: this.createdBy,
      createdByName: this.createdByName,
      updatedBy: this.updatedBy,
      updatedByName: this.updatedByName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

/**
 * GeneralProduct — Default product type
 */
class GeneralProduct extends Product {
  constructor(data) {
    super(data)
  }

  getTypeInfo() {
    return {
      type: 'general',
      label: 'General',
      description: 'Standard gift shop product',
    }
  }
}

/**
 * HandmadeProduct — Handcrafted / artisan items
 * These may have longer lead times and unique characteristics.
 */
class HandmadeProduct extends Product {
  constructor(data) {
    super(data)
  }

  getTypeInfo() {
    return {
      type: 'handmade',
      label: 'Handmade',
      description: 'Handcrafted artisan product — may require extra processing time',
    }
  }
}

/**
 * DigitalProduct — Downloadable / digital goods
 * No shipping required.
 */
class DigitalProduct extends Product {
  constructor(data) {
    super(data)
  }

  getTypeInfo() {
    return {
      type: 'digital',
      label: 'Digital',
      description: 'Digital product — instant download, no shipping',
    }
  }
}

// ── Valid product types (aligned with DB usage) ──────────

const ProductType = Object.freeze({
  GENERAL: 'general',
  HANDMADE: 'handmade',
  DIGITAL: 'digital',
})

// ── Factory Method ──────────────────────────────────────

/**
 * ProductFactory — Factory Method Pattern
 *
 * Encapsulates the creation logic for different product subtypes.
 * The client code (service layer) calls ProductFactory.create()
 * without knowing which concrete class is being instantiated.
 */
class ProductFactory {
  /**
   * Create a Product instance of the correct subtype
   * @param {string} type - product_type from DB ('general', 'handmade', 'digital')
   * @param {Object} data - product data from DB row
   * @returns {Product} instance of the correct subtype
   */
  static create(type, data) {
    switch (type) {
      case ProductType.HANDMADE:
        return new HandmadeProduct(data)
      case ProductType.DIGITAL:
        return new DigitalProduct(data)
      case ProductType.GENERAL:
      default:
        return new GeneralProduct(data)
    }
  }
}

module.exports = {
  Product,
  GeneralProduct,
  HandmadeProduct,
  DigitalProduct,
  ProductFactory,
  ProductType,
}
