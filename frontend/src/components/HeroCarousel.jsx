import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function HeroCarousel() {
  const [heroImage, setHeroImage] = useState('/images/teddy-bear-bouquet.png');
  const [heroHeading, setHeroHeading] = useState('Where Every Stitch Tells a Story.');
  const [heroDescription, setHeroDescription] = useState(
    "Fall in love with our handmade crochet creations, or discover the joy of making your own in our creative workshops. Whether you buy one or craft one yourself, there's a little love in every stitch."
  );

  useEffect(() => {
    // Dynamic fetch from Store Settings for admin hero image management
    api.get('/store-settings/')
      .then((res) => {
        if (res.data?.hero_image_url) {
          setHeroImage(res.data.hero_image_url);
        }
        if (res.data?.hero_heading) {
          setHeroHeading(res.data.hero_heading);
        }
        if (res.data?.hero_description) {
          setHeroDescription(res.data.hero_description);
        }
      })
      .catch((err) => {
        // Fallback to default state silently
      });
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#FFFDF7] border-b border-[#84977B]/20">
      
      {/* ================= DESKTOP FULL-BLEED HERO (md and up) ================= */}
      <div className="hidden md:block relative w-full min-h-[560px] lg:min-h-[620px] xl:min-h-[660px]">
        {/* Full-width Image Layer - Right Side Composition */}
        <div className="absolute inset-0 flex justify-end">
          <div className="relative w-full lg:w-[65%] xl:w-[60%] h-full">
            <img
              src={heroImage}
              alt="Handmade crochet teddy bear with flower bouquet at Siha Craft Studio"
              className="w-full h-full object-contain lg:object-cover object-right"
              loading="eager"
            />
            {/* Soft blending gradient mask towards the left text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF7]/70 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Ambient Warm Tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF7]/40 via-transparent to-transparent pointer-events-none" />

        {/* Text Layer - Left Side Direct Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full min-h-[560px] lg:min-h-[620px] xl:min-h-[660px] flex items-center">
          <div className="max-w-xl lg:max-w-2xl space-y-5 lg:space-y-6">
            
            {/* Brand Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#84977B]/25 text-[#566B50] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D98FA5]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">
                SIHA CRAFT STUDIO
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-4xl lg:text-6xl font-bold text-[#566B50] leading-[1.12] tracking-tight">
              {heroHeading}
            </h1>

            {/* Description */}
            <p className="text-sm lg:text-base text-[#45483F]/85 leading-relaxed font-normal max-w-xl">
              {heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="px-6 py-3.5 rounded-xl bg-[#566B50] hover:bg-[#43543e] text-white text-sm font-semibold shadow-md transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <span>Explore Our Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/classes"
                className="px-6 py-3.5 rounded-xl border border-[#84977B]/30 bg-white/80 hover:bg-[#F3DCE3]/40 text-[#566B50] text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Join Our Workshops</span>
              </Link>
            </div>

            {/* Artisan Highlights Bar */}
            <div className="pt-4 flex items-center gap-6 text-[11px] font-semibold text-[#84977B] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#566B50]" />
                100% Handcrafted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D98FA5]" />
                Namakkal, Tamil Nadu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#566B50]" />
                Pan-India Delivery
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MOBILE INTELLIGENT HERO (< 768px) ================= */}
      <div className="md:hidden flex flex-col">
        {/* Mobile Visual Focus: Teddy Bear & Bouquet (Not cropped, natural proportion) */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-[#F5F7F3] via-[#FFFDF7] to-[#FFFDF7] overflow-hidden flex items-center justify-center p-4">
          <img
            src={heroImage}
            alt="Handmade crochet teddy bear with flower bouquet at Siha Craft Studio"
            className="w-full h-full object-contain"
            loading="eager"
          />
          {/* Subtle brand tag floating on mobile image */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[#566B50] text-[10px] font-bold tracking-widest uppercase shadow-sm border border-[#84977B]/20">
              <Sparkles className="w-2.5 h-2.5 text-[#D98FA5]" />
              SIHA CRAFT STUDIO
            </span>
          </div>
        </div>

        {/* Mobile Content & CTAs */}
        <div className="px-5 pt-2 pb-8 space-y-3.5 text-center bg-[#FFFDF7]">
          {/* Main Heading */}
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#566B50] leading-tight">
            {heroHeading}
          </h1>

          {/* Description */}
          <p className="text-xs text-[#45483F]/85 leading-relaxed max-w-sm mx-auto">
            {heroDescription}
          </p>

          {/* Buttons: Accessible side-by-side or stacked cleanly */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#566B50] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
            >
              <span>Explore Our Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/classes"
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#84977B]/30 bg-white text-[#566B50] text-xs font-semibold shadow-sm flex items-center justify-center"
            >
              <span>Join Our Workshops</span>
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}
