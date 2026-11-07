import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Heart, Send, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from '../config/whatsapp';

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
    <footer className="bg-pastel-sand border-t border-pastel-pink/70 pt-16 pb-10 text-brand-chocolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-pastel-pink/60">
          
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/siha-logo.png"
                alt="SiHA Craft Studio"
                className="w-12 h-12 rounded-full border border-pastel-pink object-cover"
              />
              <div>
                <span className="font-heading text-xl font-bold text-brand-burgundy block">
                  SiHA Craft Studio
                </span>
                <span className="text-xs font-script italic text-brand-chocolate/80">
                  Little Stitches, Handmade with Love
                </span>
              </div>
            </Link>

            <p className="text-sm text-brand-chocolate/80 leading-relaxed max-w-sm">
              A boutique crochet atelier dedicated to slow fashion, mindful handcrafted treasures, and timeless stitches. From cuddly amigurumi to everlasting bouquets, every piece is made with heirloom love.
            </p>

            <div className="space-y-1.5 text-xs text-brand-chocolate/80 pt-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-burgundy shrink-0" />
                <span>Namakkal, Tamil Nadu, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-burgundy shrink-0" />
                <a href="mailto:hello@sihacraftstudio.com" className="hover:text-brand-burgundy">hello@sihacraftstudio.com</a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-burgundy shrink-0" />
                <a href={`tel:${WHATSAPP_DISPLAY.replace(/\s+/g, '')}`} className="hover:text-brand-burgundy">{WHATSAPP_DISPLAY}</a>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={getWhatsAppUrl("Hello SiHA Craft Studio! I have an inquiry about your creations.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 font-semibold text-emerald-700"
                >
                  WhatsApp: {WHATSAPP_DISPLAY}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-brand-burgundy uppercase tracking-wider">
              Boutique
            </h4>
            <ul className="space-y-2 text-sm text-brand-chocolate/80">
              <li><Link to="/shop" className="hover:text-brand-burgundy transition-colors">Shop All Handmade</Link></li>
              <li><Link to="/custom-orders" className="hover:text-brand-burgundy transition-colors">Custom Orders</Link></li>
              <li><Link to="/classes" className="hover:text-brand-burgundy transition-colors">Workshops & Classes</Link></li>
              <li><Link to="/order-tracking" className="hover:text-brand-burgundy transition-colors">Track Order</Link></li>
              <li><Link to="/about" className="hover:text-brand-burgundy transition-colors">Our Artisan Story</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-brand-burgundy uppercase tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-2 text-sm text-brand-chocolate/80">
              <li><Link to="/order-tracking" className="hover:text-brand-burgundy transition-colors">Track Your Order</Link></li>
              <li><Link to="/faq" className="hover:text-brand-burgundy transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-brand-burgundy transition-colors">Contact Our Studio</Link></li>
              <li>
                <a
                  href={getWhatsAppUrl("Hello SiHA Craft Studio! I need assistance with my order.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 transition-colors font-semibold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                  <span>WhatsApp Concierge</span>
                </a>
              </li>
              <li><Link to="/shipping-policy" className="hover:text-brand-burgundy transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-brand-burgundy transition-colors">Returns & Refunds</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-brand-burgundy uppercase tracking-wider">
              Studio Letters
            </h4>
            <p className="text-xs text-brand-chocolate/80 leading-relaxed">
              Receive crochet pattern releases, seasonal pastel collections, and exclusive class announcements.
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-brand-burgundy text-white hover:bg-brand-burgundy-dark transition-colors"
                  aria-label="Subscribe to newsletter"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-emerald-700 font-medium">
                  Welcome to our stitch circle!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Policies */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-chocolate/70">
          <p>© {new Date().getFullYear()} SiHA Craft Studio. All rights reserved. Stitched with love in India.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-brand-burgundy underline decoration-dotted">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-brand-burgundy underline decoration-dotted">
              Terms & Conditions
            </Link>
            <Link to="/shipping-policy" className="hover:text-brand-burgundy underline decoration-dotted">
              Shipping Info
            </Link>
            <Link to="/refund-policy" className="hover:text-brand-burgundy underline decoration-dotted">
              Cancellation & Refunds
            </Link>
            <Link to="/cookie-preferences" className="hover:text-brand-burgundy underline decoration-dotted">
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
