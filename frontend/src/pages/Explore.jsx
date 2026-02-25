import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Heart, X, Sparkles, Clock, Truck, ShoppingBag, ArrowUpRight, 
    Zap, Share2, MoreHorizontal, CheckCircle2, ShieldCheck 
} from 'lucide-react';

const Explore = () => {
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState([]);
    const [selectedArt, setSelectedArt] = useState(null);
    const [likedItems, setLikedItems] = useState(new Set());
    const [timeLeftMap, setTimeLeftMap] = useState({});
    
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:5001/api/art/explore");
            setArtworks(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    // Original Timer logic
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

    const toggleLike = (e, artId) => {
        e.stopPropagation();
        const newLikes = new Set(likedItems);
        likedItems.has(artId) ? newLikes.delete(artId) : newLikes.add(artId);
        setLikedItems(newLikes);
    };

    const auctions = artworks.filter(a => a.isAuction && !a.isSold);
    const gallery = artworks.filter(a => !a.isAuction && !a.isSold);
    const soldRegistry = artworks.filter(a => a.isSold);

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 bg-white min-h-screen font-sans text-left">
            
            {/* --- HERO SECTION --- */}
            <div className="relative mb-20 mt-4 overflow-hidden rounded-[3.5rem] bg-[#050505] py-20 px-12 md:px-24 text-white shadow-2xl border-b-[10px] border-[#FF8C00]">
                <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-center">
                    <div className="lg:col-span-3">
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
                    <div className="lg:col-span-2 grid grid-cols-2 gap-y-16 gap-x-12 border-l border-white/5 pl-16 py-4">
                        <div><p className="text-6xl font-black">12.4K</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Collectors</p></div>
                        <div><p className="text-6xl font-black">450+</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Artists</p></div>
                        <div><p className="text-6xl font-black">100%</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Insured</p></div>
                        <div><p className="text-6xl font-black">24/7</p><p className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00] mt-3">Support</p></div>
                    </div>
                </div>
                <div className="absolute top-[-30%] right-[-10%] w-[900px] h-[900px] bg-[#FF8C00] rounded-full blur-[250px] opacity-[0.1]"></div>
            </div>

            {/* --- 1. LIVE AUCTION BOOTH (HORIZONTAL SCROLL) --- */}
            {auctions.length > 0 && (
                <div className="mb-24 px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-red-600 mb-10 flex items-center gap-3 italic">
                         <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]" /> Live Auction Booth
                    </h2>
                    <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x snap-mandatory">
                        {auctions.map(art => (
                            <div key={art._id} className="min-w-[320px] md:min-w-[380px] snap-start group bg-white border border-red-100 rounded-[2.5rem] p-6 hover:shadow-2xl transition-all relative">
                                <div className="absolute top-8 right-8 z-30 bg-red-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-lg">
                                    <Clock size={10} /> {timeLeftMap[art._id] || "LIVE"}
                                </div>
                                <div className="aspect-square rounded-[1.8rem] overflow-hidden mb-6 bg-zinc-50 cursor-pointer" onClick={() => setSelectedArt(art)}>
                                    <img src={art.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="art" />
                                </div>
                                <div className="px-2 space-y-4 text-left">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900 truncate mb-1">{art.title}</h3>
                                        <p className="text-[11px] text-zinc-400 font-medium italic line-clamp-1">"{art.description || "Masterpiece lot with verified records."}"</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-5 border-t border-zinc-50">
                                        <div>
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Current Bid</p>
                                            <p className="text-2xl font-black text-red-600">₹{(art.highestBid || art.price).toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedArt(art)}
                                            className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-red-700 flex items-center gap-2"
                                        >
                                            Place Bid <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 2. AVAILABLE INVENTORY --- */}
            <div className="bg-[#fcfcfc] -mx-8 px-10 py-24 rounded-[4rem] border-y border-zinc-100 mb-24 shadow-inner">
                <div className="flex justify-between items-end mb-16 px-4">
                    <h2 className="text-4xl font-black uppercase tracking-tight text-zinc-900">Available <span className="text-[#FF8C00]">Inventory</span></h2>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        <Truck size={18} className="text-blue-500" /> Insured Shipping
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {gallery.map(art => (
                        <div key={art._id} className="group relative bg-white p-6 rounded-[2.5rem] border border-zinc-200 hover:border-[#FF8C00]/40 transition-all duration-500 hover:shadow-2xl flex flex-col">
                            <div className="relative aspect-square rounded-[1.8rem] overflow-hidden mb-6 bg-zinc-100 cursor-pointer" onClick={() => setSelectedArt(art)}>
                                <img src={art.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={art.title} />
                                <button onClick={(e) => toggleLike(e, art._id)} className="absolute top-4 right-4 z-20 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:scale-110">
                                    <Heart size={18} className={likedItems.has(art._id) ? "fill-red-500 text-red-500" : "text-zinc-400"} />
                                </button>
                            </div>
                            <div className="px-2 text-left space-y-3 flex-grow">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 truncate leading-none">{art.title}</h3>
                                    <p className="text-[10px] font-bold text-[#FF8C00] uppercase tracking-widest">Master: {art.creator?.name || 'Artist'}</p>
                                </div>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-2 h-8">
                                    {art.description || "Limited edition masterpiece curated for elite collectors globally."}
                                </p>
                                <div className="flex justify-between items-end pt-6 border-t border-zinc-50">
                                    <p className="text-3xl font-black text-zinc-900 leading-none">₹{art.price?.toLocaleString()}</p>
                                    <button onClick={() => setSelectedArt(art)} className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF8C00] transition-colors flex items-center gap-2 shadow-sm">
                                        View Piece <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 3. ARCHIVED REGISTRY (SOLD ITEMS) --- */}
            {soldRegistry.length > 0 && (
                <div className="px-8 pb-20">
                    <h2 className="text-3xl font-black uppercase text-zinc-900 mb-12 tracking-tight">Archived <span className="text-[#FF8C00]">Registry</span></h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {soldRegistry.map(art => (
                            <div key={art._id} className="group relative bg-white p-6 rounded-[2.5rem] border border-zinc-200 hover:shadow-xl transition-all">
                                <div className="absolute top-10 left-10 z-30 bg-white/90 backdrop-blur-md text-red-600 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-red-100 shadow-sm flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" /> SOLD
                                </div>
                                <div className="aspect-square rounded-[1.8rem] overflow-hidden mb-6 bg-zinc-50 cursor-pointer" onClick={() => setSelectedArt(art)}>
                                    <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                </div>
                                <div className="px-2 text-left space-y-3">
                                    <h3 className="text-xl font-black uppercase text-zinc-900 truncate leading-none">{art.title}</h3>
                                    <p className="text-[11px] text-zinc-400 font-medium italic line-clamp-2 leading-relaxed">"{art.description || "Authenticated private registry asset."}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- ✅ NEW PINTEREST X AMAZON ELITE MODAL --- */}
            {selectedArt && (
                <div className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-2xl flex items-center justify-center p-4">
                    <button onClick={() => setSelectedArt(null)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors duration-300">
                        <X size={48} strokeWidth={1.5} />
                    </button>

                    <div className="bg-white max-w-[1200px] w-full rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh] shadow-2xl relative border border-white/10">
                        
                        {/* --- LEFT: PINTEREST STYLE IMAGE VIEWER --- */}
                        <div className="flex-1 bg-[#F5F5F7] flex items-center justify-center p-6 md:p-12 relative group/img">
                            <img 
                                src={selectedArt.image} 
                                className="max-h-full max-w-full object-contain rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]" 
                                alt="preview" 
                            />
                            <div className="absolute top-8 left-8 flex gap-3">
                                <button className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform">
                                    <Share2 size={20} className="text-zinc-900" />
                                </button>
                                <button className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform">
                                    <MoreHorizontal size={20} className="text-zinc-900" />
                                </button>
                            </div>
                        </div>

                        {/* --- RIGHT: AMAZON STYLE PURCHASE SIDEBAR --- */}
                        <div className="w-full md:w-[480px] bg-white flex flex-col border-l border-zinc-100 overflow-y-auto">
                            
                            {/* 1. Header: Instagram Style Creator Info */}
                            <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/profile/${selectedArt.creator?._id || selectedArt.creator}`)}>
                                    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {selectedArt.creator?.name?.[0] || 'A'}
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm font-black uppercase tracking-tight text-zinc-900">
                                                {selectedArt.creator?.name || 'ArtVista Creator'}
                                            </p>
                                            <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10" />
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verified Artist</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => toggleLike(e, selectedArt._id)}
                                    className={`p-3 rounded-full transition-all ${likedItems.has(selectedArt._id) ? 'bg-red-50 text-red-500' : 'bg-zinc-50 text-zinc-400'}`}
                                >
                                    <Heart size={20} fill={likedItems.has(selectedArt._id) ? "currentColor" : "none"} />
                                </button>
                            </div>

                            {/* 2. Content: Title & Description */}
                            <div className="p-10 space-y-6 flex-grow text-left">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-[#FF8C00] uppercase tracking-[0.3em]">Masterwork • Registry No. {selectedArt._id.slice(-6)}</p>
                                    <h3 className="text-5xl font-black uppercase tracking-tighter text-zinc-900 leading-[0.9]">
                                        {selectedArt.title}
                                    </h3>
                                </div>
                                
                                <p className="text-zinc-500 font-medium italic text-lg leading-relaxed border-l-4 border-zinc-100 pl-6">
                                    "{selectedArt.description || 'Verified masterpiece with guaranteed provenance and global logistics support.'}"
                                </p>

                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center gap-3 text-zinc-600">
                                        <Clock size={18} className="text-[#FF8C00]" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest">
                                            {selectedArt.isAuction ? `Ends In: ${timeLeftMap[selectedArt._id] || 'LIVE'}` : 'Instant Acquisition'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-zinc-600">
                                        <ShieldCheck size={18} className="text-[#FF8C00]" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest">Authenticity Guaranteed</p>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Footer: Pricing & Action */}
                            <div className="p-10 bg-zinc-50/50 border-t border-zinc-100 mt-auto text-left">
                                <div className="mb-8">
                                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2">Total Acquisition Value</p>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-6xl font-black text-zinc-900 tracking-tighter">
                                            ₹{(selectedArt.highestBid || selectedArt.price).toLocaleString()}
                                        </p>
                                        <span className="text-xs font-bold text-zinc-400 uppercase">Inc. Taxes</span>
                                    </div>
                                </div>

                                {!selectedArt.isSold ? (
                                    <div className="space-y-4">
                                        <button className="w-full bg-[#FF8C00] text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-[#e67e00] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                            <Zap size={20} fill="currentColor" /> {selectedArt.isAuction ? 'Place Bid' : 'Acquire Masterpiece'}
                                        </button>
                                        <button className="w-full bg-zinc-900 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg hover:bg-black active:scale-[0.98] transition-all">
                                            Add to Collection
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full bg-zinc-100 text-zinc-400 py-10 rounded-2xl font-black text-center border-2 border-dashed border-zinc-200 uppercase text-[10px] tracking-[0.3em] flex flex-col gap-2">
                                        <span className="text-red-500 text-lg">●</span>
                                        Asset Held in Private Registry
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