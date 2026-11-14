import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle2, Clock, ExternalLink, 
  AlertCircle, ShieldCheck, Mail, MapPin, Calendar, CreditCard, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from '../config/whatsapp';

const trackingSteps = [
  { key: 'Order Placed', label: 'Order Placed', desc: 'Received in atelier' },
  { key: 'Payment Confirmed', label: 'Payment Confirmed', desc: 'Authorized & queued' },
  { key: 'Processing', label: 'Processing', desc: 'Artisan crafting & packing' },
  { key: 'Shipped', label: 'Shipped', desc: 'Dispatched with courier' },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'With local courier' },
  { key: 'Delivered', label: 'Delivered', desc: 'Delivered with love' },
];

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get('order') || '');
  const [emailInput, setEmailInput] = useState(searchParams.get('email') || user?.email || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async (orderRef, verification) => {
    const cleanRef = (orderRef || '').trim();
    if (!cleanRef) return;

    setLoading(true);
    setError(null);
    try {
      const params = { order: cleanRef };
      if (verification && verification.trim()) {
        params.email = verification.trim().toLowerCase();
      }
      const res = await api.get('/orders/tracking/', { params });
      setTrackingData(res.data);
    } catch (err) {
      const msg = err.response?.data?.error ||
        'Order reference could not be verified. Please double-check your Order ID and registered email or phone.';
      setError(msg);
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
      const cleanOrder = orderNumberInput.trim().toUpperCase();
      const cleanEmail = emailInput.trim();
      setSearchParams({
        order: cleanOrder,
        ...(cleanEmail ? { email: cleanEmail } : {})
      });
      fetchTracking(cleanOrder, cleanEmail);
    }
  };

  const mapStatusToStepIndex = (statusLabel) => {
    switch (statusLabel) {
      case 'Order Placed':
        return 0;
      case 'Payment Confirmed':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const currentStepIdx = trackingData ? mapStatusToStepIndex(trackingData.order_status) : 0;
  const isCancelled = trackingData?.order_status === 'Cancelled' || trackingData?.fulfillment_status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3DCE3] text-[#566B50] text-xs font-bold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5 text-[#D98FA5]" /> Dispatch & Tracking
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#566B50]">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-[#45483F]/75 leading-relaxed">
          Enter your Order ID (or Courier AWB Tracking Number) along with your registered email or phone to view live status updates.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto p-6 rounded-3xl bg-white border border-[#84977B]/20 shadow-sm space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#566B50] uppercase tracking-wider block mb-1">
              Order ID / Tracking Number *
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-[#84977B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
                placeholder="e.g. SIHA-20261105-ABCD or AWB"
                className="input-pastel text-xs pl-10 py-3 uppercase font-medium border-[#84977B]/30 focus:border-[#566B50]"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#566B50] uppercase tracking-wider">
                Registered Email or Phone {isAuthenticated ? '(Auto-verified)' : '*'}
              </label>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#84977B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="customer@example.com or phone number"
                className="input-pastel text-xs pl-10 py-3 font-medium border-[#84977B]/30 focus:border-[#566B50]"
                required={!isAuthenticated}
              />
            </div>
            <span className="text-[11px] text-[#45483F]/60 block mt-1">
              Used for secure customer verification of your delivery information.
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#566B50] hover:bg-[#41523D] text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>Verifying & Fetching Status...</span>
            </>
          ) : (
            <>
              <Truck className="w-4 h-4" />
              <span>Track My Order</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 max-w-lg mx-auto shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Details Display */}
      {trackingData && (
        <div className="p-6 sm:p-8 space-y-8 bg-white rounded-3xl border border-[#84977B]/20 shadow-sm">
          
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#84977B]/15 gap-4">
            <div>
              <span className="text-[11px] text-[#84977B] uppercase tracking-wider font-bold">
                Order Tracking Summary
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#566B50] mt-0.5">
                #{trackingData.order_number}
              </h2>
              <span className="text-xs text-[#45483F]/75 block mt-1">
                Recipient: <strong>{trackingData.shipping_name}</strong> • Placed on {new Date(trackingData.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-[#45483F]/60 block">Order Status</span>
              {isCancelled ? (
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 mt-1">
                  Cancelled
                </span>
              ) : (
                <span className="inline-block text-xs font-bold px-3.5 py-1 rounded-full bg-[#E9EFE7] text-[#566B50] border border-[#84977B]/30 mt-1">
                  {trackingData.order_status}
                </span>
              )}
            </div>
          </div>

          {/* Progress Timeline */}
          {!isCancelled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-[#566B50]">
                  Fulfillment Milestones
                </h3>
                <span className="text-[11px] text-[#45483F]/70">
                  Step {Math.min(currentStepIdx + 1, 6)} of 6
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                {trackingSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center space-y-1.5 ${
                        isCurrent
                          ? 'bg-[#E9EFE7] border-[#566B50] shadow-sm ring-1 ring-[#566B50]'
                          : isCompleted
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-[#FFFDF7] border-[#84977B]/15 text-[#45483F]/40 opacity-70'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-[#566B50] text-white'
                            : 'bg-white border text-[#45483F]/50'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block leading-tight text-[#566B50]">
                          {step.label}
                        </span>
                        <span className="text-[10px] text-[#45483F]/70 block leading-tight">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Shipping & Payment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FFFDF7] border border-[#84977B]/20 text-xs">
            <div>
              <span className="text-[#45483F]/60 block mb-0.5 font-medium">Payment Status</span>
              <strong className="text-[#566B50] text-sm block flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#84977B]" />
                {trackingData.payment_status}
              </strong>
            </div>

            <div>
              <span className="text-[#45483F]/60 block mb-0.5 font-medium">Shipping Status</span>
              <strong className="text-[#566B50] text-sm block">
                {trackingData.shipping_status}
              </strong>
            </div>

            <div>
              <span className="text-[#45483F]/60 block mb-0.5 font-medium">Courier Partner</span>
              <strong className="text-[#566B50] text-sm block">
                {trackingData.courier_name}
              </strong>
            </div>

            <div>
              <span className="text-[#45483F]/60 block mb-0.5 font-medium">Tracking Number (AWB)</span>
              <strong className="font-mono text-[#566B50] text-sm block">
                {trackingData.tracking_number || 'Pending Assignment'}
              </strong>
            </div>

            <div>
              <span className="text-[#45483F]/60 block mb-0.5 font-medium">Estimated Delivery</span>
              <strong className="text-[#566B50] text-sm block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#84977B]" />
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
              <span className="text-[#45483F]/60 block mb-0.5 font-medium">Destination</span>
              <strong className="text-[#566B50] text-sm block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#84977B]" />
                {trackingData.destination_city || 'India'}
                {trackingData.destination_state ? `, ${trackingData.destination_state}` : ''}
              </strong>
            </div>

            <div>
              <span className="text-[#45483F]/60 block mb-0.5 font-medium">Total Paid</span>
              <strong className="text-[#566B50] text-sm block">
                ₹{trackingData.total_amount?.toFixed(2)}
              </strong>
            </div>

            <div>
              <span className="text-[#45483F]/60 block mb-0.5 font-medium">Atelier Origin</span>
              <strong className="text-[#566B50] text-sm block">
                Namakkal, Tamil Nadu
              </strong>
            </div>
          </div>

          {/* Official Courier Tracking Link Button */}
          {trackingData.tracking_url && (
            <div className="p-4 rounded-2xl bg-[#E9EFE7]/50 border border-[#84977B]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#45483F] text-center sm:text-left">
                <strong>Live Courier Dispatch:</strong> Track live coordinates directly on {trackingData.courier_name}'s official portal.
              </div>
              <a
                href={trackingData.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#566B50] hover:bg-[#41523D] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Track on {trackingData.courier_name} Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Items Summary */}
          {trackingData.items && trackingData.items.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#84977B]/15">
              <h4 className="font-heading text-sm font-bold text-[#566B50]">
                Items in this Order ({trackingData.items.length})
              </h4>
              <div className="divide-y divide-[#84977B]/10 text-xs">
                {trackingData.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-[#566B50]">{item.product_name}</strong>
                      {item.variant_name && (
                        <span className="text-[#45483F]/60 block text-[11px]">Variant: {item.variant_name}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[#45483F]/70">Qty: {item.quantity}</span>
                      <span className="font-bold text-[#566B50] ml-3">₹{item.total_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          {trackingData.status_history && trackingData.status_history.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#84977B]/15">
              <h4 className="font-heading text-sm font-bold text-[#566B50] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#84977B]" /> Shipment Activity Log
              </h4>
              <div className="space-y-2">
                {trackingData.status_history.map((h, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FFFDF7] border border-[#84977B]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div>
                      <strong className="text-[#566B50]">{h.status}</strong>
                      <p className="text-[#45483F]/80 text-[11px] mt-0.5">{h.notes}</p>
                    </div>
                    <span className="text-[10px] text-[#45483F]/50 whitespace-nowrap">
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
      <div className="p-6 rounded-3xl bg-[#FFFDF7] border border-[#84977B]/20 text-center text-xs text-[#45483F]/80 space-y-2">
        <p>
          Need assistance or custom dispatch modifications? Our studio concierge in Namakkal is here for you.
        </p>
        <div className="flex items-center justify-center gap-4 font-semibold text-[#566B50]">
          <Link to="/contact" className="hover:underline">Contact Atelier Support</Link>
          <span>•</span>
          <a
            href={getWhatsAppUrl(`Hello SiHA Craft Studio! I need assistance tracking my parcel${trackingData ? ` (Order #${trackingData.order_number})` : ''}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-emerald-700 font-semibold"
          >
            WhatsApp Concierge ({WHATSAPP_DISPLAY})
          </a>
        </div>
      </div>

    </div>
  );
}
