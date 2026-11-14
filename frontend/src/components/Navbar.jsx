import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User as UserIcon,
  Shield,
  Sparkles,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from '../config/whatsapp';
import { CATEGORIES, getCategoryUrl } from '../config/categories';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownTimeoutRef = useRef(null);

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
    { name: 'Workshops & Classes', path: '/classes' },
    { name: 'Custom Orders', path: '/custom-orders' },
    { name: 'Track Order', path: '/order-tracking' },
    { name: 'FAQs', path: '/faq' },
    { name: 'About Us', path: '/about' },
  ];

  const handleDropdownEnter = (id) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveCategoryDropdown(id);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveCategoryDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveCategoryDropdown(null);
  }, [location.pathname]);

  return (
    <>
      {/* Top boutique announcement ribbon */}
      <div className="bg-[#566B50] text-[#FFFDF7] text-xs py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#F3DCE3]" />
        <span>
          Complimentary domestic delivery on orders above ₹999 | Use code{' '}
          <strong className="text-[#F3DCE3]">WELCOME10</strong> for 10% off
        </span>
      </div>

      <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#84977B]/20 transition-all shadow-sm">
        {/* Main Navbar Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <img
                src="/images/siha-logo.png"
                alt="Siha Craft Studio Logo"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full shadow-sm border border-[#84977B]/30 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col">
                <span className="font-heading text-xl md:text-2xl font-bold text-[#566B50] tracking-tight leading-none group-hover:text-[#41523D] transition-colors">
                  Siha Craft Studio
                </span>
                <span className="text-[11px] font-script italic text-[#45483F] tracking-wider mt-0.5">
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
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#566B50] text-white font-semibold shadow-sm'
                        : 'text-[#45483F] hover:text-[#566B50] hover:bg-[#84977B]/10'
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
                className="p-2 rounded-full text-[#566B50] hover:bg-[#84977B]/10 transition-colors"
                aria-label="Search products"
                title="Search catalogue"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className="p-2 rounded-full text-[#566B50] hover:bg-[#84977B]/10 transition-colors relative"
                aria-label="View wishlist"
                title="Your Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* WhatsApp Support Button */}
              <a
                href={getWhatsAppUrl('Hello Siha Craft Studio! I have an inquiry about your handmade creations.')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-[#566B50] hover:bg-[#84977B]/10 transition-colors relative"
                aria-label={`Chat on WhatsApp (${WHATSAPP_DISPLAY})`}
                title={`WhatsApp Concierge: ${WHATSAPP_DISPLAY}`}
              >
                <MessageCircle className="w-5 h-5 text-[#566B50]" />
              </a>

              {/* Cart Drawer Trigger */}
              <Link
                to="/cart"
                className="p-2.5 rounded-full bg-[#566B50] text-white hover:bg-[#43543e] transition-colors relative flex items-center justify-center shadow-sm"
                aria-label="View cart"
                title="Shopping Basket"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D98FA5] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FFFDF7] shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              {isAuthenticated ? (
                <div className="relative group">
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/account'}
                    className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-white border border-[#84977B]/30 text-xs font-semibold text-[#566B50] hover:border-[#84977B] transition-all shadow-sm"
                  >
                    {isAdmin ? (
                      <span className="flex items-center gap-1 text-[#566B50]">
                        <Shield className="w-3.5 h-3.5 text-[#566B50]" /> Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" /> {user?.first_name || 'Account'}
                      </span>
                    )}
                  </Link>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-pastel-lg border border-[#84977B]/20 py-2 hidden group-hover:block transition-all animate-in fade-in z-50">
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-xs font-semibold text-[#566B50] hover:bg-[#F5F7F3]"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-xs text-[#45483F] hover:bg-[#F5F7F3]"
                    >
                      My Profile & Orders
                    </Link>
                    <Link
                      to="/account/classes"
                      className="block px-4 py-2 text-xs text-[#45483F] hover:bg-[#F5F7F3]"
                    >
                      My Crochet Classes
                    </Link>
                    <Link
                      to="/account/custom-requests"
                      className="block px-4 py-2 text-xs text-[#45483F] hover:bg-[#F5F7F3]"
                    >
                      Custom Orders & Quotes
                    </Link>
                    <hr className="my-1 border-[#84977B]/20" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-xs text-[#D98FA5] hover:bg-[#F3DCE3]/30 font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#566B50] text-white text-xs font-medium hover:bg-[#43543e] transition-all shadow-sm"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full text-[#566B50] hover:bg-[#84977B]/10 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Secondary Horizontal Category Bar */}
        <div className="hidden lg:block border-t border-[#84977B]/15 bg-[#FFFDF7]/90 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#84977B] pr-3 border-r border-[#84977B]/20">
                Categories
              </span>
              <div className="flex items-center space-x-1 xl:space-x-2">
                {CATEGORIES.map((cat) => {
                  const hasSub = cat.subcategories && cat.subcategories.length > 0;
                  const isOpen = activeCategoryDropdown === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className="relative"
                      onMouseEnter={() => handleDropdownEnter(cat.id)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <Link
                        to={getCategoryUrl(cat)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isOpen
                            ? 'bg-[#84977B]/15 text-[#566B50] font-semibold'
                            : 'text-[#45483F] hover:text-[#566B50] hover:bg-[#84977B]/10'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {hasSub && (
                          <ChevronDown className={`w-3 h-3 text-[#84977B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                      </Link>

                      {/* Dropdown Menu */}
                      {hasSub && isOpen && (
                        <div
                          className="absolute top-full left-0 mt-1 w-56 rounded-2xl bg-white shadow-pastel-lg border border-[#84977B]/20 p-2 z-50 animate-in fade-in slide-in-from-top-1"
                        >
                          <div className="px-3 py-1.5 border-b border-[#84977B]/10 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#84977B]">
                              {cat.name}
                            </span>
                          </div>
                          {cat.subcategories.map((sub, idx) => (
                            <Link
                              key={idx}
                              to={getCategoryUrl(cat, sub)}
                              className="block px-3 py-2 rounded-xl text-xs text-[#45483F] hover:bg-[#F5F7F3] hover:text-[#566B50] transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="bg-white border-b border-[#84977B]/20 px-4 py-3 animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search amigurumi, bags, flowers, coasters, scrunchies..."
                className="input-pastel text-xs py-2"
                autoFocus
              />
              <button type="submit" className="btn-primary text-xs px-5 py-2 shrink-0">
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-[#45483F]/70 hover:text-[#566B50]"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FFFDF7] border-b border-[#84977B]/20 px-4 pt-3 pb-6 space-y-3 animate-in fade-in max-h-[85vh] overflow-y-auto">
            {/* Primary Page Navigation */}
            <div className="space-y-1 pb-3 border-b border-[#84977B]/20">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#45483F] hover:bg-[#84977B]/10 hover:text-[#566B50]"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Category Navigation Accordion */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#84977B] px-3">
                Shop Product Categories
              </span>
              <div className="space-y-1 pt-1">
                {CATEGORIES.map((cat) => {
                  const isExpanded = mobileExpandedCat === cat.id;
                  const hasSub = cat.subcategories && cat.subcategories.length > 0;
                  return (
                    <div key={cat.id} className="rounded-xl border border-[#84977B]/10 bg-white/70 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2">
                        <Link
                          to={getCategoryUrl(cat)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs font-medium text-[#45483F] hover:text-[#566B50] flex-1"
                        >
                          {cat.name}
                        </Link>
                        {hasSub && (
                          <button
                            onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                            className="p-1 text-[#84977B] hover:text-[#566B50]"
                            aria-label={`Toggle ${cat.name} subcategories`}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {hasSub && isExpanded && (
                        <div className="px-4 py-2 bg-[#F5F7F3] border-t border-[#84977B]/10 space-y-1.5">
                          {cat.subcategories.map((sub, idx) => (
                            <Link
                              key={idx}
                              to={getCategoryUrl(cat, sub)}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-1.5 text-[11px] text-[#45483F]/90 hover:text-[#566B50] py-1"
                            >
                              <ChevronRight className="w-3 h-3 text-[#D98FA5]" />
                              <span>{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WhatsApp Link in Mobile Drawer */}
            <div className="pt-2">
              <a
                href={getWhatsAppUrl('Hello Siha Craft Studio! I have an inquiry about your handmade creations.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-[#566B50] bg-[#84977B]/15 hover:bg-[#84977B]/25 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#566B50]" />
                <span>WhatsApp Concierge ({WHATSAPP_DISPLAY})</span>
              </a>
            </div>

            {/* Auth Link in Mobile Drawer */}
            {!isAuthenticated && (
              <div className="pt-1">
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
