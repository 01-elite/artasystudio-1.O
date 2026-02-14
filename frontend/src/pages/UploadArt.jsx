import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Gavel, Tag, Clock } from 'lucide-react';

const UploadArt = () => {
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [auctionHours, setAuctionHours] = useState(24); // Default 24h duration
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [formData, setFormData] = useState({
        title: '', 
        price: '', 
        description: '', 
        category: 'Painting', 
        isCustomizable: false, 
        isAuction: false
    });

    const handleSubmit = async () => {
        if (!file || !formData.title || !formData.price) {
            return alert("Please fill in all required fields and upload an image.");
        }

        const data = new FormData();
        data.append('image', file);
        data.append('title', formData.title);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('isCustomizable', formData.isCustomizable);
        data.append('isAuction', formData.isAuction);
        data.append('creatorId', user._id);

        // ✅ Calculate Auction End Time if applicable
        if (formData.isAuction) {
            const auctionEndDate = new Date();
            auctionEndDate.setHours(auctionEndDate.getHours() + Number(auctionHours));
            data.append('auctionEnd', auctionEndDate.toISOString());
        }

        try {
            setLoading(true);
            await axios.post('http://localhost:5001/api/art/upload', data);
            alert("Masterpiece Published!");
            window.location.href = "/profile";
        } catch (err) { 
            console.error(err);
            alert("Upload failed."); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-50 text-left">
            {step === 1 ? (
                <div className="text-center">
                    <h2 className="text-3xl font-black mb-8 text-gray-800">Publish your <span className="text-[#FF8C00]">Work</span></h2>
                    <label className="border-4 border-dashed border-gray-100 rounded-[2rem] h-60 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition-all">
                        <Upload size={48} className="text-[#FF8C00] mb-4"/>
                        <p className="font-bold text-gray-400">{file ? file.name : "BROWSE ART FILE"}</p>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button onClick={() => {setFormData({...formData, isAuction: false}); setStep(2)}} className="p-6 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-[#FF8C00] transition-all">
                            <Tag className="text-gray-400" />
                            <span className="font-black text-xs uppercase">Fixed Price</span>
                        </button>
                        <button onClick={() => {setFormData({...formData, isAuction: true}); setStep(2)}} className="p-6 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-red-500 transition-all">
                            <Gavel className="text-gray-400" />
                            <span className="font-black text-xs text-red-500 uppercase">Auction Booth</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Final <span className="text-[#FF8C00]">Details</span></h2>
                        <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors">Back</button>
                    </div>

                    <input placeholder="Title" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-orange-100 transition-all" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    
                    <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-500 outline-none border-2 border-transparent focus:border-orange-100 transition-all" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option>Painting</option><option>Sketch</option><option>Black & White</option><option>Colourful</option>
                    </select>

                    <textarea placeholder="The story behind this piece..." className="w-full p-4 bg-gray-50 rounded-2xl h-24 font-bold outline-none border-2 border-transparent focus:border-orange-100 transition-all" onChange={(e) => setFormData({...formData, description: e.target.value})} />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">{formData.isAuction ? "Starting Bid ($)" : "Price ($)"}</p>
                            <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-orange-100" onChange={(e) => setFormData({...formData, price: e.target.value})} />
                        </div>
                        
                        {formData.isAuction && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-red-400 mb-2 ml-2 flex items-center gap-1"><Clock size={10}/> Duration (Hours)</p>
                                <select 
                                    className="w-full p-4 bg-red-50 rounded-2xl font-bold text-red-600 outline-none border-2 border-red-100"
                                    value={auctionHours}
                                    onChange={(e) => setAuctionHours(e.target.value)}
                                >
                                    <option value="1">1 Hour</option>
                                    <option value="12">12 Hours</option>
                                    <option value="24">24 Hours</option>
                                    <option value="48">48 Hours</option>
                                    <option value="72">72 Hours</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase hover:bg-[#FF8C00] transition-all disabled:bg-gray-200 mt-4"
                    >
                        {loading ? "Publishing Masterpiece..." : "Post to Artasystudio"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadArt;