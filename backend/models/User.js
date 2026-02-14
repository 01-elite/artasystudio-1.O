const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'creator', 'buyer'], default: 'user' },
    // ✅ Store address here so it's saved forever
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        phone: { type: String, default: '' }
    },
    profilePic: { type: String, default: '' },
    bio: { type: String, default: 'Digital Artist & Curator' },
    likedArt: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }], 
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;