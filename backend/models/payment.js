const mongoose=require('mongoose');

const PaymentSchema=new mongoose.Schema({
    razorpay_order_id:{
        type:String,
        required:true
    },
    razorpay_payment_id:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }

})
module.exports=mongoose.model('Payment',PaymentSchema);