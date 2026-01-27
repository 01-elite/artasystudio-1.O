const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Artwork = require('../models/Artwork');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || user.password !== req.body.password) return res.status(401).json({ message: "Invalid credentials" });
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ✅ SOCIAL: FOLLOW/UNFOLLOW
router.put('/follow', async (req, res) => {
    const { userId, targetId } = req.body;
    try {
        const user = await User.findById(userId);
        if (user.following.includes(targetId)) {
            await User.findByIdAndUpdate(userId, { $pull: { following: targetId } });
            await User.findByIdAndUpdate(targetId, { $pull: { followers: userId } });
            res.json({ success: true, action: "unfollowed" });
        } else {
            await User.findByIdAndUpdate(userId, { $addToSet: { following: targetId } });
            await User.findByIdAndUpdate(targetId, { $addToSet: { followers: userId } });
            res.json({ success: true, action: "followed" });
        }
    } catch (err) { res.status(500).json({ message: "Follow action failed" }); }
});

router.get('/liked-details/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('likedArt');
        res.json(user.likedArt || []);
    } catch (err) { res.status(500).json({ message: "Error fetching" }); }
});

module.exports = router;