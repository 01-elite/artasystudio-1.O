import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Heart, X, Sparkles, Clock, ShoppingBag,
    Zap, Share2, MoreHorizontal, CheckCircle2, User
} from 'lucide-react';

const Explore = () => {
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState([]);
    const [selectedArt, setSelectedArt] = useState(null);
    const [likedItems, setLikedItems] = useState(new Set());
    const [timeLeftMap, setTimeLeftMap] = useState({});
    const [bidAmount, setBidAmount] = useState("");
    
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const userPrefs = user?.categoryPreferences || [];

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:5001/api/art/explore");
            setArtworks(res.data);
            syncCartWithBids(res.data);
            if (user?.likedArt) {
                setLikedItems(new Set(user.likedArt));
            }
        } catch (err) { console.error("Database connection failed:", err); }
    };

    const syncCartWithBids = (latestArt) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) return;
        const updatedCart = cart.filter(item => {
            if (!item.isAuction) return true;
            const freshData = latestArt.find(a => a._id === item._id);
            if (freshData) {
                const dbBidder = freshData.highestBidder ? String(freshData.highestBidder) : null;
                const currentUserId = user._id ? String(user._id) : null;
                if (dbBidder && dbBidder !== currentUserId) return false;
                item.price = freshData.highestBid || freshData.price;
            }
            return true;
        });
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimes = {};
            artworks.forEach(art => {
                if (art.isAuction && art.auctionEnd) {
                    const dist = new Date(art.auctionEnd).getTime() - new Date().getTime();
                    if (dist < 0) newTimes[art._id] = "EXPIRED";
                    else {
                        const h = Math.floor(dist / (1000 * 60 * 60));
                        const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
                        newTimes[art._id] = `${h}h ${m}m`;
                    }
                }
            });
            setTimeLeftMap(newTimes);
        }, 1000);
        return () => clearInterval(timer);
    }, [artworks]);

    const addToCart = (art, redirect = false) => {
        if (art.isSold) return;
        const finalBid = art.isAuction ? (Number(bidAmount) || art.highestBid || art.price) : art.price;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cleanCart = cart.filter(item => item._id !== art._id);
        const cartItem = { ...art, price: finalBid, cartId: Date.now(), quantity: 1 };
        localStorage.setItem('cart', JSON.stringify([...cleanCart, cartItem]));
        window.dispatchEvent(new Event('storage'));
        if (redirect) navigate('/cart');
        else alert(`${art.title} added to collection!`);
    };

    const toggleLike = async (e, artId) => {
        e.stopPropagation();
        if (!user?._id) return alert("Please login to like art!");
        try {
            const res = await axios.put(`http://localhost:5001/api/auth/like-art`, {
                userId: user._id,
                artId: artId
            });
            const newLikes = new Set(likedItems);
            if (likedItems.has(artId)) newLikes.delete(artId);
            else newLikes.add(artId);
            setLikedItems(newLikes);
            const updatedUser = { ...user, likedArt: res.data.likedArt };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (err) { console.error("Like sync failed:", err); }
    };

    const recommendedArt = artworks.filter(art => !art.isSold && userPrefs.includes(art.category));
    const liveAuctions = artworks.filter(a => a.isAuction && !a.isSold);
    const publicStudio = artworks.filter(a => !a.isAuction && !a.isSold);
    const museumArchive = artworks.filter(a => a.isSold);

    // ✅ FIXED ART CARD COMPONENT (Ensures uniform sizing)
    const ArtCard = ({ art, isAuction, isGrid = false }) => (
        <div className={`${!isGrid ? 'w-[320px] md:w-[380px] flex-shrink-0' : 'w-full'} group bg-white border ${isAuction ? 'border-red-100' : 'border-zinc-100'} rounded-[2.5rem] p-6 hover:shadow-2xl transition-all relative text-left`}>
            {isAuction && (
                <div className="absolute top-8 right-8 z-30 bg-red-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-lg">
                    <Clock size={10} /> {timeLeftMap[art._id] || "LIVE"}
                </div>
            )}
            <button onClick={(e) => toggleLike(e, art._id)} className="absolute top-8 right-8 z-30 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
                <Heart size={18} className={likedItems.has(art._id) ? "fill-red-500 text-red-500" : "text-zinc-400"} />
            </button>
            
            {/* Aspect Square Image Container */}
            <div className="aspect-square w-full rounded-[1.8rem] overflow-hidden mb-6 bg-zinc-50 cursor-pointer" onClick={() => setSelectedArt(art)}>
                <img src={art.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={art.title} />
                {art.isSold && (
                    <div className="absolute top-6 left-6 z-30 bg-white/90 backdrop-blur-md text-red-600 px-4 py-2 rounded-full font-black text-[10px] uppercase flex items-center gap-2 border border-red-100 shadow-sm">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" /> SOLD
                    </div>
                )}
            </div>

            <div className="px-2 space-y-4">
                <div className="h-16"> {/* Fixed Height for title/meta to keep bottom rows aligned */}
                    <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900 truncate mb-1">{art.title}</h3>
                    <p className="text-[11px] text-zinc-400 font-medium italic line-clamp-1">
                        {isAuction ? `"${art.description || 'Auction Masterpiece.'}"` : `Matched: ${art.category}`}
                    </p>
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-zinc-50">
                    <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{isAuction ? 'Current Bid' : 'Price'}</p>
                        <p className={`text-2xl font-black ${isAuction ? 'text-red-600' : 'text-zinc-900'}`}>
                            ₹{(art.highestBid || art.price).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={() => setSelectedArt(art)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg transition-colors ${isAuction ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-zinc-900 text-white hover:bg-black'}`}>
                        {isAuction ? 'Place Bid' : 'View Piece'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 bg-white min-h-screen font-sans text-left overflow-x-hidden">
            
            {/* --- 1. HERO SECTION (Black Box) --- */}
            <div className="relative mb-20 mt-4 overflow-hidden rounded-[3.5rem] bg-[#050505] py-20 px-12 md:px-24 text-white shadow-2xl border-b-[10px] border-[#FF8C00]">
                <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-center">
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-3 mb-8">
                            <Sparkles className="text-[#FF8C00]" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF8C00]">Premier Art Exchange</span>
                        </div>
                        <h1 className="text-7xl md:text-[8rem] font-black leading-[0.8] mb-12 tracking-tighter uppercase italic text-white">
                            ARTVISTA <br /> <span className="text-[#FF8C00]">STUDIO.</span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-2xl font-medium max-w-2xl leading-tight">
                            Verified provenance, blockchain-backed authenticity, and worldwide white-glove logistics.
                        </p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-2 gap-y-16 gap-x-12 border-l border-white/5 pl-16 py-4">
                        <div><p className="text-6xl font-black">12.4K</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Collectors</p></div>
                        <div><p className="text-6xl font-black">450+</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Artists</p></div>
                        <div><p className="text-6xl font-black">100%</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Insured</p></div>
                        <div><p className="text-6xl font-black">24/7</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Support</p></div>
                    </div>
                </div>
                <div className="absolute top-[-30%] right-[-10%] w-[900px] h-[900px] bg-[#FF8C00] rounded-full blur-[250px] opacity-[0.1]"></div>
            </div>

            {/* --- 2. LIVE AUCTION BOOTH --- */}
            {liveAuctions.length > 0 && (
                <div className="mb-24 px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-red-600 mb-10 flex items-center gap-3 italic">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]" /> Live Auction Booth
                    </h2>
                    <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x snap-mandatory">
                        {liveAuctions.map(art => <ArtCard key={art._id} art={art} isAuction={true} />)}
                    </div>
                </div>
            )}

            {/* --- 3. RECOMMENDED FOR YOU --- */}
            {recommendedArt.length > 0 && (
                <div className="mb-24 px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 mb-10 flex items-center gap-3 italic">
                        <div className="w-3 h-3 bg-[#FF8C00] rounded-full animate-pulse shadow-[0_0_10px_#FF8C00]" /> For {user.name?.split(' ')[0] || 'You'}
                    </h2>
                    <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x snap-mandatory">
                        {recommendedArt.map(art => <ArtCard key={art._id} art={art} isAuction={false} />)}
                    </div>
                </div>
            )}

            {/* --- 4. PUBLIC STUDIO GALLERY --- */}
            <div className="bg-[#fdf4f0] -mx-8 px-10 py-24 rounded-[4rem] border-y border-zinc-100 mb-24 shadow-inner">
                <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 mb-12 italic border-l-8 border-[#FF8C00] pl-6 ml-4">Public Studio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 px-4">
                    {publicStudio.map(art => <ArtCard key={art._id} art={art} isAuction={false} isGrid={true} />)}
                </div>
            </div>

            {/* --- 5. MUSEUM ARCHIVE --- */}
            {museumArchive.length > 0 && (
                <div className="px-4 pb-24">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-400 mb-16 italic flex items-center gap-4">
                        <div className="w-12 h-[2px] bg-zinc-300" /> Museum Archive
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {museumArchive.map(art => (
                           <div key={art._id} className="opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
                                <ArtCard art={art} isAuction={false} isGrid={true} />
                           </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- FOOTER --- */}
            <footer className="mt-24 border-t border-gray-100 py-20 px-4 text-center">
                <h3 className="text-4xl font-black uppercase tracking-tighter text-gray-900 mb-6">ArtVista Studio</h3>
                <p className="text-gray-400 text-sm max-w-xl mx-auto uppercase tracking-widest mb-12">
                    Redefining the digital art market through curation and trust.
                </p>
                <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <a href="#" className="hover:text-[#FF8C00]">Terms</a>
                    <a href="#" className="hover:text-[#FF8C00]">Privacy</a>
                    <a href="#" className="hover:text-[#FF8C00]">Support</a>
                </div>
            </footer>

            {/* --- MODAL --- */}
            {selectedArt && (
                <div className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-2xl flex items-center justify-center p-4 text-left">
                    <button onClick={() => setSelectedArt(null)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"><X size={48} strokeWidth={1.5} /></button>
                    <div className="bg-white max-w-[1200px] w-full rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh] shadow-2xl relative border border-white/10">
                        <div className="flex-1 bg-[#F5F5F7] flex items-center justify-center p-6 md:p-12 relative group/img">
                            <img src={selectedArt.image} className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl" alt="preview" />
                            {selectedArt.isSold && (
                                <div className="absolute top-8 left-8 z-30 bg-red-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase flex items-center gap-2 shadow-2xl">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" /> PRIVATE ASSET
                                </div>
                            )}
                            <div className="absolute top-8 right-8 flex gap-3">
                                <button className="p-3 bg-white/90 rounded-full shadow-lg"><Share2 size={20} className="text-zinc-900" /></button>
                                <button className="p-3 bg-white/90 rounded-full shadow-lg"><MoreHorizontal size={20} className="text-zinc-900" /></button>
                            </div>
                        </div>

                        <div className="w-full md:w-[480px] bg-white flex flex-col border-l border-zinc-100 overflow-y-auto">
                            <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/profile/${selectedArt.creator?._id || selectedArt.creator}`)}>
                                    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold text-lg">{selectedArt.creator?.name?.[0] || 'A'}</div>
                                    <div><div className="flex items-center gap-1"><p className="text-sm font-black uppercase text-zinc-900">{selectedArt.creator?.name || 'ArtVista Creator'}</p><CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10" /></div><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verified Artist</p></div>
                                </div>
                                <button onClick={(e) => toggleLike(e, selectedArt._id)} className={`p-3 rounded-full ${likedItems.has(selectedArt._id) ? 'bg-red-50 text-red-500' : 'bg-zinc-50 text-zinc-400'}`}><Heart size={20} fill={likedItems.has(selectedArt._id) ? "currentColor" : "none"} /></button>
                            </div>

                            <div className="p-10 space-y-6 flex-grow">
                                <div className="space-y-2"><p className="text-[10px] font-black text-[#FF8C00] uppercase tracking-[0.3em]">Registry No. {selectedArt._id.slice(-6)}</p><h3 className="text-5xl font-black uppercase tracking-tighter text-zinc-900 leading-[0.9]">{selectedArt.title}</h3></div>
                                <p className="text-zinc-500 font-medium italic text-lg leading-relaxed border-l-4 border-zinc-100 pl-6">"{selectedArt.description || 'Verified masterpiece.'}"</p>
                            </div>

                            <div className="p-10 bg-zinc-50/50 border-t border-zinc-100 mt-auto">
                                <div className="mb-8">
                                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2">Value</p>
                                    <p className="text-6xl font-black text-zinc-900 tracking-tighter">₹{(selectedArt.highestBid || selectedArt.price).toLocaleString()}</p>
                                </div>
                                <div className="space-y-4">
                                    {selectedArt.isSold ? (
                                        <div className="w-full bg-zinc-900 text-zinc-400 py-6 rounded-2xl font-black text-center border-2 border-dashed border-zinc-700 uppercase text-[10px] tracking-[0.3em] cursor-not-allowed">
                                            Asset in Private Registry
                                        </div>
                                    ) : (
                                        <button onClick={() => addToCart(selectedArt, true)} className="w-full bg-[#FF8C00] text-white py-6 rounded-2xl font-black text-sm uppercase shadow-xl flex items-center justify-center gap-3 hover:bg-[#e67e00]">
                                            <Zap size={20} fill="currentColor" /> Add to Cart
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

export default Explore;