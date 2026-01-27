import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Eye, Palette, ExternalLink, MessageCircle, ShoppingBag, DollarSign, Gavel } from 'lucide-react';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const [followers, setFollowers] = useState([]);
    const [myAuctions, setMyAuctions] = useState([]);
    const [stats, setStats] = useState({ likes: 0, views: 0, posts: 0, sold: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user._id) return;
            try {
                // 1. Fetching all my art
                const artRes = await axios.get(`http://localhost:5001/api/art/user/${user._id}`);
                const allPosts = artRes.data;
                
                // Aggregating Stats
                const totalLikes = allPosts.reduce((acc, curr) => acc + (curr.likes || 0), 0);
                const totalViews = allPosts.reduce((acc, curr) => acc + (curr.views || 0), 0);
                
                // Logic for Auctions vs Regular Posts
                const activeAuctions = allPosts.filter(art => art.isAuction && art.bids?.length > 0);
                setMyAuctions(activeAuctions);

                setStats({ 
                    likes: totalLikes, 
                    views: totalViews, 
                    posts: allPosts.length, 
                    sold: allPosts.filter(a => a.isSold).length, 
                    revenue: allPosts.filter(a => a.isSold).reduce((acc, curr) => acc + Number(curr.price), 0) 
                });

                // 2. Fetching community data (populated names)
                const followerRes = await axios.get(`http://localhost:5001/api/auth/followers/${user._id}`);
                setFollowers(followerRes.data);
                
                setLoading(false);
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        fetchDashboardData();
    }, [user._id]);

    const statCards = [
        { label: 'Followers', value: followers.length, icon: <Users size={14}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Revenue', value: `$${stats.revenue}`, icon: <DollarSign size={14}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Likes', value: stats.likes, icon: <TrendingUp size={14}/>, color: 'text-[#FF8C00]', bg: 'bg-orange-50' },
        { label: 'Views', value: stats.views, icon: <Eye size={14}/>, color: 'text-gray-500', bg: 'bg-gray-100' },
    ];

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-gray-300">Syncing Studio Data...</div>;

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen font-sans text-left">
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Studio <span className="text-[#FF8C00]">Insights</span></h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Performance Overview</p>
                </div>
                <div className="text-[10px] font-black text-gray-300 uppercase">Live Dashboard</div>
            </div>
            
            {/* STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                {statCards.map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-gray-50 bg-white hover:shadow-md transition-all">
                        <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-xl mb-3 flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <h2 className="text-lg font-black text-gray-900">{stat.value}</h2>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* ACTIVE AUCTION MONITOR */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Active Bids on My Art</h3>
                </div>
                {myAuctions.length > 0 ? (
                    <div className="space-y-3">
                        {myAuctions.map(art => (
                            <div key={art._id} className="p-4 border border-red-50 rounded-2xl flex items-center justify-between bg-red-50/20">
                                <div className="flex items-center gap-3">
                                    <img src={art.image} className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                        <p className="text-xs font-black uppercase">{art.title}</p>
                                        <p className="text-[10px] text-red-500 font-bold">Latest Bid: ${art.highestBid}</p>
                                    </div>
                                </div>
                                <Gavel size={16} className="text-red-500" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 border border-dashed border-gray-100 rounded-2xl text-center">
                        <MessageCircle size={18} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No active auction sessions</p>
                    </div>
                )}
            </div>

            {/* COMMUNITY (Supporters) */}
            <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Community</h3>
                <div className="grid grid-cols-1 gap-2">
                    {followers.map((f) => (
                        <div key={f._id} className="flex items-center justify-between p-4 bg-white border border-gray-50 rounded-2xl hover:border-[#FF8C00] transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-xs font-black uppercase">
                                    {f.name?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-800">{f.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{f.email}</p>
                                </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-300" />
                        </div>
                    ))}
                    
                    {followers.length === 0 && (
                        <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Growth in progress...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;