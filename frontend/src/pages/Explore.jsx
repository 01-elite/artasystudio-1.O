import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, X, Check, UserPlus, Gavel, Loader2 } from 'lucide-react';

const Explore = () => {
    const [artworks, setArtworks] = useState([]);
    const [selectedArt, setSelectedArt] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [likedItems, setLikedItems] = useState(new Set());
    const [loading, setLoading] = useState(false);
    
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [followedCreators, setFollowedCreators] = useState(new Set(user.following || []));

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:5001/api/art/explore");
            setArtworks(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    // ✅ ADDED: Add to Cart Logic
    const addToCart = (art) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const exists = cart.find(item => item._id === art._id);
        
        if (exists) {
            alert("This masterpiece is already in your cart!");
            return;
        }

        const cartItem = { 
            ...art, 
            cartId: Date.now(), 
            quantity: 1 
        };
        
        const updatedCart = [...cart, cartItem];
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        
        // Trigger Navbar update
        window.dispatchEvent(new Event('storage'));
        alert(`${art.title} added to cart!`);
        setSelectedArt(null); 
    };

    const toggleFollow = async (e, creatorId) => {
        e.stopPropagation();
        if (!user._id) return alert("Login to follow!");
        if (user._id === creatorId) return alert("You can't follow yourself!");

        try {
            await axios.put("http://localhost:5001/api/auth/follow", { userId: user._id, targetId: creatorId });
            let updatedFollowing = [...user.following];
            const newFollows = new Set(followedCreators);

            if (newFollows.has(creatorId)) {
                newFollows.delete(creatorId);
                updatedFollowing = updatedFollowing.filter(id => id !== creatorId);
            } else {
                newFollows.add(creatorId);
                updatedFollowing.push(creatorId);
            }
            setFollowedCreators(newFollows);
            const updatedUser = { ...user, following: updatedFollowing };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) { alert("Follow action failed"); }
    };

    const toggleLike = (e, artId) => {
        e.stopPropagation();
        const newLikes = new Set(likedItems);
        likedItems.has(artId) ? newLikes.delete(artId) : newLikes.add(artId);
        setLikedItems(newLikes);
    };

    const handleBid = async () => {
        if (!user._id) return alert("Login to bid!");
        try {
            setLoading(true);
            await axios.put(`http://localhost:5001/api/art/bid/${selectedArt._id}`, {
                userId: user._id, amount: Number(bidAmount)
            });
            alert("Bid Placed!");
            setBidAmount("");
            fetchData();
            setSelectedArt(null);
        } catch (err) { alert(err.response?.data?.message || "Bidding failed"); }
        finally { setLoading(false); }
    };

    const auctions = artworks.filter(a => a.isAuction);
    const gallery = artworks.filter(a => !a.isAuction);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen font-sans text-left">
            {auctions.length > 0 && (
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600 italic">Live Auction Booth</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {auctions.map(art => (
                            <div key={art._id} onClick={() => setSelectedArt(art)} className="group relative bg-white border border-red-100 rounded-[2rem] p-3 hover:shadow-2xl transition-all cursor-pointer">
                                <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-4 relative">
                                    <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="art" />
                                    <button onClick={(e) => toggleLike(e, art._id)} className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                                        <Heart size={16} className={likedItems.has(art._id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                                    </button>
                                </div>
                                <div className="px-2 pb-2">
                                    <p className="font-black text-gray-800 text-sm truncate mb-1">{art.title}</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Current Bid</p>
                                        <p className="font-black text-red-600 text-lg">${art.highestBid || art.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <hr className="border-gray-50 mb-12" />

            <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Public <span className="text-[#FF8C00]">Gallery</span></h2>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {gallery.map(art => (
                    <div key={art._id} onClick={() => setSelectedArt(art)} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-pointer">
                        <img src={art.image} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="gallery" />
                        <button onClick={(e) => toggleLike(e, art._id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Heart size={14} className={likedItems.has(art._id) ? "fill-red-500 text-red-500" : "text-white"} />
                        </button>
                    </div>
                ))}
            </div>

            {selectedArt && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                    <button onClick={() => setSelectedArt(null)} className="absolute top-10 right-10 text-white"><X size={40} /></button>
                    <div className="bg-white max-w-5xl w-full rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[85vh] shadow-2xl">
                        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative">
                            <img src={selectedArt.image} className="w-full h-full object-contain rounded-2xl" alt="preview" />
                            <button onClick={(e) => toggleLike(e, selectedArt._id)} className="absolute top-8 right-8 p-4 bg-white rounded-full shadow-lg">
                                <Heart size={24} className={likedItems.has(selectedArt._id) ? "fill-red-500 text-red-500" : "text-gray-300"} />
                            </button>
                        </div>
                        <div className="w-full md:w-[450px] p-10 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[8px] font-bold">AV</div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{selectedArt.creator?.name || "Artist"}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => toggleFollow(e, selectedArt.creator?._id || selectedArt.creator)}
                                        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${followedCreators.has(selectedArt.creator?._id || selectedArt.creator) ? "bg-black text-white" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
                                    >
                                        {followedCreators.has(selectedArt.creator?._id || selectedArt.creator) ? <><Check size={12}/> Following</> : <><UserPlus size={12}/> Follow</>}
                                    </button>
                                </div>
                                <h3 className="text-4xl font-black mb-4">{selectedArt.title}</h3>
                                <p className="text-gray-500 font-medium italic mb-10">"{selectedArt.description}"</p>
                            </div>
                            <div className="pt-10 border-t">
                                {selectedArt.isAuction ? (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Highest Bid</p>
                                        <p className="text-5xl font-black text-red-600 mb-6">${selectedArt.highestBid || selectedArt.price}</p>
                                        <input type="number" placeholder="Enter bid..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                                        <button onClick={handleBid} className="w-full bg-red-600 text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-red-700 shadow-xl">{loading ? "PLACING..." : "PLACE BID"}</button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Buy Now Price</p>
                                        <p className="text-5xl font-black mb-8">${selectedArt.price}</p>
                                        {/* ✅ UPDATED: Trigger addToCart */}
                                        <button 
                                            onClick={() => addToCart(selectedArt)}
                                            className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-orange-500 shadow-xl"
                                        >
                                            COLLECT NOW
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explore;