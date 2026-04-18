/**
 * OrderBuilder - Client-side Builder Pattern
 *
 * Mirrors the backend builder pattern.
 * Allows step-by-step construction of an order payload
 * before sending to the API.
 */
class OrderBuilder {
  constructor() {
    this._customerId = null
    this._customerName = ''
    this._email = ''
    this._phone = ''
    this._shippingAddress = { street: '', city: '', state: '', zipCode: '' }
    this._items = []
    this._giftMessage = ''
    this._paymentMethod = ''
    this._discountAmount = 0
    this._discountCode = ''
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

  setShippingAddress({ street, city, state, zipCode }) {
    this._shippingAddress = { street, city, state, zipCode }
    return this
  }

  setItems(items) {
    this._items = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: parseInt(item.quantity, 10),
      price: parseFloat(item.price),
    }))
    return this
  }

  addItem(item) {
    this._items.push({
      productId: item.productId,
      productName: item.productName,
      quantity: parseInt(item.quantity, 10),
      price: parseFloat(item.price),
    })
    return this
  }

  removeItem(productId) {
    this._items = this._items.filter((item) => item.productId !== productId)
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

  setDiscountCode(code) {
    this._discountCode = code
    return this
  }

  /**
   * Calculate total from items
   */
  getTotal() {
    const subtotal = this._items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return Math.max(0, subtotal - this._discountAmount)
  }

  /**
   * Get current state (for preview/summary)
   */
  getPreview() {
    return {
      customerName: this._customerName,
      email: this._email,
      phone: this._phone,
      shippingAddress: { ...this._shippingAddress },
      items: [...this._items],
      subtotalAmount: this._items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      discountAmount: this._discountAmount,
      totalAmount: this.getTotal(),
      giftMessage: this._giftMessage,
      paymentMethod: this._paymentMethod,
    }
  }

  /**
   * Build the final order payload for API submission
   */
  build() {
    return {
      customerId: this._customerId,
      customerName: this._customerName,
      email: this._email,
      phone: this._phone,
      shippingAddress: { ...this._shippingAddress },
      items: [...this._items],
      giftMessage: this._giftMessage,
      paymentMethod: this._paymentMethod,
      discountAmount: this._discountAmount,
      discountCode: this._discountCode,
    }
  }
}

export default OrderBuilder
