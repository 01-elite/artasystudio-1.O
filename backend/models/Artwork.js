const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    public_id: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['Black & White', 'Colourful', 'Painting', 'Sketch'], required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isAuction: { type: Boolean, default: false },
    auctionEnd: { type: Date },
    highestBid: { type: Number, default: 0 },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isSold: { type: Boolean, default: false },
    bids: [{
        bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
        time: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Explicitly link to 'artworks' collection
module.exports = mongoose.model('Artwork', artworkSchema, 'artworks');