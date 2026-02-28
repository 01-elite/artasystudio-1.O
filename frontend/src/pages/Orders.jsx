import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, Calendar, Loader2, Edit3, Check, X, ArrowRight, User } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // ✅ Load User from LocalStorage (Logic preserved)
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [addressForm, setAddressForm] = useState(user.address || {
        street: '', city: '', state: '', pincode: '', phone: ''
    });

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/v1/payment/process'); 
            const myOrders = data.filter(order => order.email === user.email);
            setOrders(myOrders);
        } catch (err) {
            console.error("Orders fetch failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email) fetchOrders();
    }, [user.email]);

    const handleSaveAddress = async () => {
        try {
            const { data } = await axios.put(`http://localhost:5001/api/auth/update-address/${user._id}`, addressForm);
            localStorage.setItem("user", JSON.stringify(data));
            setUser(data);
            setIsEditing(false);
            alert("Shipping Address Updated!");
        } catch (err) {
            alert("Failed to update address.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="relative">
                <Loader2 className="animate-spin text-[#FF8C00]" size={64} strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-[#FF8C00]">AV</div>
            </div>
            <p className="font-black text-gray-900 uppercase tracking-[0.4em] mt-6 animate-pulse">Syncing Studio Records</p>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto p-6 md:p-12 bg-white min-h-screen font-sans text-left">
            
            {/* --- HERO HEADER --- */}
            <div className="mb-16 border-b-[10px] border-black pb-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-2 h-10 bg-[#FF8C00]" />
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400">Account Dashboard</p>
                </div>
                {/* ✅ Changed Heading here */}
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8]">
                    YOUR <br /> <span className="text-[#FF8C00]">ORDERS.</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* --- LEFT: ADDRESS MANAGER --- */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 space-y-6">
                        <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-[#FF8C00] rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                        <MapPin className="text-[#FF8C00]" size={24} />
                                    </div>
                                    <button 
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="text-[10px] font-black uppercase tracking-widest bg-[#FF8C00] text-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all"
                                    >
                                        {isEditing ? 'Cancel' : 'Modify'}
                                    </button>
                                </div>

                                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Shipping Profile</h2>
                                
                                {isEditing ? (
                                    <div className="space-y-3 mt-6 animate-in slide-in-from-bottom-2">
                                        <input className="w-full p-4 rounded-xl bg-zinc-800 text-xs font-bold border-none outline-none focus:ring-1 focus:ring-[#FF8C00]" placeholder="Street" value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input className="p-4 rounded-xl bg-zinc-800 text-xs font-bold border-none outline-none" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                                            <input className="p-4 rounded-xl bg-zinc-800 text-xs font-bold border-none outline-none" placeholder="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} />
                                        </div>
                                        <input className="w-full p-4 rounded-xl bg-zinc-800 text-xs font-bold border-none outline-none" placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} />
                                        <button onClick={handleSaveAddress} className="w-full bg-white text-black py-4 rounded-2xl font-black text-[11px] uppercase mt-4 hover:bg-[#FF8C00] hover:text-white transition-all flex items-center justify-center gap-2">
                                            Confirm Changes <ArrowRight size={14}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-sm font-medium text-zinc-400 mt-6 leading-relaxed">
                                        {user.address?.street ? (
                                            <>
                                                <p className="text-white font-black uppercase text-lg mb-4">{user.name}</p>
                                                <p>{user.address.street}</p>
                                                <p className="uppercase">{user.address.city}, {user.address.state} {user.address.pincode}</p>
                                                <div className="pt-4 border-t border-white/5 mt-4">
                                                    <p className="text-[#FF8C00] text-[10px] font-black uppercase tracking-widest">Verified Phone</p>
                                                    <p className="text-white">{user.address.phone}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="italic opacity-50">Studio registry incomplete. Please define your shipping coordinates.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: ORDER HISTORY --- */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Acquisition Registry</h2>
                        <span className="bg-zinc-100 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{orders.length} items</span>
                    </div>

                    <div className="space-y-4">
                        {orders.length > 0 ? orders.map((order) => (
                            <div key={order._id} className="group p-8 border border-zinc-100 rounded-[2.5rem] bg-white hover:border-[#FF8C00] hover:shadow-2xl hover:shadow-orange-50 transition-all duration-500">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-[#FF8C00] border border-zinc-100">
                                            <Package size={32} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black uppercase text-white bg-black px-2 py-1 rounded-md tracking-tighter">
                                                    ID: {order.razorpay_order_id.split('_')[1]}
                                                </span>
                                                <span className="text-xs font-black text-[#FF8C00] uppercase tracking-widest">
                                                    Verified Acquisition
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-black uppercase text-zinc-400 flex items-center gap-2">
                                                <MapPin size={14} /> {order.address?.city || 'ArtVista Central'} Studio
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full md:w-auto flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-50">
                                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase">
                                            <Calendar size={14} />
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-green-600">
                                                Secured & Logged
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-32 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
                                <div className="inline-block p-6 bg-white rounded-full shadow-sm mb-6">
                                    <Package size={48} className="text-zinc-200" strokeWidth={1} />
                                </div>
                                <p className="text-sm font-black uppercase text-zinc-400 tracking-[0.2em]">Your Order History is Empty</p>
                                <button 
                                    onClick={() => window.location.href='/explore'}
                                    className="mt-8 text-[11px] font-black uppercase text-[#FF8C00] hover:underline tracking-widest"
                                >
                                    Browse the Collection
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;