
const express = require('express');
const router = express.Router();
const { 
    processPayment, 
    getKey, 
    paymentverification, 
    getAllPayments // ✅ New controller function
} = require('../controller/productController');

router.route('/payment/process').post(processPayment).get(getAllPayments); // ✅ Added GET here
router.route('/getkey').get(getKey);
router.route('/payment-success/:userId').post(paymentverification);

module.exports = { paymentRoutes: router };