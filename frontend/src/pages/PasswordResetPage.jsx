import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/password-reset/confirm/', { email, new_password: newPassword });
      setSubmitted(true);
      toast.success('Your password has been successfully reset.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not reset password. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold text-brand-burgundy">
          Password Recovery
        </h1>
        <p className="text-xs text-brand-chocolate/75">
          Enter your registered email address and choose a new password.
        </p>
      </div>

      <div className="card-pastel p-8 bg-white/95 shadow-pastel-lg">
        {submitted ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
            <h3 className="font-heading text-lg font-bold text-brand-burgundy">Password Updated!</h3>
            <p className="text-xs text-brand-chocolate/75">
              You can now sign in using your updated password.
            </p>
            <Link to="/login" className="btn-primary text-xs w-full">
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Registered Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-burgundy/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-pastel text-xs pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">New Password * (Min 6 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-burgundy/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-pastel text-xs pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs gap-2"
            >
              <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-pastel-pink/50 text-xs text-brand-chocolate/75 mt-4">
          <Link to="/login" className="text-brand-burgundy font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
