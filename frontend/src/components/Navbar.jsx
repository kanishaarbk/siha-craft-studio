import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'Crochet Classes', path: '/classes' },
    { name: 'Custom Orders', path: '/custom-orders' },
    { name: 'Track Order', path: '/order-tracking' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <>
      {/* Top boutique announcement ribbon */}
      <div className="bg-brand-burgundy text-pastel-cream text-xs py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-pastel-peach" />
        <span>Complimentary domestic boutique delivery on orders above ₹999 | Use code <strong>WELCOME10</strong> for 10% off</span>
      </div>

      <header className="sticky top-0 z-40 bg-pastel-cream/90 backdrop-blur-md border-b border-pastel-pink/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <img
                src="/images/siha-logo.png"
                alt="SiHA Craft Studio Logo"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full shadow-sm border border-pastel-pink object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col">
                <span className="font-heading text-xl md:text-2xl font-bold text-brand-burgundy tracking-tight leading-none group-hover:text-brand-burgundy-dark transition-colors">
                  SiHA Craft Studio
                </span>
                <span className="text-[11px] font-script italic text-brand-chocolate tracking-wider mt-0.5">
                  Little Stitches, Handmade with Love
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-pastel-pink/60 text-brand-burgundy font-semibold shadow-sm'
                        : 'text-brand-chocolate hover:text-brand-burgundy hover:bg-white/60'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center space-x-2 md:space-x-3">
              
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full text-brand-burgundy hover:bg-pastel-pink/50 transition-colors"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className="p-2.5 rounded-full text-brand-burgundy hover:bg-pastel-pink/50 transition-colors relative"
                aria-label="View wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart Drawer Trigger */}
              <Link
                to="/cart"
                className="p-2.5 rounded-full bg-pastel-pink/70 text-brand-burgundy hover:bg-pastel-pink transition-colors relative flex items-center justify-center shadow-sm"
                aria-label="View cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-burgundy text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              {isAuthenticated ? (
                <div className="relative group">
                  <Link
                    to={isAdmin ? "/admin/dashboard" : "/account"}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/80 border border-pastel-pink text-xs font-semibold text-brand-burgundy hover:bg-white transition-all shadow-sm"
                  >
                    {isAdmin ? (
                      <span className="flex items-center gap-1 text-brand-burgundy">
                        <Shield className="w-3.5 h-3.5 text-brand-burgundy" /> Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" /> {user?.first_name || 'My Account'}
                      </span>
                    )}
                  </Link>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-pastel-lg border border-pastel-pink py-2 hidden group-hover:block transition-all animate-in fade-in z-50">
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-xs font-semibold text-brand-burgundy hover:bg-pastel-peach/40"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-xs text-brand-chocolate hover:bg-pastel-peach/40"
                    >
                      My Profile & Orders
                    </Link>
                    <Link
                      to="/account/classes"
                      className="block px-4 py-2 text-xs text-brand-chocolate hover:bg-pastel-peach/40"
                    >
                      My Crochet Classes
                    </Link>
                    <Link
                      to="/account/custom-requests"
                      className="block px-4 py-2 text-xs text-brand-chocolate hover:bg-pastel-peach/40"
                    >
                      Custom Orders & Quotes
                    </Link>
                    <hr className="my-1 border-pastel-pink/50" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-xs text-brand-burgundy hover:bg-pastel-pink/30 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-burgundy text-white text-xs font-medium hover:bg-brand-burgundy-dark transition-all shadow-sm"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full text-brand-burgundy hover:bg-pastel-pink/50 transition-colors"
                aria-label="Toggle mobile navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="bg-white/95 border-b border-pastel-pink/60 px-4 py-3 animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plushies, bags, yarn skeins, hooks, flowers..."
                className="input-pastel text-sm py-2"
                autoFocus
              />
              <button type="submit" className="btn-primary text-xs px-5 py-2 shrink-0">
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-brand-chocolate/60 hover:text-brand-burgundy"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-pastel-cream border-b border-pastel-pink px-4 pt-2 pb-6 space-y-2 animate-in fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-chocolate hover:bg-pastel-pink/60 hover:text-brand-burgundy"
              >
                {link.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-xs text-center"
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
