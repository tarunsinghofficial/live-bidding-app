import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Home, User, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center text-xl font-bold text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            LiveBid
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* Authenticated User Links */}
                <div className="flex items-center space-x-4">
                  <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-primary">
                    <Link to="/my-auctions">My Auctions</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-primary">
                    <Link to="/my-bids">My Bids</Link>
                  </Button>
                  {user?.role === 'admin' && (
                    <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-primary">
                      <Link to="/admin/dashboard">Admin</Link>
                    </Button>
                  )}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {user?.username || 'User'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-foreground hover:text-primary"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              /* Unauthenticated User Links */
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-[#E2E687] text-primary hover:bg-[#E2E687]/90 rounded-full"
                >
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-foreground hover:text-primary"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-lg border-0 shadow-lg rounded-b-2xl">
            <div className="px-4 py-4 space-y-3">
              {user ? (
                <>
                  {/* Authenticated Mobile Links */}
                  <div className="space-y-2">
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-foreground hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link to="/my-auctions">My Auctions</Link>
                    </Button>
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-foreground hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link to="/my-bids">My Bids</Link>
                    </Button>
                    {user?.role === 'admin' && (
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-foreground hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to="/admin/dashboard">Admin</Link>
                      </Button>
                    )}
                  </div>

                  {/* User Info & Logout */}
                  <div className="pt-3 border-t border-white/20">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {user?.username || 'User'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start text-foreground hover:text-primary"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                /* Unauthenticated Mobile Links */
                <div className="space-y-2">
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button 
                    asChild 
                    size="sm" 
                    className="w-full bg-[#E2E687] text-primary hover:bg-[#E2E687]/90 rounded-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
