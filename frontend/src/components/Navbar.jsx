import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, PlusSquare, LayoutDashboard } from 'lucide-react';

const Navbar = ({ user, role }) => {
  const [cartCount, setCartCount] = useState(0);

  // Listen for cart changes every time the navbar renders or localStorage updates
  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(cart.length);
    };
    updateCart();
    window.addEventListener('storage', updateCart); // Syncs across tabs
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-gray-100 bg-white sticky top-0 z-50">
      <Link to="/" className="text-2xl font-black tracking-tighter">
        ART<span className="text-[#FF8C00]">VISTA</span>
      </Link>

      <div className="flex items-center gap-8 font-medium text-gray-600">
        <Link to="/" className="hover:text-[#FF8C00] transition">Explore</Link>
        
        {role === 'creator' && (
          <>
            <Link to="/upload" className="flex items-center gap-1 hover:text-[#FF8C00]">
              <PlusSquare size={18}/> Upload
            </Link>
            <Link to="/dashboard" className="flex items-center gap-1 hover:text-[#FF8C00]">
              <LayoutDashboard size={18}/> Dashboard
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* FIXED: Wrapped in Link and using dynamic cartCount */}
        <Link to="/cart" className="relative cursor-pointer hover:text-[#FF8C00] transition">
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#FF8C00] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>
        
        <Link to="/profile" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:border-2 hover:border-[#FF8C00] transition">
          <User size={20} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;