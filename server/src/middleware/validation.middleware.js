const { PaymentMethod } = require('../models/order.model')

/**
 * Validation Middleware for Order endpoints
 */

/**
 * Validate create order request body
 */
function validateCreateOrder(req, res, next) {
  const errors = []
  const { customerId, customerName, email, phone, shippingAddress, items, paymentMethod } =
    req.body

  // Customer ID (UUID)
  if (!customerId || typeof customerId !== 'string' || customerId.trim().length === 0) {
    errors.push('customerId is required')
  }

  // Customer name
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
    errors.push('customerName is required')
  }

  // Email
  if (!email || typeof email !== 'string') {
    errors.push('email is required')
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('email must be a valid email address')
    }
  }

  // Phone
  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    errors.push('phone is required')
  }

  // Shipping address (can be string or object)
  if (!shippingAddress) {
    errors.push('shippingAddress is required')
  } else if (typeof shippingAddress === 'object') {
    const { street, city, state, zipCode } = shippingAddress
    if (!street) errors.push('shippingAddress.street is required')
    if (!city) errors.push('shippingAddress.city is required')
    if (!state) errors.push('shippingAddress.state is required')
    if (!zipCode) errors.push('shippingAddress.zipCode is required')
  }

  // Items
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array')
  } else {
    items.forEach((item, index) => {
      if (!item.productId) errors.push(`items[${index}].productId is required`)
      if (!item.productName) errors.push(`items[${index}].productName is required`)
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`items[${index}].quantity must be greater than 0`)
      }
      if (!item.price || item.price <= 0) {
        errors.push(`items[${index}].price must be greater than 0`)
      }
    })
  }

  // Payment method
  const validMethods = Object.values(PaymentMethod)
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    errors.push(`paymentMethod must be one of: ${validMethods.join(', ')}`)
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors,
    })
  }

  next()
}

/**
 * Validate update order request body
 */
function validateUpdateOrder(req, res, next) {
  const errors = []
  const { email, items, paymentMethod, shippingAddress } = req.body

  // If email is provided, validate format
  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('email must be a valid email address')
    }
  }

  // If items are provided, validate each
  if (items !== undefined) {
    if (!Array.isArray(items) || items.length === 0) {
      errors.push('items must be a non-empty array')
    } else {
      items.forEach((item, index) => {
        if (!item.productId) errors.push(`items[${index}].productId is required`)
        if (!item.productName) errors.push(`items[${index}].productName is required`)
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`items[${index}].quantity must be greater than 0`)
        }
        if (!item.price || item.price <= 0) {
          errors.push(`items[${index}].price must be greater than 0`)
        }
      })
    }
  }

  // If payment method is provided, validate
  if (paymentMethod !== undefined) {
    const validMethods = Object.values(PaymentMethod)
    if (!validMethods.includes(paymentMethod)) {
      errors.push(`paymentMethod must be one of: ${validMethods.join(', ')}`)
    }
  }

  // If shipping address is provided as an object, validate fields
  if (shippingAddress !== undefined && typeof shippingAddress === 'object') {
    const { street, city, state, zipCode } = shippingAddress
    if (!street) errors.push('shippingAddress.street is required')
    if (!city) errors.push('shippingAddress.city is required')
    if (!state) errors.push('shippingAddress.state is required')
    if (!zipCode) errors.push('shippingAddress.zipCode is required')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors,
    })
  }

  next()
}

/**
 * Validate order ID path parameter (UUID format)
 */
function validateOrderId(req, res, next) {
  const { id } = req.params
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order ID',
    })
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Order ID must be a valid UUID',
    })
  }

  next()
}

module.exports = {
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderId,
}
