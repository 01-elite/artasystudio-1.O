const express = require('express');
const router = express.Router();
const { 
    processPayment, 
    getKey, 
    paymentverification, 
    getAllPayments 
} = require('../controller/productController');

// Define routes clearly
router.post('/payment/process', processPayment);
router.get('/payment/process', getAllPayments);
router.get('/getkey', getKey);

// Use the specific userId parameter your controller expects
router.post('/payment-success/:userId', paymentverification);

module.exports = { paymentRoutes: router };