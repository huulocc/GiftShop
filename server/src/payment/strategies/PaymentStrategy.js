class PaymentStrategy {
  async pay() {
    throw new Error('pay() must be implemented by subclass')
  }
}

module.exports = PaymentStrategy
