import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    TrendingUp, Users, Eye, ExternalLink, 
    MessageCircle, DollarSign, Gavel, Loader2 
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    
    // 1. Get user and ensure we have a fallback
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [followers, setFollowers] = useState([]);
    const [myAuctions, setMyAuctions] = useState([]);
    const [stats, setStats] = useState({ likes: 0, views: 0, posts: 0, sold: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user._id) {
                setLoading(false);
                return;
            }

            try {
                // Fetch all artwork created by this user
                const artRes = await axios.get(`http://localhost:5001/api/art/user/${user._id}`);
                const allPosts = artRes.data || [];
                
                // Aggregate Stats
                const totalLikes = allPosts.reduce((acc, curr) => acc + (curr.likes || 0), 0);
                const totalViews = allPosts.reduce((acc, curr) => acc + (curr.views || 0), 0);
                
                // Filter for artworks that have active bids
                const activeAuctions = allPosts.filter(art => art.isAuction && art.bids?.length > 0);
                setMyAuctions(activeAuctions);

                setStats({ 
                    likes: totalLikes, 
                    views: totalViews, 
                    posts: allPosts.length, 
                    sold: allPosts.filter(a => a.isSold).length, 
                    revenue: allPosts.filter(a => a.isSold).reduce((acc, curr) => acc + Number(curr.price), 0) 
                });

                // Fetch community data (who is following the creator)
                const followerRes = await axios.get(`http://localhost:5001/api/auth/followers/${user._id}`);
                setFollowers(followerRes.data || []);
                
            } catch (err) {
                console.error("Dashboard API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user._id]);

    const statCards = [
        { label: 'Followers', value: followers.length, icon: <Users size={14}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Revenue', value: `$${stats.revenue}`, icon: <DollarSign size={14}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Likes', value: stats.likes, icon: <TrendingUp size={14}/>, color: 'text-[#FF8C00]', bg: 'bg-orange-50' },
        { label: 'Total Views', value: stats.views, icon: <Eye size={14}/>, color: 'text-gray-500', bg: 'bg-gray-100' },
    ];

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#FF8C00] mb-4" size={48} />
            <p className="font-black text-gray-300 uppercase tracking-widest">Syncing Studio Data...</p>
        </div>
    );

    // Safety check if user somehow bypassed App.js protection
    if (user.role !== 'creator') {
        return <div className="p-20 text-center font-bold text-red-500">Access Denied: Creator account required.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen font-sans text-left">
            {/* --- HEADER --- */}
            <div className="mb-8 flex items-end justify-between border-b pb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Studio <span className="text-[#FF8C00]">Insights</span></h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time Performance</p>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-green-100">Live</div>
            </div>
            
            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
                {statCards.map((stat, i) => (
                    <div key={i} className="p-5 rounded-[2rem] border border-gray-50 bg-white hover:shadow-xl transition-all duration-500 group">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <h2 className="text-xl font-black text-gray-900">{stat.value}</h2>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* --- ACTIVE BID MONITOR --- */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Active Bids on Your Art</h3>
                    <span className="h-px flex-1 bg-gray-50 ml-4"></span>
                </div>
                {myAuctions.length > 0 ? (
                    <div className="space-y-3">
                        {myAuctions.map(art => (
                            <div key={art._id} className="p-5 border border-red-50 rounded-[2rem] flex items-center justify-between bg-red-50/20 hover:bg-red-50/40 transition-colors">
                                <div className="flex items-center gap-4">
                                    <img src={art.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt={art.title} />
                                    <div>
                                        <p className="text-xs font-black uppercase text-gray-800">{art.title}</p>
                                        <p className="text-[10px] text-red-500 font-bold">Latest Bid: ${art.highestBid}</p>
                                    </div>
                                </div>
                                <div className="bg-red-500 p-2 rounded-full text-white">
                                    <Gavel size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 border-2 border-dashed border-gray-50 rounded-[2.5rem] text-center">
                        <MessageCircle size={24} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">No active auction sessions found</p>
                    </div>
                )}
            </div>

            {/* --- COMMUNITY FEED (FOLLOWERS) --- */}
            <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6">
                    Community (Followers)
                </h3>
                <div className="flex flex-col gap-3">
                    {followers.length > 0 ? (
                        followers.map((follower) => (
                            <div 
                                key={follower._id} 
                                className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] hover:border-[#FF8C00] hover:shadow-xl transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Profile Initial Avatar */}
                                    <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-sm font-black uppercase shadow-lg group-hover:bg-[#FF8C00] transition-colors">
                                        {follower.name ? follower.name[0] : 'A'}
                                    </div>
                                    
                                    {/* Follower Details */}
                                    <div className="flex flex-col text-left">
                                        <p className="text-sm font-black text-gray-900 group-hover:text-[#FF8C00] transition-colors">
                                            {follower.name}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                            {follower.email}
                                        </p>
                                    </div>
                                </div>

                                {/* ✅ VIEW PROFILE BUTTON */}
                                <button 
                                    onClick={() => navigate(`/profile/${follower._id}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full group-hover:bg-[#FF8C00] transition-all"
                                >
                                    <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-white transition-colors">
                                        View Profile
                                    </span>
                                    <ExternalLink size={14} className="text-gray-200 group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <Users size={32} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                No followers yet. Your community is growing!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;