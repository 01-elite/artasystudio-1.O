const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to update full profile info (Username, Categories, Phone, etc.)
router.put('/update-address/:userId', async (req, res) => {
    try {
        const { username, role, categoryPreferences, address } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { 
                $set: { 
                    username: username,
                    role: role,
                    categoryPreferences: categoryPreferences,
                    address: address 
                } 
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json(updatedUser);
    } catch (err) {
        console.error("Update Error:", err);
        if (err.code === 11000) return res.status(400).json({ message: "Username already taken." });
        res.status(500).json({ message: "Update failed" });
    }
});

// Purane routes (Login/Register) ko mat bhulna agar wo isi file mein the:
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

router.get('/followers/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('followers', 'name email');
        res.json(user.followers || []);
    } catch (err) { res.status(500).json({ message: "Error fetching community" }); }
});

router.get('/liked-details/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('likedArt');
        res.json(user.likedArt || []);
    } catch (err) { res.status(500).json({ message: "Error fetching" }); }
});

module.exports = router;