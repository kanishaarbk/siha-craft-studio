import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Instagram, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from '../config/whatsapp';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact/', form);
      setSent(true);
      toast.success('Your message has been received by our atelier.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center space-y-3 pb-6 border-b border-pastel-pink/70">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Get in Touch</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Connect with Our Atelier
        </h1>
        <p className="text-sm text-brand-chocolate/75 max-w-xl mx-auto">
          Whether you have a question about our slow-crafted stitches, workshop enrollments, or custom corporate gifting—our artisans are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Studio Info Card (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-pastel p-8 bg-white/95 space-y-6 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-brand-burgundy pb-3 border-b border-pastel-pink/60">
              Studio Details
            </h3>

            <div className="space-y-4 text-xs text-brand-chocolate">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-burgundy shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-brand-burgundy text-sm">Operating Atelier</strong>
                  <span>SiHA Craft Studio, Handcrafted Boutique, Namakkal, Tamil Nadu, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-burgundy shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-brand-burgundy text-sm">Email Inquiries</strong>
                  <a href="mailto:hello@sihacraftstudio.com" className="hover:text-brand-burgundy">hello@sihacraftstudio.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-burgundy shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-brand-burgundy text-sm">Customer Helpline</strong>
                  <a href={`tel:${WHATSAPP_DISPLAY.replace(/\s+/g, '')}`} className="hover:text-brand-burgundy font-medium">
                    {WHATSAPP_DISPLAY}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick social links */}
            <div className="pt-4 border-t border-pastel-pink/60 space-y-3">
              <h4 className="font-heading text-sm font-bold text-brand-burgundy">Direct Channels</h4>
              <div className="flex flex-col gap-2">
                <a
                  href={getWhatsAppUrl("Hello SiHA Craft Studio! I have an inquiry.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors text-xs font-semibold"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat with Artisan on WhatsApp ({WHATSAPP_DISPLAY})</span>
                </a>

                <a
                  href="https://instagram.com/sihacraftstudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-pastel-pink/40 text-brand-burgundy hover:bg-pastel-pink transition-colors text-xs font-semibold"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Follow @sihacraftstudio on Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols on lg) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="card-pastel p-8 sm:p-10 bg-white/95 space-y-4 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-brand-burgundy pb-3 border-b border-pastel-pink/60">
              Send an Inquiry
            </h3>

            {sent && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! Your message has been sent. We will respond within 24 business hours.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Aaradhya Sharma"
                  className="input-pastel text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="input-pastel text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Custom commission inquiry / Workshop query"
                className="input-pastel text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Your Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                placeholder="How can we help your handmade journey today?"
                className="input-pastel text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 text-xs gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
