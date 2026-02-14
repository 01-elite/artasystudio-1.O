const instance = require('../config/razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment');
const User = require('../models/user');
const mongoose = require('mongoose');
const processPayment = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount) * 100, // convert to paise
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.log("RAZORPAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getKey = async (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_API_KEY,
  });
};

const paymentverification = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const userId = req.params.userId;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Fetch user once
    const user = await User.findById(userId).select("name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      name: user.name,
      email: user.email,
    });

    return res.redirect(
      `http://localhost:3000/payment-success?reference=${razorpay_payment_id}`
    );

  } catch (error) {
    console.log("VERIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { processPayment, getKey, paymentverification };
