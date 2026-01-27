import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Gavel, Tag } from 'lucide-react';

const UploadArt = () => {
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [formData, setFormData] = useState({
        title: '', price: '', description: '', category: 'Painting', isCustomizable: false, isAuction: false
    });

    const handleSubmit = async () => {
        const data = new FormData();
        data.append('image', file);
        data.append('title', formData.title);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('isCustomizable', formData.isCustomizable);
        data.append('isAuction', formData.isAuction);
        data.append('creatorId', user._id);

        try {
            setLoading(true);
            await axios.post('http://localhost:5001/api/art/upload', data);
            alert("Masterpiece Published!");
            window.location.href = "/profile";
        } catch (err) { alert("Upload failed."); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-50">
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
                            <span className="font-black text-xs">FIXED PRICE</span>
                        </button>
                        <button onClick={() => {setFormData({...formData, isAuction: true}); setStep(2)}} className="p-6 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-red-500 transition-all">
                            <Gavel className="text-gray-400" />
                            <span className="font-black text-xs text-red-500">AUCTION BOOTH</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-2xl font-black">Final <span className="text-[#FF8C00]">Details</span></h2>
                    <input placeholder="Title" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-500 outline-none" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option>Painting</option><option>Sketch</option><option>Black & White</option><option>Colourful</option>
                    </select>
                    <textarea placeholder="The story..." className="w-full p-4 bg-gray-50 rounded-2xl h-24 font-bold outline-none" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <input type="number" placeholder={formData.isAuction ? "Starting Bid ($)" : "Price ($)"} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-orange-100" onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    <button onClick={handleSubmit} className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-[#FF8C00] transition-all">
                        {loading ? "PUBLISHING..." : "POST MASTERPIECE"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadArt;