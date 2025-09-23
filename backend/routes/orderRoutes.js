const express = require("express");
const Cart = require("../models/Cart");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

const router = express.Router();

// @route GET /api/orders/my-orders
// @desc Get logged-in user's orders
// @access private
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    }); // sort by most recent orders
    console.log("Orders found:", orders);
    res.json(orders);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// @route GET /api/orders/:id
// @desc Get order details by ID
// @access private
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",   
      "name email"  
    );
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    // return the null orders

    res.json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;