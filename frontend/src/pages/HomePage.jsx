import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart, Star, ShieldCheck, Truck, RefreshCw, Scissors, Calendar, CheckCircle2 } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [plushieProducts, setPlushieProducts] = useState([]);
  const [bagProducts, setBagProducts] = useState([]);
  const [flowerProducts, setFlowerProducts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes, classesRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/products/?page_size=12'),
          api.get('/classes/'),
        ]);

        setCategories(catsRes.data);
        const allProds = prodsRes.data.results || [];
        setFeaturedProducts(allProds.filter((p) => p.is_featured).slice(0, 4));
        setPlushieProducts(allProds.filter((p) => p.category_slug === 'crochet-toys-plushies').slice(0, 4));
        setBagProducts(allProds.filter((p) => p.category_slug === 'crochet-bags-purses').slice(0, 4));
        setFlowerProducts(allProds.filter((p) => p.category_slug === 'crochet-flowers-bouquets').slice(0, 4));
        setClasses(classesRes.data.slice(0, 3));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Hero Carousel with Floating Crochet Elements */}
      <HeroCarousel />

      {/* 2. Brand Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 rounded-3xl bg-white/70 border border-pastel-pink/70 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-pastel-pink text-brand-burgundy shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-brand-burgundy">100% Handcrafted</h4>
              <p className="text-xs text-brand-chocolate/70">Mindfully stitched by hand</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-pastel-peach text-brand-burgundy shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-brand-burgundy">Pan-India Delivery</h4>
              <p className="text-xs text-brand-chocolate/70">Safe courier packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-pastel-lavender text-brand-burgundy shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-brand-burgundy">Bespoke Orders</h4>
              <p className="text-xs text-brand-chocolate/70">Personalized gifts & colors</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-pastel-sage text-brand-burgundy shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-brand-burgundy">Online Classes</h4>
              <p className="text-xs text-brand-chocolate/70">Interactive Google Meet</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Curated Categories</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy mt-1">Shop by Handmade Craft</h2>
          </div>
          <Link to="/categories" className="btn-outline text-xs gap-1.5 self-start sm:self-auto">
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat, idx) => {
            const bgGradients = [
              'bg-pastel-pink/40 hover:bg-pastel-pink/70',
              'bg-pastel-peach/40 hover:bg-pastel-peach/70',
              'bg-pastel-lavender/40 hover:bg-pastel-lavender/70',
              'bg-pastel-sage/40 hover:bg-pastel-sage/70',
              'bg-pastel-sand/60 hover:bg-pastel-sand',
              'bg-pastel-cream hover:bg-pastel-pink/30',
            ];
            const bgClass = bgGradients[idx % bgGradients.length];

            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className={`group p-5 rounded-3xl border border-pastel-pink/60 transition-all duration-300 transform hover:-translate-y-1.5 shadow-sm hover:shadow-pastel flex flex-col items-center text-center ${bgClass}`}
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-burgundy group-hover:scale-110 transition-transform mb-3 border border-pastel-pink">
                  <Scissors className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-sm font-bold text-brand-burgundy leading-snug line-clamp-2">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-brand-chocolate/70 mt-1">
                  {cat.product_count || 'Boutique'} items
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Best Sellers / Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Artisan Favorites</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy mt-1">Bestselling Creations</h2>
          </div>
          <Link to="/shop?sort=popularity" className="btn-outline text-xs gap-1.5 self-start sm:self-auto">
            <span>Explore Popular</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. Custom Orders Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pastel-peach/90 via-pastel-cream to-pastel-pink/90 border border-pastel-pink shadow-pastel-lg p-8 sm:p-12 md:p-16">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-brand-burgundy text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Bespoke Commissions
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-burgundy leading-tight">
              Have a Dream Crochet Project in Mind?
            </h2>
            <p className="text-sm sm:text-base text-brand-chocolate/85 leading-relaxed">
              We specialize in custom crochet creations tailored to your favorite colors, character inspirations, anniversary dates, and personalized dimensions. Submit your reference photos and receive a free quote from our master artisan.
            </p>
            <div className="pt-2">
              <Link to="/custom-orders" className="btn-primary text-sm gap-2">
                <span>Request Customization</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Decorative motif */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 opacity-20 pointer-events-none">
            <img src="/images/siha-logo.png" alt="" className="w-full h-full object-contain" />
          </div>
        </div>
      </section>

      {/* 6. Spotlight: Handmade Plushies & Toys */}
      {plushieProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Sweet Companions</span>
              <h2 className="font-heading text-3xl font-bold text-brand-burgundy mt-1">Crochet Toys & Plushies</h2>
            </div>
            <Link to="/shop?category=crochet-toys-plushies" className="btn-outline text-xs">
              View All Plushies
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plushieProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Spotlight: Crochet Bags & Accessories */}
      {bagProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Wearable Art</span>
              <h2 className="font-heading text-3xl font-bold text-brand-burgundy mt-1">Crochet Bags & Purses</h2>
            </div>
            <Link to="/shop?category=crochet-bags-purses" className="btn-outline text-xs">
              View All Bags
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bagProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Online Crochet Training Classes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-pastel-lavender/30 border border-pastel-pink/60 shadow-sm space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Learn with Our Artisans</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy mt-1">Live Online Crochet Classes</h2>
              <p className="text-sm text-brand-chocolate/75 max-w-xl mt-2">
                Small-batch, live video workshops held securely over Google Meet. From foundational slip knots to complex amigurumi shaping, join our welcoming community.
              </p>
            </div>
            <Link to="/classes" className="btn-primary text-xs gap-1.5 self-start md:self-auto shrink-0">
              <span>View All Classes & Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="card-pastel p-6 flex flex-col justify-between gap-4 bg-white/90">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy text-[11px] font-bold uppercase tracking-wider">
                      {cls.skill_level_display || cls.skill_level}
                    </span>
                    <span className="font-heading text-lg font-bold text-brand-burgundy">
                      ₹{cls.price}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-brand-chocolate leading-snug">
                    {cls.title}
                  </h3>

                  <p className="text-xs text-brand-chocolate/75 line-clamp-3">
                    {cls.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-pastel-pink/50 flex items-center justify-between">
                  <span className="text-xs text-brand-chocolate/70">
                    ⏱ {cls.duration_minutes} Mins Live
                  </span>
                  <Link to={`/classes/${cls.slug}`} className="btn-outline text-xs px-4 py-1.5">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Artisan Story Snippet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Our Studio Philosophy</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy leading-tight">
              Crafted Slowly, Loved Forever
            </h2>
            <p className="text-sm sm:text-base text-brand-chocolate/80 leading-relaxed">
              At SiHA Craft Studio, we believe the world moves too fast. In an era of mass-produced plastic goods, our studio is a sanctuary for deliberate handwork, gentle pastel hues, and natural yarns that feel wonderful in your hands.
            </p>
            <p className="text-sm text-brand-chocolate/80 leading-relaxed">
              Every single stitch is pulled with intention. When you unbox a SiHA piece, you are holding hours of patience, traditional craft heritage, and heartfelt warmth.
            </p>
            <div className="pt-2">
              <Link to="/about" className="btn-secondary text-sm">
                Read the SiHA Story
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-md w-full">
              <img
                src="/images/siha-logo.png"
                alt="SiHA Craft Studio Artisan"
                className="w-full aspect-square object-cover rounded-3xl shadow-pastel-lg border-4 border-white"
              />
              <div className="absolute -bottom-5 -left-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-pastel-pink shadow-card max-w-xs">
                <p className="font-script italic text-brand-burgundy text-base font-semibold">
                  "Each yarn strand weaves a story of care and patience."
                </p>
                <span className="text-[11px] text-brand-chocolate/60 block mt-1">— SiHA Craft Studio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Community & Instagram Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Follow Along</span>
          <h2 className="font-heading text-3xl font-bold text-brand-burgundy mt-1">@sihacraftstudio on Instagram</h2>
          <p className="text-sm text-brand-chocolate/75 max-w-md mx-auto mt-1">
            Behind the scenes in our Bengaluru atelier, work-in-progress amigurumi stitches, and student showcases.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-sm group relative">
            <img src="https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=500&q=80" alt="Crochet Bunny" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-sm group relative">
            <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=500&q=80" alt="Granny Square Tote" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-sm group relative">
            <img src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=500&q=80" alt="Crochet Flowers" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-sm group relative">
            <img src="https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=500&q=80" alt="Yarn Skeins" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

    </div>
  );
}
