const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/explore', async (req, res) => {
    try {
        const artworks = await Artwork.find().populate('creator', 'name').sort({ createdAt: -1 });
        res.json(artworks);
    } catch (err) { res.status(500).json({ message: "Explore fetch failed" }); }
});

// ✅ NEW: Bidding Route
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
                $set: { highestBid: amount },
                $push: { bids: { bidder: userId, amount: amount } }
            },
            { new: true }
        ).populate('bids.bidder', 'name');

        res.json(updatedArt);
    } catch (err) { res.status(500).json({ message: "Bidding failed" }); }
});

router.put('/view/:artId', async (req, res) => {
    try {
        await Artwork.findByIdAndUpdate(req.params.artId, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Error updating views" }); }
});

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { title, price, description, category, creatorId, isAuction } = req.body;
        const newArt = await Artwork.create({
            title, price, description, category,
            creator: creatorId, 
            isAuction: isAuction === 'true',
            highestBid: isAuction === 'true' ? price : 0,
            image: `http://localhost:5001/uploads/${req.file.filename}`
        });
        res.status(201).json(newArt);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Artwork.find({ creator: req.params.userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;