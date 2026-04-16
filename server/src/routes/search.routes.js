const express = require('express')
const searchController = require('../controllers/search.controller')

const router = express.Router()

/**
 * Global Search Routes
 * 
 * GET /api/search?q=keyword
 * Public search for categories and products.
 */
router.get('/', (req, res) => searchController.search(req, res))

module.exports = router
