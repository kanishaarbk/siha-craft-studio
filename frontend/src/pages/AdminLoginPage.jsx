import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  // If already logged in as admin, redirect directly
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login/', {
        email: email.trim(),
        username: email.trim(),
        password,
      });

      const { token, user: userData } = res.data;

      // Role check: Only ADMIN, STAFF or is_staff allowed
      const hasAdminAccess = userData.role === 'ADMIN' || userData.role === 'STAFF' || userData.is_staff || userData.is_admin;

      if (!hasAdminAccess) {
        setError('Access Denied: This portal is restricted to authorized administrators and staff.');
        toast.error('Unauthorized access attempt.');
        setLoading(false);
        return;
      }

      // Store credentials and set authenticated session
      localStorage.setItem('siha_token', token);
      localStorage.setItem('siha_user', JSON.stringify(userData));

      toast.success(`Welcome back, ${userData.first_name || 'Admin'}!`);
      // Reload or navigate to dashboard
      window.location.href = '/admin/dashboard';
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid administrator credentials. Please check your email and password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/95 p-8 sm:p-10 rounded-3xl border border-pastel-pink shadow-pastel-lg">
        
        {/* Header with Security Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-brand-burgundy text-white flex items-center justify-center mx-auto shadow-md border-2 border-pastel-peach">
            <Shield className="w-8 h-8 text-pastel-peach" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy text-[11px] font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" /> Management Portal • Authorized Only
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-burgundy">
            Artisan Admin Login
          </h2>

          <p className="text-xs text-brand-chocolate/75">
            Sign in with your staff or administrator credentials to manage products, inventory, orders, and Google Meet workshops.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1.5">
              Administrator Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-chocolate/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sihacraftstudio.com or admin"
                className="input-pastel text-xs pl-10 py-3 font-medium"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-chocolate/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-pastel text-xs pl-10 py-3 font-medium"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs py-3 justify-center shadow-pastel"
          >
            {loading ? (
              <span className="flex items-center gap-2">Authenticating...</span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Access Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>

        {/* Verified Admin Credentials Helper */}
        <div className="p-3 rounded-2xl bg-pastel-cream/70 border border-pastel-pink text-[11px] text-brand-chocolate/85 space-y-1">
          <p className="font-semibold text-brand-burgundy flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-brand-burgundy" /> Verified Admin Account
          </p>
          <p>
            Username: <code className="bg-white px-1.5 py-0.5 rounded border border-pastel-pink/60 text-brand-burgundy font-mono text-[10px]">admin</code> or <code className="bg-white px-1.5 py-0.5 rounded border border-pastel-pink/60 text-brand-burgundy font-mono text-[10px]">admin@sihacraftstudio.com</code>
          </p>
          <p>
            Password: <code className="bg-white px-1.5 py-0.5 rounded border border-pastel-pink/60 text-brand-burgundy font-mono text-[10px]">Admin@Siha2026!</code>
          </p>
        </div>

        {/* Footer Links */}
        <div className="pt-4 border-t border-pastel-pink/60 flex items-center justify-between text-xs text-brand-chocolate/70">
          <Link to="/" className="hover:text-brand-burgundy transition-colors">
            ← Return to Live Boutique
          </Link>
          <Link to="/login" className="hover:text-brand-burgundy transition-colors font-medium">
            Customer Login →
          </Link>
        </div>

      </div>
    </div>
  );
}
