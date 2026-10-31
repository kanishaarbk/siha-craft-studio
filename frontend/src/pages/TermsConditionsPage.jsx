import React from 'react';
import { FileCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 pb-8 border-b border-pastel-pink/70">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Customer Agreement</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Terms & Conditions
        </h1>
        <p className="text-xs text-brand-chocolate/70">
          Effective Date: October 26, 2026 • SiHA Craft Studio Atelier
        </p>
      </div>

      <div className="card-pastel p-8 sm:p-12 bg-white/95 space-y-8 text-xs sm:text-sm text-brand-chocolate/85 leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            1. Nature of Handmade Creations & Natural Variations
          </h2>
          <p>
            All physical items presented by SiHA Craft Studio are handcrafted stitch-by-stitch using textile fibers and artisan needles. Because our items are made by human hands rather than industrial automated machinery:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-chocolate/80">
            <li>Subtle differences in stitch tension, amigurumi stuffing firmness, or exact floral placement are genuine hallmarks of authentic handcraft and are not considered defects.</li>
            <li>Yarn manufacturers produce skeins in specific dye lots; slight variations in pastel shade between individual dye lots may occur.</li>
            <li>Photographic lighting and mobile screen calibration may cause minor color perception differences compared to real-life sunlight.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            2. Product Pricing & Currency
          </h2>
          <p>
            All listed prices are denominated in <strong>Indian Rupees (INR)</strong> and encompass applicable taxes. We reserve the right to revise prices for upcoming collections or when yarn raw-material costs adjust. The price confirmed during your final checkout session is binding for that completed transaction.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            3. Bespoke Custom Commissions & Quotations
          </h2>
          <p>
            When submitting a custom crochet inquiry:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-chocolate/80">
            <li>Submitting an inquiry through our custom order form carries <strong>no financial obligation or fee</strong>.</li>
            <li>Our head artisan reviews the submitted sketches, requirements, and reference photographs to generate an itemized quotation reflecting estimated production days and pricing.</li>
            <li>Work on custom commissions begins only after quotation acceptance and verified checkout payment. Because custom items are tailored specifically to your personalized specifications, custom orders cannot be cancelled once handcrafting has begun.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            4. Live Crochet Classes & Google Meet Terms
          </h2>
          <p>
            For students enrolling in our online workshops:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-chocolate/80">
            <li>Workshops are conducted live via Google Meet. The access link is confidential and reserved exclusively for the enrolled student. Sharing meeting links with non-enrolled third parties is strictly prohibited.</li>
            <li>Students are responsible for arranging the necessary crochet hook and yarn materials listed in the workshop syllabus prior to session start.</li>
            <li>If an artisan instructor must reschedule a session due to unforeseen circumstances, enrolled students will be offered an alternative session date or a full refund.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            5. Intellectual Property
          </h2>
          <p>
            The SiHA Craft Studio brand name, illustrated circular logo, proprietary crochet pattern charts, class resource guides, and product photography are the exclusive intellectual property of SiHA Craft Studio. Patterns provided in classes are intended for personal, non-commercial educational crafting only.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">
            6. Governing Law & Dispute Resolution
          </h2>
          <p>
            These terms are governed by the laws of India. Any disputes arising in connection with orders or workshop enrollments shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
          </p>
        </section>

      </div>
    </div>
  );
}
