const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Artwork = require('../models/Artwork');

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || user.password !== req.body.password) return res.status(401).json({ message: "Invalid credentials" });
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. SOCIAL: FOLLOW/UNFOLLOW
router.put('/follow', async (req, res) => {
    const { userId, targetId } = req.body;
    
    // Prevent self-following
    if (userId === targetId) return res.status(400).json({ message: "You cannot follow yourself" });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isFollowing = user.following.includes(targetId);

        if (isFollowing) {
            // UNFOLLOW Logic
            await User.findByIdAndUpdate(userId, { $pull: { following: targetId } });
            await User.findByIdAndUpdate(targetId, { $pull: { followers: userId } });
            res.json({ success: true, action: "unfollowed" });
        } else {
            // FOLLOW Logic
            await User.findByIdAndUpdate(userId, { $addToSet: { following: targetId } });
            await User.findByIdAndUpdate(targetId, { $addToSet: { followers: userId } });
            res.json({ success: true, action: "followed" });
        }
    } catch (err) { 
        res.status(500).json({ message: "Follow action failed" }); 
    }
});

// 4. GET LIKED DETAILS
router.get('/liked-details/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('likedArt');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.likedArt || []);
    } catch (err) { res.status(500).json({ message: "Error fetching" }); }
});

// 5. GET FOLLOWERS (Populated for Dashboard)
router.get('/followers/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('followers', 'name email');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.followers || []);
    } catch (err) {
        res.status(500).json({ message: "Error fetching community" });
    }
});

module.exports = router;