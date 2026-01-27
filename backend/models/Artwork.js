const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
        type: String, 
        enum: ['Black & White', 'Colourful', 'Painting', 'Sketch'], 
        required: true 
    },
    description: { type: String },
    isCustomizable: { type: Boolean, default: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Artwork', artworkSchema);