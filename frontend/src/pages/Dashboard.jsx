import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Eye, DollarSign, Loader2 } from 'lucide-react';

const Dashboard = () => {
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [stats, setStats] = useState({ likes: 0, views: 0, posts: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user._id) return setLoading(false);
            try {
                // Fetch creator's artworks
                const artRes = await axios.get(`http://localhost:5001/api/art/user/${user._id}`);
                const posts = artRes.data || [];
                
                // Fetch payments to calculate personal revenue
                const payRes = await axios.get('http://localhost:5001/api/v1/payment/process');
                const creatorRevenue = (payRes.data || [])
                    .filter(p => p.email === user.email)
                    .reduce((acc, curr) => acc + (Number(curr.amount) / 100), 0);

                setStats({
                    likes: posts.reduce((acc, art) => acc + (art.likes || 0), 0),
                    views: posts.reduce((acc, art) => acc + (art.views || 0), 0),
                    posts: posts.length,
                    revenue: creatorRevenue.toLocaleString()
                });
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, [user._id, user.email]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#FF8C00]" size={40} /></div>;

    const cards = [
        { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: <DollarSign />, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Art Likes', value: stats.likes, icon: <TrendingUp />, color: 'text-[#FF8C00]', bg: 'bg-orange-50' },
        { label: 'Total Views', value: stats.views, icon: <Eye />, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Pieces Published', value: stats.posts, icon: <Users />, color: 'text-gray-500', bg: 'bg-gray-100' },
    ];

    return (
        <div className="max-w-5xl mx-auto p-10 font-sans text-left">
            <h1 className="text-3xl font-black mb-10">Studio <span className="text-[#FF8C00]">Insights</span></h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] ${c.bg} border border-transparent hover:border-white shadow-sm transition-all`}>
                        <div className={`${c.color} mb-4`}>{c.icon}</div>
                        <h2 className="text-2xl font-black">{c.value}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{c.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;