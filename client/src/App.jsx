import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AdminRoutes from './components/admin/AdminRoutes';
import UserDashboard from './components/user/UserDashboard';
import UserAuctionList from './components/user/UserAuctionList';
import AuctionDetail from './components/user/AuctionDetail';
import UserAuctionHistory from './components/user/UserAuctionHistory';
import UserBidHistory from './components/user/UserBidHistory';
import LandingPage from './components/LandingPage';
import { Button } from './components/ui/button';
import { Home, LogOut, User } from 'lucide-react';

const App = () => {
  const { user, logout } = useAuth();
  const currentPath = window.location.pathname;
  
  // Don't show header on landing page, login, and register pages
  const showHeader = !['/', '/login', '/register'].includes(currentPath);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header - Only show for authenticated routes */}
      {showHeader && (
        <header className="border-b shadow-sm bg-card">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center">
                <Home className="w-8 h-8 mr-3 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Live Bidding Platform</h1>
              </Link>
              
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="items-center hidden space-x-2 sm:flex">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/my-auctions">My Auctions</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/my-bids">My Bids</Link>
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {user?.username || 'Not logged in'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user?.role === 'admin' 
                          ? 'bg-blue-slate text-eggshell' 
                          : user?.role === 'user'
                          ? 'bg-dusty-denim text-ink-black'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user?.role || 'No role'}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* DEBUG: Show current path and user role */}
        <div className="fixed z-50 p-2 text-xs text-white bg-black rounded bottom-4 left-4">
          Path: {window.location.pathname} | Role: {user?.role} | Is Admin: {user?.role === 'admin'}
        </div>
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<div>Login Page (TODO)</div>} />
          <Route path="/register" element={<div>Register Page (TODO)</div>} />
          
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
