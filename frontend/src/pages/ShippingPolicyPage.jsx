import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center space-y-3 pb-8 border-b border-pastel-pink/70">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Packaging & Dispatch</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-brand-chocolate/70">
          Last Updated: October 26, 2026 • Domestic Delivery Across India
        </p>
      </div>

      <div className="card-pastel p-8 sm:p-12 bg-white/95 space-y-8 text-xs sm:text-sm text-brand-chocolate/85 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            1. Dispatch & Processing Times
          </h2>
          <p>
            Because we take slow, conscious care with every piece:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-chocolate/80">
            <li><strong>Ready-to-Ship Items:</strong> Pieces marked "Ready to Ship" (such as in-stock yarn skeins, hooks, and completed plushies) are packed in our boutique packaging and dispatched within <strong>2 to 3 business days</strong>.</li>
            <li><strong>Made-to-Order & Custom Commissions:</strong> Because these creations are made entirely from scratch by our artisans, production typically takes <strong>5 to 10 business days</strong> as stated in your product details or agreed custom quote.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            2. Shipping Rates & Complimentary Delivery
          </h2>
          <p>
            We offer fair and transparent domestic shipping charges across India:
          </p>
          <div className="p-4 rounded-xl bg-pastel-cream border border-pastel-pink text-xs space-y-1">
            <p><strong>Standard Domestic Delivery:</strong> Flat ₹79 per order across all serviceable pin codes.</p>
            <p><strong>Complimentary Free Shipping:</strong> Automatically applied to all shopping baskets totaling <strong>₹999 or more</strong>.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            3. Courier Partners & Tracking Links
          </h2>
          <p>
            We partner with reliable express couriers including Blue Dart, DTDC, Delhivery, and India Post Speed Post. As soon as your package is scanned by the courier, our studio updates your order with a clickable tracking link accessible on your <strong>Track Order</strong> page.
          </p>
        </section>
      </div>
    </div>
  );
}
