import React, { useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function CookiePreferencesPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
  });
  const toast = useToast();

  const handleSave = () => {
    localStorage.setItem('siha_cookie_prefs', JSON.stringify(preferences));
    toast.success('Your privacy and cookie preferences have been recorded.');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center space-y-3 pb-6 border-b border-pastel-pink/70">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Privacy Controls</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Cookie & Data Preferences
        </h1>
        <p className="text-sm text-brand-chocolate/75">
          Manage how cookies and local storage tokens are used on your browser during your boutique visit.
        </p>
      </div>

      <div className="card-pastel p-8 bg-white/95 space-y-6">
        
        {/* Essential */}
        <div className="p-4 rounded-2xl bg-pastel-cream/70 border border-pastel-pink flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-sm text-brand-burgundy">Essential Functionality Cookies</h4>
            <p className="text-xs text-brand-chocolate/75">
              Necessary for preserving your shopping cart items, authentication session, and CSRF protection.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full shrink-0">
            Always Active
          </span>
        </div>

        {/* Analytics */}
        <div className="p-4 rounded-2xl bg-white border border-pastel-pink flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-sm text-brand-burgundy">Anonymous Performance Metrics</h4>
            <p className="text-xs text-brand-chocolate/75">
              Allows our development team to measure page speed and diagnose navigation errors.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.analytics}
            onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
            className="rounded border-pastel-pink text-brand-burgundy focus:ring-brand-burgundy w-5 h-5 cursor-pointer"
          />
        </div>

        {/* Marketing */}
        <div className="p-4 rounded-2xl bg-white border border-pastel-pink flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-sm text-brand-burgundy">Personalized Craft Recommendations</h4>
            <p className="text-xs text-brand-chocolate/75">
              Shows relevant crochet supplies or class announcements based on previous visits.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.marketing}
            onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
            className="rounded border-pastel-pink text-brand-burgundy focus:ring-brand-burgundy w-5 h-5 cursor-pointer"
          />
        </div>

        <button
          onClick={handleSave}
          className="btn-primary text-xs w-full py-3"
        >
          Save Cookie Preferences
        </button>
      </div>
    </div>
  );
}
