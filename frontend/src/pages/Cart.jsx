import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ChevronRight, ShieldCheck, rotateCcw } from 'lucide-react';

const Cart = () => {
    const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cart')) || []);
    const navigate = useNavigate();

    const updateQuantity = (cartId, delta) => {
        const updated = cartItems.map(item => {
            if (item.cartId === cartId) {
                const newQty = Math.max(1, (item.quantity || 1) + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
    };

    const removeFromCart = (cartId) => {
        const updated = cartItems.filter(item => item.cartId !== cartId);
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 bg-white min-h-screen font-sans">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* --- LEFT: PRODUCT LIST --- */}
                <div className="lg:col-span-2 border-t border-gray-100">
                    {cartItems.map((item) => (
                        <div key={item.cartId} className="flex gap-6 py-8 border-b border-gray-100 items-start">
                            {/* Product Image - Clicking takes you back to Profile detail */}
                            <img 
                                onClick={() => navigate('/profile')} 
                                src={item.image} 
                                className="w-32 h-32 md:w-44 md:h-44 object-cover rounded-lg cursor-pointer hover:opacity-90 transition" 
                                alt={item.title} 
                            />

                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <h3 onClick={() => navigate('/profile')} className="text-xl font-bold text-gray-900 cursor-pointer hover:text-[#FF8C00] transition">
                                        {item.title}
                                    </h3>
                                    <p className="text-lg font-bold text-gray-900">${item.price}</p>
                                </div>
                                
                                {/* Truncated Description */}
                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                    {item.description || "Limited edition ArtVista masterpiece, verified for authenticity."}
                                </p>

                                <div className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1">
                                    <ShieldCheck size={12}/> In Stock & Ready to Ship
                                </div>

                                {/* Controls: Qty and Remove */}
                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-sm">
                                        <button onClick={() => updateQuantity(item.cartId, -1)} className="p-2 hover:bg-gray-200 transition"><Minus size={14}/></button>
                                        <span className="px-4 font-bold text-sm">{item.quantity || 1}</span>
                                        <button onClick={() => updateQuantity(item.cartId, 1)} className="p-2 hover:bg-gray-200 transition"><Plus size={14}/></button>
                                    </div>
                                    <div className="h-4 w-[1px] bg-gray-200"></div>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cartItems.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-xl text-gray-400 font-bold mb-4">Your ArtVista cart is empty.</p>
                            <Link to="/" className="text-blue-500 font-bold hover:underline">Continue shopping</Link>
                        </div>
                    )}
                </div>

                {/* --- RIGHT: AMAZON-STYLE PROCEED BOX --- */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-28 shadow-sm">
                    <div className="flex items-center gap-2 text-green-700 mb-4">
                        <CheckCircle size={18} fill="#15803d" className="text-white"/>
                        <p className="text-xs font-medium">Your order qualifies for FREE Shipping.</p>
                    </div>

                    <div className="mb-6">
                        <span className="text-lg">Subtotal ({cartItems.length} items): </span>
                        <span className="text-xl font-black">${subtotal.toLocaleString()}</span>
                    </div>

                    <button 
                        onClick={() => alert("Redirecting to Secure Payment Gateway...")}
                        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 py-3 rounded-full font-bold text-sm shadow-sm border border-[#F2C200] transition-colors mb-3"
                    >
                        Proceed to Checkout
                    </button>
                    
                    <div className="p-4 bg-white rounded-xl border border-gray-200 mt-4">
                        <p className="text-[11px] font-bold text-gray-800 mb-2">Order Summary</p>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Items:</span>
                            <span>${subtotal}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-3">
                            <span>Shipping:</span>
                            <span className="text-green-700">FREE</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold text-red-700">
                            <span>Order Total:</span>
                            <span>${subtotal}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckCircle = ({ size, fill, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
    </svg>
);

export default Cart;