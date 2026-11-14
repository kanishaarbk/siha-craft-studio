import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Truck,
  Scissors,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { CATEGORIES, getCategoryUrl } from '../config/categories';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bagProducts, setBagProducts] = useState([]);
  const [amigurumiProducts, setAmigurumiProducts] = useState([]);
  const [flowerProducts, setFlowerProducts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodsRes, classesRes] = await Promise.all([
          api.get('/products/?page_size=20'),
          api.get('/classes/'),
        ]);

        const allProds = prodsRes.data.results || [];
        setFeaturedProducts(allProds.filter((p) => p.is_featured).slice(0, 8));
        if (allProds.length > 0 && featuredProducts.length === 0) {
          // Fallback if not enough featured
          setFeaturedProducts(allProds.slice(0, 8));
        }

        setBagProducts(
          allProds
            .filter((p) =>
              p.category_slug?.includes('bag') ||
              p.name?.toLowerCase().includes('bag') ||
              p.name?.toLowerCase().includes('purse')
            )
            .slice(0, 4)
        );

        setAmigurumiProducts(
          allProds
            .filter((p) =>
              p.category_slug?.includes('toy') ||
              p.category_slug?.includes('plush') ||
              p.name?.toLowerCase().includes('bunny') ||
              p.name?.toLowerCase().includes('plush')
            )
            .slice(0, 4)
        );

        setFlowerProducts(
          allProds
            .filter((p) =>
              p.category_slug?.includes('flower') ||
              p.name?.toLowerCase().includes('bouquet') ||
              p.name?.toLowerCase().includes('rose') ||
              p.name?.toLowerCase().includes('flower')
            )
            .slice(0, 4)
        );

        setClasses((classesRes.data || []).slice(0, 3));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-14 sm:space-y-20 pb-16 bg-[#FFFDF7]">
      {/* 1. Main Hero Carousel (Clean, Elegant, No Floating Objects) */}
      <HeroCarousel />

      {/* 2. Brand Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-8 rounded-3xl bg-white border border-[#84977B]/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E9EFE7] text-[#566B50] shrink-0">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#566B50]">
                100% Handcrafted
              </h4>
              <p className="text-[11px] text-[#45483F]/75">Hand-stitched in Namakkal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F3DCE3] text-[#566B50] shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#566B50]">
                Pan-India Delivery
              </h4>
              <p className="text-[11px] text-[#45483F]/75">Safe parcel dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EFEBF4] text-[#566B50] shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#566B50]">
                Bespoke Orders
              </h4>
              <p className="text-[11px] text-[#45483F]/75">Personalized color & design</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E9EFE7] text-[#566B50] shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#566B50]">
                Online Workshops
              </h4>
              <p className="text-[11px] text-[#45483F]/75">Live interactive training</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Categories Grid (The 8 Official Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#84977B]">
              Artisan Collections
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#566B50] mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-[#566B50] hover:text-[#43543e] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Categories Grid (2 cols on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={getCategoryUrl(cat)}
              className="group rounded-2xl bg-white border border-[#84977B]/20 p-3 sm:p-4 hover:border-[#84977B] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#F5F7F3]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-xs sm:text-base font-bold text-[#566B50] group-hover:text-[#41523D] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#45483F]/75 line-clamp-2 mt-0.5 hidden sm:block">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-[#84977B]/10 flex items-center justify-between text-[11px] font-semibold text-[#84977B]">
                <span>Explore</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. HOMEPAGE IMAGE DISPLAY: REFERENCE PHOTOGRAPHS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#D98FA5]">
            Artisan Gallery
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#566B50]">
            Handmade with Love & Care
          </h2>
          <p className="text-xs sm:text-sm text-[#45483F]/80">
            Real snapshots from our handmade atelier. Each piece is crafted from scratch with premium yarn, patient hands, and timeless stitches.
          </p>
        </div>

        {/* 2 Handmade Product Highlights (Teddy Bear & Flower Bouquet) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
          {/* Highlight 1: Amigurumi Teddy Bear with Bouquet */}
          <div className="rounded-3xl bg-white border border-[#84977B]/20 p-4 sm:p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="aspect-[4/3.5] sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#F5F7F3]">
                <img
                  src="/images/teddy-bear-bouquet.png"
                  alt="Handmade amigurumi teddy bear holding crochet flower bouquet"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E9EFE7] text-[#566B50] text-[10px] font-bold uppercase tracking-wider">
                    Featured Keepsake
                  </span>
                  <span className="text-xs text-[#84977B]">Amigurumi Collection</span>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#566B50]">
                  Amigurumi Teddy Bear with Floral Bouquet
                </h3>
                <p className="text-xs sm:text-sm text-[#45483F]/85 leading-relaxed">
                  Our signature cuddle bear holding an everlasting micro-bouquet. Meticulously hand-stitched with hypoallergenic milk cotton yarn and weighted lightly for the sweetest cuddle.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#84977B]/15 flex items-center justify-between">
              <Link
                to="/shop?category=amigurumi-toys"
                className="btn-primary text-xs gap-1.5"
              >
                <span>Shop Amigurumi Toys</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/custom-orders"
                className="text-xs font-semibold text-[#566B50] hover:underline"
              >
                Custom Color Request
              </Link>
            </div>
          </div>

          {/* Highlight 2: Handmade Crochet Flower Bouquet */}
          <div className="rounded-3xl bg-white border border-[#84977B]/20 p-4 sm:p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="aspect-[4/3.5] sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#F5F7F3]">
                <img
                  src="/images/crochet-flower-bouquet.png"
                  alt="Handmade crochet floral bouquet display"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F3DCE3] text-[#566B50] text-[10px] font-bold uppercase tracking-wider">
                    Everlasting Gift
                  </span>
                  <span className="text-xs text-[#84977B]">Botanical Collection</span>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#566B50]">
                  Handmade Crochet Flower Bouquet
                </h3>
                <p className="text-xs sm:text-sm text-[#45483F]/85 leading-relaxed">
                  Carefully sculpted crochet roses, tulips, and daisies arranged with pastel ribbons. A meaningful floral tribute that never wilts, bringing lasting joy to any room.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#84977B]/15 flex items-center justify-between">
              <Link
                to="/shop?category=crochet-flowers"
                className="btn-primary text-xs gap-1.5"
              >
                <span>Explore Floral Bouquets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/custom-orders"
                className="text-xs font-semibold text-[#566B50] hover:underline"
              >
                Custom Arrangements
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Our Craft / Handmade With Love Section (Featuring the Crochet Workspace) */}
        <div className="rounded-3xl bg-[#F5F7F3] border border-[#84977B]/25 p-6 sm:p-10 md:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Image Column */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden bg-white p-2.5 shadow-sm border border-[#84977B]/20">
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white">
                  <img
                    src="/images/crochet-workspace.png"
                    alt="Siha Craft Studio crochet workspace showing the handmade crochet process"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
              <p className="text-[11px] text-center text-[#45483F]/70 mt-2 italic">
                Our Namakkal atelier workspace: yarn skeins, hooks & work-in-progress stitches.
              </p>
            </div>

            {/* Story & Process Column */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#566B50] border border-[#84977B]/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D98FA5]" /> Our Craft
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#566B50] leading-tight">
                Slow Craft: Handcrafted with Love
              </h3>
              <p className="text-xs sm:text-sm text-[#45483F]/85 leading-relaxed">
                At Siha Craft Studio, nothing is mass produced or rushed by machines. Every flower petal, amigurumi snout, and granny square bag is crafted individually with ergonomic hooks and the softest cotton yarn.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#45483F]/85">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#84977B] shrink-0 mt-0.5" />
                  <span>Premium milk cotton & organic fibers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#84977B] shrink-0 mt-0.5" />
                  <span>Reinforced seams for heirloom durability</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#84977B] shrink-0 mt-0.5" />
                  <span>Hypoallergenic polyfill for child-safe toys</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#84977B] shrink-0 mt-0.5" />
                  <span>Custom colorways upon request</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link to="/about" className="btn-primary text-xs gap-1.5">
                  <span>Read Our Artisan Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/custom-orders" className="btn-secondary text-xs">
                  <span>Commission a Piece</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bestselling Creations Product Grid (2 columns on mobile!) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#84977B]">
              Artisan Favorites
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#566B50] mt-1">
              Bestselling Creations
            </h2>
          </div>
          <Link
            to="/shop?sort=popularity"
            className="btn-outline text-xs gap-1.5 self-start sm:self-auto"
          >
            <span>Explore Popular</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Product Grid: 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 6. Custom Orders Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F5F7F3] via-[#FFFDF7] to-[#F3DCE3]/50 border border-[#84977B]/25 shadow-sm p-6 sm:p-10 md:p-14">
          <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#566B50] text-xs font-bold uppercase tracking-wider shadow-sm border border-[#84977B]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#D98FA5]" /> Bespoke Commissions
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#566B50] leading-tight">
              Have a Dream Crochet Project in Mind?
            </h2>
            <p className="text-xs sm:text-sm text-[#45483F]/85 leading-relaxed">
              We specialize in custom crochet creations tailored to your favorite color palettes, pet amigurumi likenesses, wedding flower keepsakes, and personalized lettering. Share your idea and get a quick quotation.
            </p>
            <div className="pt-2">
              <Link to="/custom-orders" className="btn-primary text-xs sm:text-sm gap-2">
                <span>Request Customization</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Spotlight Section: Crochet Bags (2 cols on mobile) */}
      {bagProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#84977B]">
                Wearable Art
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#566B50] mt-0.5">
                Handmade Crochet Bags
              </h2>
            </div>
            <Link
              to="/shop?category=crochet-bags"
              className="text-xs font-semibold text-[#566B50] hover:underline"
            >
              View All Bags →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {bagProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Spotlight Section: Amigurumi Toys (2 cols on mobile) */}
      {amigurumiProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#84977B]">
                Cuddle Friends
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#566B50] mt-0.5">
                Amigurumi & Plush Toys
              </h2>
            </div>
            <Link
              to="/shop?category=amigurumi-toys"
              className="text-xs font-semibold text-[#566B50] hover:underline"
            >
              View All Toys →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {amigurumiProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 9. Live Online Crochet Training Workshops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#84977B]/20 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#84977B]">
                Learn the Art
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#566B50] mt-1">
                Live Online Crochet Classes
              </h2>
              <p className="text-xs sm:text-sm text-[#45483F]/80 max-w-xl mt-1.5">
                Small-batch, live video workshops held securely over Google Meet. From foundational chain stitches to complex amigurumi shaping, join our friendly atelier circle.
              </p>
            </div>
            <Link
              to="/classes"
              className="btn-primary text-xs gap-1.5 self-start md:self-auto shrink-0"
            >
              <span>View Workshop Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="card-pastel p-5 flex flex-col justify-between gap-4 bg-[#FFFDF7]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E9EFE7] text-[#566B50] text-[10px] font-bold uppercase tracking-wider">
                      {cls.level}
                    </span>
                    <span className="text-xs font-semibold text-[#566B50]">
                      ₹{cls.price}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#566B50]">
                    {cls.title}
                  </h3>
                  <p className="text-xs text-[#45483F]/75 line-clamp-2">
                    {cls.short_description || cls.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#84977B]/15 flex items-center justify-between">
                  <span className="text-[11px] text-[#45483F]/70">
                    {cls.duration_minutes || 60} mins per session
                  </span>
                  <Link
                    to={`/classes/${cls.slug || cls.id}`}
                    className="text-xs font-semibold text-[#566B50] hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
