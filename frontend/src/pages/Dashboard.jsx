import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Eye, Palette, ExternalLink, MessageCircle, ChevronRight, ShoppingBag, DollarSign } from 'lucide-react';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const [followers, setFollowers] = useState([]);
    const [stats, setStats] = useState({ likes: 0, views: 0, posts: 0, sold: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetching real metrics from MongoDB
                const artRes = await axios.get(`http://localhost:5001/api/art/user/${user._id}`);
                const allPosts = artRes.data;
                
                // Aggregating stats
                const totalLikes = allPosts.reduce((acc, curr) => acc + (curr.likes || 0), 0);
                const totalViews = allPosts.reduce((acc, curr) => acc + (curr.views || 0), 0);
                const soldCount = allPosts.filter(art => art.isSold).length; // Filter for sold status
                const totalRevenue = allPosts.filter(art => art.isSold).reduce((acc, curr) => acc + Number(curr.price), 0);
                
                setStats({ likes: totalLikes, views: totalViews, posts: allPosts.length, sold: soldCount, revenue: totalRevenue });

                // 2. Fetching community data
                const followerRes = await axios.get(`http://localhost:5001/api/auth/followers/${user._id}`);
                setFollowers(followerRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        if (user._id) fetchDashboardData();
    }, [user._id]);

    // Redesigned: Smaller, more focused stat cards
    const statCards = [
        { label: 'Followers', value: followers.length, icon: <Users size={14}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Total Sold', value: stats.sold, icon: <ShoppingBag size={14}/>, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Revenue', value: `$${stats.revenue}`, icon: <DollarSign size={14}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Likes', value: stats.likes, icon: <TrendingUp size={14}/>, color: 'text-[#FF8C00]', bg: 'bg-orange-50' },
        { label: 'Views', value: stats.views, icon: <Eye size={14}/>, color: 'text-gray-500', bg: 'bg-gray-100' },
        { label: 'Posts', value: stats.posts, icon: <Palette size={14}/>, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen font-sans">
            {/* --- HEADER --- */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Studio <span className="text-[#FF8C00]">Insights</span></h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Performance Overview</p>
                </div>
                <div className="text-[10px] font-black text-gray-300">JAN 2026</div>
            </div>
            
            {/* --- 1. COMPACT STATS GRID --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
                {statCards.map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-50 bg-white hover:shadow-sm transition-all flex items-center gap-4">
                        <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex-shrink-0 flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-none">{stat.value}</h2>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- 2. ACTIVE BIDS --- */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Active Bids</h3>
                </div>
                <div className="p-8 border border-dashed border-gray-100 rounded-2xl text-center bg-gray-50/30">
                    <MessageCircle size={18} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase">No active bidding sessions</p>
                </div>
            </div>

            {/* --- 3. COMMUNITY LIST --- */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Supporters</h3>
                    <button className="text-[9px] font-bold text-[#FF8C00] hover:underline">VIEW ALL</button>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                    {followers.map((f) => (
                        <div key={f._id} className="flex items-center justify-between p-3 bg-white border border-gray-50 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                                    {f.name[0]}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-800">{f.name}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Collector</p>
                                </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-200" />
                        </div>
                    ))}
                    
                    {followers.length === 0 && (
                        <div className="p-6 text-center bg-gray-50/50 rounded-xl border border-gray-50">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Community is growing...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;