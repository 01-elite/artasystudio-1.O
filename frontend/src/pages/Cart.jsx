import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import Axios from 'axios';

const Cart = () => {
    const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cart')) || []);
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem("user"));
    const userid = user?._id;
    const useremail = user?.email;

    const PaymentGateway = async (amount) => {
        if (!user || !useremail) {
            alert("Please login to proceed with the payment.");
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // ✅ REDIRECTION LOGIC: Agar address incomplete hai toh prompt nahi, seedha profile par bhejo
        const shippingAddress = user.address;
        const isAddressIncomplete = !shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode;

        if (isAddressIncomplete) {
            alert("Shipping address is required for delivery. Please complete your profile first.");
            // Redirecting to profile journey
            navigate(`/profile/${userid}`); 
            return;
        }

        // Using the first item's ID for revenue attribution
        const primaryArtworkId = cartItems[0]._id;

        try {
            const { data: keydata } = await Axios.get('http://localhost:5001/api/v1/getkey');
            const { data: ordereddata } = await Axios.post('http://localhost:5001/api/v1/payment/process', { amount });

            const options = {
                key: keydata.key,
                amount: amount,
                currency: 'INR',
                name: "ArtVista Studio",
                description: 'Artwork Purchase',
                order_id: ordereddata.order.id,
                callback_url: `http://localhost:5001/api/v1/payment-success/${userid}?artworkId=${primaryArtworkId}`,
                prefill: {
                    name: user.name,
                    email: useremail,
                    contact: shippingAddress.phone
                },
                notes: {
                    address: JSON.stringify(shippingAddress),
                    artworkId: primaryArtworkId
                },
                theme: { color: '#FF8C00' },
            };

            const razor = new window.Razorpay(options);
            razor.open();
        } catch (err) {
            alert("Payment failed to initialize. Please check your connection.");
        }
    };

    useEffect(() => {
        const syncCart = () => {
            setCartItems(JSON.parse(localStorage.getItem('cart')) || []);
        };
        window.addEventListener('storage', syncCart);
        return () => window.removeEventListener('storage', syncCart);
    }, []);

    const removeFromCart = (cartId) => {
        const updated = cartItems.filter(item => item.cartId !== cartId);
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price)), 0);

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 bg-white min-h-screen font-sans">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 text-left tracking-tight">Shopping Bag</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* --- ITEM LIST --- */}
                <div className="lg:col-span-2">
                    {cartItems.length > 0 ? (
                        <div className="border-t border-gray-100">
                            {cartItems.map((item) => (
                                <div key={item.cartId} className="flex gap-6 py-10 border-b border-gray-100 items-start text-left">
                                    <div className="relative group">
                                        <img src={item.image} className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-[2rem] shadow-sm" alt={item.title} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{item.title}</h3>
                                                <p className="text-[10px] font-black text-[#FF8C00] uppercase tracking-widest mt-1">Registry ID: {item._id?.slice(-6)}</p>
                                            </div>
                                            <p className="text-xl font-black text-gray-900">₹{Number(item.price).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed">{item.description || "Verified physical artwork for collection."}</p>
                                        
                                        <div className="flex items-center gap-4 pt-4">
                                            <div className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
                                                <ShieldCheck size={12}/> Authenticated
                                            </div>
                                            <button onClick={() => removeFromCart(item.cartId)} className="text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors">Remove Asset</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <p className="text-sm font-black uppercase text-gray-400 tracking-widest">Your studio bag is empty</p>
                            <Link to="/" className="text-[#FF8C00] font-black text-xs uppercase mt-4 inline-block hover:underline">Explore Masterpieces</Link>
                        </div>
                    )}
                </div>

                {/* --- SUMMARY PANEL --- */}
                <div className="space-y-6 sticky top-28">
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 italic">Order Summary</h2>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-500">Subtotal ({cartItems.length} items)</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-green-600 uppercase text-[10px] font-black tracking-widest">Free Express</span>
                            </div>
                            <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                                <span className="text-lg font-black uppercase italic">Total</span>
                                <span className="text-3xl font-black text-gray-900">₹{subtotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* ✅ Shipping Indicator */}
                        {user?.address?.city ? (
                            <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-100 flex items-start gap-3">
                                <MapPin size={16} className="text-[#FF8C00] mt-1 shrink-0"/>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400">Ship to</p>
                                    <p className="text-[11px] font-bold text-gray-800 truncate">{user.address.street}, {user.address.city}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                                <AlertCircle size={16} className="text-orange-600 mt-1 shrink-0"/>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-orange-600">Address Missing</p>
                                    <p className="text-[11px] font-bold text-orange-800">Complete profile to proceed.</p>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => PaymentGateway(subtotal)} 
                            className="w-full bg-[#FF8C00] hover:bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-orange-100 active:scale-95"
                        >
                            Complete Acquisition
                        </button>
                    </div>

                    <p className="text-[9px] text-gray-400 font-medium text-center uppercase tracking-widest leading-loose">
                        Secure SSL Encryption • Insured Logistics • 100% Provenance Guarantee
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Cart;