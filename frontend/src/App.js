import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Explore from './pages/Explore';
import UploadArt from './pages/UploadArt';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Orders from './pages/Orders'; // ✅ New Import
import PaymentSucess from './components/PaymentSucess';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = "/login"; 
  };

  return (
    <Router>
      <div className="ArtVista-App font-sans min-h-screen bg-white">
        <Navbar user={user} role={user?.role} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/login" element={!user ? <Auth /> : <Navigate to="/profile" />} />
          <Route 
            path="/profile/:userId?" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={user?.role === 'creator' ? <Dashboard /> : <Navigate to="/profile" />} 
          />
          <Route 
            path="/orders" 
            element={user ? <Orders /> : <Navigate to="/login" />} 
          />
          <Route
            path="/payment-success"
            element={<PaymentSucess />}
          />
          <Route 
            path="/upload" 
            element={user?.role === 'creator' ? <UploadArt /> : <Navigate to="/profile" />} 
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;