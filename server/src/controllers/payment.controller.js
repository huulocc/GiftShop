const orderService = require('../services/order.service')
const paymentService = require('../services/payment.service')

class PaymentController {
  async createPayment(req, res) {
    try {
      const { orderId, paymentMethod } = req.body
      if (!orderId) {
        return res.status(400).json({ success: false, error: 'orderId is required' })
      }

      const order = await orderService.getOrderById(orderId)
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' })
      }

      if (req.session?.user?.roleCode === 'customer' && req.session.user.userId !== order.customerId) {
        return res.status(403).json({ success: false, error: 'Access denied for this order' })
      }

      const data = await paymentService.createPayment(order, paymentMethod)
      return res.status(200).json({
        success: true,
        message: 'Payment initialized',
        data,
      })
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to initialize payment',
      })
    }
  }

  async handleReturn(req, res) {
    try {
      const resultCode = Number(req.query.resultCode || 0)
      const payload = {
        orderId: req.query.orderId || '',
        requestId: req.query.requestId || '',
        transId: req.query.transId || '',
        amount: req.query.amount || '',
        paymentMethod: req.query.paymentMethod || 'momo',
        paymentStatus: resultCode === 0 ? 'completed' : 'failed',
        resultCode,
        message: req.query.message || '',
      }

      return res.status(200).json({ success: true, data: payload })
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to process return' })
    }
  }

  async handleIpn(req, res) {
    try {
      const result = await paymentService.handleMoMoIpn(req.body || {})
      return res.status(200).json(result)
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        resultCode: 1001,
        message: error.message || 'IPN processing failed',
      })
    }
  }
}

module.exports = new PaymentController()
