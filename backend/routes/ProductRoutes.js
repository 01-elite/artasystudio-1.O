const express=require('express');
const PaymentSchema=require('../models/payment');
const router=express.Router();
const {processPayment, getKey, paymentverification}=require('../controller/productController');

router.route('/payment/process').post(processPayment);
router.route('/getkey').get(getKey)
router.route('/payment-success/:userId').post(paymentverification);
module.exports={paymentRoutes:router};