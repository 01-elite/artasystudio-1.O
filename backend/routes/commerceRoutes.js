const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// Send Message/Commission Request
router.post('/message', protect, async (req, res) => {
    const { receiverId, content, isCommission } = req.body;
    const newMessage = await Message.create({
        sender: req.user.id,
        receiver: receiverId,
        content,
        isCommissionRequest: isCommission
    });
    res.status(201).json(newMessage);
});

// Placeholder for Stripe/Razorpay logic
router.post('/checkout', protect, async (req, res) => {
    // This is where you'd integrate the Stripe API secret
    res.json({ message: "Checkout session initialized", url: "https://stripe.com/demo" });
});

module.exports = router;