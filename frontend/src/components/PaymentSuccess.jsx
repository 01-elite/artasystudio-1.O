import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const referenceNum = searchParams.get("reference");
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('storage'));
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
            <div className="max-w-md w-full text-center space-y-8 p-12 rounded-[3rem] border border-gray-100 shadow-2xl">
                <CheckCircle size={80} className="mx-auto text-green-500" />
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Masterpiece <span className="text-[#FF8C00]">Secured</span></h2>
                    <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-widest">Reference: {referenceNum}</p>
                </div>
                <div className="pt-6 space-y-3">
                    <button onClick={() => navigate('/orders')} className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-[#FF8C00] transition-all">
                        <ShoppingBag size={18} /> View My Orders
                    </button>
                    <button onClick={() => navigate('/')} className="w-full text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-black transition-colors">
                        Back to Gallery
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;