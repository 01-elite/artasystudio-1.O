const mongoose= require('mongoose');
const AnalyticsSchema = new mongoose.Schema({
    price:{type:Number, required:true},
    city:{type:String, required:true},
    state:{type:String, required:true},
    year:{type:Number, required:true},
    month:{type:Number, required:true},
    categories:{type:String,required:true},
})

module.exports = mongoose.model('Analytics', AnalyticsSchema);