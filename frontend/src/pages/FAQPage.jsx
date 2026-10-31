import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Scissors, Truck, Sparkles, Video } from 'lucide-react';

const faqs = [
  {
    category: 'Handmade Craft & Care',
    q: 'How should I wash and care for my handmade crochet plushies and bags?',
    a: 'We recommend gentle hand washing in lukewarm or cold water using a mild wool or baby shampoo. Do not wring or twist. Gently press out excess water between clean dry towels and reshape flat on a clean surface away from direct harsh sunlight.'
  },
  {
    category: 'Handmade Craft & Care',
    q: 'Are the safety eyes on your plushies secure for young children?',
    a: 'Yes, our amigurumi plushies use internal safety-washer locked eyes that grip firmly through the stitches. For infants and toddlers under 3, we also offer custom plushies with 100% hand-embroidered thread eyes.'
  },
  {
    category: 'Custom Commissions',
    q: 'How long does a bespoke custom order take to craft?',
    a: 'Most single custom plushies or bouquet arrangements take between 5 to 8 business days to hand-crochet. For larger orders or complex multi-piece designs, we will provide an exact timeline in your custom quotation.'
  },
  {
    category: 'Custom Commissions',
    q: 'Can I choose specific yarn shades that match my room decor?',
    a: 'Absolutely! Our studio stocks over 60 shades of combed cotton and chenille yarns. Simply mention your color palette in the Custom Orders form or attach sample color swatch images.'
  },
  {
    category: 'Classes & Google Meet',
    q: 'I am an absolute beginner. Which workshop should I book?',
    a: 'Our "Beginner Crochet Basics: Foundation Stitches & Granny Squares" is specifically designed for first-timers who have never touched a hook before. We guide you slowly through hook grip, tension, and foundational chains.'
  },
  {
    category: 'Shipping & Delivery',
    q: 'How can I track my package once dispatched?',
    a: 'You can navigate to our "Track Order" page and enter your order reference (e.g. SIHA-20261026-XXXX). Once our shipping team hands the parcel to Blue Dart or DTDC, a direct live tracking URL will appear on your page.'
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center space-y-3 pb-6 border-b border-pastel-pink/70">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Support & Answers</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-brand-chocolate/75">
          Everything you need to know about our slow-crafted crochet collections, custom orders, and online workshops.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="card-pastel overflow-hidden bg-white/95 transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-burgundy/80 block mb-1">
                    {faq.category}
                  </span>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-brand-chocolate">
                    {faq.q}
                  </h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-brand-burgundy shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-brand-chocolate/80 leading-relaxed border-t border-pastel-pink/40 mt-1">
                  <p className="pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
