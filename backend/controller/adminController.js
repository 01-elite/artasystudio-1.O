const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Payment = require('../models/payment');

const getAdminStats = async (req, res) => {
    try {
        const users = await User.find({}).lean(); 
        const artworks = await Artwork.find({}).lean();
        const payments = await Payment.find({}).lean();

        const globalRevenue = (payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)) / 100;

        const userAnalytics = users.map(user => {
            // All artworks created by this user
            const userPosts = artworks.filter(art => 
                art.creator && art.creator.toString() === user._id.toString()
            );
            
            // REVENUE EARNED: Sum of payments for artworks where this user is the creator
            const revenueAsCreator = payments.reduce((acc, p) => {
                // Check if this payment's artwork belongs to the current user
                // We match by artworkId (if stored in payment) or by finding the art title/price
                const isUsersArt = artworks.some(art => 
                    art._id.toString() === p.artworkId?.toString() && 
                    art.creator?.toString() === user._id.toString()
                );

                if (isUsersArt) {
                    return acc + (Number(p.amount) || 0);
                }
                return acc;
            }, 0) / 100;

            return {
                _id: user._id,
                name: user.name || "Anonymous",
                email: user.email,
                role: user.role || "user",
                address: user.address || {},
                followersCount: user.followers?.length || 0,
                postsCount: userPosts.length,
                totalLikes: userPosts.reduce((acc, art) => acc + (art.likes || 0), 0),
                revenueGenerated: revenueAsCreator, // Now shows earnings, not spending
                joinedAt: user.createdAt || new Date()
            };
        });

        res.status(200).json({
            globalStats: {
                totalUsers: users.length,
                totalArt: artworks.length,
                totalRevenue: globalRevenue
            },
            userAnalytics
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (user?.email === "admin@gmail.com") return res.status(403).json({ message: "Admin protected" });
        await User.findByIdAndDelete(id);
        await Artwork.deleteMany({ creator: id });
        res.status(200).json({ message: "Banned" });
    } catch (error) {
        res.status(500).json({ message: "Failed" });
    }
};

module.exports = { getAdminStats, banUser };