import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingAdd(true);
    await addToCart(product.id, null, 1);
    setLoadingAdd(false);
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
    <div className="card-pastel group flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-pastel-peach/30 p-3">
        <Link to={`/product/${product.slug || product.id}`}>
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-burgundy text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> Featured
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm">
              SALE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-5 right-5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-10 ${
            isWishlisted
              ? 'bg-brand-burgundy text-white'
              : 'bg-white/80 text-brand-burgundy hover:bg-white hover:scale-110'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Stock / Ready-to-ship Indicator */}
        <div className="absolute bottom-5 left-5 z-10 pointer-events-none">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-md border ${
            product.is_in_stock
              ? 'bg-white/90 text-emerald-800 border-emerald-200'
              : 'bg-white/90 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.is_in_stock ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {product.is_ready_stock ? 'Ready to Ship' : 'Made to Order'}
          </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category */}
          <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-burgundy/80">
            {product.category_name || 'Handmade Craft'}
          </span>

          {/* Product Name */}
          <h3 className="font-heading text-base sm:text-lg font-bold text-brand-chocolate hover:text-brand-burgundy transition-colors line-clamp-1 mt-0.5">
            <Link to={`/product/${product.slug || product.id}`}>
              {product.name}
            </Link>
          </h3>

          {/* Short description */}
          {product.short_description && (
            <p className="text-xs text-brand-chocolate/70 line-clamp-2 mt-1">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-pastel-pink/50 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-lg font-bold text-brand-burgundy">
              ₹{product.current_price || product.price}
            </span>
            {hasDiscount && (
              <span className="text-xs text-brand-chocolate/40 line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={loadingAdd}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-pastel-pink/80 hover:bg-brand-burgundy text-brand-burgundy hover:text-white transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shadow-sm focus:outline-none"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{loadingAdd ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
