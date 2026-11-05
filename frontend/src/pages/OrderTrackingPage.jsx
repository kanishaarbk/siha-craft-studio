import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, Clock, ExternalLink, AlertCircle, ArrowRight, ShieldCheck, Mail, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const trackingSteps = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Order received in atelier' },
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Payment verified & queued' },
  { key: 'PROCESSING', label: 'Processing', desc: 'Artisan crafting & packing' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Handed over to courier' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'With local delivery agent' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Delivered with love' },
];

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get('order') || '');
  const [emailInput, setEmailInput] = useState(searchParams.get('email') || user?.email || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async (orderNum, email) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const emailQuery = email ? `?email=${encodeURIComponent(email.trim().toLowerCase())}` : '';
      const res = await api.get(`/orders/tracking/${encodeURIComponent(orderNum.trim())}/${emailQuery}`);
      setTrackingData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Order reference could not be verified. Please double-check your Order ID and registered email.'
      );
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const orderParam = searchParams.get('order');
    const emailParam = searchParams.get('email') || user?.email || '';
    if (orderParam) {
      setOrderNumberInput(orderParam);
      if (emailParam) setEmailInput(emailParam);
      fetchTracking(orderParam, emailParam);
    }
  }, [searchParams, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setSearchParams({
        order: orderNumberInput.trim().toUpperCase(),
        ...(emailInput ? { email: emailInput.trim() } : {})
      });
      fetchTracking(orderNumberInput.trim().toUpperCase(), emailInput.trim());
    }
  };

  const mapStatusToStepIndex = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 0; // Order Placed
      case 'CONFIRMED':
        return 1; // Order Confirmed
      case 'PROCESSING':
      case 'READY_TO_SHIP':
        return 2; // Processing
      case 'SHIPPED':
        return 3; // Shipped
      case 'OUT_FOR_DELIVERY':
        return 4; // Out for Delivery
      case 'DELIVERED':
        return 5; // Delivered
      case 'CANCELLED':
        return -1;
      default:
        return 1;
    }
  };

  const currentStepIdx = trackingData ? mapStatusToStepIndex(trackingData.fulfillment_status) : 0;
  const isCancelled = trackingData?.fulfillment_status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy text-xs font-bold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5" /> Order Dispatch & Status
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy">
          Track Your Order
        </h1>
        <p className="text-sm text-brand-chocolate/75">
          Enter your Order ID along with your registered email to view real-time courier tracking and dispatch updates.
        </p>
      </div>

      {/* Secure Search Form */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto card-pastel p-6 bg-white/95 shadow-pastel space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1">
              Order ID / Number *
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-brand-burgundy/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
                placeholder="e.g. SIHA-20261105-ABCD"
                className="input-pastel text-xs pl-10 py-3 uppercase font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1">
              Registered Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-burgundy/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="customer@example.com"
                className="input-pastel text-xs pl-10 py-3 font-medium"
                required
              />
            </div>
            <span className="text-[11px] text-brand-chocolate/60 block mt-1">
              Required for security verification of your order details.
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-xs py-3 justify-center shadow-pastel"
        >
          {loading ? 'Verifying & Fetching Status...' : 'Track My Order'}
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 max-w-lg mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Details Card */}
      {trackingData && (
        <div className="card-pastel p-6 sm:p-10 space-y-10 bg-white/95 rounded-3xl border border-pastel-pink shadow-pastel">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-pastel-pink/60 gap-4">
            <div>
              <span className="text-xs text-brand-chocolate/60 uppercase tracking-wider font-semibold">
                Order Tracking Summary
              </span>
              <h2 className="font-heading text-2xl font-bold text-brand-burgundy">
                #{trackingData.order_number}
              </h2>
              <span className="text-xs text-brand-chocolate/70 block mt-0.5">
                Recipient: <strong>{trackingData.shipping_name}</strong> • Placed on {new Date(trackingData.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-brand-chocolate/60 block">Status</span>
              {isCancelled ? (
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 mt-1">
                  Cancelled
                </span>
              ) : (
                <span className="inline-block text-xs font-bold px-3.5 py-1 rounded-full bg-pastel-pink text-brand-burgundy border border-pastel-pink mt-1">
                  {trackingData.fulfillment_status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>

          {/* 6-Step Progress Timeline */}
          {!isCancelled && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-brand-burgundy">
                  Order Progress Timeline
                </h3>
                <span className="text-[11px] text-brand-chocolate/70">
                  Step {Math.min(currentStepIdx + 1, 6)} of 6
                </span>
              </div>

              {/* Responsive Progress Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {trackingSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center space-y-2 ${
                        isCurrent
                          ? 'bg-pastel-pink/50 border-brand-burgundy shadow-sm ring-2 ring-pastel-pink'
                          : isCompleted
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-pastel-cream/40 border-pastel-pink/40 text-brand-chocolate/40 opacity-70'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-brand-burgundy text-white'
                            : 'bg-white border text-brand-chocolate/50'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block leading-tight text-brand-burgundy">
                          {step.label}
                        </span>
                        <span className="text-[10px] text-brand-chocolate/70 block leading-tight">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Courier & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-pastel-cream/60 border border-pastel-pink/70 text-xs">
            <div>
              <span className="text-brand-chocolate/60 block mb-0.5 font-medium">Courier Partner</span>
              <strong className="text-brand-burgundy text-sm block">
                {trackingData.courier_name}
              </strong>
            </div>

            <div>
              <span className="text-brand-chocolate/60 block mb-0.5 font-medium">Tracking / AWB Number</span>
              <strong className="font-mono text-brand-burgundy text-sm block">
                {trackingData.tracking_number || 'Pending Assignment'}
              </strong>
            </div>

            <div>
              <span className="text-brand-chocolate/60 block mb-0.5 font-medium">Estimated Delivery</span>
              <strong className="text-brand-burgundy text-sm block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-burgundy" />
                {trackingData.estimated_delivery_date
                  ? new Date(trackingData.estimated_delivery_date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '3–5 Business Days'}
              </strong>
            </div>

            <div>
              <span className="text-brand-chocolate/60 block mb-0.5 font-medium">Destination</span>
              <strong className="text-brand-burgundy text-sm block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-burgundy" />
                {trackingData.destination_city || 'India'}
                {trackingData.destination_state ? `, ${trackingData.destination_state}` : ''}
              </strong>
            </div>
          </div>

          {/* Official Courier Tracking Link Button */}
          {trackingData.tracking_url && (
            <div className="p-4 rounded-2xl bg-brand-burgundy/5 border border-brand-burgundy/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-brand-chocolate text-center sm:text-left">
                <strong>Live Courier Dispatch:</strong> Track live coordinates directly on {trackingData.courier_name}'s official portal.
              </div>
              <a
                href={trackingData.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs px-4 py-2 shrink-0 gap-1.5"
              >
                <span>Track on {trackingData.courier_name} Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Items Summary */}
          {trackingData.items && trackingData.items.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-pastel-pink/60">
              <h4 className="font-heading text-sm font-bold text-brand-burgundy">
                Items in this Shipment ({trackingData.items_count})
              </h4>
              <div className="divide-y divide-pastel-pink/40 text-xs">
                {trackingData.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-brand-burgundy">{item.product_name}</strong>
                      {item.variant_name && (
                        <span className="text-brand-chocolate/60 block text-[11px]">Variant: {item.variant_name}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-brand-chocolate/70">Qty: {item.quantity}</span>
                      <span className="font-bold text-brand-burgundy ml-3">₹{item.total_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Audit & Dispatch History */}
          {trackingData.status_history && trackingData.status_history.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-pastel-pink/60">
              <h4 className="font-heading text-sm font-bold text-brand-burgundy flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Activity & Shipment Log
              </h4>
              <div className="space-y-2.5">
                {trackingData.status_history.map((h, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-pastel-cream/40 border border-pastel-pink/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div>
                      <strong className="text-brand-burgundy">{h.status.replace(/_/g, ' ')}</strong>
                      <p className="text-brand-chocolate/80 text-[11px] mt-0.5">{h.notes}</p>
                    </div>
                    <span className="text-[10px] text-brand-chocolate/50 whitespace-nowrap">
                      {new Date(h.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Support Box */}
      <div className="p-6 rounded-3xl bg-pastel-cream border border-pastel-pink/80 text-center text-xs text-brand-chocolate/80 space-y-2">
        <p>
          Need assistance or custom dispatch modifications? Our artisan concierge is here for you.
        </p>
        <div className="flex items-center justify-center gap-4 font-semibold text-brand-burgundy">
          <Link to="/contact" className="hover:underline">Contact Atelier Support</Link>
          <span>•</span>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp Concierge</a>
        </div>
      </div>

    </div>
  );
}