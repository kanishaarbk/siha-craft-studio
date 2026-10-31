import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    tagline: "Soft & Cuddly Crochet Companions",
    heading: "Meet Your New Favourite Bunny",
    description:
      "Meet our adorable handmade bunny, crafted with soft yarn, floppy ears, and charming little details. A sweet keepsake for gifting, collecting, or cuddling close.",
    primaryBtn: { text: "Shop Bunny Plushies", link: "/shop?category=crochet-toys-plushies" },
    secondaryBtn: { text: "Explore All Toys", link: "/shop?category=crochet-toys-plushies" },
    productImage:
      "https://i.pinimg.com/1200x/27/9d/59/279d59ed2e6af090152bb93caf999c35.jpg",
    productAlt: "Soft handmade crochet bunny plushie",
    badge: "Made with Love",
    bgColor: "from-pastel-peach/60 via-pastel-cream to-pastel-pink/40",
    yarnColor: "#F8DDE0",
  },
  {
    id: 2,
    tagline: "Tiny Handmade Treasures",
    heading: "Little Charms, Big Smiles",
    description:
      "Add a handmade touch to your everyday essentials with adorable crochet keychains. From tiny animals to colourful miniatures, each charm brings personality to your keys and bags.",
    primaryBtn: { text: "Shop Keychains", link: "/shop?category=keychains-small-gifts" },
    secondaryBtn: { text: "Find Your Favourite", link: "/shop?category=keychains-small-gifts" },
    productImage:
      "https://i.pinimg.com/736x/f7/ef/ea/f7efea63d4988fa6162681e3c6934481.jpg",
    productAlt: "Cute handmade accessories and small gifts",
    badge: "Perfect Little Gifts",
    bgColor: "from-pastel-pink/50 via-pastel-cream to-pastel-lavender/40",
    yarnColor: "#EAE2F5",
  },
  {
    id: 3,
    tagline: "Handmade Style, Everyday Comfort",
    heading: "Carry a Little Creativity",
    description:
      "Discover unique crochet bags made stitch by stitch, with beautiful textures and thoughtful details. Perfect for everyday outings, shopping trips, and adding a handmade accent to your look.",
    primaryBtn: { text: "Shop Crochet Bags", link: "/shop?category=bags" },
    secondaryBtn: { text: "Explore Accessories", link: "/shop?category=bags" },
    productImage:
      "https://i.pinimg.com/736x/75/e6/0e/75e60e5f903a2eae4c4681efe60d2e28.jpg",
    productAlt: "Stylish handmade-inspired everyday bag",
    badge: "Made for Your Style",
    bgColor: "from-pastel-cream via-pastel-sage/30 to-pastel-peach/50",
    yarnColor: "#DCE8D8",
  },
  {
    id: 4,
    tagline: "Cosy Handmade Fashion",
    heading: "Wrap Yourself in Handmade Comfort",
    description:
      "From cosy crochet sweaters to beautifully textured wearable pieces, find handmade styles that feel special. Thoughtful stitches and timeless designs make every piece one of a kind.",
    primaryBtn: { text: "Shop Crochet Wear", link: "/shop?category=crochet-clothing" },
    secondaryBtn: { text: "Discover More Styles", link: "/shop?category=crochet-clothing" },
    productImage:
      "https://i.pinimg.com/736x/52/2d/0b/522d0b7937580d3975c10d58a15a632e.jpg",
    productAlt: "Cosy knitwear and handmade fashion inspiration",
    badge: "Cosy by Design",
    bgColor: "from-pastel-lavender/40 via-pastel-cream to-pastel-peach/60",
    yarnColor: "#FFE8DF",
  },
  {
    id: 5,
    tagline: "A World of Handmade Wonders",
    heading: "Something Special in Every Stitch",
    description:
      "Explore crochet flower bouquets, cute plushies, floral accessories, personalised keepsakes, and other handcrafted creations made to brighten your day or make someone's gift extra meaningful.",
    primaryBtn: { text: "Explore All Products", link: "/shop" },
    secondaryBtn: { text: "Request a Custom Piece", link: "/custom-orders" },
    productImage:
      "https://i.pinimg.com/1200x/c2/b8/9a/c2b89ac109ff87344011d03e1f67a78b.jpg",
    productAlt: "Colourful yarn and materials for handmade crochet creations",
    badge: "Discover Something Unique",
    bgColor: "from-pastel-peach/50 via-pastel-cream to-pastel-sage/40",
    yarnColor: "#F8DDE0",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(nextSlide, 6500);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, currentSlide]);

  const slide = slides[currentSlide];

  return (
    <div
      className="relative w-full overflow-hidden bg-pastel-cream border-b border-pastel-pink/50 transition-colors duration-1000"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label="Handmade crochet hero showcase"
    >
      {/* Background Layer with Soft Pastel Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgColor} transition-all duration-1000 opacity-90`} />

      {/* Floating Decorative Crochet Elements (Yarn balls, hooks, strands, flowers) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 select-none">
        
        {/* Floating Yarn Ball 1 (Top Left) */}
        <div className="absolute top-8 left-6 md:left-16 animate-float-slow opacity-85">
          <svg className="w-16 h-16 md:w-24 md:h-24 drop-shadow-md" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" fill="#F8DDE0" stroke="#71313D" strokeWidth="2.5" />
            {/* Yarn textures */}
            <path d="M20 35 C 35 20, 65 20, 80 35" stroke="#71313D" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M15 50 C 35 30, 65 30, 85 50" stroke="#71313D" strokeWidth="2.5" />
            <path d="M20 65 C 35 80, 65 80, 80 65" stroke="#71313D" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M35 18 C 25 45, 25 75, 40 85" stroke="#71313D" strokeWidth="2" />
            <path d="M65 18 C 75 45, 75 75, 60 85" stroke="#71313D" strokeWidth="2" />
          </svg>
        </div>

        {/* Floating Crochet Hook (Top Right / Middle) */}
        <div className="absolute top-12 right-12 md:right-28 animate-float-reverse opacity-75">
          <svg className="w-20 h-20 md:w-28 md:h-28 drop-shadow-md transform rotate-45" viewBox="0 0 120 120" fill="none">
            {/* Hook shaft */}
            <rect x="56" y="10" width="8" height="90" rx="4" fill="#FFE8DF" stroke="#55352E" strokeWidth="2" />
            {/* Grip handle */}
            <rect x="53" y="65" width="14" height="45" rx="7" fill="#71313D" />
            {/* Hook curve tip */}
            <path d="M60 10 C 60 4, 70 4, 70 12 C 70 16, 64 16, 64 20" stroke="#55352E" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Floating Yarn Ball 2 (Bottom Right) */}
        <div className="absolute bottom-10 right-6 md:right-20 animate-float-gentle opacity-80">
          <svg className="w-14 h-14 md:w-20 md:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" fill="#EAE2F5" stroke="#55352E" strokeWidth="2.5" />
            <path d="M18 40 C 35 25, 65 25, 82 40" stroke="#55352E" strokeWidth="2" />
            <path d="M15 55 C 35 70, 65 70, 85 55" stroke="#55352E" strokeWidth="2" strokeDasharray="4 2" />
            <path d="M45 15 C 30 40, 30 70, 48 85" stroke="#55352E" strokeWidth="2" />
          </svg>
        </div>

        {/* Curved Floating Yarn Strand (Bottom Center / Left) */}
        <div className="absolute -bottom-8 left-1/4 w-96 h-32 animate-yarn-sway opacity-60">
          <svg className="w-full h-full" viewBox="0 0 400 100" fill="none">
            <path
              d="M10 80 Q 100 10, 200 60 T 390 40"
              stroke="#71313D"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 4"
            />
          </svg>
        </div>

        {/* Miniature Crocheted Flower 1 */}
        <div className="absolute top-1/3 left-4 md:left-24 animate-spin-very-slow opacity-80">
          <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="25" r="18" fill="#F8DDE0" stroke="#71313D" strokeWidth="2" />
            <circle cx="75" cy="50" r="18" fill="#F8DDE0" stroke="#71313D" strokeWidth="2" />
            <circle cx="50" cy="75" r="18" fill="#F8DDE0" stroke="#71313D" strokeWidth="2" />
            <circle cx="25" cy="50" r="18" fill="#F8DDE0" stroke="#71313D" strokeWidth="2" />
            <circle cx="50" cy="50" r="14" fill="#FFE8DF" stroke="#71313D" strokeWidth="2" />
          </svg>
        </div>

        {/* Miniature Crocheted Bow (Top Center) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 animate-float-slow opacity-70">
          <svg className="w-10 h-8" viewBox="0 0 60 40" fill="none">
            <path d="M30 20 C 10 5, 5 35, 30 20 Z" fill="#DCE8D8" stroke="#55352E" strokeWidth="2" />
            <path d="M30 20 C 50 5, 55 35, 30 20 Z" fill="#DCE8D8" stroke="#55352E" strokeWidth="2" />
            <circle cx="30" cy="20" r="6" fill="#FFF9F3" stroke="#55352E" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Main Slide Content Grid */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Text & CTAs Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left-4 duration-700 key={slide.id}">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-pastel-pink text-brand-burgundy text-xs font-semibold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-burgundy" />
              <span>{slide.tagline}</span>
            </div>

            {/* Slide Heading */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-burgundy tracking-tight leading-[1.12]">
              {slide.heading}
            </h1>

            {/* Slide Description */}
            <p className="text-base sm:text-lg text-brand-chocolate/85 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {slide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to={slide.primaryBtn.link} className="btn-primary text-sm sm:text-base gap-2 group">
                <span>{slide.primaryBtn.text}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              {slide.secondaryBtn && (
                <Link to={slide.secondaryBtn.link} className="btn-secondary text-sm sm:text-base">
                  {slide.secondaryBtn.text}
                </Link>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-pastel-pink/60 flex items-center justify-center lg:justify-start gap-8 text-xs text-brand-chocolate/70 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-burgundy"></span> 100% Handcrafted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-burgundy"></span> Custom Made to Order
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-burgundy"></span> Pan-India Delivery
              </span>
            </div>
          </div>

          {/* Product Photography Showcase Column */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Soft decorative circular backdrop matching logo peach-pink */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/70 border-4 border-dashed border-pastel-pink/80 shadow-pastel-lg -z-10 animate-spin-very-slow" />
            
            {/* Featured Product Photograph Card */}
            <div className="relative group max-w-sm sm:max-w-md w-full">
              <div className="relative rounded-3xl overflow-hidden shadow-pastel-lg border-2 border-white/90 bg-white/40 backdrop-blur-sm p-3">
                <img
                  src={slide.productImage}
                  alt={slide.productAlt}
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl transform group-hover:scale-102 transition-transform duration-700"
                />
                
                {/* Floating Product Badge */}
                <div className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-pastel-pink text-xs font-semibold text-brand-burgundy shadow-card flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{slide.badge}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Controls (Arrows & Indicators) */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 pb-6 flex items-center justify-between">
        
        {/* Indicators (Dots) */}
        <div className="flex items-center gap-2.5">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                currentSlide === index
                  ? 'w-8 bg-brand-burgundy'
                  : 'w-2.5 bg-brand-burgundy/25 hover:bg-brand-burgundy/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Previous & Next Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/90 border border-pastel-pink text-brand-burgundy hover:bg-pastel-pink shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-burgundy"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/90 border border-pastel-pink text-brand-burgundy hover:bg-pastel-pink shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-burgundy"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
