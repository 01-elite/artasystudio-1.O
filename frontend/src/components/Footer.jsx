// src/components/Footer.jsx
import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const Footer = () => {
    const [message, setMessage] = useState("");

    const handleSendMail = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        window.location.href = `mailto:admin@gmail.com?subject=ArtVista Inquiry&body=${encodeURIComponent(message)}`;
        setMessage("");
    };

    return (
        <footer className="bg-[#050505] text-white pt-24 pb-12 px-12 md:px-24 mt-32 rounded-t-[5rem] border-t-8 border-[#FF8C00]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                <div className="lg:col-span-2 space-y-8 text-left">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-[#FF8C00]" size={24} />
                        <h2 className="text-3xl font-black uppercase italic">ARTVISTA STUDIO.</h2>
                    </div>
                    <p className="text-zinc-500 max-w-md">The world's premier digital registry for fine art.</p>
                </div>
                <div className="text-left space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#FF8C00]">Admin Contact</h3>
                    <a href="mailto:admin@gmail.com" className="text-xl font-black hover:text-[#FF8C00]">admin@gmail.com</a>
                </div>
                <div className="text-left space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#FF8C00]">Quick Message</h3>
                    <form onSubmit={handleSendMail} className="relative">
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white text-sm"
                            placeholder="Message admin..."
                        />
                        <button type="submit" className="absolute bottom-4 right-4 text-[#FF8C00]"><ArrowRight /></button>
                    </form>
                </div>
            </div>
        </footer>
    );
};

export default Footer;