const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Artwork = require('../models/Artwork');

router.post('/register', async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || user.password !== req.body.password) return res.status(401).json({ message: "Invalid credentials" });
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ✅ ADDED: Liked details route to fix 404 on Profile
router.get('/liked-details/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('likedArt');
        res.json(user.likedArt || []);
    } catch (err) { res.status(500).json({ message: "Error fetching wishlist" }); }
});

router.put('/like-art', async (req, res) => {
    try {
        const { userId, artId } = req.body;
        const user = await User.findById(userId);
        const isLiked = user.likedArt.includes(artId);
        
        if (isLiked) {
            const updated = await User.findByIdAndUpdate(userId, { $pull: { likedArt: artId } }, { new: true });
            await Artwork.findByIdAndUpdate(artId, { $inc: { likes: -1 } });
            res.json(updated);
        } else {
            const updated = await User.findByIdAndUpdate(userId, { $addToSet: { likedArt: artId } }, { new: true });
            await Artwork.findByIdAndUpdate(artId, { $inc: { likes: 1 } });
            res.json(updated);
        }
    } catch (err) { res.status(500).json({ message: "Action failed" }); }
});
// backend/routes/authRoutes.js

// ✅ UPDATED: Fetching full follower details for the Dashboard
router.get('/followers/:userId', async (req, res) => {
    try {
        // Find the user and "populate" the followers array with their Name and Email
        const user = await User.findById(req.params.userId).populate('followers', 'name email');
        
        if (!user) return res.status(404).json({ message: "User not found" });
        
        // Return only the followers array
        res.json(user.followers || []);
    } catch (err) {
        res.status(500).json({ message: "Error fetching community" });
    }
});
module.exports = router;