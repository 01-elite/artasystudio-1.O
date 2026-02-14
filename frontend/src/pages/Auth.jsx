import React, { useState } from 'react';
import axios from 'axios';
import { ArrowRight, Loader2 } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // DIRECT SOLUTION: Ensuring port 5001 is hit
        const path = isLogin ? 'login' : 'register';
        const API_URL = `http://localhost:5001/api/auth/${path}`;

        try {
            const { data } = await axios.post(API_URL, formData);
            
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(data));
           
            alert(isLogin ? `Welcome back, ${data.name}!` : "Account created successfully!");
            
            // Redirect based on role
            if (data.role === 'creator') {
                window.location.href = "/dashboard";
            } else {
                window.location.href = "/profile";
            }
        } catch (err) {
            console.error("Auth Error:", err);
            alert(err.response?.data?.message || "Connection failed. Check if backend is running on 5001.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-white">
            <div className="max-w-md w-full p-10 rounded-[3rem] shadow-2xl border border-gray-100 bg-white">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-gray-900">{isLogin ? "Login" : "Sign Up"}</h2>
                    <p className="text-[#FF8C00] font-bold text-xs uppercase tracking-[0.2em] mt-2">ArtVista Studio</p>
                </div>

                <form onSubmit={handleAction} className="space-y-4">
                    {!isLogin && (
                        <input 
                            type="text" placeholder="Full Name" 
                            className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-[#FF8C00] transition-all"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    )}
                    <input 
                        type="email" placeholder="Email" 
                        className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-[#FF8C00] transition-all"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                    <input 
                        type="password" placeholder="Password" 
                        className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-[#FF8C00] transition-all"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                    
                    <button 
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-[#FF8C00] transition-all flex items-center justify-center gap-2 group disabled:bg-gray-400"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? "SIGN IN" : "CREATE ACCOUNT"} 
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 font-bold text-gray-400 text-sm">
                    {isLogin ? "New here?" : "Already a member?"}
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)} 
                        className="ml-2 text-[#FF8C00] underline decoration-2 underline-offset-4"
                    >
                        {isLogin ? "Join now" : "Log in"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;