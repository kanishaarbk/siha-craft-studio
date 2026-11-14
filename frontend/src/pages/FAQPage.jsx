import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, ChevronDown, Sparkles, ShoppingBag, 
  Truck, Palette, GraduationCap, MessageCircle, ArrowRight 
} from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from '../config/whatsapp';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({ 'products-0': true, 'orders-0': true });

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const faqSections = [
    {
      id: 'products',
      title: 'Products & Handcraft Quality',
      icon: Sparkles,
      questions: [
        {
          q: 'Are all products handmade?',
          a: 'Yes, absolutely 100%! Every single creation at Siha Craft Studio is handcrafted stitch by stitch by our passionate artisans in our Namakkal, Tamil Nadu atelier. We use premium skin-friendly natural cotton yarns, bamboo-cotton blends, and hypoallergenic fiberfill. Because each piece is handmade with slow, loving attention, no two items are mass-produced machine duplicates—each holds its own charming individuality.'
        },
        {
          q: 'Can I customize the products?',
          a: 'Yes! Most of our catalog items can be personalized. Whether you wish to change a flower bouquet color scheme, request embroidered baby initials on a blanket, or adjust bag strap lengths, we are delighted to accommodate your wishes. Simply click "Request Customization" on any product page or visit our Custom Orders section.'
        },
        {
          q: 'Are products available in different colors?',
          a: 'Yes! Many of our pieces feature selectable color variants directly on their product pages (such as our signature Sage Green, Dusty Pink, and Warm Cream tones). If you desire a specific shade not shown on the website, reach out to us via our Custom Orders page or WhatsApp concierge and we will happily match your preferred palette.'
        }
      ]
    },
    {
      id: 'orders',
      title: 'Orders & Payments',
      icon: ShoppingBag,
      questions: [
        {
          q: 'How can I place an order?',
          a: 'Placing an order is simple and secure:\n1. Browse our collection and select your desired creations.\n2. Choose your preferred color variant and click "Add to Basket".\n3. Proceed to Checkout and provide your delivery address in India.\n4. Complete payment securely via our integrated Razorpay gateway.\nYou will receive instant confirmation via email and SMS with your unique Order ID.'
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We accept all secure domestic and international payment methods through Razorpay:\n• UPI (Google Pay, PhonePe, Paytm, BHIM)\n• Credit & Debit Cards (Visa, MasterCard, RuPay, American Express)\n• Net Banking across 50+ major Indian banks\n• Cred & Popular Mobile Wallets\nAll transactions are processed over encrypted 256-bit SSL connections. We do not store any card credentials on our servers.'
        },
        {
          q: 'Can I cancel my order?',
          a: 'For ready-to-ship catalog items, orders can be cancelled within 12 hours of placement before dispatch packaging begins. For bespoke made-to-order creations, cancellations are accepted within 24 hours of placement before yarn sourcing and artisan stitching begin. To cancel, please message our support team with your Order ID via WhatsApp or email (hello@sihacraftstudio.com).'
        }
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: Truck,
      questions: [
        {
          q: 'How long does delivery take?',
          a: 'Delivery timelines depend on the creation type:\n• Ready-to-Ship creations: Dispatched from our Namakkal atelier within 1–2 business days.\n• Made-to-Order & Custom creations: Meticulously crocheted in 5–8 business days before dispatch.\nOnce handed over to our express courier partners (Blue Dart, DTDC, Delhivery, Speed Post), delivery across India typically takes 3–5 business days depending on your postal code.'
        },
        {
          q: 'How can I track my order?',
          a: 'You can track your order at any moment on our dedicated Track Order page (/order-tracking). Simply enter your Order ID (e.g. SIHA-20261105-ABCD) along with your registered email or phone. As soon as your parcel is scanned by our courier, you will see real-time milestone updates, courier partner details, AWB tracking number, and a direct courier portal tracking link.'
        },
        {
          q: 'What if my order is delayed?',
          a: 'While express couriers operate smoothly, occasional transit delays may occur during festive peak seasons or regional weather advisories. If your package has not arrived within 7 business days of dispatch, please reach out to our concierge via WhatsApp at +91 6379 557 761 with your Order ID. We will promptly liaise with courier station managers to expedite delivery.'
        }
      ]
    },
    {
      id: 'custom',
      title: 'Custom Orders & Personalization',
      icon: Palette,
      questions: [
        {
          q: 'How do I request a custom crochet product?',
          a: 'To commission a custom crochet piece:\n1. Visit our Custom Orders page (/custom-orders).\n2. Fill out our brief inquiry form describing your idea, preferred dimensions, and color palette.\n3. You can attach reference sketches or photographs.\n4. Our head artisan will review your request and send you a transparent quotation and crafting timeline via WhatsApp or email within 24 hours.'
        },
        {
          q: 'Can I request a personalized gift?',
          a: 'Yes! Personalized gifts are our specialty. We frequently create bespoke portrait dolls, wedding keepsake bouquets that never fade, amigurumi pets matching beloved furry companions, and custom letter keychains. Every personalized gift arrives in luxury gift packaging with a handwritten calligraphy note.'
        }
      ]
    },
    {
      id: 'workshops',
      title: 'Crochet Workshops & Classes',
      icon: GraduationCap,
      questions: [
        {
          q: 'Do you provide crochet classes?',
          a: 'Yes! Siha Craft Studio hosts live interactive online workshops through Google Meet for beginners and craft lovers. We offer:\n• Beginner Foundations (holding the hook, tension, essential chain and single/double crochet stitches)\n• Amigurumi Mastery (shaping, color changes, invisible decreases, and safety eye assembly)\n• Botanical Crochet (realistic flowers, petals, and floral assembly)\nSmall batch sizes ensure personalized guidance and real-time posture feedback.'
        },
        {
          q: 'How can I join a workshop?',
          a: 'Explore upcoming workshop batches on our Workshops page (/classes). Select your preferred topic and schedule, click "Book Seat", and complete registration. You will instantly receive a Google Calendar invitation, Google Meet joining link, and a comprehensive downloadable materials list (hook size and recommended yarn weights).'
        }
      ]
    }
  ];

  const filteredSections = activeCategory === 'all' 
    ? faqSections 
    : faqSections.filter(s => s.id === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3DCE3] text-[#566B50] text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#D98FA5]" /> Helpful Answers
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#566B50]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#45483F]/80 leading-relaxed">
          Everything you need to know about our slow-crafted handmade creations, custom commissions, domestic shipping from Namakkal, and live online workshops.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-[#566B50] text-white shadow-sm'
              : 'bg-white text-[#45483F] border border-[#84977B]/20 hover:bg-[#F3DCE3]/40'
          }`}
        >
          All Questions (13)
        </button>
        {faqSections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveCategory(sec.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeCategory === sec.id
                ? 'bg-[#566B50] text-white shadow-sm'
                : 'bg-white text-[#45483F] border border-[#84977B]/20 hover:bg-[#F3DCE3]/40'
            }`}
          >
            <span>{sec.title.split(' & ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Accordion List by Section */}
      <div className="space-y-10">
        {filteredSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div key={sec.id} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#84977B]/20">
                <div className="w-7 h-7 rounded-lg bg-[#566B50] text-white flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[#566B50]">
                  {sec.title}
                </h2>
              </div>

              <div className="space-y-3">
                {sec.questions.map((item, qIdx) => {
                  const key = `${sec.id}-${qIdx}`;
                  const isOpen = !!openItems[key];

                  return (
                    <div
                      key={qIdx}
                      className="rounded-2xl border border-[#84977B]/20 bg-white shadow-sm overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FFFDF7] transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span className="font-heading text-sm sm:text-base font-bold text-[#566B50]">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#84977B] shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-[#566B50]' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-[#84977B]/10">
                          <div className="text-xs sm:text-sm text-[#45483F]/85 leading-relaxed whitespace-pre-line pt-3">
                            {item.a}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Still Have Questions Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#F5F7F3] via-[#FFFDF7] to-[#F3DCE3]/50 border border-[#84977B]/25 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#566B50]">
            Still have a question about your project?
          </h3>
          <p className="text-xs sm:text-sm text-[#45483F]/80 max-w-lg">
            Our artisan concierge in Namakkal is happy to help with yarn advice, custom quotes, or tracking queries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={getWhatsAppUrl("Hello SiHA Craft Studio! I have a question that was not covered in the FAQ. Could you please assist me?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#84977B]/30 bg-white text-[#566B50] hover:bg-[#F3DCE3]/40 text-xs font-semibold transition-colors"
          >
            <span>Contact Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
