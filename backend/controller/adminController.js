const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Payment = require('../models/payment');

const getAdminStats = async (req, res) => {
    try {
        const users = await User.find({}).lean(); 
        const artworks = await Artwork.find({}).lean();
        const payments = await Payment.find({}).lean();

        const totalRevenue = (payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)) / 100;
        const totalArtists = [...new Set(artworks.map(a => a.creator?.toString()))].length;

        const userAnalytics = users.map(user => {
            const userPosts = artworks.filter(art => art.creator?.toString() === user._id.toString());
            const userOrders = payments.filter(p => p.userId?.toString() === user._id.toString());
            
            const popularArt = userPosts.length > 0 
                ? userPosts.reduce((prev, current) => (prev.likes > current.likes) ? prev : current) 
                : null;

            const revenueAsCreator = payments.reduce((acc, p) => {
                const isUsersArt = artworks.some(art => 
                    art._id.toString() === p.artworkId?.toString() && 
                    art.creator?.toString() === user._id.toString()
                );
                return isUsersArt ? acc + (Number(p.amount) || 0) : acc;
            }, 0) / 100;

            return {
                _id: user._id,
                name: user.name || "Anonymous",
                email: user.email,
                joinedAt: user.createdAt,
                postsCount: userPosts.length,
                ordersCount: userOrders.length,
                totalSpent: userOrders.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) / 100,
                revenueGenerated: revenueAsCreator,
                popularArt: popularArt ? { title: popularArt.title, likes: popularArt.likes } : "No Posts",
                address: user.address || {}
            };
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        res.status(200).json({
            kpis: {
                totalRevenue, totalOrders: payments.length, totalArt: artworks.length,
                totalArtists, totalUsers: users.length,
                pendingOrders: payments.filter(p => p.status === 'pending').length,
                outOfStock: artworks.filter(a => a.stock === 0).length
            },
            userAnalytics,
            inactiveCount: users.filter(u => new Date(u.lastLogin || u.createdAt) < thirtyDaysAgo).length,
            revenueTrend: await Payment.aggregate([
                { $group: { _id: { $month: "$createdAt" }, total: { $sum: { $divide: ["$amount", 100] } } } },
                { $sort: { "_id": 1 } }
            ]),
            categoryStats: await Payment.aggregate([
                { $lookup: { from: 'artworks', localField: 'artworkId', foreignField: '_id', as: 'art' } },
                { $unwind: '$art' },
                { $group: { _id: '$art.category', value: { $sum: 1 } } }
            ]),
            spatialClusters: await Payment.aggregate([{ $group: { _id: "$address.city", count: { $sum: 1 } } }])
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        await Artwork.deleteMany({ creator: id });
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats, banUser };