import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Heart, X, Sparkles, Clock, ShoppingBag,
    Zap, Share2, MoreHorizontal, CheckCircle2, User, Gavel, Search
} from 'lucide-react';

const Explore = () => {
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState([]);
    const [selectedArt, setSelectedArt] = useState(null);
    const [likedItems, setLikedItems] = useState(new Set());
    const [timeLeftMap, setTimeLeftMap] = useState({});
    const [bidAmount, setBidAmount] = useState("");
    const [showBidModal, setShowBidModal] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [maxPrice, setMaxPrice] = useState(200000);

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const userPrefs = user?.categoryPreferences || [];

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:5001/api/art/explore");
            setArtworks(res.data);
            syncCartWithBids(res.data);
            if (user?.likedArt) setLikedItems(new Set(user.likedArt));
        } catch (err) { console.error("Database connection failed"); }
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
                    if (dist <= 0) newTimes[art._id] = "EXPIRED";
                    else {
                        const h = Math.floor(dist / (1000 * 60 * 60));
                        const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
                        const s = Math.floor((dist % (1000 * 60)) / 1000);
                        newTimes[art._id] = `${h}h ${m}m ${s}s`;
                    }
                }
            });
            setTimeLeftMap(newTimes);
        }, 1000);
        return () => clearInterval(timer);
    }, [artworks]);

    const handlePlaceBid = async () => {
        const currentPrice = selectedArt.highestBid || selectedArt.price;
        const newBid = Number(bidAmount);
        if (newBid <= currentPrice) return alert(`Bid higher than ₹${currentPrice}`);

        try {
            await axios.put(`http://localhost:5001/api/art/bid/${selectedArt._id}`, {
                userId: user._id, amount: newBid
            });
            setArtworks(prev => prev.map(art => 
                art._id === selectedArt._id ? { ...art, highestBid: newBid, highestBidder: user._id } : art
            ));
            setShowBidModal(false);
            setBidAmount("");
            setSelectedArt(null);
            alert("Bid Placed Successfully!");
        } catch (err) { alert("Bid failed"); }
    };

    const addToCart = (art, redirect = false) => {
        if (art.isSold) return;
        const finalPrice = art.highestBid || art.price;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cleanCart = cart.filter(item => item._id !== art._id);
        const cartItem = { ...art, price: finalPrice, cartId: Date.now(), quantity: 1 };
        localStorage.setItem('cart', JSON.stringify([...cleanCart, cartItem]));
        window.dispatchEvent(new Event('storage'));
        if (redirect) navigate('/cart');
    };

    const toggleLike = async (e, artId) => {
        e.stopPropagation();
        if (!user?._id) return alert("Login to like!");
        try {
            const res = await axios.put(`http://localhost:5001/api/auth/like-art`, { userId: user._id, artId });
            const newLikes = new Set(likedItems);
            likedItems.has(artId) ? newLikes.delete(artId) : newLikes.add(artId);
            setLikedItems(newLikes);
            localStorage.setItem('user', JSON.stringify({ ...user, likedArt: res.data.likedArt }));
        } catch (err) { console.error("Like failed"); }
    };

    // ✅ FIXED RECOMMENDATION LOGIC: Strictly match categories from profile
    const recommendedArt = artworks.filter(art => {
        return !art.isSold && 
               (!art.isAuction || timeLeftMap[art._id] === "EXPIRED") && 
               userPrefs.includes(art.category);
    });

    const liveAuctions = artworks.filter(a => a.isAuction && !a.isSold && timeLeftMap[a._id] !== "EXPIRED");
    
    const publicStudio = artworks.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (a.creator?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "All" || a.category === filterCategory;
        const matchesPrice = (a.highestBid || a.price) <= maxPrice;
        return !a.isSold && (!a.isAuction || timeLeftMap[a._id] === "EXPIRED") && matchesSearch && matchesCategory && matchesPrice;
    });

    const museumArchive = artworks.filter(a => a.isSold);

    const ArtCard = ({ art, isAuction, isGrid = false, showCategory = false }) => (
        <div className={`${!isGrid ? 'w-[320px] md:w-[380px] flex-shrink-0' : 'w-full'} group bg-white border border-zinc-100 rounded-[2.5rem] p-6 hover:shadow-2xl transition-all relative text-left flex flex-col h-full`}>
            {isAuction && (
                <div className="absolute top-8 left-8 z-30 bg-red-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-lg">
                    <Clock size={10} /> {timeLeftMap[art._id] || "LIVE"}
                </div>
            )}
            {showCategory && (
                <div className="absolute top-8 right-8 z-30 bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                    {art.category}
                </div>
            )}
            {!isAuction && !showCategory && !art.isSold && (
                 <button onClick={(e) => toggleLike(e, art._id)} className="absolute top-8 right-8 z-30 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
                    <Heart size={18} className={likedItems.has(art._id) ? "fill-red-500 text-red-500" : "text-zinc-400"} />
                 </button>
            )}
            <div className="aspect-square w-full rounded-[1.8rem] overflow-hidden mb-6 bg-zinc-50 cursor-pointer relative" onClick={() => setSelectedArt(art)}>
                <img src={art.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                {art.isSold && (
                    <div className="absolute top-6 left-6 z-30 bg-white/70 backdrop-blur-sm text-red-600 px-4 py-2 rounded-full font-black text-[10px] uppercase border border-red-100 shadow-sm flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" /> SOLD
                    </div>
                )}
            </div>
            <div className="space-y-4 flex-grow flex flex-col">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900 truncate mb-1">{art.title}</h3>
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-1">{art.creator?.name || "ArtVista Artist"}</p>
                    <p className="text-[11px] text-zinc-400 font-medium italic line-clamp-2 h-8 leading-relaxed">{art.description}</p>
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-zinc-50 mt-auto">
                    <div>
                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{isAuction ? 'High Bid' : 'Price'}</p>
                        <p className={`text-2xl font-black ${isAuction ? 'text-red-600' : 'text-zinc-900'}`}>₹{(art.highestBid || art.price).toLocaleString()}</p>
                    </div>
                    <button onClick={() => { setSelectedArt(art); if(isAuction) setShowBidModal(true); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg ${isAuction ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                        {isAuction ? 'Place Bid' : 'View Piece'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 bg-white min-h-screen font-sans text-left overflow-x-hidden">
            
            {/* OG BLACK BOX HERO */}
            <div className="relative mb-20 mt-4 overflow-hidden rounded-[3.5rem] bg-[#050505] py-20 px-12 md:px-24 text-white shadow-2xl border-b-[10px] border-[#FF8C00]">
                <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-center">
                    <div className="lg:col-span-3 text-left">
                        <div className="flex items-center gap-3 mb-8">
                            <Sparkles className="text-[#FF8C00]" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF8C00]">Premier Art Exchange</span>
                        </div>
                        <h1 className="text-7xl md:text-[9.5rem] font-black leading-[0.8] mb-12 tracking-tighter uppercase italic text-white">
                            ARTVISTA <br /> <span className="text-[#FF8C00]">STUDIO.</span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-2xl font-medium max-w-2xl leading-tight">
                            Verified provenance, blockchain-backed authenticity, and worldwide white-glove logistics.
                        </p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-2 gap-y-16 gap-x-12 border-l border-white/5 pl-16 py-4 text-center">
                        <div><p className="text-6xl font-black">12.4K</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Collectors</p></div>
                        <div><p className="text-6xl font-black">450+</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Artists</p></div>
                        <div><p className="text-6xl font-black">100%</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Insured</p></div>
                        <div><p className="text-6xl font-black">24/7</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Support</p></div>
                    </div>
                </div>
                <div className="absolute top-[-30%] right-[-10%] w-[900px] h-[900px] bg-[#FF8C00] rounded-full blur-[250px] opacity-[0.1]"></div>
            </div>

            {/* LIVE AUCTIONS */}
            {liveAuctions.length > 0 && (
                <div className="mb-24 px-4">
                    <h2 className="text-2xl font-black uppercase italic text-red-600 mb-10 flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]" /> Live Auction Booth
                    </h2>
                    <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x">
                        {liveAuctions.map(art => <ArtCard key={art._id} art={art} isAuction={true} />)}
                    </div>
                </div>
            )}

            {/* RECOMMENDED */}
            {recommendedArt.length > 0 && (
                <div className="mb-24 px-4">
                    <h2 className="text-2xl font-black uppercase italic text-zinc-900 mb-10 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#FF8C00] rounded-full animate-pulse shadow-[0_0_10px_#FF8C00]" /> For {user.name?.split(' ')[0] || 'You'}
                    </h2>
                    <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x">
                        {recommendedArt.map(art => <ArtCard key={art._id} art={art} isAuction={false} showCategory={true} />)}
                    </div>
                </div>
            )}

            {/* PUBLIC STUDIO */}
            <div className="bg-[#fdf4f0] -mx-8 px-10 py-24 rounded-[4rem] border-y border-zinc-100 mb-24 shadow-inner">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 px-4 text-black">
                    <h2 className="text-3xl font-black uppercase italic border-l-8 border-[#FF8C00] pl-6">Public Studio</h2>
                    <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl border border-zinc-100">
                        <div className="flex items-center gap-3 px-5 py-3 bg-zinc-50 rounded-full min-w-[280px]">
                            <Search size={16} className="text-zinc-400" /><input type="text" placeholder="Search Title or Artist..." className="bg-transparent outline-none text-xs font-bold w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="px-5 py-3 bg-zinc-50 rounded-full text-xs font-black uppercase outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="All">All Categories</option>
                            <option value="Colour drawing">Colour drawing</option><option value="Sketching">Sketching</option><option value="Charcoal drawing">Charcoal drawing</option><option value="Acrylic painting">Acrylic painting</option>
                            <option value="Oil Painting">Oil Painting</option><option value="Watercolour Art">Watercolour Art</option><option value="Mandala Art">Mandala Art</option><option value="Anime & Manga">Anime & Manga</option>
                            <option value="Pottery & Ceramics">Pottery & Ceramics</option><option value="Calligraphy">Calligraphy</option><option value="Canvas Print">Canvas Print</option><option value="Portrait Sketch">Portrait Sketch</option>
                            <option value="Abstract Expressionism">Abstract Expressionism</option><option value="Pop Art">Pop Art</option>
                        </select>
                        <div className="flex items-center gap-4 px-6 py-2 bg-zinc-50 rounded-full">
                            <span className="text-[9px] font-black uppercase text-zinc-400">Max: ₹{maxPrice.toLocaleString()}</span>
                            <input type="range" min="0" max="200000" className="w-32 accent-[#FF8C00]" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 px-4 text-black">
                    {publicStudio.map(art => <ArtCard key={art._id} art={art} isAuction={false} isGrid={true} />)}
                </div>
            </div>

            {/* MUSEUM ARCHIVE */}
            {museumArchive.length > 0 && (
                <div className="px-4 pb-24">
                    <h2 className="text-3xl font-black uppercase italic text-zinc-400 mb-16 flex items-center gap-4"><div className="w-12 h-[2px] bg-zinc-300" /> Museum Archive</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-black">
                        {museumArchive.map(art => <ArtCard key={art._id} art={art} isAuction={false} isGrid={true} />)}
                    </div>
                </div>
            )}

            {/* BID MODAL */}
            {showBidModal && selectedArt && (
                <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-black text-center">
                    <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in duration-300 relative">
                        <button onClick={() => {setShowBidModal(false); setBidAmount("");}} className="absolute top-8 right-8 text-zinc-300 hover:text-black"><X/></button>
                        <Gavel className="mx-auto text-red-600" size={48} /><h2 className="text-3xl font-black uppercase tracking-tight">Bid Registry</h2>
                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100"><p className="text-4xl font-black text-red-600">₹{(selectedArt.highestBid || selectedArt.price).toLocaleString()}</p></div>
                        <input type="number" className="w-full p-5 bg-zinc-100 rounded-2xl outline-none font-black text-xl text-center" value={bidAmount} placeholder="Enter Higher Amount" onChange={(e) => setBidAmount(e.target.value)} />
                        <button onClick={handlePlaceBid} className="w-full bg-red-600 text-white py-6 rounded-2xl font-black uppercase text-xs shadow-xl">Update DB Registry</button>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {selectedArt && !showBidModal && (
                <div className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-2xl flex items-center justify-center p-4 text-left text-black">
                    <button onClick={() => setSelectedArt(null)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"><X size={48}/></button>
                    <div className="bg-white max-w-[1200px] w-full rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh] shadow-2xl relative border border-white/10">
                        <div className="flex-1 bg-[#F5F5F7] flex items-center justify-center p-6 md:p-12 relative group/img">
                            <img src={selectedArt.image} className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl" alt="" />
                            {selectedArt.isSold && <div className="absolute top-8 left-8 z-30 bg-white/70 backdrop-blur-sm text-red-600 px-6 py-2 rounded-full font-black text-xs uppercase flex items-center gap-2 shadow-2xl border border-red-100"><div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" /> PRIVATE ASSET</div>}
                        </div>
                        <div className="w-full md:w-[480px] bg-white flex flex-col border-l border-zinc-100 overflow-y-auto">
                            <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/profile/${selectedArt.creator?._id || selectedArt.creator}`)}>
                                    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold text-lg">{selectedArt.creator?.name?.[0] || 'A'}</div>
                                    <div><p className="text-sm font-black uppercase text-zinc-900">{selectedArt.creator?.name || 'Artist'}</p><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10} className="text-blue-500" /> Verified</p></div>
                                </div>
                                {!selectedArt.isSold && (
                                    <button onClick={(e) => toggleLike(e, selectedArt._id)} className={`p-3 rounded-full ${likedItems.has(selectedArt._id) ? 'bg-red-50 text-red-500' : 'bg-zinc-50 text-zinc-400'}`}><Heart size={20} fill={likedItems.has(selectedArt._id) ? "currentColor" : "none"} /></button>
                                )}
                            </div>
                            <div className="p-10 space-y-6 flex-grow">
                                <h3 className="text-5xl font-black uppercase tracking-tighter text-zinc-900 leading-[0.9]">{selectedArt.title}</h3>
                                <p className="text-zinc-500 font-medium italic text-lg leading-relaxed border-l-4 border-zinc-100 pl-6">"{selectedArt.description}"</p>
                            </div>
                            <div className="p-10 bg-zinc-50/50 border-t border-zinc-100 mt-auto">
                                <div className="mb-8"><p className="text-6xl font-black text-zinc-900 tracking-tighter">₹{(selectedArt.highestBid || selectedArt.price).toLocaleString()}</p></div>
                                {!selectedArt.isSold ? (
                                    <button onClick={() => addToCart(selectedArt, true)} className="w-full bg-[#FF8C00] text-white py-6 rounded-2xl font-black text-sm uppercase shadow-xl flex items-center justify-center gap-3 hover:bg-[#e67e00]"><Zap size={20} fill="currentColor" /> Purchase</button>
                                ) : (
                                    <div className="w-full bg-zinc-900 text-zinc-400 py-6 rounded-2xl font-black text-center border-2 border-dashed border-zinc-700 uppercase text-[10px] tracking-[0.3em]">Registry Asset</div>
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