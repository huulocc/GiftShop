const PaymentStrategy = require('./PaymentStrategy')
const momoClient = require('../momo.client')

class CreditCardPaymentStrategy extends PaymentStrategy {
  async pay({ order }) {
    const exchangeRate = Number(process.env.MOMO_VND_EXCHANGE_RATE || 25000)
    const orderTotal = Number(order.totalAmount || 0)

    // Catalog prices are in USD; MoMo requires amount in VND integer.
    const momoAmountVnd = Math.round(orderTotal * exchangeRate)

    const momoResponse = await momoClient.createPayment({
      orderId: order.orderId,
      amount: momoAmountVnd,
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
    })

    if (momoResponse.resultCode !== 0) {
      const err = new Error(momoResponse.message || 'Cannot create MoMo payment')
      err.statusCode = 400
      throw err
    }

    return {
      method: 'credit_card',
      status: 'ready',
      provider: 'momo',
      payUrl: momoResponse.payUrl,
      deeplink: momoResponse.deeplink,
      qrCodeUrl: momoResponse.qrCodeUrl,
      requestId: momoResponse.requestId,
      orderId: momoResponse.orderId || order.orderId,
      amount: momoAmountVnd,
      originalAmount: orderTotal,
      currency: 'VND',
      originalCurrency: 'USD',
      exchangeRate,
      paymentMethod: 'momo',
      paymentStatus: 'pending',
      raw: momoResponse,
    }
  }
}

module.exports = CreditCardPaymentStrategy
