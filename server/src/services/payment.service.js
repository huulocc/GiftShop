const { OrderStatus } = require('../models/order.model')
const orderService = require('./order.service')
const momoClient = require('../payment/momo.client')
const CashPaymentStrategy = require('../payment/strategies/CashPaymentStrategy')
const CreditCardPaymentStrategy = require('../payment/strategies/CreditCardPaymentStrategy')
const PayPalPaymentStrategy = require('../payment/strategies/PayPalPaymentStrategy')

class PaymentService {
  constructor() {
    this.strategyRegistry = {
      cash: new CashPaymentStrategy(),
      credit_card: new CreditCardPaymentStrategy(),
      paypal: new PayPalPaymentStrategy(),
      bank_transfer: new CashPaymentStrategy(),
    }
  }

  _resolveStrategy(paymentMethod) {
    const strategy = this.strategyRegistry[paymentMethod]
    if (!strategy) {
      const err = new Error(`Unsupported payment method: ${paymentMethod}`)
      err.statusCode = 400
      throw err
    }
    return strategy
  }

  async createPayment(order, paymentMethod) {
    if (!order) {
      const err = new Error('Order not found')
      err.statusCode = 404
      throw err
    }

    const method = paymentMethod || order.paymentMethodSelected
    const strategy = this._resolveStrategy(method)
    return strategy.pay({ order })
  }

  async handleMoMoIpn(payload) {
    if (!momoClient.isConfigured()) {
      return { resultCode: 0, message: 'MoMo not configured. Skip IPN handling.' }
    }

    const signatureValid = momoClient.verifyIpnSignature(payload)
    if (!signatureValid) {
      const err = new Error('Invalid MoMo signature')
      err.statusCode = 400
      throw err
    }

    const paymentSucceeded = Number(payload.resultCode) === 0
    if (paymentSucceeded && payload.orderId) {
      const order = await orderService.getOrderById(payload.orderId)
      if (order && order.status !== OrderStatus.PAID) {
        if (order.status === OrderStatus.PENDING) {
          await orderService.updateOrderStatus(payload.orderId, OrderStatus.PLACED)
          await orderService.updateOrderStatus(payload.orderId, OrderStatus.PAID)
        } else if (order.status === OrderStatus.PLACED) {
          await orderService.updateOrderStatus(payload.orderId, OrderStatus.PAID)
        }
      }
    }

    return { resultCode: 0, message: 'IPN processed' }
  }
}

module.exports = new PaymentService()
