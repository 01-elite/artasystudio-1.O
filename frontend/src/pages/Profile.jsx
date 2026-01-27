import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Eye, X, ShoppingCart, Sliders, Grid, Bookmark } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [myPosts, setMyPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'liked'
    const [selectedPost, setSelectedPost] = useState(null);
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

    useEffect(() => {
        if (user._id) {
            // Fetch your own uploads
            axios.get(`http://localhost:5001/api/art/user/${user._id}`)
                .then(res => setMyPosts(res.data))
                .catch(err => console.error("Gallery fetch failed:", err));

            // Fetch your wishlist (liked art)
            axios.get(`http://localhost:5001/api/auth/liked-details/${user._id}`)
                .then(res => setLikedPosts(res.data))
                .catch(err => console.error("Liked fetch failed:", err));
        }
    }, [user._id]);

    const addToCart = (post) => {
        const updatedCart = [...cart, { ...post, cartId: Date.now(), quantity: 1 }];
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('storage')); // Notify Navbar
        alert("Added to ArtVista Cart!");
    };

    const toggleCreatorMode = async () => {
        const targetRole = user.role === 'creator' ? 'user' : 'creator';
        try {
            const { data } = await axios.put('http://localhost:5001/api/auth/update-role', {
                userId: user._id, newRole: targetRole
            });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            window.location.reload();
        } catch (err) { alert("Role switch failed."); }
    };

    // Determine which list to show in the grid
    const currentDisplayPosts = activeTab === 'posts' ? myPosts : likedPosts;

    // Inside Profile.jsx

useEffect(() => {
    const fetchProfileData = async () => {
        if (!user._id) return;
        
        try {
            // 1. Fetch My Uploads
            const myPostsRes = await axios.get(`http://localhost:5001/api/art/user/${user._id}`);
            setMyPosts(myPostsRes.data);

            // 2. Fetch Liked Art (Full Objects)
            const likedRes = await axios.get(`http://localhost:5001/api/auth/liked-details/${user._id}`);
            setLikedPosts(likedRes.data);
        } catch (err) {
            console.error("Profile sync error", err);
        }
    };

    fetchProfileData();
}, [user._id, activeTab]); // Added activeTab here to refresh when you click the tab
    return (
        <div className="max-w-5xl mx-auto pt-10 px-6 font-sans">
            {/* Header Section */}
            <div className="flex items-center gap-12 mb-10 border-b pb-12 border-gray-100">
                <div className="w-40 h-40 bg-orange-50 rounded-full flex items-center justify-center text-5xl font-black text-[#FF8C00] shadow-inner">
                    {user.name?.[0]}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-6 mb-6">
                        <h2 className="text-3xl font-light">{user.name}</h2>
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                            <span className="text-[10px] font-black uppercase text-gray-400">Creator Mode</span>
                            <button onClick={toggleCreatorMode} className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${user.role === 'creator' ? 'bg-[#FF8C00]' : 'bg-gray-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${user.role === 'creator' ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-10 font-bold text-gray-700">
                        <div className="text-center md:text-left">
                            <span className="block text-xl">{myPosts.length}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Posts</span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="block text-xl">{user.followers?.length || 0}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Followers</span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="block text-xl">{user.following?.length || 0}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Following</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TAB SELECTOR --- */}
            <div className="flex justify-center gap-16 mb-8 border-t border-gray-50 pt-2">
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`flex items-center gap-2 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'posts' ? 'border-t-2 border-black text-black' : 'text-gray-300'}`}
                >
                    <Grid size={14} /> My Posts
                </button>
                <button 
                    onClick={() => setActiveTab('liked')}
                    className={`flex items-center gap-2 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'liked' ? 'border-t-2 border-black text-black' : 'text-gray-300'}`}
                >
                    <Bookmark size={14} /> Liked Art
                </button>
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                {currentDisplayPosts.map(post => (
                    <div key={post._id} onClick={() => setSelectedPost(post)} className="aspect-square relative group cursor-pointer overflow-hidden bg-gray-50 rounded-lg shadow-sm">
                        <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-bold transition-opacity duration-300">
                            <span className="flex items-center gap-1"><Heart size={18} fill="white"/> {post.likes || 0}</span>
                            <span className="flex items-center gap-1"><Eye size={18}/> {post.views || 0}</span>
                        </div>
                    </div>
                ))}
            </div>

            {currentDisplayPosts.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[3rem] mt-4 bg-gray-50/30">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nothing to show here yet</p>
                </div>
            )}

            {/* --- POST DETAIL MODAL --- */}
            {selectedPost && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 transition-all">
                    <div className="bg-white max-w-5xl w-full h-[85vh] rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
                        <button onClick={() => setSelectedPost(null)} className="absolute top-6 right-8 text-gray-400 hover:text-black z-50 transition-colors">
                            <X size={32} />
                        </button>

                        {/* Image Side */}
                        <div className="flex-1 bg-gray-50 flex items-center justify-center border-r border-gray-100 p-8">
                            <img src={selectedPost.image} className="w-full h-full object-contain rounded-2xl shadow-xl" alt="detail" />
                        </div>

                        {/* Content Side */}
                        <div className="w-full md:w-[450px] p-12 flex flex-col justify-between">
                            <div>
                                <div className="mb-8">
                                    <h3 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">{selectedPost.title}</h3>
                                    <div className="flex gap-2">
                                        <span className="px-4 py-1.5 bg-orange-50 text-[#FF8C00] text-[10px] font-black uppercase rounded-full tracking-widest">{selectedPost.category}</span>
                                        {selectedPost.isCustomizable && (
                                            <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full flex items-center gap-1 tracking-widest">
                                                <Sliders size={10} /> Customizable
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">The Story</p>
                                    <p className="text-gray-600 leading-relaxed text-sm font-medium italic">
                                        "{selectedPost.description || "Every masterpiece has a story. This unique creation is part of the exclusive ArtVista collection."}"
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-50">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valuation</p>
                                        <p className="text-4xl font-black text-gray-900">${selectedPost.price}</p>
                                    </div>
                                    <div className="flex gap-3 text-gray-200">
                                        <Heart size={24} className="hover:text-red-500 cursor-pointer transition-colors" />
                                        <Eye size={24} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button onClick={() => addToCart(selectedPost)} className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-[#FF8C00] shadow-xl shadow-orange-50 transition-all active:scale-95">
                                        <ShoppingCart size={20} /> COLLECT MASTERPIECE
                                    </button>
                                    {selectedPost.isCustomizable && (
                                        <button className="w-full border-2 border-gray-100 text-gray-800 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm uppercase tracking-widest">
                                            <Sliders size={16} /> Request Custom Design
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;