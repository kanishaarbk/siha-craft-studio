import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await register(formData);
    setSubmitting(false);
    if (result.success) {
      navigate('/account');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-3">
        <img
          src="/images/siha-logo.png"
          alt="SiHA Craft Studio"
          className="w-20 h-20 rounded-full mx-auto shadow-md border-2 border-pastel-pink object-cover"
        />
        <h1 className="font-heading text-3xl font-bold text-brand-burgundy">
          Join the Studio Circle
        </h1>
        <p className="text-xs text-brand-chocolate/75">
          Create your account to save custom crochet designs, enroll in classes, and track your parcels.
        </p>
      </div>

      <div className="card-pastel p-8 bg-white/95 shadow-pastel-lg">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="input-pastel text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="input-pastel text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-pastel text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1">Mobile Phone (Optional)</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="+91 98765 43210"
              className="input-pastel text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1">Password * (Min 6 characters)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input-pastel text-xs"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-xs gap-2"
          >
            <span>{submitting ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-pastel-pink/50 text-xs text-brand-chocolate/75 mt-4">
          <span>Already have an account? </span>
          <Link to="/login" className="text-brand-burgundy font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
