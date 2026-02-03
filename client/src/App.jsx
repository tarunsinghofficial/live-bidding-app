import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';

// Import components
import LandingPage from './components/LandingPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import UserDashboard from './components/user/UserDashboard';
import UserAuctionList from './components/user/UserAuctionList';
import AuctionDetail from './components/user/AuctionDetail';
import UserAuctionHistory from './components/user/UserAuctionHistory';
import UserBidHistory from './components/user/UserBidHistory';
import AdminRoutes from './components/admin/AdminRoutes';

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Unified Navigation - Shows on all pages */}
      <Navbar />

      {/* Main Content - Add padding to account for fixed navbar */}
      <main className="pt-16">
        {/* DEBUG: Show current path and user role */}
        <div className="fixed z-50 p-2 text-xs text-white bg-black rounded bottom-4 left-4">
          Path: {window.location.pathname} | Role: {user?.role} | Is Admin: {user?.role === 'admin'}
        </div>
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          {/* Admin Routes - Always available but protected internally */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          
          {/* DEBUG: Always show admin dashboard for testing */}
          <Route path="/admin-test" element={<AdminRoutes />} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/auctions" element={<UserAuctionList />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/my-auctions" element={<UserAuctionHistory />} />
          <Route path="/my-bids" element={<UserBidHistory />} />
          
          {/* 404 Page */}
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="mb-4 text-2xl font-bold text-gray-900">Page Not Found</h1>
                  <p className="mb-4 text-gray-600">
                    {user ? (
                      user.role === 'admin' ? (
                        <Link to="/admin/dashboard" className="text-blue-600 hover:underline">
                          Go to Admin Dashboard
                        </Link>
                      ) : (
                        <Link to="/dashboard" className="text-blue-600 hover:underline">
                          Go to Dashboard
                        </Link>
                      )
                    ) : (
                      <Link to="/" className="text-blue-600 hover:underline">
                        Go to Home
                      </Link>
                    )}
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
