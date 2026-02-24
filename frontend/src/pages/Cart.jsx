import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
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

        // Using the first item's ID for revenue attribution in this single-transaction flow
        const primaryArtworkId = cartItems[0]._id;

        let shippingAddress = user.address;

        if (!shippingAddress || !shippingAddress.street || shippingAddress.street === "") {
            const street = prompt("Enter Street/House No:");
            const city = prompt("Enter City:");
            const state = prompt("Enter State:");
            const pincode = prompt("Enter Pincode:");
            const phone = prompt("Enter Phone Number:");

            if (!street || !city || !pincode || !phone) {
                alert("Address is required for shipment!");
                return;
            }

            shippingAddress = { street, city, state, pincode, phone };

            try {
                const { data } = await Axios.put(`http://localhost:5001/api/auth/update-address/${userid}`, shippingAddress);
                localStorage.setItem("user", JSON.stringify(data));
            } catch (err) {
                console.error("Failed to save address to profile");
            }
        }

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
                // ✅ Added artworkId to the query string so the backend can credit the creator
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
            alert("Payment failed to initialize.");
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
            <h1 className="text-3xl font-bold mb-8 text-gray-900 text-left">Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 border-t border-gray-100">
                    {cartItems.map((item) => (
                        <div key={item.cartId} className="flex gap-6 py-8 border-b border-gray-100 items-start text-left">
                            <img src={item.image} className="w-32 h-32 md:w-44 md:h-44 object-cover rounded-lg" alt={item.title} />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-lg font-bold text-gray-900">${item.price}</p>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                <div className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1">
                                    <ShieldCheck size={12}/> Verified Artwork
                                </div>
                                <button onClick={() => removeFromCart(item.cartId)} className="text-xs font-bold text-red-500 hover:underline mt-4">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-28">
                    <div className="mb-6 text-left">
                        <span className="text-lg">Total ({cartItems.length} items): </span>
                        <span className="text-xl font-black">${subtotal.toLocaleString()}</span>
                    </div>
                    <button onClick={() => PaymentGateway(subtotal)} className="w-full bg-[#FF8C00] hover:bg-orange-600 text-white py-3 rounded-full font-bold transition-colors shadow-lg">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;