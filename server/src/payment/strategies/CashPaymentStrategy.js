const PaymentStrategy = require('./PaymentStrategy')

class CashPaymentStrategy extends PaymentStrategy {
  async pay({ order }) {
    return {
      method: 'cash',
      status: 'pending',
      message: 'Cash payment selected. Customer will pay on delivery.',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      amount: order.totalAmount,
      orderId: order.orderId,
    }
  }
}

module.exports = CashPaymentStrategy
