const express = require("express");
const router = express.Router();
const subscriberSchema = require("../models/Subscriber");

// @routr POST /api/subscriber
// @desc Handle newsletter subscription
// @access public
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide an email address" });
  }

  try {
    // Check if the email already subscribed
    let subscriber = await subscriberSchema.findOne({ email });
    if (subscriber) {
      return res.status(400).json({ message: "You are already subscribed" });
    }

    // Create a new subscriber
    subscriber = new subscriberSchema({ email });
    await subscriber.save();

    res.status(201).json({ message: "You have been subscribed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;