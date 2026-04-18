const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/payment.controller')
const { requireAuth } = require('../middleware/auth.middleware')

router.post('/create', requireAuth, (req, res) => paymentController.createPayment(req, res))
router.get('/return', (req, res) => paymentController.handleReturn(req, res))
router.post('/ipn', (req, res) => paymentController.handleIpn(req, res))

module.exports = router
