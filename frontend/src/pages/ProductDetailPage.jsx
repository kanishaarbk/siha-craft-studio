import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, RefreshCw, Scissors, Sparkles, Check, ChevronRight, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from '../config/whatsapp';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, headline: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}/`)
      .then((res) => {
        const prod = res.data;
        setProduct(prod);
        setSelectedImage(prod.primary_image_url || prod.images?.[0]?.image_url);
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }
        setReviews(prod.reviews || []);
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-pastel-pink border-t-brand-burgundy animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-brand-chocolate">Unwrapping handmade details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-heading text-3xl font-bold text-brand-burgundy">Creation Not Found</h2>
        <p className="text-sm text-brand-chocolate/75">The requested piece may have been retired or moved.</p>
        <Link to="/shop" className="btn-primary text-xs">Back to Boutique</Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? parseFloat(selectedVariant.effective_price || product.current_price)
    : parseFloat(product.current_price || product.price);

  const stockAvailable = selectedVariant ? selectedVariant.stock : product.total_stock;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product.id, selectedVariant?.id, quantity);
    setAddingToCart(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to share your product review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product.id}/reviews/`, reviewForm);
      setReviews([res.data, ...reviews]);
      setReviewForm({ rating: 5, headline: '', comment: '' });
      toast.success('Thank you! Your verified review has been published.');
    } catch (err) {
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-brand-chocolate/60">
        <Link to="/" className="hover:text-brand-burgundy">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-brand-burgundy">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-brand-burgundy">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-brand-burgundy font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Photos Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white/80 border-2 border-pastel-pink shadow-card p-4 flex items-center justify-center">
            <img
              src={selectedImage || product.primary_image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedImage(product.primary_image_url)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 p-1 bg-white shrink-0 transition-all ${
                  selectedImage === product.primary_image_url ? 'border-brand-burgundy ring-2 ring-brand-burgundy/20' : 'border-pastel-pink/70 opacity-70'
                }`}
              >
                <img src={product.primary_image_url} alt="" className="w-full h-full object-cover rounded-xl" />
              </button>
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url || img.image)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 p-1 bg-white shrink-0 transition-all ${
                    selectedImage === (img.image_url || img.image) ? 'border-brand-burgundy ring-2 ring-brand-burgundy/20' : 'border-pastel-pink/70 opacity-70'
                  }`}
                >
                  <img src={img.image_url || img.image} alt="" className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buying Controls & Artisan Information (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">
                {product.category?.name}
              </span>
              <span className="text-[11px] font-mono text-brand-chocolate/50">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy mt-1 leading-tight">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="font-heading text-3xl font-bold text-brand-burgundy">
                ₹{currentPrice.toFixed(2)}
              </span>
              {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) && (
                <span className="text-base text-brand-chocolate/40 line-through">
                  ₹{product.price}
                </span>
              )}
              <span className="text-xs text-emerald-700 font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                Inclusive of GST
              </span>
            </div>
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-sm text-brand-chocolate/80 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-pastel-pink/60">
              <label className="text-xs font-bold text-brand-burgundy uppercase tracking-wider block">
                Select Shade / Variant: <span className="text-brand-chocolate font-medium">{selectedVariant?.color} - {selectedVariant?.size}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-brand-burgundy bg-pastel-pink/60 text-brand-burgundy font-semibold shadow-sm'
                          : 'border-pastel-pink/80 bg-white text-brand-chocolate hover:bg-pastel-peach/30'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: v.color_code || '#F8DDE0' }}
                      />
                      <span>{v.color} ({v.size})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock & Quantity Control */}
          <div className="space-y-3 pt-3 border-t border-pastel-pink/60">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-brand-chocolate/80">Availability:</span>
              <span className={stockAvailable > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                {stockAvailable > 0 ? `In Stock (${stockAvailable} available)` : 'Made to Order upon Request'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-pastel-pink rounded-2xl bg-white shadow-sm p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-burgundy hover:bg-pastel-pink/40 font-bold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center font-heading font-bold text-brand-burgundy text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stockAvailable || 10, q + 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-burgundy hover:bg-pastel-pink/40 font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn-primary flex-1 py-3 text-sm gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addingToCart ? 'Adding to Basket...' : 'Add to Handmade Basket'}</span>
              </button>
            </div>

            {/* Direct WhatsApp Product Enquiry */}
            <a
              href={getWhatsAppUrl(`Hello SiHA Craft Studio! I have an inquiry about "${product.name}" (SKU: ${product.sku || product.id}). Could you help me with customization and availability?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-xs font-semibold shadow-sm"
              aria-label={`Enquire about ${product.name} on WhatsApp`}
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>Enquire About This Piece on WhatsApp</span>
            </a>
          </div>

          {/* Boutique Shipping & Care Highlights */}
          <div className="p-4 rounded-2xl bg-white/70 border border-pastel-pink/70 space-y-2.5 text-xs text-brand-chocolate/80">
            <p className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-burgundy shrink-0" />
              <span>Estimated Dispatch: <strong>{product.estimated_dispatch_days} business days</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-brand-burgundy shrink-0" />
              <span>Material: <strong>{product.material}</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-burgundy shrink-0" />
              <span>Heirloom Quality: Stitched with reinforced seams</span>
            </p>
          </div>
        </div>
      </div>

      {/* Description & Care Specifications Tabbed Area */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white/70 border border-pastel-pink/70 shadow-sm space-y-6">
        <h3 className="font-heading text-2xl font-bold text-brand-burgundy">
          Artisan Craftsmanship & Care Instructions
        </h3>
        <div className="prose prose-sm text-brand-chocolate/85 max-w-none leading-relaxed space-y-4">
          <p>{product.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-pastel-pink/50">
            <div>
              <h4 className="font-heading font-bold text-brand-burgundy text-sm">Product Dimensions</h4>
              <p className="text-xs text-brand-chocolate/75 mt-1">{product.dimensions || 'Handmade standard boutique sizing'}</p>
            </div>
            <div>
              <h4 className="font-heading font-bold text-brand-burgundy text-sm">Recommended Care</h4>
              <p className="text-xs text-brand-chocolate/75 mt-1">{product.care_instructions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Moderated Ratings */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white/70 border border-pastel-pink/70 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pastel-pink/60">
          <div>
            <h3 className="font-heading text-2xl font-bold text-brand-burgundy">Customer Impressions</h3>
            <p className="text-xs text-brand-chocolate/70 mt-1">Real reflections from our crochet collectors and patrons</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="font-heading font-bold text-brand-burgundy text-sm">
              {product.average_rating || '5.0'} / 5.0
            </span>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-pastel-cream/60 border border-pastel-pink/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-brand-chocolate">{rev.reviewer_name}</span>
                    {rev.is_verified_purchase && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <h4 className="font-heading text-sm font-bold text-brand-burgundy">{rev.headline}</h4>
                <p className="text-xs text-brand-chocolate/80 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-brand-chocolate/60 italic">
              Be the first to share your thoughts on this handmade piece.
            </p>
          )}
        </div>

        {/* Submit Review Form (for authenticated customers) */}
        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-pastel-pink/60 space-y-4 max-w-xl">
            <h4 className="font-heading text-base font-bold text-brand-burgundy">Write a Review</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-brand-chocolate block mb-1">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  className="input-pastel text-xs py-2"
                >
                  <option value={5}>5 Stars - Heirloom Perfection</option>
                  <option value={4}>4 Stars - Wonderful Handcraft</option>
                  <option value={3}>3 Stars - Good</option>
                  <option value={2}>2 Stars - Fair</option>
                  <option value={1}>1 Star - Needs Improvement</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-chocolate block mb-1">Review Headline</label>
                <input
                  type="text"
                  value={reviewForm.headline}
                  onChange={(e) => setReviewForm({ ...reviewForm, headline: e.target.value })}
                  placeholder="e.g. In love with the soft stitches!"
                  className="input-pastel text-xs py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-brand-chocolate block mb-1">Your Thoughts</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={3}
                placeholder="Share your experience with the craftsmanship, packaging, and colors..."
                className="input-pastel text-xs"
                required
              />
            </div>
            <button type="submit" disabled={submittingReview} className="btn-secondary text-xs">
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        ) : (
          <div className="pt-4 border-t border-pastel-pink/60 text-xs text-brand-chocolate/70">
            <Link to="/login" className="text-brand-burgundy font-bold hover:underline">Sign in</Link> to share a review for this piece.
          </div>
        )}
      </div>

    </div>
  );
}
