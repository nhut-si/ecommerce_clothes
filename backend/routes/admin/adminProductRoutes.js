const express = require('express');
const product = require('../../models/Product')
const { protect, admin } = require('../../middleware/authMiddleware');
const Product = require('../../models/Product');
const router = express.Router()

// @route GET /api/admin/products
// @desc Get all products (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    try {
    const products = await Product.find({})
    res.json(products)        
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
})

module.exports = router