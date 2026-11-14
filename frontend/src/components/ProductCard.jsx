import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingAdd(true);
    const res = await addToCart(product.id, null, 1);
    setLoadingAdd(false);
    if (res?.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post('/wishlist/', { product_id: product.id });
      setIsWishlisted(res.data.action === 'added');
      toast.success(res.data.message);
    } catch (err) {
      toast.info('Please sign in to save items to your wishlist.');
    }
  };

  const imageUrl = product.primary_image_url || '/images/siha-logo.png';
  const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);

  return (
    <div className="card-pastel group flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white border border-[#84977B]/15">
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F7F3] p-2 sm:p-3">
        <Link to={`/product/${product.slug || product.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center rounded-xl transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1 z-10 pointer-events-none">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-[#566B50] text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-[#F3DCE3]" />
              <span className="hidden min-[380px]:inline">Featured</span>
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-[#D98FA5] text-white text-[9px] sm:text-[10px] font-bold shadow-sm">
              SALE
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-10 ${
            isWishlisted
              ? 'bg-[#566B50] text-white'
              : 'bg-white/85 text-[#566B50] hover:bg-white hover:scale-110'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Stock / Ready-to-ship Indicator (Bottom Left) */}
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-medium backdrop-blur-md border ${
              product.is_in_stock
                ? 'bg-white/95 text-emerald-800 border-emerald-200'
                : 'bg-white/95 text-amber-800 border-amber-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.is_in_stock ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{product.is_ready_stock ? 'Ready' : 'Custom'}</span>
          </span>
        </div>
      </div>

      {/* Product Details Area */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div>
          {/* Category */}
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#84977B] block truncate">
            {product.category_name || 'Handmade Craft'}
          </span>

          {/* Product Name */}
          <h3 className="font-heading text-xs sm:text-base font-bold text-[#45483F] hover:text-[#566B50] transition-colors line-clamp-1 mt-0.5">
            <Link to={`/product/${product.slug || product.id}`} title={product.name}>
              {product.name}
            </Link>
          </h3>

          {/* Short description (desktop only) */}
          {product.short_description && (
            <p className="text-[11px] text-[#45483F]/70 line-clamp-1 mt-0.5 hidden sm:block">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 sm:pt-3 border-t border-[#84977B]/15 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Prices */}
          <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-baseline gap-0.5 min-[380px]:gap-1">
            <span className="font-heading text-xs sm:text-base font-bold text-[#566B50]">
              ₹{product.current_price || product.price}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-[#45483F]/50 line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={loadingAdd}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1 text-[11px] font-semibold shadow-sm focus:outline-none shrink-0 ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#566B50] hover:bg-[#43543e] text-white'
            }`}
            aria-label={`Add ${product.name} to cart`}
            title={`Add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden min-[400px]:inline sm:inline">
                  {loadingAdd ? '...' : 'Add'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
