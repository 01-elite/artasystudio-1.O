const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    amount: { type: Number, required: true },
    artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        phone: { type: String, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);