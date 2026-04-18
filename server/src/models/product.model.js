/**
 * Product Model + Factory Method Pattern
 *
 * Implements the Factory Method design pattern to create
 * different product subtypes based on `product_type`.
 *
 * Class hierarchy:
 *   Product (base)
 *   ├── BookProduct
 *   ├── ClothesProduct
 *   └── ElectronicsProduct
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
    this.productType = productType || 'book'
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
 * BookProduct
 */
class BookProduct extends Product {
  constructor(data) {
    super(data)
  }

  getTypeInfo() {
    return {
      type: 'book',
      label: 'Book',
      description: 'Book and printed publication items',
    }
  }
}

/**
 * ClothesProduct
 */
class ClothesProduct extends Product {
  constructor(data) {
    super(data)
  }

  getTypeInfo() {
    return {
      type: 'clothes',
      label: 'Clothes',
      description: 'Wearable items such as shirts, jackets, and accessories',
    }
  }
}

/**
 * ElectronicsProduct
 */
class ElectronicsProduct extends Product {
  constructor(data) {
    super(data)
  }

  getTypeInfo() {
    return {
      type: 'electronics',
      label: 'Electronics',
      description: 'Electronic devices and smart accessories',
    }
  }
}

// ── Valid product types (aligned with DB usage) ──────────

const ProductType = Object.freeze({
  BOOK: 'book',
  CLOTHES: 'clothes',
  ELECTRONICS: 'electronics',
})

const LEGACY_TYPE_ALIAS = Object.freeze({
  general: ProductType.BOOK,
  handmade: ProductType.CLOTHES,
  digital: ProductType.ELECTRONICS,
})

function normalizeProductType(type) {
  const normalized = (type || '').toString().trim().toLowerCase()
  if (!normalized) return ProductType.BOOK
  if (Object.values(ProductType).includes(normalized)) return normalized
  if (LEGACY_TYPE_ALIAS[normalized]) return LEGACY_TYPE_ALIAS[normalized]
  return ProductType.BOOK
}

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
   * @param {string} type - product_type from DB/input
   * @param {Object} data - product data from DB row
   * @returns {Product} instance of the correct subtype
   */
  static create(type, data) {
    const normalizedType = normalizeProductType(type)
    const normalizedData = {
      ...data,
      productType: normalizedType,
    }

    switch (normalizedType) {
      case ProductType.CLOTHES:
        return new ClothesProduct(normalizedData)
      case ProductType.ELECTRONICS:
        return new ElectronicsProduct(normalizedData)
      case ProductType.BOOK:
      default:
        return new BookProduct(normalizedData)
    }
  }
}

module.exports = {
  Product,
  BookProduct,
  ClothesProduct,
  ElectronicsProduct,
  ProductFactory,
  ProductType,
  normalizeProductType,
}
