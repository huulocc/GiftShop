const { v4: uuidv4 } = require('uuid')
const { OrderStatus, PaymentMethod } = require('../models/order.model')

/**
 * In-memory data store for orders.
 * This will be replaced by a real database connection later.
 * All data is lost when the server restarts.
 */

const mockOrders = [
  {
    id: uuidv4(),
    customerName: 'Nguyen Van A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    shippingAddress: {
      street: '123 Le Loi',
      city: 'Ho Chi Minh',
      state: 'HCM',
      zipCode: '70000',
    },
    items: [
      { productId: 1, productName: 'Enamel Mug', quantity: 2, price: 20.0 },
      { productId: 4, productName: 'Birthday Card', quantity: 1, price: 6.5 },
    ],
    totalAmount: 46.5,
    giftMessage: 'Happy Birthday!',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    customerName: 'Tran Thi B',
    email: 'tranthib@email.com',
    phone: '0912345678',
    shippingAddress: {
      street: '456 Nguyen Hue',
      city: 'Ha Noi',
      state: 'HN',
      zipCode: '10000',
    },
    items: [
      { productId: 7, productName: 'Strawberry Quartz Bracelet', quantity: 1, price: 350.0 },
    ],
    totalAmount: 350.0,
    giftMessage: '',
    paymentMethod: PaymentMethod.PAYPAL,
    status: OrderStatus.PLACED,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    customerName: 'Le Van C',
    email: 'levanc@email.com',
    phone: '0923456789',
    shippingAddress: {
      street: '789 Hai Ba Trung',
      city: 'Da Nang',
      state: 'DN',
      zipCode: '50000',
    },
    items: [
      { productId: 10, productName: 'Teddy Bear Flying Rainbow Balloons', quantity: 1, price: 120.0 },
      { productId: 12, productName: 'Porcelain Balloon', quantity: 2, price: 70.0 },
    ],
    totalAmount: 260.0,
    giftMessage: 'For my little angel',
    paymentMethod: PaymentMethod.COD,
    status: OrderStatus.CANCELLED,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

module.exports = mockOrders
