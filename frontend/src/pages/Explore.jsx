import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, X, Gavel, Info } from 'lucide-react';

const Explore = () => {
    const [artworks, setArtworks] = useState([]);
    const [selectedArt, setSelectedArt] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const fetchData = () => {
        axios.get('http://localhost:5001/api/art/explore').then(res => setArtworks(res.data));
    };

    useEffect(() => { fetchData(); }, []);

    const handleBid = async () => {
        if (!user._id) return alert("Login to place a bid!");
        try {
            await axios.put(`http://localhost:5001/api/art/bid/${selectedArt._id}`, {
                userId: user._id, amount: Number(bidAmount)
            });
            alert("Bid Placed Successfully!");
            setBidAmount("");
            fetchData();
            setSelectedArt(null);
        } catch (err) { alert(err.response.data.message); }
    };

    const auctions = artworks.filter(a => a.isAuction);
    const gallery = artworks.filter(a => !a.isAuction);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen font-sans text-left">
            {/* --- AUCTION BOOTH --- */}
            {auctions.length > 0 && (
                <div id="auction-booth" className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600 italic">Live Auction Booth</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {auctions.map(art => (
                            <div key={art._id} onClick={() => setSelectedArt(art)} className="group relative bg-white border border-red-100 rounded-[2rem] p-3 hover:shadow-2xl transition-all cursor-pointer">
                                <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-4 relative">
                                    <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="art" />
                                    <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="bg-white text-red-600 font-black px-6 py-2 rounded-full text-xs shadow-xl">BID ON THIS</button>
                                    </div>
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

            {/* --- REGULAR GALLERY --- */}
            <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Public <span className="text-[#FF8C00]">Gallery</span></h2>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {gallery.map(art => (
                    <div key={art._id} onClick={() => setSelectedArt(art)} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-pointer">
                        <img src={art.image} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="gallery" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-white font-bold text-[10px] truncate">{art.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- AUCTION / DETAIL MODAL --- */}
            {selectedArt && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                    <button onClick={() => setSelectedArt(null)} className="absolute top-10 right-10 text-white"><X size={40} /></button>
                    <div className="bg-white max-w-5xl w-full rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[85vh] shadow-2xl">
                        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
                            <img src={selectedArt.image} className="w-full h-full object-contain rounded-2xl" alt="preview" />
                        </div>
                        <div className="w-full md:w-[450px] p-10 flex flex-col bg-white">
                            <h3 className="text-4xl font-black mb-4">{selectedArt.title}</h3>
                            
                            {selectedArt.isAuction ? (
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 mb-6">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs font-black text-red-400 uppercase">Highest Bidder</p>
                                            <div className="bg-red-500 w-2 h-2 rounded-full animate-ping"></div>
                                        </div>
                                        <p className="text-4xl font-black text-red-600">${selectedArt.highestBid}</p>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-300 uppercase mb-3 tracking-widest">Recent Bids</p>
                                    <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
                                        {selectedArt.bids?.map((bid, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                                <span className="font-bold text-xs text-gray-700">{bid.bidder?.name}</span>
                                                <span className="font-black text-red-500 text-sm">${bid.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 p-2 bg-gray-100 rounded-2xl">
                                        <input type="number" placeholder="Enter bid amount..." className="flex-1 bg-transparent px-4 py-3 font-black text-sm outline-none" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                                        <button onClick={handleBid} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-red-700 transition">PLACE BID</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col justify-between">
                                    <p className="text-gray-500 font-medium italic mb-10">"{selectedArt.description}"</p>
                                    <div className="pt-10 border-t">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Buy Now Price</p>
                                        <p className="text-5xl font-black mb-8">${selectedArt.price}</p>
                                        <button className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-orange-500 shadow-xl transition-all">COLLECT NOW</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explore;