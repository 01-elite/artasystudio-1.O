const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const multer = require('multer');

// Configure Image Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ 1. EXPLORE ROUTE (This was missing!)
// This is what the Explore page calls to see the gallery
// Change your explore route to this:
router.get('/explore', async (req, res) => {
    try {
        // .populate('creator') is the magic that fetches the Name and ID of the artist
        const artworks = await Artwork.find().populate('creator', 'name followers').sort({ likes: -1, createdAt: -1 });
        res.json(artworks);
    } catch (err) {
        res.status(500).json({ message: "Explore fetch failed" });
    }
});
// 2. UPLOAD ROUTE
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { title, price, description, category, creatorId } = req.body;
        const newArt = await Artwork.create({
            title,
            price,
            description,
            category,
            creator: creatorId, 
            image: `http://localhost:5001/uploads/${req.file.filename}`,
            views: 0,
            likes: 0
        });
        res.status(201).json(newArt);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. PROFILE FETCH ROUTE
router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Artwork.find({ creator: req.params.userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;