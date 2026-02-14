import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, Calendar, Loader2, Edit3, Check, X } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // ✅ Load User from LocalStorage
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [addressForm, setAddressForm] = useState(user.address || {
        street: '', city: '', state: '', pincode: '', phone: ''
    });

    const fetchOrders = async () => {
        try {
            // Hits the new GET route we added to ProductRoutes.js
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

    // ✅ Save Updated Address
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
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#FF8C00] mb-4" size={48} />
            <p className="font-black text-gray-300 uppercase tracking-widest">Syncing Orders...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen font-sans text-left">
            <h1 className="text-3xl font-black mb-8 uppercase tracking-tight">Your <span className="text-[#FF8C00]">Account</span></h1>
            
            {/* ✅ AMAZON STYLE ADDRESS MANAGER */}
            <div className="mb-12 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Default Shipping Address</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Used for all future ArtVista purchases</p>
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase hover:bg-orange-50 hover:text-[#FF8C00] transition-all"
                    >
                        {isEditing ? <><X size={14}/> Cancel</> : <><Edit3 size={14}/> Change Address</>}
                    </button>
                </div>

                {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="p-4 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100 focus:ring-2 focus:ring-orange-100" placeholder="Street" value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} />
                        <input className="p-4 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100 focus:ring-2 focus:ring-orange-100" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                        <input className="p-4 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100 focus:ring-2 focus:ring-orange-100" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} />
                        <input className="p-4 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100 focus:ring-2 focus:ring-orange-100" placeholder="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} />
                        <input className="p-4 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100 md:col-span-2" placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} />
                        <button onClick={handleSaveAddress} className="md:col-span-2 bg-black text-white py-4 rounded-xl font-black text-[10px] uppercase hover:bg-[#FF8C00] transition-all flex items-center justify-center gap-2">
                            <Check size={16}/> Save Changes
                        </button>
                    </div>
                ) : (
                    <div className="flex items-start gap-4 p-2">
                        <MapPin className="text-[#FF8C00] shrink-0" size={20} />
                        <div className="text-sm font-bold text-gray-600 leading-relaxed">
                            {user.address?.street ? (
                                <>
                                    <p className="text-gray-900">{user.name}</p>
                                    <p>{user.address.street}</p>
                                    <p>{user.address.city}, {user.address.state} {user.address.pincode}</p>
                                    <p className="text-[#FF8C00] mt-1">Phone: {user.address.phone}</p>
                                </>
                            ) : (
                                <p className="text-gray-300 italic">No address saved. Click change to add one.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6 border-b pb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Order History</h2>
            </div>

            <div className="space-y-6">
                {orders.length > 0 ? orders.map((order) => (
                    <div key={order._id} className="p-6 border border-gray-100 rounded-[2rem] bg-white hover:border-[#FF8C00] transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[#FF8C00]">
                                    <Package size={16} />
                                    <span className="text-[10px] font-black uppercase">Order: {order.razorpay_order_id.split('_')[1]}</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400">
                                    <MapPin size={12} className="inline mr-1" />
                                    Shipped to: {order.address?.street}, {order.address?.city}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 justify-end text-gray-400 mb-2">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-green-100">
                                    Delivered
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[2rem]">
                        <Package size={40} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-xs font-bold text-gray-400">Your studio is currently empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;