import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, Clock, ExternalLink, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

const statusSteps = [
  { key: 'PENDING_PAYMENT', label: 'Payment Pending' },
  { key: 'CONFIRMED', label: 'Order Confirmed' },
  { key: 'PROCESSING', label: 'Artisan Stitching' },
  { key: 'READY_TO_SHIP', label: 'Ready to Dispatch' },
  { key: 'SHIPPED', label: 'Handed to Courier' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered with Love' },
];

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get('order') || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async (orderNum) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/tracking/${orderNum.trim()}/`);
      setTrackingData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Order reference not found. Please verify your order number.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setOrderNumberInput(orderParam);
      fetchTracking(orderParam);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setSearchParams({ order: orderNumberInput.trim() });
      fetchTracking(orderNumberInput.trim());
    }
  };

  const getStepIndex = (currentStatus) => {
    const idx = statusSteps.findIndex((s) => s.key === currentStatus);
    return idx >= 0 ? idx : 1; // Default to Confirmed if matched
  };

  const currentStepIdx = trackingData ? getStepIndex(trackingData.fulfillment_status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Real-Time Dispatch Updates</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-burgundy">
          Track Your Handmade Order
        </h1>
        <p className="text-sm text-brand-chocolate/75">
          Enter your order reference code (e.g. SIHA-20261026-XXXX) to view current handcrafting progress and courier tracking links.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Package className="w-4 h-4 text-brand-burgundy/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
            placeholder="e.g. SIHA-20261026-ABCD"
            className="input-pastel text-xs pl-10 py-3 uppercase font-medium"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary text-xs px-6 py-3 shrink-0">
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Details View */}
      {trackingData && (
        <div className="card-pastel p-6 sm:p-10 space-y-10 bg-white/95">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-pastel-pink/60 gap-4">
            <div>
              <span className="text-xs text-brand-chocolate/60">Tracking Order</span>
              <h2 className="font-heading text-2xl font-bold text-brand-burgundy">
                #{trackingData.order_number}
              </h2>
              <span className="text-xs text-brand-chocolate/70">
                Ordered on {new Date(trackingData.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-brand-chocolate/60 block">Current Status</span>
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy border border-pastel-pink mt-1">
                {trackingData.fulfillment_status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Interactive Progress Timeline */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-bold text-brand-burgundy">Fulfillment Timeline</h3>
            <div className="relative">
              
              {/* Desktop Horizontal Bar */}
              <div className="hidden sm:grid grid-cols-7 gap-2 items-start relative">
                {statusSteps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                          isDone
                            ? 'bg-brand-burgundy text-white'
                            : 'bg-white border-2 border-pastel-pink text-brand-chocolate/40'
                        } ${isCurrent ? 'ring-4 ring-pastel-pink animate-pulse' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] leading-tight ${isDone ? 'font-semibold text-brand-burgundy' : 'text-brand-chocolate/50'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical List */}
              <div className="sm:hidden space-y-4">
                {statusSteps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDone ? 'bg-brand-burgundy text-white' : 'bg-pastel-pink/40 text-brand-chocolate/40'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className={`text-xs ${isDone ? 'font-bold text-brand-burgundy' : 'text-brand-chocolate/60'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Courier & Shipping Link Box */}
          <div className="p-6 rounded-2xl bg-pastel-cream/70 border border-pastel-pink/70 space-y-4">
            <h3 className="font-heading text-base font-bold text-brand-burgundy">Courier & Transit Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brand-chocolate">
              <div>
                <span className="text-brand-chocolate/60 block">Assigned Courier</span>
                <strong className="text-sm text-brand-burgundy mt-0.5 block">{trackingData.courier_name}</strong>
              </div>
              <div>
                <span className="text-brand-chocolate/60 block">Tracking Number / AWB</span>
                <strong className="text-sm font-mono text-brand-burgundy mt-0.5 block">
                  {trackingData.tracking_number || 'Awaiting Dispatch AWB'}
                </strong>
              </div>
              <div>
                <span className="text-brand-chocolate/60 block">Estimated Delivery</span>
                <strong className="text-sm text-brand-burgundy mt-0.5 block">
                  {trackingData.estimated_delivery_date
                    ? new Date(trackingData.estimated_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '2-4 business days post dispatch'}
                </strong>
              </div>
            </div>

            {/* Clickable External Tracking Link */}
            {trackingData.tracking_url ? (
              <div className="pt-2">
                <a
                  href={trackingData.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs gap-2 inline-flex"
                >
                  <span>Open Official Courier Tracking Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <p className="text-[11px] text-brand-chocolate/60 italic pt-1">
                A live tracking URL will appear here as soon as our shipping artisan hands the parcel to the domestic courier.
              </p>
            )}
          </div>

          {/* Timestamped Status History Audit Trail */}
          {trackingData.status_history && trackingData.status_history.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-pastel-pink/60">
              <h4 className="font-heading text-sm font-bold text-brand-burgundy">Activity Log</h4>
              <div className="space-y-2 text-xs">
                {trackingData.status_history.map((h, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-white border border-pastel-pink/50">
                    <div>
                      <p className="font-semibold text-brand-chocolate">{h.status.replace(/_/g, ' ')}</p>
                      {h.notes && <p className="text-brand-chocolate/70 text-[11px] mt-0.5">{h.notes}</p>}
                    </div>
                    <span className="text-[10px] text-brand-chocolate/50 shrink-0">
                      {new Date(h.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
