const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'creator', 'buyer'], default: 'user' },
    profilePic: { type: String, default: '' },
    bio: { type: String, default: 'Digital Artist & Curator' },
    likedArt: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }], 
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }]
}, { timestamps: true });

const User=mongoose.models.User || mongoose.model("User", userSchema)

module.exports = User;
