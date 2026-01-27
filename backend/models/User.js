const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Fixed: Added 'buyer' to enum to match your auth logic
    role: { type: String, enum: ['user', 'creator', 'buyer'], default: 'user' },
    profilePic: { type: String, default: '' },
    bio: { type: String, default: 'Digital Artist & Curator' },
    // REQUIRED: This is why your "likes" weren't saving properly
    likedArt: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }], 
    // Social Metrics
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);