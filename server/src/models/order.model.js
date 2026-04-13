const { v4: uuidv4 } = require('uuid')

/**
 * Order Status Constants
 * Aligned with DB CHECK constraint: 'pending', 'placed', 'paid', 'cancelled', 'completed'
 */
const OrderStatus = Object.freeze({
  PENDING: 'pending',
  PLACED: 'placed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
})

/**
 * Payment Method Constants
 * Aligned with DB CHECK constraint: 'cash', 'credit_card', 'paypal', 'bank_transfer'
 */
const PaymentMethod = Object.freeze({
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
})

/**
 * Generate a unique order number in format ORD-YYYYMMDD-XXXXX
 */
function generateOrderNumber() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `ORD-${date}-${random}`
}

/**
 * Order Model
 * Represents a complete order entity aligned with the DB schema
 */
class Order {
  constructor({
    orderId,
    orderNumber,
    customerId,
    staffId,
    status,
    orderDate,
    customerNameSnapshot,
    customerEmailSnapshot,
    customerPhoneSnapshot,
    shippingAddressSnapshot,
    note,
    giftMessage,
    paymentMethodSelected,
    subtotal,
    discountAmount,
    totalAmount,
    items,
    createdAt,
    updatedAt,
  }) {
    this.orderId = orderId || uuidv4()
    this.orderNumber = orderNumber || generateOrderNumber()
    this.customerId = customerId
    this.staffId = staffId || null
    this.status = status || OrderStatus.PENDING
    this.orderDate = orderDate || new Date().toISOString()
    this.customerNameSnapshot = customerNameSnapshot
    this.customerEmailSnapshot = customerEmailSnapshot
    this.customerPhoneSnapshot = customerPhoneSnapshot || null
    this.shippingAddressSnapshot = shippingAddressSnapshot || null
    this.note = note || null
    this.giftMessage = giftMessage || null
    this.paymentMethodSelected = paymentMethodSelected
    this.subtotal = subtotal || 0
    this.discountAmount = discountAmount || 0
    this.totalAmount = totalAmount || 0
    this.items = items || []
    this.createdAt = createdAt || new Date().toISOString()
    this.updatedAt = updatedAt || new Date().toISOString()
  }

  toJSON() {
    return {
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      customerId: this.customerId,
      staffId: this.staffId,
      status: this.status,
      orderDate: this.orderDate,
      customerNameSnapshot: this.customerNameSnapshot,
      customerEmailSnapshot: this.customerEmailSnapshot,
      customerPhoneSnapshot: this.customerPhoneSnapshot,
      shippingAddressSnapshot: this.shippingAddressSnapshot,
      note: this.note,
      giftMessage: this.giftMessage,
      paymentMethodSelected: this.paymentMethodSelected,
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      totalAmount: this.totalAmount,
      items: this.items,
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
    this._customerId = null
    this._customerName = ''
    this._email = ''
    this._phone = ''
    this._shippingAddress = null
    this._items = []
    this._note = ''
    this._giftMessage = ''
    this._paymentMethod = ''
    this._discountAmount = 0
  }

  setCustomerId(id) {
    this._customerId = id
    return this
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

  setShippingAddress(address) {
    this._shippingAddress = typeof address === 'string' ? address : JSON.stringify(address)
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

  setNote(note) {
    this._note = note
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

  setDiscountAmount(amount) {
    this._discountAmount = parseFloat(amount) || 0
    return this
  }

  /**
   * Calculate subtotal from items
   */
  _calculateSubtotal() {
    return this._items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  /**
   * Build and return the Order instance
   */
  build() {
    const subtotal = this._calculateSubtotal()
    const totalAmount = subtotal - this._discountAmount

    return new Order({
      customerId: this._customerId,
      customerNameSnapshot: this._customerName,
      customerEmailSnapshot: this._email,
      customerPhoneSnapshot: this._phone,
      shippingAddressSnapshot: this._shippingAddress,
      items: this._items,
      note: this._note,
      giftMessage: this._giftMessage,
      paymentMethodSelected: this._paymentMethod,
      subtotal,
      discountAmount: this._discountAmount,
      totalAmount,
      status: OrderStatus.PENDING,
    })
  }
}

module.exports = { Order, OrderBuilder, OrderStatus, PaymentMethod, generateOrderNumber }
