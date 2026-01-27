import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Gavel, Bookmark, Heart, Eye } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [allArt, setAllArt] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        if (user._id) {
            axios.get(`http://localhost:5001/api/art/user/${user._id}`).then(res => setAllArt(res.data));
            axios.get(`http://localhost:5001/api/auth/liked-details/${user._id}`).then(res => setLikedPosts(res.data));
        }
    }, [user._id]);

    const myPosts = allArt.filter(a => !a.isAuction);
    const myAuctions = allArt.filter(a => a.isAuction);

    return (
        <div className="max-w-6xl mx-auto pt-10 px-6 font-sans text-left">
            {/* --- Profile Header --- */}
            <div className="flex items-center gap-10 mb-16 border-b pb-12 border-gray-100">
                <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center text-4xl font-black text-[#FF8C00]">
                    {user.name?.[0]}
                </div>
                <div>
                    <h2 className="text-4xl font-light mb-4">{user.name}</h2>
                    <div className="flex gap-8">
                        <div><span className="block text-xl font-black">{allArt.length}</span><span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Submissions</span></div>
                        <div><span className="block text-xl font-black">{user.followers?.length || 0}</span><span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Followers</span></div>
                        <div><span className="block text-xl font-black">{user.following?.length || 0}</span><span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Following</span></div>
                    </div>
                </div>
            </div>

            {/* --- TRIPLE TAB SELECTOR --- */}
            <div className="flex justify-center gap-12 mb-10 border-t border-gray-50 pt-2">
                <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'border-t-2 border-black text-black' : 'text-gray-300'}`}>
                    <Grid size={16} /> My Posts
                </button>
                <button onClick={() => setActiveTab('auctions')} className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'auctions' ? 'border-t-2 border-red-500 text-red-500' : 'text-gray-300'}`}>
                    <Gavel size={16} /> Auction Booth
                </button>
                <button onClick={() => setActiveTab('liked')} className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'liked' ? 'border-t-2 border-orange-500 text-orange-500' : 'text-gray-300'}`}>
                    <Bookmark size={16} /> Liked Art
                </button>
            </div>

            {/* --- GRID DISPLAY --- */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(activeTab === 'posts' ? myPosts : activeTab === 'auctions' ? myAuctions : likedPosts).map(post => (
                    <div key={post._id} className="aspect-square relative group rounded-2xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                        <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="post" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 text-white font-black transition-opacity">
                            {post.isAuction ? (
                                <span className="text-xs text-red-400">BID: ${post.highestBid}</span>
                            ) : (
                                <>
                                    <span className="flex items-center gap-1 text-xs"><Heart size={14} fill="white"/> {post.likes}</span>
                                    <span className="flex items-center gap-1 text-xs"><Eye size={14}/> {post.views}</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {((activeTab === 'posts' && myPosts.length === 0) || (activeTab === 'auctions' && myAuctions.length === 0)) && (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 mt-4">
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">No activity in this booth yet</p>
                </div>
            )}
        </div>
    );
};

export default Profile;