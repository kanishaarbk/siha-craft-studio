import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Package, DollarSign, AlertTriangle, Video, Sparkles,
  ShoppingBag, Truck, Plus, CheckCircle2, RefreshCw, ExternalLink,
  ChevronRight, Users, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, inventory, customizations, classes, coupons
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fulfillment update modal / inline form state
  const [editingOrder, setEditingOrder] = useState(null);
  const [fulfillmentForm, setFulfillmentForm] = useState({
    fulfillment_status: 'CONFIRMED',
    courier_name: 'Blue Dart',
    tracking_number: '',
    tracking_url: '',
    estimated_delivery_date: '',
    status_notes: '',
  });

  // Stock Adjustment state
  const [stockAdjustment, setStockAdjustment] = useState({
    product_id: '',
    quantity_delta: 5,
    reason: 'Restocking fresh batch from artisan',
  });

  // Quotation state
  const [quotingRequest, setQuotingRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    quote_amount: '',
    estimated_production_days: 7,
    quote_details: '',
  });

  // New Class Session state
  const [addingSessionToClass, setAddingSessionToClass] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    start_time: '',
    end_time: '',
    max_participants: 12,
    google_meet_link: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Staff or Administrator access required.');
      navigate('/login?redirect=/admin/dashboard');
      return;
    }

    const loadAllAdminData = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes, invRes, custRes, classesRes, couponsRes] = await Promise.all([
          api.get('/admin/dashboard/'),
          api.get('/orders/admin/orders/'),
          api.get('/admin/inventory/'),
          api.get('/customizations/admin/requests/'),
          api.get('/classes/admin/classes/'),
          api.get('/admin/coupons/'),
        ]);

        setStats(statsRes.data);
        setOrders(ordersRes.data || []);
        setInventory(invRes.data || []);
        setCustomRequests(custRes.data || []);
        setClasses(classesRes.data || []);
        setCoupons(couponsRes.data || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllAdminData();
  }, [isAdmin, navigate]);

  // Handle Order Fulfillment Save (Courier + Tracking Link Upload)
  const handleSaveFulfillment = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const res = await api.put(`/orders/admin/orders/${editingOrder.id}/fulfillment/`, fulfillmentForm);
      toast.success(res.data.message);
      setOrders(orders.map((o) => (o.id === editingOrder.id ? res.data.order : o)));
      setEditingOrder(null);
    } catch (err) {
      toast.error('Failed to update courier shipment details.');
    }
  };

  // Handle Stock Adjustment
  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/inventory/adjust/', stockAdjustment);
      toast.success(res.data.message);
      // Reload inventory
      const invRes = await api.get('/admin/inventory/');
      setInventory(invRes.data);
      const statsRes = await api.get('/admin/dashboard/');
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Could not adjust inventory.');
    }
  };

  // Handle Send Quote
  const handleSendQuote = async (e) => {
    e.preventDefault();
    if (!quotingRequest) return;

    try {
      const res = await api.post(`/customizations/admin/requests/${quotingRequest.id}/quote/`, quoteForm);
      toast.success(res.data.message);
      // Refresh requests
      const custRes = await api.get('/customizations/admin/requests/');
      setCustomRequests(custRes.data);
      setQuotingRequest(null);
    } catch (err) {
      toast.error('Could not issue quotation.');
    }
  };

  // Handle Add Session
  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!addingSessionToClass) return;

    try {
      await api.post(`/classes/admin/classes/${addingSessionToClass.id}/sessions/`, sessionForm);
      toast.success('New class session & Google Meet link saved!');
      const classesRes = await api.get('/classes/admin/classes/');
      setClasses(classesRes.data);
      setAddingSessionToClass(null);
    } catch (err) {
      toast.error('Could not save class session.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-brand-burgundy text-white shadow-pastel-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-pastel-pink border border-white/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-pastel-pink">
              SiHA Atelier Staff Portal
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">
              Artisan Management Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="btn-secondary text-xs px-4 py-2">
            View Live Boutique
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-pastel-pink/60">
        {[
          { key: 'overview', label: 'Store Overview', icon: Shield },
          { key: 'orders', label: `Orders (${orders.length})`, icon: Package },
          { key: 'inventory', label: `Inventory & Stock`, icon: AlertTriangle },
          { key: 'customizations', label: `Custom Requests (${customRequests.length})`, icon: Sparkles },
          { key: 'classes', label: `Class Schedules`, icon: Video },
          { key: 'coupons', label: `Coupons (${coupons.length})`, icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-burgundy text-white shadow-sm'
                  : 'bg-white/80 border border-pastel-pink/70 text-brand-chocolate hover:bg-pastel-peach/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB: Real Metrics */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="card-pastel p-6 bg-white/95 space-y-1">
              <span className="text-xs text-brand-chocolate/70">Verified Revenue</span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-emerald-800">
                ₹{stats.verified_revenue.toFixed(2)}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">Razorpay Paid Orders</span>
            </div>

            <div className="card-pastel p-6 bg-white/95 space-y-1">
              <span className="text-xs text-brand-chocolate/70">Total Orders</span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-brand-burgundy">
                {stats.total_orders}
              </p>
              <span className="text-[10px] text-brand-chocolate/60">{stats.pending_orders} awaiting fulfillment</span>
            </div>

            <div className="card-pastel p-6 bg-white/95 space-y-1">
              <span className="text-xs text-brand-chocolate/70">Low Stock Warnings</span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-amber-700">
                {stats.low_stock_products}
              </p>
              <span className="text-[10px] text-amber-700 font-medium">Restock needed</span>
            </div>

            <div className="card-pastel p-6 bg-white/95 space-y-1">
              <span className="text-xs text-brand-chocolate/70">Pending Custom Quotes</span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-purple-700">
                {stats.pending_customizations}
              </p>
              <span className="text-[10px] text-purple-700 font-medium">Customer requests</span>
            </div>
          </div>

          {/* Recent Orders & Activity Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="card-pastel p-6 bg-white/95 space-y-4">
              <h3 className="font-heading text-base font-bold text-brand-burgundy flex items-center justify-between">
                <span>Recent Customer Orders</span>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-brand-burgundy hover:underline">
                  View All
                </button>
              </h3>
              <div className="space-y-2.5">
                {stats.recent_orders?.map((ord) => (
                  <div key={ord.id} className="p-3 rounded-xl bg-pastel-cream/50 border border-pastel-pink/50 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-brand-burgundy">#{ord.order_number}</strong>
                      <span className="text-brand-chocolate/70 block">{ord.customer_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-brand-burgundy">₹{ord.amount}</span>
                      <span className={`block text-[10px] font-semibold ${ord.payment_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {ord.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="card-pastel p-6 bg-white/95 space-y-4">
              <h3 className="font-heading text-base font-bold text-brand-burgundy">
                Staff Audit & Activity Trails
              </h3>
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {stats.recent_logs?.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white border border-pastel-pink/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-brand-burgundy">{log.action}</strong>
                      <span className="text-[10px] text-brand-chocolate/50">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-brand-chocolate/80 text-[11px]">{log.details}</p>
                    <span className="text-[10px] text-brand-chocolate/50 block">By: {log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT TAB (Fulfillment & Tracking URL Upload) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-brand-burgundy">Order Fulfillment & Tracking</h2>
            <span className="text-xs text-brand-chocolate/70">Click "Update Courier" to assign tracking URLs</span>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="card-pastel p-6 bg-white/95 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-pastel-pink/50 gap-2">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-brand-burgundy">#{ord.order_number}</h3>
                    <p className="text-xs text-brand-chocolate/70">
                      Customer: <strong>{ord.shipping_name}</strong> ({ord.guest_email || ord.shipping_phone})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ord.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {ord.payment_status}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy">
                      {ord.fulfillment_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items & Shipping address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-brand-chocolate">
                  <div>
                    <h4 className="font-semibold text-brand-burgundy mb-1">Ordered Items:</h4>
                    {ord.items?.map((item) => (
                      <p key={item.id}>{item.quantity}x {item.product_name} - ₹{item.total_price}</p>
                    ))}
                    <p className="font-bold text-brand-burgundy mt-2">Total Amount: ₹{ord.total_amount}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-brand-burgundy mb-1">Shipping Details:</h4>
                    <p>{ord.shipping_address_line1}, {ord.shipping_city}, {ord.shipping_state} {ord.shipping_postal_code}</p>
                    <p className="mt-1">
                      Courier: <strong>{ord.courier_name || 'Not assigned'}</strong> | AWB: <strong>{ord.tracking_number || 'N/A'}</strong>
                    </p>
                    {ord.tracking_url && (
                      <a href={ord.tracking_url} target="_blank" rel="noopener noreferrer" className="text-brand-burgundy underline flex items-center gap-1 mt-1 font-medium">
                        <span>Customer Tracking Link</span> <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-pastel-pink/50 flex justify-end">
                  <button
                    onClick={() => {
                      setEditingOrder(ord);
                      setFulfillmentForm({
                        fulfillment_status: ord.fulfillment_status,
                        courier_name: ord.courier_name || 'Blue Dart',
                        tracking_number: ord.tracking_number || '',
                        tracking_url: ord.tracking_url || '',
                        estimated_delivery_date: ord.estimated_delivery_date || '',
                        status_notes: '',
                      });
                    }}
                    className="btn-primary text-xs px-4 py-2 gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Update Shipping & Courier Tracking</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Fulfillment Edit Modal */}
          {editingOrder && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleSaveFulfillment} className="card-pastel p-8 bg-white max-w-lg w-full space-y-4 shadow-pastel-lg animate-in fade-in">
                <h3 className="font-heading text-xl font-bold text-brand-burgundy">
                  Update Shipment for #{editingOrder.order_number}
                </h3>

                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Fulfillment Status</label>
                  <select
                    value={fulfillmentForm.fulfillment_status}
                    onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, fulfillment_status: e.target.value })}
                    className="input-pastel text-xs"
                  >
                    <option value="CONFIRMED">Order Confirmed</option>
                    <option value="PROCESSING">Processing & Handcrafting</option>
                    <option value="READY_TO_SHIP">Ready to Ship</option>
                    <option value="SHIPPED">Shipped (Handed to Courier)</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-brand-chocolate block mb-1">Courier Service</label>
                    <input
                      type="text"
                      value={fulfillmentForm.courier_name}
                      onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, courier_name: e.target.value })}
                      placeholder="e.g. Blue Dart / DTDC"
                      className="input-pastel text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brand-chocolate block mb-1">Tracking Number / AWB</label>
                    <input
                      type="text"
                      value={fulfillmentForm.tracking_number}
                      onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, tracking_number: e.target.value })}
                      placeholder="AWB12345678"
                      className="input-pastel text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Official Tracking URL</label>
                  <input
                    type="url"
                    value={fulfillmentForm.tracking_url}
                    onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, tracking_url: e.target.value })}
                    placeholder="https://track.bluedart.com/awb=123"
                    className="input-pastel text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={fulfillmentForm.estimated_delivery_date}
                    onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, estimated_delivery_date: e.target.value })}
                    className="input-pastel text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Audit Notes / Timeline Message</label>
                  <input
                    type="text"
                    value={fulfillmentForm.status_notes}
                    onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, status_notes: e.target.value })}
                    placeholder="e.g. Packed in boutique gift box and dispatched via BlueDart Express"
                    className="input-pastel text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-pastel-pink/50">
                  <button type="button" onClick={() => setEditingOrder(null)} className="btn-secondary text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    Save Tracking Details
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3. INVENTORY & STOCK TAB */}
      {activeTab === 'inventory' && (
        <div className="space-y-8">
          {/* Manual Adjustment Card */}
          <form onSubmit={handleStockAdjustment} className="card-pastel p-6 sm:p-8 bg-white/95 space-y-4">
            <h3 className="font-heading text-lg font-bold text-brand-burgundy">
              Manual Stock Adjustment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Select Creation</label>
                <select
                  value={stockAdjustment.product_id}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, product_id: e.target.value })}
                  className="input-pastel text-xs"
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {inventory.map((inv) => (
                    <option key={inv.product_id} value={inv.product_id}>
                      {inv.product_name} (Current: {inv.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Quantity Delta (+/-)</label>
                <input
                  type="number"
                  value={stockAdjustment.quantity_delta}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity_delta: parseInt(e.target.value) })}
                  className="input-pastel text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
                  className="input-pastel text-xs"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary text-xs">
              Apply Stock Adjustment
            </button>
          </form>

          {/* Current Inventory Table */}
          <div className="card-pastel overflow-hidden bg-white/95">
            <table className="w-full text-xs text-left">
              <thead className="bg-pastel-cream text-brand-burgundy font-bold uppercase tracking-wider border-b border-pastel-pink/60">
                <tr>
                  <th className="p-3.5">Creation Name</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Threshold</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pastel-pink/40 text-brand-chocolate">
                {inventory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-pastel-peach/10">
                    <td className="p-3.5 font-semibold text-brand-burgundy">{inv.product_name}</td>
                    <td className="p-3.5 font-mono text-[11px]">{inv.sku}</td>
                    <td className="p-3.5">{inv.category}</td>
                    <td className="p-3.5 font-bold text-sm">{inv.quantity}</td>
                    <td className="p-3.5">{inv.low_stock_threshold}</td>
                    <td className="p-3.5">
                      {inv.is_out_of_stock ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">Out of Stock</span>
                      ) : inv.is_low_stock ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Low Stock Warning</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Adequate</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CUSTOM COMMISSIONS & QUOTATIONS TAB */}
      {activeTab === 'customizations' && (
        <div className="space-y-6">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">Custom Crochet Requests & Quotes</h2>

          <div className="space-y-4">
            {customRequests.map((req) => (
              <div key={req.id} className="card-pastel p-6 bg-white/95 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-pastel-pink/50 gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-brand-chocolate/60">#{req.request_number}</span>
                    <h3 className="font-heading text-lg font-bold text-brand-burgundy">{req.title}</h3>
                    <p className="text-xs text-brand-chocolate/70">
                      From: <strong>{req.name}</strong> ({req.email} • {req.phone})
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy">
                    {req.status_display}
                  </span>
                </div>

                <p className="text-xs text-brand-chocolate/85 leading-relaxed">{req.description}</p>
                <div className="text-xs text-brand-chocolate/70 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <span>Color: <strong>{req.color_preferences}</strong></span>
                  <span>Size: <strong>{req.size_preferences}</strong></span>
                  <span>Qty: <strong>{req.quantity}</strong></span>
                  <span>Budget: <strong>{req.budget_range_inr}</strong></span>
                </div>

                {req.quote && (
                  <div className="p-4 rounded-xl bg-pastel-cream text-xs text-brand-chocolate space-y-1 border border-pastel-pink">
                    <p className="font-bold text-brand-burgundy">Active Quotation: ₹{req.quote.quote_amount}</p>
                    <p>{req.quote.quote_details}</p>
                    <p className="text-[11px] text-brand-chocolate/60">Production: {req.quote.estimated_production_days} days | Accepted: {req.quote.is_accepted ? 'Yes' : 'No'}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setQuotingRequest(req);
                      setQuoteForm({
                        quote_amount: req.quote?.quote_amount || '',
                        estimated_production_days: req.quote?.estimated_production_days || 7,
                        quote_details: req.quote?.quote_details || '',
                      });
                    }}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    {req.quote ? 'Edit Quotation' : 'Prepare & Issue Quote'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quotation Modal */}
          {quotingRequest && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleSendQuote} className="card-pastel p-8 bg-white max-w-lg w-full space-y-4 shadow-pastel-lg animate-in fade-in">
                <h3 className="font-heading text-xl font-bold text-brand-burgundy">
                  Quotation for #{quotingRequest.request_number}
                </h3>
                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Quote Amount (in INR) *</label>
                  <input
                    type="number"
                    value={quoteForm.quote_amount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quote_amount: e.target.value })}
                    placeholder="1200"
                    className="input-pastel text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Estimated Production Time (Days)</label>
                  <input
                    type="number"
                    value={quoteForm.estimated_production_days}
                    onChange={(e) => setQuoteForm({ ...quoteForm, estimated_production_days: parseInt(e.target.value) })}
                    className="input-pastel text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Quotation Specifications</label>
                  <textarea
                    value={quoteForm.quote_details}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quote_details: e.target.value })}
                    rows={3}
                    placeholder="Detail the materials, customization techniques, and packaging inclusions..."
                    className="input-pastel text-xs"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-pastel-pink/50">
                  <button type="button" onClick={() => setQuotingRequest(null)} className="btn-secondary text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    Issue Quote to Customer
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 5. CLASS MANAGEMENT & GOOGLE MEET TAB */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">Crochet Classes & Google Meet Sessions</h2>

          <div className="space-y-6">
            {classes.map((cls) => (
              <div key={cls.id} className="card-pastel p-6 bg-white/95 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-pastel-pink/50 gap-2">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-brand-burgundy">{cls.title}</h3>
                    <p className="text-xs text-brand-chocolate/70">
                      Level: {cls.skill_level_display || cls.skill_level} • Fee: ₹{cls.price}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAddingSessionToClass(cls);
                      setSessionForm({
                        start_time: '',
                        end_time: '',
                        max_participants: 12,
                        google_meet_link: 'https://meet.google.com/sih-crft-new',
                      });
                    }}
                    className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Schedule Session Slot
                  </button>
                </div>

                {/* Scheduled sessions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-brand-burgundy uppercase tracking-wider">Scheduled Sessions</h4>
                  {cls.sessions?.map((sess) => (
                    <div key={sess.id} className="p-3 rounded-xl bg-pastel-cream/70 border border-pastel-pink/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <strong>{new Date(sess.start_time).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })} at {new Date(sess.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        <span className="text-brand-chocolate/70 block mt-0.5">
                          Capacity: {sess.confirmed_bookings_count} enrolled / {sess.max_participants} max seats
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {sess.google_meet_link && (
                          <a href={sess.google_meet_link} target="_blank" rel="noopener noreferrer" className="btn-outline text-[11px] px-2.5 py-1 gap-1">
                            <span>Google Meet Link</span> <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Session Modal */}
          {addingSessionToClass && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleAddSession} className="card-pastel p-8 bg-white max-w-lg w-full space-y-4 shadow-pastel-lg animate-in fade-in">
                <h3 className="font-heading text-xl font-bold text-brand-burgundy">
                  Add Session Slot for {addingSessionToClass.title}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-brand-chocolate block mb-1">Start Time *</label>
                    <input
                      type="datetime-local"
                      value={sessionForm.start_time}
                      onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                      className="input-pastel text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brand-chocolate block mb-1">End Time *</label>
                    <input
                      type="datetime-local"
                      value={sessionForm.end_time}
                      onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
                      className="input-pastel text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Seat Limit</label>
                  <input
                    type="number"
                    value={sessionForm.max_participants}
                    onChange={(e) => setSessionForm({ ...sessionForm, max_participants: parseInt(e.target.value) })}
                    className="input-pastel text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Google Meet Link</label>
                  <input
                    type="url"
                    value={sessionForm.google_meet_link}
                    onChange={(e) => setSessionForm({ ...sessionForm, google_meet_link: e.target.value })}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="input-pastel text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-pastel-pink/50">
                  <button type="button" onClick={() => setAddingSessionToClass(null)} className="btn-secondary text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    Save Session
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 6. COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <h2 className="font-heading text-xl font-bold text-brand-burgundy">Promo Coupons & Discounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map((c) => (
              <div key={c.id} className="card-pastel p-6 bg-white/95 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-brand-burgundy bg-pastel-pink px-2.5 py-1 rounded-lg">
                    {c.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-brand-chocolate">
                  Discount: <strong>{c.discount_value}{c.discount_type === 'PERCENTAGE' ? '%' : ' INR'}</strong>
                </p>
                <p className="text-xs text-brand-chocolate/70">
                  Min Order: ₹{c.min_order_amount} • Used: {c.times_used} times
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
