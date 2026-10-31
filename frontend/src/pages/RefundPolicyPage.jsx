import React from 'react';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center space-y-3 pb-8 border-b border-pastel-pink/70">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Customer Care</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Cancellation, Returns & Refunds Policy
        </h1>
        <p className="text-xs text-brand-chocolate/70">
          Last Updated: October 26, 2026 • SiHA Craft Studio Atelier
        </p>
      </div>

      <div className="card-pastel p-8 sm:p-12 bg-white/95 space-y-8 text-xs sm:text-sm text-brand-chocolate/85 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            1. Order Cancellations
          </h2>
          <p>
            You may request cancellation of standard ready-to-ship orders within <strong>12 hours</strong> of placing the order, provided the package has not yet been processed for dispatch. Once a parcel has been handed to the courier partner, cancellation is no longer possible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            2. Defective, Damaged, or Incorrect Items
          </h2>
          <p>
            We take supreme pride in the durability and beauty of our crochet stitches. If an item arrives structurally damaged in transit or differs significantly from your order, please notify us within <strong>48 hours of delivery</strong> with an unboxing video or photographs sent to <code>hello@sihacraftstudio.com</code>. We will gladly arrange a complimentary replacement or full refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            3. Custom Commissions & Personalizations
          </h2>
          <p>
            Due to the personalized nature of bespoke made-to-order commissions (custom plushies with specific names, tailored color palettes, or custom bouquet counts), custom items cannot be returned or refunded once production has commenced, except in the unlikely event of structural transit damage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            4. Refund Processing
          </h2>
          <p>
            Approved refunds are credited back to your original payment method (via Razorpay) within <strong>5 to 7 business days</strong> as per banking and gateway settlement timelines.
          </p>
        </section>
      </div>
    </div>
  );
}
