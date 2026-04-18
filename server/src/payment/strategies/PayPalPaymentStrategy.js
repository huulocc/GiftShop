const PaymentStrategy = require('./PaymentStrategy')

class PayPalPaymentStrategy extends PaymentStrategy {
  async pay({ order }) {
    const returnBase = process.env.PAYPAL_REDIRECT_URL || 'http://localhost:3000/payments/return'
    const params = new URLSearchParams({
      orderId: order.orderId,
      requestId: `paypal-${Date.now()}`,
      paymentMethod: 'paypal',
      paymentStatus: 'completed',
      amount: String(order.totalAmount),
    })

    return {
      method: 'paypal',
      status: 'ready',
      payUrl: `${returnBase}?${params.toString()}`,
      paymentMethod: 'paypal',
      paymentStatus: 'completed',
      amount: order.totalAmount,
      orderId: order.orderId,
    }
  }
}

module.exports = PayPalPaymentStrategy
