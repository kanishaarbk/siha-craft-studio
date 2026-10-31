import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, subtotal, cartCount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await api.post('/orders/validate-coupon/', {
        code: couponCode.trim(),
        amount: subtotal,
      });
      setAppliedCoupon(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon code.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-pastel-pink/50 text-brand-burgundy flex items-center justify-center mx-auto border border-pastel-pink">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-brand-burgundy">Your Handmade Basket is Empty</h2>
        <p className="text-sm text-brand-chocolate/75 max-w-md mx-auto">
          Explore our lovingly crafted plushies, floral bouquets, bags, and supplies to begin filling your basket.
        </p>
        <Link to="/shop" className="btn-primary text-sm gap-2">
          <span>Explore Boutique Creations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Slow Craft Checkout</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy mt-1">
          Your Handmade Basket ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Cart Items List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="card-pastel p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-white/90"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.product?.primary_image_url || '/images/siha-logo.png'}
                  alt={item.product?.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-pastel-peach/30 border border-pastel-pink shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-heading text-base font-bold text-brand-burgundy">
                    <Link to={`/product/${item.product?.slug || item.product?.id}`}>
                      {item.product?.name}
                    </Link>
                  </h3>
                  {item.variant && (
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-pastel-peach/60 text-[11px] font-medium text-brand-chocolate">
                      {item.variant.color} / {item.variant.size}
                    </span>
                  )}
                  <p className="text-xs text-brand-chocolate/70">
                    ₹{item.unit_price} each
                  </p>
                </div>
              </div>

              {/* Counter & Subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-pastel-pink/50">
                {/* Quantity Controls */}
                <div className="flex items-center border border-pastel-pink rounded-xl bg-white p-0.5">
                  <button
                    onClick={() => updateCartItem(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-brand-burgundy hover:bg-pastel-pink/40 font-bold text-xs rounded-lg"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-brand-burgundy">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-brand-burgundy hover:bg-pastel-pink/40 font-bold text-xs rounded-lg"
                  >
                    +
                  </button>
                </div>

                <span className="font-heading text-base font-bold text-brand-burgundy min-w-[70px] text-right">
                  ₹{parseFloat(item.total_price).toFixed(2)}
                </span>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-brand-chocolate/40 hover:text-rose-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Card (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-pastel p-6 sm:p-8 space-y-6 bg-white/95">
            <h3 className="font-heading text-xl font-bold text-brand-burgundy pb-4 border-b border-pastel-pink/60">
              Basket Summary
            </h3>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-brand-burgundy uppercase tracking-wider block">
                Have a Promo Coupon?
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-brand-burgundy/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="input-pastel text-xs pl-9 py-2 uppercase font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="btn-secondary text-xs px-4 py-2 shrink-0"
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-xs font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-pastel-pink/60 text-sm">
              <div className="flex justify-between text-brand-chocolate/80">
                <span>Stitched Subtotal</span>
                <span className="font-semibold text-brand-chocolate">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-brand-chocolate/80">
                <span>Domestic Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-emerald-700 uppercase text-xs">Complimentary</strong>
                  ) : (
                    `₹${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-4 border-t border-pastel-pink/70 flex justify-between items-baseline">
                <span className="font-heading text-lg font-bold text-brand-burgundy">Estimated Total</span>
                <span className="font-heading text-2xl font-bold text-brand-burgundy">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Free shipping notice */}
            {subtotal < 999 && (
              <p className="text-[11px] text-brand-burgundy bg-pastel-pink/40 p-2.5 rounded-xl text-center font-medium">
                Add ₹{(999 - subtotal).toFixed(2)} more to unlock complimentary shipping!
              </p>
            )}

            {/* Checkout Button */}
            <Link
              to={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon.code}` : ''}`}
              className="btn-primary w-full py-3.5 text-sm gap-2"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-chocolate/60">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-burgundy" /> 100% Verified Razorpay Payment Gateway
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
