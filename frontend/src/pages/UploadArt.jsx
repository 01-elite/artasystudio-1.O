import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Gavel, Tag, Clock } from 'lucide-react';

const UploadArt = () => {
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [auctionHours, setAuctionHours] = useState(24); 
    
    // ✅ Check if user exists to avoid creatorId error
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [formData, setFormData] = useState({
        title: '', 
        price: '', 
        description: '', 
        category: 'Colour drawing', // Defaulting to one of your new ones
        isCustomizable: false, 
        isAuction: false
    });

    const handleSubmit = async () => {
        // Validation
        if (!file) return alert("Please upload an image.");
        if (!formData.title) return alert("Please enter a title.");
        if (!formData.price) return alert("Please enter a price.");
        if (!user._id) return alert("You must be logged in to upload!");

        const data = new FormData();
        data.append('image', file);
        data.append('title', formData.title);
        data.append('price', formData.price);
        data.append('description', formData.description || "No description provided.");
        data.append('category', formData.category);
        data.append('isCustomizable', String(formData.isCustomizable));
        data.append('isAuction', String(formData.isAuction));
        data.append('creatorId', user._id); // Make sure this matches your backend req.body.creatorId

        // Handle Auction Logic
        if (formData.isAuction) {
            const auctionEndDate = new Date();
            auctionEndDate.setHours(auctionEndDate.getHours() + Number(auctionHours));
            data.append('auctionEnd', auctionEndDate.toISOString());
        }

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5001/api/art/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.status === 201 || response.status === 200) {
                alert("Masterpiece Published!");
                window.location.href = "/profile";
            }
        } catch (err) { 
            console.error("Upload Error Details:", err.response?.data);
            alert(err.response?.data?.message || "Upload failed. Check console for details."); 
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

                    <input placeholder="Title" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-orange-100 transition-all text-black" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    
                    <select 
                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-500 outline-none border-2 border-transparent focus:border-orange-100 transition-all" 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="Colour drawing">Colour drawing</option>
                        <option value="Sketching">Sketching</option>
                        <option value="Charcoal drawing">Charcoal drawing</option>
                        <option value="Acrylic painting">Acrylic painting</option>
                        <option value="Oil Painting">Oil Painting</option>
                        <option value="Watercolour Art">Watercolour Art</option>
                        <option value="Mandala Art">Mandala Art</option>
                        <option value="Anime & Manga">Anime & Manga</option>
                        <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                        <option value="Calligraphy">Calligraphy</option>
                        <option value="Canvas Print">Canvas Print</option>
                        <option value="Portrait Sketch">Portrait Sketch</option>
                        <option value="Abstract Expressionism">Abstract Expressionism</option>
                        <option value="Pop Art">Pop Art</option>
                    </select>

                    <textarea placeholder="The story behind this piece..." className="w-full p-4 bg-gray-50 rounded-2xl h-24 font-bold outline-none border-2 border-transparent focus:border-orange-100 transition-all text-black" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">{formData.isAuction ? "Starting Bid (₹)" : "Price (₹)"}</p>
                            <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-orange-100 text-black" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
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
                                    <option value="2">2 Hours</option>
                                    <option value="5">5 Hours</option>
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