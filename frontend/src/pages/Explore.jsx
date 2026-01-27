import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, UserPlus, X, Eye, ShoppingCart } from 'lucide-react';

const Explore = () => {
    const [artworks, setArtworks] = useState([]);
    const [selectedArt, setSelectedArt] = useState(null);
    const user = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        axios.get('http://localhost:5001/api/art/explore').then(res => setArtworks(res.data));
    }, []);

    // Replace your handleLike function in Explore.jsx with this:
const handleLike = async (e, artId) => {
    e.stopPropagation(); 
    
    // 1. Re-fetch current user from storage to ensure we are logged in
    const activeUser = JSON.parse(localStorage.getItem('user'));

    if (!activeUser || !activeUser._id) {
        alert("Login to like masterpieces!");
        return;
    }

    try {
        // 2. Call the backend route we added to authRoutes.js
        const { data } = await axios.put('http://localhost:5001/api/auth/like-art', {
            userId: activeUser._id,
            artId: artId
        });
        
        // 3. Update Local Storage so the UI knows this item is now liked
        localStorage.setItem('user', JSON.stringify(data));
        
        // 4. Force a quick state update or reload to show the red heart
        alert("Added to your Liked Collection!");
        window.location.reload(); 
    } catch (err) {
        console.error("Like Error:", err);
        alert("Action failed. Check if your backend is running.");
    }
};

    const handleFollow = async (creatorId) => {
        try {
            const { data } = await axios.put('http://localhost:5001/api/auth/follow', {
                followerId: user._id,
                followingId: creatorId
            });
            localStorage.setItem('user', JSON.stringify(data.user));
            alert("Following artist!");
        } catch (err) { alert("Login to follow artists"); }
    };

    return (
        <div className="p-8 bg-white min-h-screen font-sans">
            <h2 className="text-3xl font-black mb-10 tracking-tight">Explore <span className="text-[#FF8C00]">Gallery</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {artworks.map((art) => (
                    <div key={art._id} onClick={() => setSelectedArt(art)} className="group relative cursor-pointer">
                        {/* --- THE ART CARD --- */}
                        <div className="relative rounded-[2rem] overflow-hidden aspect-square shadow-sm hover:shadow-2xl transition-all duration-500">
                            <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={art.title} />
                            
                            {/* --- THE HEART SYMBOL (TOP RIGHT) --- */}
                            <button 
                                onClick={(e) => handleLike(e, art._id)}
                                className="absolute top-5 right-5 z-10 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                            >
                                <Heart size={20} fill={user.likedArt?.includes(art._id) ? "currentColor" : "none"} className={user.likedArt?.includes(art._id) ? "text-red-500" : ""} />
                            </button>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 text-white">
                                <p className="font-black text-2xl">{art.title}</p>
                                <p className="text-sm font-bold opacity-80">By {art.creator?.name || "ArtVista Artist"}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- POST MODAL (Remains the same as your previous code) --- */}
            {selectedArt && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                    <button onClick={() => setSelectedArt(null)} className="absolute top-10 right-10 text-white hover:rotate-90 transition-transform">
                        <X size={40} />
                    </button>
                    
                    <div className="bg-white max-w-5xl w-full rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[80vh] shadow-2xl">
                        <div className="flex-1 bg-gray-50 flex items-center justify-center border-r border-gray-100 p-4">
                            <img src={selectedArt.image} className="w-full h-full object-contain" alt="preview" />
                        </div>

                        <div className="w-full md:w-[450px] p-10 flex flex-col">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#FF8C00] rounded-2xl flex items-center justify-center text-white font-black text-xl">{selectedArt.creator?.name?.[0]}</div>
                                    <div>
                                        <p className="font-black text-gray-800 leading-none">{selectedArt.creator?.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Verified Artist</p>
                                    </div>
                                </div>
                                <button onClick={() => handleFollow(selectedArt.creator?._id)} className="text-[#FF8C00] font-black text-xs bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition">
                                    + FOLLOW
                                </button>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-3xl font-black mb-3">{selectedArt.title}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 italic">"{selectedArt.description}"</p>
                                <div className="flex gap-2">
                                    <span className="bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{selectedArt.category}</span>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Value</p>
                                        <p className="text-4xl font-black text-gray-900">${selectedArt.price}</p>
                                    </div>
                                    <div className="flex gap-3 text-gray-300">
                                        <Heart size={24} className="hover:text-red-500 cursor-pointer transition" onClick={(e) => handleLike(e, selectedArt._id)} />
                                        <Eye size={24} />
                                    </div>
                                </div>
                                <button className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-[#FF8C00] shadow-xl shadow-orange-100 transition-all">
                                    COLLECT NOW
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explore;