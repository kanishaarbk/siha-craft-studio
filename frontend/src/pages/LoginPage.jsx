import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, googleLogin } = useAuth();
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

  const handleSimulatedGoogleLogin = async () => {
    setSubmitting(true);
    const result = await googleLogin({
      email: 'customer@sihacraftstudio.com',
      name: 'Google Customer',
    });
    setSubmitting(false);
    if (result.success) {
      navigate(redirectPath);
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
          Sign in to track orders, access live Google Meet classes, and review quotations.
        </p>
      </div>

      <div className="card-pastel p-8 bg-white/95 shadow-pastel-lg space-y-6">
        
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleSimulatedGoogleLogin}
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl border border-pastel-pink bg-white text-brand-chocolate text-xs font-semibold hover:bg-pastel-peach/30 transition-all flex items-center justify-center gap-3 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google Identity</span>
        </button>

        <div className="flex items-center gap-3 text-[11px] text-brand-chocolate/40 uppercase tracking-wider">
          <div className="flex-1 h-px bg-pastel-pink/70" />
          <span>Or sign in with email</span>
          <div className="flex-1 h-px bg-pastel-pink/70" />
        </div>

        {/* Standard Email Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-burgundy/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@sihacraftstudio.com"
                className="input-pastel text-xs pl-10"
                required
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
                placeholder="••••••••"
                className="input-pastel text-xs pl-10"
                required
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

        {/* Quick Demo Credentials & Admin Link */}
        <div className="p-3.5 rounded-xl bg-pastel-cream text-[11px] text-brand-chocolate/80 space-y-2 border border-pastel-pink/60">
          <div className="flex items-center justify-between">
            <span className="font-bold text-brand-burgundy">Artisan Staff Access:</span>
            <Link to="/admin/login" className="text-brand-burgundy font-semibold hover:underline">
              Admin Portal →
            </Link>
          </div>
          <p className="text-[10px] text-brand-chocolate/70">
            Admin: <code className="bg-white px-1 py-0.5 rounded">admin@sihacraftstudio.com</code> (or <code className="bg-white px-1 py-0.5 rounded">admin</code>) | <code className="bg-white px-1 py-0.5 rounded">Admin@Siha2026!</code>
          </p>
        </div>

      </div>
    </div>
  );
}
