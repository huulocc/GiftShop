const express = require('express')
const cors = require('cors')
const session = require('express-session')
const orderRoutes = require('./routes/order.routes')
const cartRoutes = require('./routes/cart.routes')
const authRoutes = require('./routes/auth.routes')
const categoryRoutes = require('./routes/category.routes')
const productRoutes = require('./routes/product.routes')

const app = express()

// CORS — allow credentials (cookies) from the React dev server
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())

// Session middleware (server-side, cookie-based)
app.use(session({
  secret: process.env.SESSION_SECRET || 'giftshop_dev_fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,          // set true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
  },
}))

app.get('/api', (req, res) => {
  res.json({ message: 'Backend Node.js is running' })
})

// Auth routes
app.use('/api/auth', authRoutes)

// Order routes
app.use('/api/orders', orderRoutes)

// Cart routes
app.use('/api/cart', cartRoutes)

// Category routes
app.use('/api/categories', categoryRoutes)

// Product routes
app.use('/api/products', productRoutes)

module.exports = app