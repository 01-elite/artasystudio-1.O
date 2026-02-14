const instance = require('../config/razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment');
const User = require('../models/user');

const processPayment = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount) * 100, 
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getKey = async (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
};

const paymentverification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.params.userId;

    // Razorpay sends 'notes' in the body during a callback_url redirect
    // We parse it safely so the validation doesn't fail
    const addressData = req.body.address ? JSON.parse(req.body.address) : null;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        // Instead of a black screen, send them to a failure page on the frontend
        return res.redirect(`http://localhost:3000/payment-fail`);
    }

    const user = await User.findById(userId);
    
    // ✅ SAVE TO MONGO DB
    // We use the address from the user profile if the note is missing
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      name: user.name,
      email: user.email,
      address: addressData || user.address // Fallback to saved profile address
    });

    // ✅ REDIRECT TO FRONTEND (This stops the JSON screen)
    return res.redirect(`http://localhost:3000/payment-success?reference=${razorpay_payment_id}`);

  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// ✅ Add this to the bottom of productController.js
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Make sure to add getAllPayments to the module.exports at the very bottom
module.exports = { processPayment, getKey, paymentverification, getAllPayments };

