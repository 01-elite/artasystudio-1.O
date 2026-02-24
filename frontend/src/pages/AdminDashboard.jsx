import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, DollarSign, Image as ImageIcon, Search, 
    Trash2, Eye, X, TrendingUp, MapPin, Calendar, Heart, Loader2, 
    ShieldCheck, Zap, Crown, Activity, BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5001/api/admin/stats');
            setData(res.data);
        } catch (err) { 
            console.error("Admin Fetch Error:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    const handleBan = async (id) => {
        if (window.confirm("⚠️ SYSTEM ALERT: Are you sure you want to permanently terminate this account? This action is irreversible.")) {
            try {
                await axios.delete(`http://localhost:5001/api/admin/user/${id}`);
                alert("User successfully wiped from system.");
                fetchData();
                setSelectedUser(null);
            } catch (err) {
                alert("Security Protocol Failed: Could not ban user.");
            }
        }
    };

    // Safety check: Ensure data exists before filtering
    const filteredUsers = data?.userAnalytics ? data.userAnalytics.filter(u => 
        (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
            <div className="relative">
                <Loader2 className="animate-spin text-[#FF8C00] relative z-10" size={60} />
                <div className="absolute inset-0 blur-2xl bg-orange-200 opacity-50 animate-pulse"></div>
            </div>
            <p className="mt-6 font-black text-gray-400 uppercase tracking-[0.5em] text-xs">Initializing ArtVista Core</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto p-10 font-sans text-left bg-[#fcfcfc] min-h-screen">
            {/* --- TOP BAR --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8 text-left">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-12 bg-[#FF8C00]"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF8C00]">Super Admin Terminal</p>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-gray-900 leading-none">
                        Studio <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-orange-600">Intelligence.</span>
                    </h1>
                </div>
                
                <div className="relative group w-full lg:w-[450px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF8C00] transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search identities, emails, or roles..." 
                        className="w-full pl-16 pr-8 py-5 bg-white border-2 border-gray-100 rounded-[2rem] font-bold outline-none focus:border-[#FF8C00] shadow-sm transition-all text-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="relative overflow-hidden bg-black p-10 rounded-[3rem] shadow-2xl group transition-transform hover:-translate-y-1">
                    <div className="relative z-10 text-left">
                        <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1 text-white">Total Community 👥</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">{data?.globalStats?.totalUsers || 0}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-400">
                           <Activity size={14}/> Live Node Active
                        </div>
                    </div>
                    <Users size={120} className="absolute -right-8 -bottom-8 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>

                <div className="relative overflow-hidden bg-white p-10 rounded-[3rem] border-2 border-orange-100 shadow-xl group transition-transform hover:-translate-y-1">
                    <div className="relative z-10 text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Market Revenue 💰</p>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">₹{data?.globalStats?.totalRevenue?.toLocaleString() || 0}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-500">
                           <TrendingUp size={14}/> Profitable State
                        </div>
                    </div>
                    <DollarSign size={120} className="absolute -right-8 -bottom-8 text-orange-500 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>

                <div className="relative overflow-hidden bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-xl group transition-transform hover:-translate-y-1 text-left">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Curated Pieces 🎨</p>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">{data?.globalStats?.totalArt || 0}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-500">
                           <ImageIcon size={14}/> Museum Grade
                        </div>
                    </div>
                    <ImageIcon size={120} className="absolute -right-8 -bottom-8 text-gray-900 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>
            </div>

            {/* --- USER TABLE --- */}
            <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden mb-20">
                <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-white">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2">
                        <Zap size={18} className="text-[#FF8C00] fill-[#FF8C00]"/> Network Registry
                    </h3>
                    <span className="px-4 py-2 bg-orange-50 text-[#FF8C00] text-[9px] font-black uppercase rounded-full tracking-widest">
                        {filteredUsers.length} Identities Linked
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#fafafa]">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="px-10 py-8 text-left">Identity 🆔</th>
                                <th className="px-10 py-8 text-left">Security Role 🛡️</th>
                                <th className="px-10 py-8 text-left">Sales Trajectory 📊</th>
                                <th className="px-10 py-8 text-left">Assets 📦</th>
                                <th className="px-10 py-8 text-right">Protocol ⚙️</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-orange-50/20 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-lg group-hover:bg-[#FF8C00] transition-colors">
                                                {user.name ? user.name[0] : "?"}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-gray-900 text-sm tracking-tight">{user.name || "Unknown"}</p>
                                                <p className="text-[11px] text-gray-400 font-bold">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-left">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                            user.role === 'creator' ? 'bg-orange-100 text-[#FF8C00]' : 
                                            user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {user.role === 'admin' && <Crown size={12}/>}
                                            {user.role || 'user'}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-left">
                                        <div className="flex flex-col gap-1">
                                            <p className="font-black text-gray-900 text-sm">₹{(user.revenueGenerated || 0).toLocaleString()}</p>
                                            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000" 
                                                    style={{ width: `${Math.min(((user.revenueGenerated || 0) / (data?.globalStats?.totalRevenue || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm text-gray-900">{user.postsCount || 0}</span>
                                            <ImageIcon size={14} className="text-gray-300" />
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right space-x-3">
                                        <button 
                                            onClick={() => setSelectedUser(user)} 
                                            className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {user.email !== "admin@gmail.com" && (
                                            <button 
                                                onClick={() => handleBan(user._id)} 
                                                className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-10 py-32 text-center">
                                        <Search size={48} className="mx-auto text-gray-100 mb-4" />
                                        <p className="font-black text-gray-300 uppercase tracking-widest text-sm">No identity matched core records</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ANALYTICS MODAL --- */}
            {selectedUser && (
                <div className="fixed inset-0 z-[200] flex items-center justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedUser(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white h-screen shadow-[-20px_0_50px_rgba(0,0,0,0.2)] p-12 overflow-y-auto animate-in slide-in-from-right duration-500 text-left">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-10 right-10 p-4 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                            <X size={24} />
                        </button>

                        <div className="mb-12 border-b border-gray-100 pb-10">
                            <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center text-3xl font-black mb-6 shadow-xl">
                                {selectedUser.name ? selectedUser.name[0] : "?"}
                            </div>
                            <h2 className="text-5xl font-black uppercase tracking-tighter text-gray-900 mb-2">{selectedUser.name || "Anonymous"}</h2>
                            <div className="flex items-center gap-3">
                                <span className="px-4 py-1.5 bg-orange-100 text-[#FF8C00] rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {selectedUser.role || "User"} 🌟
                                </span>
                                <span className="text-gray-300">|</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UID: {selectedUser._id?.slice(-8)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                <BarChart3 size={24} className="text-[#FF8C00] mb-4" />
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Sales Earnings</p>
                                <p className="text-3xl font-black text-gray-900">₹{(selectedUser.revenueGenerated || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-8 bg-black rounded-[2.5rem] text-white">
                                <Heart size={24} className="text-red-500 mb-4 fill-red-500" />
                                <p className="text-[10px] font-black uppercase opacity-50 tracking-widest mb-1">Total Engagement</p>
                                <p className="text-3xl font-black">{selectedUser.totalLikes || 0} <span className="text-sm font-bold opacity-50">Likes</span></p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-6 flex items-center gap-2">
                                    <MapPin size={14} /> Shipping Logistics
                                </h3>
                                <div className="p-8 bg-white border-2 border-dashed border-gray-100 rounded-[2rem]">
                                    {selectedUser.address?.street ? (
                                        <div className="space-y-2 text-left">
                                            <p className="text-sm font-black text-gray-800">{selectedUser.address.street}</p>
                                            <p className="text-xs font-bold text-gray-500">{selectedUser.address.city}, {selectedUser.address.state} - {selectedUser.address.pincode}</p>
                                            <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-[#FF8C00] font-black text-xs uppercase">
                                                <Zap size={14}/> {selectedUser.address.phone}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-gray-300 italic py-4">No logistics profile found for this identity.</p>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-6 flex items-center gap-2">
                                    <Activity size={14} /> Node Analytics
                                </h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="p-6 bg-[#fafafa] rounded-2xl text-center">
                                        <p className="text-2xl font-black text-gray-900">{selectedUser.totalViews || 0}</p>
                                        <p className="text-[8px] font-black uppercase text-gray-400 mt-1">Impressions</p>
                                    </div>
                                    <div className="text-center p-6 bg-[#fafafa] rounded-2xl">
                                        <p className="text-2xl font-black text-gray-900">₹{selectedUser.highestBid || 0}</p>
                                        <p className="text-[8px] font-black uppercase text-gray-400 mt-1">Peak Bid</p>
                                    </div>
                                    <div className="text-center p-6 bg-[#fafafa] rounded-2xl">
                                        <p className="text-2xl font-black text-gray-900">{selectedUser.joinedAt ? new Date(selectedUser.joinedAt).getFullYear() : '2026'}</p>
                                        <p className="text-[8px] font-black uppercase text-gray-400 mt-1">Onboarding</p>
                                    </div>
                                </div>
                            </section>

                            <div className="pt-10 mb-10">
                                <button 
                                    onClick={() => handleBan(selectedUser._id)}
                                    className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl shadow-red-100 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck size={18}/> Execute Termination Protocol
                                </button>
                                <p className="text-center mt-6 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                                    Warning: This wipes all curated assets from the ArtVista cloud
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;