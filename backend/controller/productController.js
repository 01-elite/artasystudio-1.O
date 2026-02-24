const instance = require('../config/razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment');
const User = require('../models/User');

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
    
    // Extract artworkId from the URL query string
    const artworkId = req.query.artworkId; 

    console.log("Verifying Payment for User:", userId, "Artwork:", artworkId);

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        console.log("Signature Mismatch!");
        return res.redirect(`http://localhost:3000/payment-fail`);
    }

    const orderDetails = await instance.orders.fetch(razorpay_order_id);

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).send("User not found");
    }
    
    const shippingAddress = {
        street: user.address?.street || "Not Provided",
        city: user.address?.city || "Not Provided",
        state: user.address?.state || "Not Provided",
        pincode: user.address?.pincode || "000000",
        phone: user.address?.phone || "0000000000"
    };

    // SAVE TO MONGO DB
    // artworkId is now saved so the Admin Panel can credit the correct creator
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      amount: orderDetails.amount, 
      artworkId: artworkId, 
      name: user.name,
      email: user.email,
      address: shippingAddress 
    });

    console.log("Payment Saved. Revenue attributed to Artwork:", artworkId);
    return res.redirect(`http://localhost:3000/payment-success?reference=${razorpay_payment_id}`);

  } catch (error) {
    console.error("CRITICAL PAYMENT ERROR:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { processPayment, getKey, paymentverification, getAllPayments };