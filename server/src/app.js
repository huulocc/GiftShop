const express = require('express')
const cors = require('cors')
const orderRoutes = require('./routes/order.routes')
const cartRoutes = require('./routes/cart.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api', (req, res) => {
  res.json({ message: 'Backend Node.js is running' })
})

// Order routes
app.use('/api/orders', orderRoutes)

// Cart routes
app.use('/api/cart', cartRoutes)

module.exports = app