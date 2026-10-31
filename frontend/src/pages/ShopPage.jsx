import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state from URL params
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    api.get('/categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedCategory) query.set('category', selectedCategory);
    if (searchQuery) query.set('search', searchQuery);
    if (sortBy) query.set('sort', sortBy);
    if (inStockOnly) query.set('in_stock', 'true');
    if (minPrice) query.set('min_price', minPrice);
    if (maxPrice) query.set('max_price', maxPrice);

    api.get(`/products/?${query.toString()}`)
      .then((res) => {
        setProducts(res.data.results || []);
        setTotalCount(res.data.count || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, sortBy, inStockOnly, minPrice, maxPrice]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Handmade Boutique</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Explore Our Handmade Catalogue
        </h1>
        <p className="text-sm text-brand-chocolate/75">
          Each item is lovingly crocheted stitch by stitch. Ready-to-ship pieces dispatch within 2-3 days; bespoke made-to-order creations are crafted specifically for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block space-y-8 p-6 rounded-3xl bg-white/70 border border-pastel-pink/70 shadow-sm h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-pastel-pink/60">
            <h3 className="font-heading text-lg font-bold text-brand-burgundy flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h3>
            {(selectedCategory || searchQuery || inStockOnly || minPrice || maxPrice) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-brand-burgundy hover:underline font-medium"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-burgundy uppercase tracking-wider">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Product name, yarn, hook..."
                className="input-pastel text-xs py-2 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-chocolate/40 hover:text-brand-burgundy"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-brand-burgundy uppercase tracking-wider">Categories</label>
            <div className="space-y-1.5">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-brand-burgundy text-white font-semibold'
                    : 'text-brand-chocolate hover:bg-pastel-pink/40'
                }`}
              >
                All Categories ({totalCount})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter('category', c.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    selectedCategory === c.slug
                      ? 'bg-brand-burgundy text-white font-semibold'
                      : 'text-brand-chocolate hover:bg-pastel-pink/40'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-75">{c.product_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-pastel-pink/60">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-chocolate">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
                className="rounded border-pastel-pink text-brand-burgundy focus:ring-brand-burgundy w-4 h-4"
              />
              <span>In Stock Ready to Ship</span>
            </label>
          </div>
        </aside>

        {/* Main Products Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Control Bar: Total Count & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 border border-pastel-pink/60 shadow-sm">
            <p className="text-xs text-brand-chocolate/75 font-medium">
              Showing <strong className="text-brand-burgundy">{products.length}</strong> creations
              {selectedCategory && ` in "${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}"`}
            </p>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden btn-secondary text-xs px-3 py-1.5 gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-brand-chocolate">
                <ArrowUpDown className="w-3.5 h-3.5 text-brand-burgundy shrink-0" />
                <span className="hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="bg-transparent border border-pastel-pink/80 rounded-xl px-2.5 py-1 text-xs text-brand-burgundy font-medium focus:outline-none focus:ring-1 focus:ring-brand-burgundy"
                >
                  <option value="newest">Newest Stitches</option>
                  <option value="popularity">Most Loved</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="card-pastel p-4 h-80 animate-pulse bg-pastel-peach/20" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/70 border border-pastel-pink/70 shadow-sm space-y-4">
              <img src="/images/siha-logo.png" alt="" className="w-16 h-16 rounded-full mx-auto opacity-70 border border-pastel-pink" />
              <h3 className="font-heading text-xl font-bold text-brand-burgundy">
                No matching handmade pieces found
              </h3>
              <p className="text-xs text-brand-chocolate/70 max-w-sm mx-auto">
                Try loosening your filters or search terms. You can also commission our artisans directly for a bespoke design.
              </p>
              <button onClick={clearAllFilters} className="btn-secondary text-xs">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
