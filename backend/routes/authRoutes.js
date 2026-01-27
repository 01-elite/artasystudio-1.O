const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "User exists" });
        const newUser = await User.create({ name, email, password, role: 'user' });
        res.status(201).json(newUser);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/update-role', async (req, res) => {
    try {
        const { userId, newRole } = req.body;
        const updated = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// backend/routes/authRoutes.js

// FOLLOW/UNFOLLOW LOGIC
router.put('/follow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;
        
        // 1. Add follower to the Creator's list
        const creator = await User.findByIdAndUpdate(followingId, 
            { $addToSet: { followers: followerId } }, { new: true });
            
        // 2. Add creator to the User's following list
        const user = await User.findByIdAndUpdate(followerId, 
            { $addToSet: { following: followingId } }, { new: true });

        res.json({ creator, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// backend/routes/authRoutes.js

// FETCH FOLLOWER DETAILS
router.get('/followers/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('followers', 'name email');
        res.json(user.followers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// backend/routes/authRoutes.js

// Add art to user's liked list (Wishlist)
router.put('/like-art', async (req, res) => {
    try {
        const { userId, artId } = req.body;
        
        // Use $addToSet so the same art isn't added twice
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { $addToSet: { likedArt: artId } }, 
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Could not save like" });
    }
});

// backend/routes/authRoutes.js

// FETCH FULL DETAILS FOR LIKED ART
router.get('/liked-details/:userId', async (req, res) => {
    try {
        // We find the user and 'populate' the likedArt array with full image/title data
        const user = await User.findById(req.params.userId).populate('likedArt');
        
        if (!user) return res.status(404).json({ message: "User not found" });
        
        // Return the full array of art objects
        res.json(user.likedArt || []);
    } catch (err) {
        res.status(500).json({ message: "Error fetching wishlist" });
    }
});
module.exports = router;
