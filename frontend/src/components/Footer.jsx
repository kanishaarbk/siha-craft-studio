import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Heart, Send, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from '../config/whatsapp';
import { CATEGORIES, getCategoryUrl } from '../config/categories';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    try {
      await api.post('/newsletter/subscribe/', { email });
      setSubscribed(true);
      toast.success('Thank you for subscribing to our studio newsletter!');
      setEmail('');
    } catch (err) {
      toast.error('Could not subscribe. Please try again.');
    }
  };

  return (
    <footer className="bg-[#FFFDF7] border-t border-[#84977B]/20 pt-16 pb-10 text-[#45483F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#84977B]/15">
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/siha-logo.png"
                alt="Siha Craft Studio"
                className="w-12 h-12 rounded-full border border-[#84977B]/30 object-cover"
              />
              <div>
                <span className="font-heading text-xl font-bold text-[#566B50] block">
                  Siha Craft Studio
                </span>
                <span className="text-xs font-script italic text-[#45483F]">
                  Little Stitches, Handmade with Love
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#45483F]/85 leading-relaxed max-w-sm">
              An artisan crochet studio dedicated to mindful handmade slow fashion, heirloom amigurumi toys, and everlasting floral blooms. Each piece is lovingly hand-crocheted stitch by stitch.
            </p>

            <div className="space-y-2 text-xs text-[#45483F]/85 pt-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#566B50] shrink-0" />
                <span>Namakkal, Tamil Nadu, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#566B50] shrink-0" />
                <a href="mailto:hello@sihacraftstudio.com" className="hover:text-[#566B50]">
                  hello@sihacraftstudio.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#566B50] shrink-0" />
                <a href={`tel:${WHATSAPP_DISPLAY.replace(/\s+/g, '')}`} className="hover:text-[#566B50]">
                  {WHATSAPP_DISPLAY}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#566B50] shrink-0" />
                <a
                  href={getWhatsAppUrl('Hello Siha Craft Studio! I have an inquiry about your creations.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#566B50] font-semibold text-[#566B50]"
                >
                  WhatsApp: {WHATSAPP_DISPLAY}
                </a>
              </p>
            </div>
          </div>

          {/* Shop Product Categories */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#566B50] uppercase tracking-wider">
              Product Categories
            </h4>
            <ul className="space-y-1.5 text-xs text-[#45483F]/80">
              {CATEGORIES.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={getCategoryUrl(cat)}
                    className="hover:text-[#566B50] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop?sort=newest" className="hover:text-[#566B50] font-medium text-[#566B50]">
                  New Arrivals →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick & Studio Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#566B50] uppercase tracking-wider">
              Studio & Orders
            </h4>
            <ul className="space-y-1.5 text-xs text-[#45483F]/80">
              <li>
                <Link to="/custom-orders" className="hover:text-[#566B50] transition-colors">
                  Custom Orders & Quotes
                </Link>
              </li>
              <li>
                <Link to="/classes" className="hover:text-[#566B50] transition-colors">
                  Workshops & Classes
                </Link>
              </li>
              <li>
                <Link to="/order-tracking" className="hover:text-[#566B50] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#566B50] transition-colors">
                  Our Artisan Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#566B50] transition-colors">
                  Contact Our Studio
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#566B50] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription & Socials */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#566B50] uppercase tracking-wider">
              Artisan Newsletter
            </h4>
            <p className="text-xs text-[#45483F]/80 leading-relaxed">
              Receive new pattern previews, seasonal collection drops, and workshop announcements.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-pastel text-xs pr-10 py-2.5"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#566B50] text-white hover:bg-[#43543e] transition-colors"
                  aria-label="Subscribe to newsletter"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-[#566B50] font-medium">
                  Welcome to our stitch circle!
                </p>
              )}
            </form>

            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#84977B] block mb-1.5 uppercase tracking-wider">
                Follow Our Studio
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com/sihacraftstudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white border border-[#84977B]/20 text-[#566B50] hover:bg-[#84977B]/10 transition-colors"
                  aria-label="Follow on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={getWhatsAppUrl('Hello Siha Craft Studio!')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white border border-[#84977B]/20 text-[#566B50] hover:bg-[#84977B]/10 transition-colors"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Policies */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#45483F]/70">
          <p>© {new Date().getFullYear()} Siha Craft Studio. All rights reserved. Handcrafted in Namakkal, Tamil Nadu, India.</p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <Link to="/privacy-policy" className="hover:text-[#566B50] underline decoration-dotted">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-[#566B50] underline decoration-dotted">
              Terms & Conditions
            </Link>
            <Link to="/shipping-policy" className="hover:text-[#566B50] underline decoration-dotted">
              Shipping Info
            </Link>
            <Link to="/refund-policy" className="hover:text-[#566B50] underline decoration-dotted">
              Cancellation & Refunds
            </Link>
            <Link to="/cookie-preferences" className="hover:text-[#566B50] underline decoration-dotted">
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
