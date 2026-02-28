import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Explore from './pages/Explore';
import UploadArt from './pages/UploadArt';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import PaymentSucess from './components/PaymentSucess';
import AdminDashboard from './pages/AdminDashboard'; 
import Analytics from './pages/Analytics'; 
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const syncUser = () => setUser(JSON.parse(localStorage.getItem('user')));
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
      <div className="ArtVista-App font-sans min-h-screen bg-white flex flex-col">
        {/* Navbar stays at the top of every page */}
        <Navbar user={user} role={user?.role} onLogout={handleLogout} />
        
        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Explore />} />
            <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" />} />
            <Route path="/profile/:userId?" element={user ? <Profile /> : <Navigate to="/login" />} />
            
            {/* Admin Routes */}
            <Route path="/admin-panel" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/analytics" element={user?.role === 'admin' ? <Analytics /> : <Navigate to="/" />} />
            
            {/* Creator Routes */}
            <Route path="/dashboard" element={user?.role === 'creator' ? <Dashboard /> : <Navigate to="/profile" />} />
            <Route path="/upload" element={user?.role === 'creator' ? <UploadArt /> : <Navigate to="/profile" />} />
            
            {/* General Routes */}
            <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
            <Route path="/payment-success" element={<PaymentSucess />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* ✅ FIXED: Footer is now outside <Routes>, making it globally visible */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;