import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Scissors, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      
      {/* Hero Brand Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Handmade with Love</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          The Story of SiHA Craft Studio
        </h1>
        <p className="font-script italic text-xl text-brand-chocolate/80">
          "Little Stitches, Handmade with Love"
        </p>
      </div>

      {/* Visual Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center card-pastel p-8 sm:p-12 bg-white/95 shadow-pastel">
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative">
            <img
              src="/images/siha-logo.png"
              alt="SiHA Craft Studio Official Logo"
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-full shadow-pastel-lg border-4 border-pastel-pink object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-brand-chocolate/85 leading-relaxed">
          <h2 className="font-heading text-2xl font-bold text-brand-burgundy">
            A Mindful Sanctuary for Slow Handcraft
          </h2>
          <p>
            SiHA Craft Studio was born out of a quiet reverence for slow, deliberate creating. In a world saturated with ephemeral mass production and fleeting synthetic trends, our studio is dedicated to the tactile beauty of natural cotton yarns, gentle pastel palettes, and the meditative rhythm of a single crochet hook.
          </p>
          <p>
            Our official insignia—a gentle feminine profile cradling a handcrafted bloom, framed by an elegant hook and yarn strand—embodies patience, maternal warmth, and the timeless art of passing down handcrafted treasures from generation to generation.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-8 rounded-3xl bg-pastel-pink/40 border border-pastel-pink space-y-3">
          <div className="w-12 h-12 rounded-full bg-white text-brand-burgundy flex items-center justify-center mx-auto shadow-sm">
            <Scissors className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-brand-burgundy">Authentic Slow Craft</h3>
          <p className="text-xs text-brand-chocolate/80 leading-relaxed">
            Zero factory automation. Every plushie, flower petal, and granny square is individually crocheted by hand with organic and combed cotton fibers.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-pastel-peach/40 border border-pastel-peach space-y-3">
          <div className="w-12 h-12 rounded-full bg-white text-brand-burgundy flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-brand-burgundy">Heirloom Durability</h3>
          <p className="text-xs text-brand-chocolate/80 leading-relaxed">
            Stitched with reinforced tension, locked safety fixtures, and durable yarn to ensure your keepsake withstands years of hugs and love.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-pastel-lavender/40 border border-pastel-lavender space-y-3">
          <div className="w-12 h-12 rounded-full bg-white text-brand-burgundy flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-brand-burgundy">Empowering Workshops</h3>
          <p className="text-xs text-brand-chocolate/80 leading-relaxed">
            We share the joy of crochet through patient, interactive Google Meet classes, helping beginners master foundation stitches in supportive circles.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-4 pt-6">
        <h3 className="font-heading text-2xl font-bold text-brand-burgundy">Ready to Explore Our Stitches?</h3>
        <div className="flex justify-center gap-4">
          <Link to="/shop" className="btn-primary text-xs gap-1.5">
            <span>Explore Boutique</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link to="/custom-orders" className="btn-secondary text-xs">
            Request a Custom Piece
          </Link>
        </div>
      </div>

    </div>
  );
}
