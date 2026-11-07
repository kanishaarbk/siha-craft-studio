import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { cart, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const couponCodeParam = searchParams.get('coupon') || '';

  const [formData, setFormData] = useState({
    full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user ? user.email : '',
    phone_number: user?.phone_number || '',
    address_line1: '',
    address_line2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '',
    country: 'India',
    customer_notes: '',
    coupon_code: couponCodeParam,
    terms_accepted: true,
  });

  const [loading, setLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (couponCodeParam && subtotal > 0) {
      api.post('/orders/validate-coupon/', { code: couponCodeParam, amount: subtotal })
        .then((res) => {
          setDiscountAmount(parseFloat(res.data.discount_amount || 0));
        })
        .catch(() => setDiscountAmount(0));
    }
  }, [couponCodeParam, subtotal]);

  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const finalPayable = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProcessOrder = async (e) => {
    e.preventDefault();

    if (!formData.terms_accepted) {
      toast.error('Please accept the Terms & Conditions and Policies to proceed.');
      return;
    }

    if (!cart || cart.items?.length === 0) {
      toast.error('Your cart is empty.');
      navigate('/shop');
      return;
    }

    setLoading(true);

    try {
      // 1. Submit checkout request to backend to validate stock, calculate backend prices, and create pending Order
      const sessionKey = localStorage.getItem('siha_session_key');
      const checkoutRes = await api.post('/orders/checkout/', {
        ...formData,
        session_key: sessionKey,
      });

      const order = checkoutRes.data.order;

      // 2. Create Razorpay order on server
      const razorpayOrderRes = await api.post('/payments/razorpay/create-order/', {
        order_id: order.id,
      });

      const {
        razorpay_order_id,
        amount,
        currency,
        key_id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        business_name,
      } = razorpayOrderRes.data;

      // 3. Configure and trigger Razorpay Checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: business_name,
        description: `Order #${order_number} - SiHA Craft Studio`,
        image: '/images/siha-logo.png',
        order_id: razorpay_order_id,
        handler: async function (response) {
          // 4. Verify signature on backend
          try {
            await api.post('/payments/razorpay/verify/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_number: order_number,
            });

            clearCart();
            toast.success('Payment verified! Your order is placed.');
            navigate(`/order-confirmation/${order_number}`);
          } catch (verifyErr) {
            toast.error('Payment signature verification failed. Please contact support.');
          }
        },
        prefill: {
          name: customer_name,
          email: customer_email,
          contact: customer_phone,
        },
        theme: {
          color: '#71313D', // Brand burgundy
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment was cancelled or dismissed. You can retry anytime.');
            setLoading(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback for development if Razorpay script offline
        toast.info('Simulating local payment verification in development test mode...');
        await api.post('/payments/razorpay/verify/', {
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          order_number: order_number,
        });
        clearCart();
        navigate(`/order-confirmation/${order_number}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Could not create order. Please check item availability.';
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Secure Checkout</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy mt-1">
          Delivery & Payment Details
        </h1>
      </div>

      <form onSubmit={handleProcessOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Delivery Form (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contact Information */}
          <div className="card-pastel p-6 sm:p-8 space-y-4 bg-white/95">
            <h3 className="font-heading text-lg font-bold text-brand-burgundy">1. Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Aaradhya Sharma"
                  className="input-pastel text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="input-pastel text-xs"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Mobile Phone (For Courier Updates) *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="+91 6379 557 761"
                className="input-pastel text-xs"
                required
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card-pastel p-6 sm:p-8 space-y-4 bg-white/95">
            <h3 className="font-heading text-lg font-bold text-brand-burgundy">2. Domestic Delivery Address</h3>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Street Address / House / Flat *</label>
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleInputChange}
                placeholder="Flat 302, Rosewood Heights, 12th Main"
                className="input-pastel text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Apartment, Suite, Landmark (Optional)</label>
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleInputChange}
                placeholder="Near Botanical Garden Gate 2"
                className="input-pastel text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-pastel text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input-pastel text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Postal Code *</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  placeholder="560001"
                  className="input-pastel text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Notes */}
          <div className="card-pastel p-6 sm:p-8 space-y-4 bg-white/95">
            <h3 className="font-heading text-lg font-bold text-brand-burgundy">3. Special Delivery Instructions</h3>
            <textarea
              name="customer_notes"
              value={formData.customer_notes}
              onChange={handleInputChange}
              rows={2}
              placeholder="e.g. Please leave with security if unavailable, or gift wrap note..."
              className="input-pastel text-xs"
            />
          </div>

          {/* Legal Acknowledgments */}
          <div className="p-4 rounded-2xl bg-pastel-cream/70 border border-pastel-pink/70 space-y-2">
            <label className="flex items-start gap-2.5 text-xs text-brand-chocolate cursor-pointer">
              <input
                type="checkbox"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleInputChange}
                className="mt-0.5 rounded border-pastel-pink text-brand-burgundy focus:ring-brand-burgundy"
                required
              />
              <span>
                I agree to the{' '}
                <Link to="/terms-and-conditions" target="_blank" className="text-brand-burgundy underline font-medium">Terms and Conditions</Link>,{' '}
                <Link to="/privacy-policy" target="_blank" className="text-brand-burgundy underline font-medium">Privacy Policy</Link>, and{' '}
                <Link to="/refund-policy" target="_blank" className="text-brand-burgundy underline font-medium">Cancellation & Refund Policy</Link>.
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-pastel p-6 sm:p-8 space-y-6 bg-white/95 sticky top-28">
            <h3 className="font-heading text-xl font-bold text-brand-burgundy pb-4 border-b border-pastel-pink/60">
              Order Review
            </h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart?.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={item.product?.primary_image_url || '/images/siha-logo.png'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-pastel-peach/40 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-brand-chocolate truncate">{item.product?.name}</p>
                      <span className="text-[10px] text-brand-chocolate/60">
                        Qty: {item.quantity} {item.variant ? `(${item.variant.color})` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-brand-burgundy shrink-0">
                    ₹{parseFloat(item.total_price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-pastel-pink/60 text-xs">
              <div className="flex justify-between text-brand-chocolate/80">
                <span>Items Subtotal</span>
                <span className="font-semibold text-brand-chocolate">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-chocolate/80">
                <span>Domestic Courier Fee</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee.toFixed(2)}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon ({couponCodeParam})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-pastel-pink/70 flex justify-between items-baseline text-sm">
                <span className="font-heading font-bold text-brand-burgundy">Total Payable</span>
                <span className="font-heading text-2xl font-bold text-brand-burgundy">
                  ₹{finalPayable.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Initiating Gateway...' : `Pay ₹${finalPayable.toFixed(2)} via Razorpay`}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-brand-chocolate/60">
              <ShieldCheck className="w-4 h-4 text-brand-burgundy" />
              <span>256-Bit SSL Encrypted Razorpay Checkout</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
