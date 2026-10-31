import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Curated Collections</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Explore by Category
        </h1>
        <p className="text-sm text-brand-chocolate/75">
          Browse our dedicated collections of handmade amigurumi plushies, bohemian granny square bags, everlasting floral bouquets, and premium crafting supplies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, idx) => {
          const pastelBgs = [
            'bg-pastel-pink/40 border-pastel-pink',
            'bg-pastel-peach/40 border-pastel-peach',
            'bg-pastel-lavender/40 border-pastel-lavender',
            'bg-pastel-sage/40 border-pastel-sage',
            'bg-pastel-sand/60 border-pastel-sand',
            'bg-pastel-cream border-pastel-pink/60',
          ];
          const bg = pastelBgs[idx % pastelBgs.length];

          return (
            <div
              key={cat.id}
              className={`p-8 rounded-3xl border shadow-card hover:shadow-pastel transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between gap-6 ${bg}`}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-burgundy border border-pastel-pink">
                  <Scissors className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-brand-burgundy">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-brand-chocolate/60 block mt-0.5">
                    {cat.product_count || 'Boutique'} Items Available
                  </span>
                </div>
                <p className="text-xs text-brand-chocolate/80 leading-relaxed">
                  {cat.description || 'Carefully handcrafted with premium yarns and attention to detail.'}
                </p>
              </div>

              <Link
                to={`/shop?category=${cat.slug}`}
                className="btn-secondary text-xs w-full justify-between group"
              >
                <span>Browse {cat.name}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
