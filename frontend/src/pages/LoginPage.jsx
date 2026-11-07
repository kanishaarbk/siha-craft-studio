import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/account';

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      if (result.user.role === 'ADMIN' || result.user.is_staff) {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      {/* Brand Logo & Header */}
      <div className="text-center space-y-3">
        <img
          src="/images/siha-logo.png"
          alt="SiHA Craft Studio"
          className="w-20 h-20 rounded-full mx-auto shadow-md border-2 border-pastel-pink object-cover"
        />
        <h1 className="font-heading text-3xl font-bold text-brand-burgundy">
          Welcome to the Studio
        </h1>
        <p className="text-xs text-brand-chocolate/75">
          Sign in to track orders, access live artisan workshops, and review custom quotations.
        </p>
      </div>

      <div className="card-pastel p-8 bg-white/95 shadow-pastel-lg space-y-6">
        
        {/* Standard Email/Username Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1">Email Address or Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-burgundy/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com or username"
                className="input-pastel text-xs pl-10"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-brand-chocolate">Password</label>
              <Link to="/password-reset" className="text-[11px] text-brand-burgundy hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-burgundy/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-pastel text-xs pl-10"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-xs gap-2"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-pastel-pink/50 text-xs text-brand-chocolate/75">
          <span>New to SiHA Craft Studio? </span>
          <Link to="/register" className="text-brand-burgundy font-bold hover:underline">
            Create an Account
          </Link>
        </div>

        {/* Return to Boutique */}
        <div className="pt-3 border-t border-pastel-pink/50 text-center text-xs text-brand-chocolate/70">
          <Link to="/" className="hover:text-brand-burgundy transition-colors">
            ← Return to Boutique
          </Link>
        </div>

      </div>
    </div>
  );
}
