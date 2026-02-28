const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// 1. Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'artworks',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage });

// 2. Fetch All Art (Explore)
router.get('/explore', async (req, res) => {
    try {
        const artworks = await Artwork.find().populate('creator', 'name').sort({ createdAt: -1 });
        res.json(artworks);
    } catch (err) { 
        res.status(500).json({ message: "Explore fetch failed" }); 
    }
});

// 3. Upload Art (FIXED: Validation & public_id mapping)
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const { title, price, description, category, creatorId, isAuction, auctionEnd } = req.body;

        const newArt = await Artwork.create({
            title,
            price: Number(price),
            description,
            category,
            creator: creatorId,
            isAuction: isAuction === 'true',
            // Conversion logic for dates
            auctionEnd: isAuction === 'true' && auctionEnd ? new Date(auctionEnd) : null,
            highestBid: isAuction === 'true' ? Number(price) : 0,
            
            // ✅ FIX: Capture the ID from either 'filename' or 'public_id'
            // Added a timestamp fallback to prevent the "Path public_id is required" error
            image: req.file.path,
            public_id: req.file.filename || req.file.public_id || `art_${Date.now()}` 
        });

        res.status(201).json(newArt);
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(400).json({ message: err.message });
    }
});

// 4. Bidding Logic
router.put('/bid/:artId', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const art = await Artwork.findById(req.params.artId);

        if (amount <= art.highestBid) {
            return res.status(400).json({ message: "Bid must be higher than current highest bid" });
        }

        const updatedArt = await Artwork.findByIdAndUpdate(
            req.params.artId,
            { 
                $set: { highestBid: amount, highestBidder: userId },
                $push: { bids: { bidder: userId, amount: amount } }
            },
            { new: true }
        ).populate('bids.bidder', 'name');

        res.json(updatedArt);
    } catch (err) { 
        res.status(500).json({ message: "Bidding failed" }); 
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Artwork.find({ creator: req.params.userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

module.exports = router;