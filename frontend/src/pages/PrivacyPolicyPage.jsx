import React from 'react';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 pb-8 border-b border-pastel-pink/70">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Customer Trust & Compliance</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Privacy Policy
        </h1>
        <p className="text-xs text-brand-chocolate/70">
          Last Updated: October 26, 2026 • SiHA Craft Studio Atelier
        </p>
      </div>

      <div className="card-pastel p-8 sm:p-12 bg-white/95 space-y-8 text-xs sm:text-sm text-brand-chocolate/85 leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy flex items-center gap-2">
            1. Business Identity & Atelier Contact
          </h2>
          <p>
            Welcome to <strong>SiHA Craft Studio</strong> ("we," "our," or "us"). We craft handmade slow-crochet creations, offer online crochet training workshops, and operate our official e-commerce platform. For any inquiries regarding your personal data, privacy rights, or data deletion requests, you may contact our privacy coordinator at:
          </p>
          <div className="p-4 rounded-xl bg-pastel-cream border border-pastel-pink text-xs space-y-1">
            <p><strong>Business Name:</strong> SiHA Craft Studio</p>
            <p><strong>Primary Contact Email:</strong> hello@sihacraftstudio.com</p>
            <p><strong>Operating Atelier:</strong> Bengaluru, Karnataka, India</p>
            <p><strong>WhatsApp Inquiries:</strong> +91 98765 43210</p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy flex items-center gap-2">
            2. Personal Information Collected
          </h2>
          <p>
            We collect only the essential information needed to fulfill your handmade orders, facilitate live video workshops, and maintain your customer profile:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-chocolate/80">
            <li><strong>Customer Account & Identity:</strong> Full name, email address, contact phone number, and optional password credentials.</li>
            <li><strong>Delivery & Logistics Data:</strong> Shipping street address, apartment/suite, city, state, postal code, and specific delivery instructions.</li>
            <li><strong>Order & Transaction References:</strong> Product SKUs, chosen color and size variants, subtotal, promotional coupons applied, and encrypted payment gateway transaction reference IDs. (Note: We never view or store raw credit/debit card numbers or bank PINs).</li>
            <li><strong>Customization Commissions:</strong> Custom crochet descriptions, color preferences, budget estimates, required delivery dates, and customer-uploaded design sketches or reference photographs.</li>
            <li><strong>Crochet Workshop Data:</strong> Workshop enrollment history, attendee names, attendance records, and Google Meet session distribution.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy flex items-center gap-2">
            3. Third-Party Integrations & Service Providers
          </h2>
          <p>
            To provide a seamless boutique experience, we interface with trusted service providers strictly for transactional fulfillment:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-chocolate/80">
            <li><strong>Payment Processing (Razorpay):</strong> Payments are processed via Razorpay Software Private Limited. Transaction details are transmitted through 256-bit SSL encrypted channels under Razorpay's PCI-DSS compliant infrastructure.</li>
            <li><strong>Google Identity & Google Meet:</strong> We support optional one-click sign-in via Google Identity Services and conduct live crochet workshops over Google Meet. Only authorized student email addresses receive access to workshop links.</li>
            <li><strong>Domestic Courier Aggregators:</strong> Your name, phone number, and destination address are provided to verified shipping partners (e.g. Blue Dart, DTDC, India Post) solely to enable parcel delivery and live tracking updates.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy flex items-center gap-2">
            4. Cookie Usage & Preferences
          </h2>
          <p>
            Our website uses strictly necessary session cookies and browser local storage to preserve your shopping basket, remember your authentication session, and maintain your wishlist preferences. We do not sell your personal browsing habits to third-party advertising networks.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy flex items-center gap-2">
            5. Data Retention & Your Rights
          </h2>
          <p>
            You retain the right to review, update, or request the permanent deletion of your customer profile and saved delivery addresses at any time. To exercise these rights, navigate to your Customer Account settings or write to us directly at <code>hello@sihacraftstudio.com</code>.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy flex items-center gap-2">
            6. Security Measures & Limitations
          </h2>
          <p>
            We implement industry-standard database password hashing (PBKDF2/SHA-256), environment-level secret isolation, CSRF protection, and server-side payment signature verification. While we take every reasonable measure to protect your data, no method of digital transmission or electronic storage is 100% impenetrable.
          </p>
        </section>

      </div>
    </div>
  );
}
