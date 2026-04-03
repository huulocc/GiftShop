const { v4: uuidv4 } = require('uuid')

/**
 * Order Status Constants
 */
const OrderStatus = Object.freeze({
  PENDING: 'pending',
  PLACED: 'placed',
  CANCELLED: 'cancelled',
})

/**
 * Payment Method Constants
 */
const PaymentMethod = Object.freeze({
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  COD: 'cod',
})

/**
 * Order Model
 * Represents a complete order entity
 */
class Order {
  constructor({
    id,
    customerName,
    email,
    phone,
    shippingAddress,
    items,
    totalAmount,
    giftMessage,
    paymentMethod,
    status,
    createdAt,
    updatedAt,
  }) {
    this.id = id || uuidv4()
    this.customerName = customerName
    this.email = email
    this.phone = phone
    this.shippingAddress = shippingAddress || {}
    this.items = items || []
    this.totalAmount = totalAmount || 0
    this.giftMessage = giftMessage || ''
    this.paymentMethod = paymentMethod
    this.status = status || OrderStatus.PENDING
    this.createdAt = createdAt || new Date().toISOString()
    this.updatedAt = updatedAt || new Date().toISOString()
  }

  toJSON() {
    return {
      id: this.id,
      customerName: this.customerName,
      email: this.email,
      phone: this.phone,
      shippingAddress: this.shippingAddress,
      items: this.items,
      totalAmount: this.totalAmount,
      giftMessage: this.giftMessage,
      paymentMethod: this.paymentMethod,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

/**
 * OrderBuilder - Builder Pattern
 * Allows step-by-step construction of an Order object.
 * Separates construction logic from the Order representation.
 */
class OrderBuilder {
  constructor() {
    this._customerName = ''
    this._email = ''
    this._phone = ''
    this._shippingAddress = {}
    this._items = []
    this._giftMessage = ''
    this._paymentMethod = ''
  }

  setCustomerName(name) {
    this._customerName = name
    return this
  }

  setEmail(email) {
    this._email = email
    return this
  }

  setPhone(phone) {
    this._phone = phone
    return this
  }

  setShippingAddress({ street, city, state, zipCode }) {
    this._shippingAddress = { street, city, state, zipCode }
    return this
  }

  setItems(items) {
    this._items = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: parseFloat(item.price),
    }))
    return this
  }

  setGiftMessage(message) {
    this._giftMessage = message
    return this
  }

  setPaymentMethod(method) {
    this._paymentMethod = method
    return this
  }

  /**
   * Calculate total amount from items
   */
  _calculateTotal() {
    return this._items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  /**
   * Build and return the Order instance
   */
  build() {
    const totalAmount = this._calculateTotal()

    return new Order({
      customerName: this._customerName,
      email: this._email,
      phone: this._phone,
      shippingAddress: this._shippingAddress,
      items: this._items,
      totalAmount,
      giftMessage: this._giftMessage,
      paymentMethod: this._paymentMethod,
      status: OrderStatus.PENDING,
    })
  }
}

module.exports = { Order, OrderBuilder, OrderStatus, PaymentMethod }
