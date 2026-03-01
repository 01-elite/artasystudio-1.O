import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, MoreVertical, LayoutDashboard, ShieldAlert,
  UserCircle, Repeat, LogOut, Gavel, LogIn, UserPlus, PlusSquare, Package 
} from 'lucide-react';

const Navbar = ({ user, role, onLogout }) => {
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(cart.length);
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', updateCart);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSwitchProfile = () => {
    if (role === 'admin') return; 
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) return;
    const newRole = storedUser.role === 'creator' ? 'user' : 'creator';
    const updatedUser = { ...storedUser, role: newRole };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsOpen(false);
    window.location.reload(); 
  };

  // --- MENU ITEMS LOGIC (FIXED PATHS) ---
  const menuItems = [
    { 
      label: 'Admin Panel', 
      icon: <ShieldAlert size={18}/>, 
      path: '/analytics', // 👈 YAHAN FIX KIYA HAI: Ab ye naye Analytics Dashboard par jayega
      show: role === 'admin' 
    },
    { 
      label: 'View Profile', 
      icon: <UserCircle size={18}/>, 
      path: '/profile', 
      show: !!user && role !== 'admin' 
    },
    { 
      label: 'My Orders', 
      icon: <Package size={18}/>, 
      path: '/orders', 
      show: !!user && role !== 'admin' 
    },
    { 
      label: 'Creator Dashboard', 
      icon: <LayoutDashboard size={18}/>, 
      path: '/analytics', 
      show: role === 'creator' 
    },
    { 
      label: `Switch to ${role === 'creator' ? 'User' : 'Creator'}`, 
      icon: <Repeat size={18}/>, 
      path: null, 
      show: !!user && role !== 'admin', 
      action: handleSwitchProfile 
    },
  ];

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-gray-100 bg-white sticky top-0 z-50 font-sans">
      <Link to="/" className="text-2xl font-black tracking-tighter">
        ART<span className="text-[#FF8C00]">VISTA</span>
      </Link>

      <div className="flex items-center gap-8 font-bold text-xs text-gray-400 uppercase tracking-widest text-left">
        <Link to="/" className="hover:text-[#FF8C00] transition">Explore</Link>
        {role === 'creator' && (
          <Link to="/upload" className="flex items-center gap-1 text-[#FF8C00]">
            <PlusSquare size={16}/> Upload
          </Link>
        )}
      </div>

      <div className="flex items-center gap-5">
        {role !== 'admin' && (
          <Link to="/cart" className="relative cursor-pointer hover:text-[#FF8C00] transition p-2">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#FF8C00] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        )}

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-orange-50 text-[#FF8C00]' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <MoreVertical size={22} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-4 w-60 bg-white border border-gray-100 rounded-[2rem] shadow-2xl py-4 z-[100] overflow-hidden">
              <div className="px-6 py-2 mb-2 border-b border-gray-50 text-left">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                  {role === 'admin' ? 'Admin Terminal' : 'Studio Menu'}
                </p>
              </div>

              {menuItems.map((item, i) => item.show && (
                <button
                  key={i}
                  onClick={() => { 
                    if (item.action) item.action();
                    else { navigate(item.path); setIsOpen(false); }
                  }}
                  className="w-full flex items-center gap-4 px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-[#FF8C00] transition-all text-left"
                >
                  <span className="opacity-70">{item.icon}</span> {item.label}
                </button>
              ))}

              <div className="h-[1px] bg-gray-50 my-2 mx-4"></div>

              {user ? (
                <button 
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full flex items-center gap-4 px-6 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all text-left"
                >
                  <LogOut size={18}/> Logout
                </button>
              ) : (
                <div className="space-y-1">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-4 px-6 py-3.5 text-sm font-bold text-gray-600 text-left">
                    <LogIn size={18}/> Sign In
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;