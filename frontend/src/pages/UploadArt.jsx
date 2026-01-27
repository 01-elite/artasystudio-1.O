import React, { useState } from 'react';
import axios from 'axios';
import { Upload, ChevronRight, Check } from 'lucide-react';

const UploadArt = () => {
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Safety check: get user ID for the 'creator' field
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: 'Painting',
        isCustomizable: false
    });

    const handleSubmit = async () => {
        const data = new FormData();
        data.append('image', file);
        data.append('title', formData.title);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('isCustomizable', formData.isCustomizable);
        data.append('creatorId', user._id); // Connects art to your account

        try {
            setLoading(true);
            await axios.post('http://localhost:5001/api/art/upload', data);
            alert("Masterpiece Published to ArtVista!");
            window.location.href = "/profile";
        } catch (err) {
            alert("Upload failed. Ensure backend is on 5001");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-50">
            {step === 1 ? (
                <div className="text-center">
                    <h2 className="text-3xl font-black mb-8 text-gray-800">Choose your <span className="text-[#FF8C00]">Art</span></h2>
                    <label className="border-4 border-dashed border-gray-100 rounded-[2rem] h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/50 transition-all">
                        <Upload size={48} className="text-[#FF8C00] mb-4"/>
                        <p className="font-bold text-gray-400">{file ? file.name : "BROWSE FROM DEVICE"}</p>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                    <button onClick={() => setStep(2)} disabled={!file} className="mt-8 w-full bg-[#FF8C00] text-white py-5 rounded-2xl font-black shadow-lg shadow-orange-200 disabled:bg-gray-100 transition-all">NEXT DETAILS</button>
                </div>
            ) : (
                <div className="space-y-5">
                    <h2 className="text-2xl font-black mb-6">Art <span className="text-[#FF8C00]">Details</span></h2>
                    <input placeholder="Title" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-none font-bold" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    
                    <select className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold text-gray-500" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option>Painting</option>
                        <option>Sketch</option>
                        <option>Black & White</option>
                        <option>Colourful</option>
                    </select>

                    <textarea placeholder="Tell the story of this piece..." className="w-full p-5 bg-gray-50 rounded-2xl h-32 outline-none font-bold" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                        <span className="font-bold text-gray-700">Customizable?</span>
                        <input type="checkbox" className="w-6 h-6 accent-[#FF8C00]" onChange={(e) => setFormData({...formData, isCustomizable: e.target.checked})} />
                    </div>

                    <div className="relative">
                        <span className="absolute left-5 top-5 font-bold text-[#FF8C00]">$</span>
                        <input type="number" placeholder="Price" className="w-full p-5 pl-10 bg-gray-50 rounded-2xl outline-none font-bold" onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    </div>

                    <button onClick={handleSubmit} className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-[#FF8C00] transition-all">
                        {loading ? "PUBLISHING..." : "PUBLISH TO GALLERY"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadArt;