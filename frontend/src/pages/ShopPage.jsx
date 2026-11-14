import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Search, X, SlidersHorizontal, ArrowUpDown, ChevronRight, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../config/categories';
import api from '../services/api';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categoriesFromApi, setCategoriesFromApi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedCat, setExpandedCat] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state from URL params
  const selectedCategory = searchParams.get('category') || '';
  const selectedSubcategory = searchParams.get('subcategory') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  useEffect(() => {
    api.get('/categories/')
      .then((res) => setCategoriesFromApi(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedCategory) query.set('category', selectedCategory);
    if (selectedSubcategory) query.set('subcategory', selectedSubcategory);
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
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy, inStockOnly, minPrice, maxPrice]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset subcategory if category changes
    if (key === 'category') {
      newParams.delete('subcategory');
    }
    setSearchParams(newParams);
  };

  const handleCategoryClick = (cat) => {
    if (cat.isCustom) return; // Handled by standard Link
    if (selectedCategory === cat.slug) {
      updateFilter('category', '');
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('category', cat.slug);
      newParams.delete('subcategory');
      setSearchParams(newParams);
    }
  };

  const handleSubcategoryClick = (cat, sub) => {
    const newParams = new URLSearchParams();
    if (sub.query) {
      Object.entries(sub.query).forEach(([k, v]) => newParams.set(k, v));
    } else {
      newParams.set('category', cat.slug);
      newParams.set('subcategory', sub.slug);
    }
    setSearchParams(newParams);
    setMobileFilterOpen(false);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const currentCategoryObj = CATEGORIES.find(
    (c) => c.slug === selectedCategory || c.fallbackSlugs?.includes(selectedCategory)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2.5">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#84977B]">
          Artisan Handcrafted Boutique
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#566B50]">
          {currentCategoryObj ? currentCategoryObj.name : 'Explore Our Creations'}
        </h1>
        <p className="text-xs sm:text-sm text-[#45483F]/75 leading-relaxed">
          {currentCategoryObj
            ? currentCategoryObj.description
            : 'Each piece is individually hand-crocheted stitch by stitch with gentle, skin-friendly yarn. Ready pieces dispatch in 2–3 days; bespoke requests are lovingly made to order.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* ================= Sidebar Filters (Desktop) ================= */}
        <aside className="hidden lg:block space-y-6 p-6 rounded-3xl bg-white border border-[#84977B]/20 shadow-sm h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-[#84977B]/15">
            <h3 className="font-heading text-base font-bold text-[#566B50] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#84977B]" /> Filters
            </h3>
            {(selectedCategory || selectedSubcategory || searchQuery || inStockOnly || minPrice || maxPrice) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#D98FA5] hover:text-[#566B50] hover:underline font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#566B50] uppercase tracking-wider">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Product, yarn, flower..."
                className="input-pastel text-xs py-2 pr-8 border-[#84977B]/30 focus:border-[#566B50]"
              />
              {searchQuery && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#45483F]/40 hover:text-[#566B50]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 8 Categories Navigation */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#566B50] uppercase tracking-wider">Categories</label>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-[#566B50] text-white font-semibold shadow-sm'
                    : 'text-[#45483F] hover:bg-[#F3DCE3]/30'
                }`}
              >
                All Categories ({totalCount})
              </button>

              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                const isExpanded = expandedCat === cat.id || isActive;

                if (cat.isCustom) {
                  return (
                    <Link
                      key={cat.id}
                      to="/custom-orders"
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#45483F] hover:bg-[#F3DCE3]/30 flex items-center justify-between transition-all"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] uppercase font-bold text-[#D98FA5] px-1.5 py-0.5 rounded bg-[#F3DCE3]/50">
                        Bespoke
                      </span>
                    </Link>
                  );
                }

                return (
                  <div key={cat.id} className="space-y-0.5">
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-[#566B50] text-white font-semibold shadow-sm'
                          : 'text-[#45483F] hover:bg-[#F3DCE3]/30'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCat(isExpanded ? null : cat.id);
                          }}
                          className="p-1 rounded hover:bg-black/10"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </button>

                    {/* Subcategories list */}
                    {isExpanded && cat.subcategories && (
                      <div className="pl-4 pr-1 py-1 space-y-1">
                        {cat.subcategories.map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSubcategoryClick(cat, sub)}
                            className="w-full text-left px-2.5 py-1 text-[11px] text-[#45483F]/75 hover:text-[#566B50] hover:bg-[#84977B]/10 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 rounded-full bg-[#84977B]" />
                            <span>{sub.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-[#84977B]/15">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#45483F]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
                className="rounded border-[#84977B]/40 text-[#566B50] focus:ring-[#566B50] w-4 h-4"
              />
              <span>In Stock Ready to Ship</span>
            </label>
          </div>
        </aside>

        {/* ================= Main Products Area ================= */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Top Control Bar: Total Count & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#84977B]/20 shadow-sm">
            <p className="text-xs text-[#45483F]/80 font-medium">
              Showing <strong className="text-[#566B50]">{products.length}</strong> creations
              {selectedCategory && (
                <> in <strong className="text-[#566B50]">"{currentCategoryObj?.name || selectedCategory}"</strong></>
              )}
            </p>

            <div className="flex items-center gap-2.5 justify-between sm:justify-end">
              {/* Mobile Filter Trigger Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#84977B]/30 bg-[#FFFDF7] text-xs font-semibold text-[#566B50] hover:bg-[#F3DCE3]/30 transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#84977B]" />
                <span>Filters {(selectedCategory || inStockOnly) ? '• Active' : ''}</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-[#45483F]">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#566B50] shrink-0" />
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="bg-white border border-[#84977B]/30 rounded-xl px-2.5 py-1 text-xs text-[#566B50] font-medium focus:outline-none focus:ring-1 focus:ring-[#566B50]"
                >
                  <option value="newest">Newest Stitches</option>
                  <option value="popularity">Most Loved</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid: CRITICAL REQUIREMENT -> TWO PRODUCTS SIDE BY SIDE (grid-cols-2) on mobile */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="card-pastel p-3 aspect-[3/4] animate-pulse bg-[#F5F7F3] rounded-2xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 p-6 sm:p-8 rounded-3xl bg-white border border-[#84977B]/20 shadow-sm space-y-4">
              <img
                src="/images/siha-logo.png"
                alt="Siha Craft Studio"
                className="w-16 h-16 rounded-full mx-auto opacity-70 border border-[#84977B]/20"
              />
              <h3 className="font-heading text-xl font-bold text-[#566B50]">
                No matching handmade pieces found
              </h3>
              <p className="text-xs text-[#45483F]/70 max-w-sm mx-auto leading-relaxed">
                Try loosening your filters or search terms. You can also commission our artisans directly for a bespoke design.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-xl bg-[#566B50] text-white text-xs font-semibold hover:bg-[#43543e] transition-colors"
                >
                  Clear All Filters
                </button>
                <Link
                  to="/custom-orders"
                  className="px-4 py-2 rounded-xl bg-[#F3DCE3] text-[#566B50] text-xs font-semibold hover:bg-[#eed1da] transition-colors"
                >
                  Custom Order
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= Mobile Filter Drawer ================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-xs bg-[#FFFDF7] h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#84977B]/20">
                <h3 className="font-heading text-base font-bold text-[#566B50] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#84977B]" /> Filter Creations
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-[#45483F]/70 hover:text-[#566B50]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#566B50] uppercase tracking-wider">Categories</label>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      updateFilter('category', '');
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                      !selectedCategory ? 'bg-[#566B50] text-white font-semibold' : 'text-[#45483F]'
                    }`}
                  >
                    All Categories ({totalCount})
                  </button>

                  {CATEGORIES.map((cat) => {
                    if (cat.isCustom) {
                      return (
                        <Link
                          key={cat.id}
                          to="/custom-orders"
                          onClick={() => setMobileFilterOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#45483F] flex items-center justify-between"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[9px] uppercase font-bold text-[#D98FA5] px-1.5 py-0.5 rounded bg-[#F3DCE3]">
                            Bespoke
                          </span>
                        </Link>
                      );
                    }

                    const isActive = selectedCategory === cat.slug;
                    return (
                      <div key={cat.id}>
                        <button
                          onClick={() => {
                            handleCategoryClick(cat);
                            setMobileFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                            isActive ? 'bg-[#566B50] text-white font-semibold' : 'text-[#45483F]'
                          }`}
                        >
                          {cat.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* In Stock */}
              <div className="pt-3 border-t border-[#84977B]/15">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#45483F]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
                    className="rounded border-[#84977B]/40 text-[#566B50] focus:ring-[#566B50] w-4 h-4"
                  />
                  <span>In Stock Ready to Ship</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#84977B]/20 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs font-semibold text-[#566B50] border border-[#84977B]/30 rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-semibold bg-[#566B50] text-white rounded-xl shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
