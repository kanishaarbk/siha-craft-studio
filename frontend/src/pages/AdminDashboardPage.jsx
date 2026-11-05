import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Package, DollarSign, AlertTriangle, Video, Sparkles,
  ShoppingBag, Truck, Plus, CheckCircle2, RefreshCw, ExternalLink,
  ChevronRight, Users, Clock, Edit2, Trash2, Search, Filter,
  X, Eye, EyeOff, Layers, Tag, LogOut, Menu, Calendar, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, inventory, orders, workshops, customizations, coupons
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search States
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');

  const [invSearch, setInvSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  // Modals & Form States
  // 1. Product Modal (Add / Edit)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category_id: '',
    price: '',
    sale_price: '',
    short_description: '',
    description: '',
    material: '100% Premium Cotton Yarn',
    dimensions: 'Handcrafted Standard',
    care_instructions: 'Hand wash gently in cold water. Lay flat on towel to dry.',
    estimated_dispatch_days: 3,
    is_ready_stock: true,
    is_customizable: true,
    is_featured: false,
    is_active: true,
    primary_image_url: '',
    stock: 10,
    low_stock_threshold: 5,
    image_urls: [''],
    variants: [],
  });

  // Delete Confirmation Dialog
  const [deleteProductConfirm, setDeleteProductConfirm] = useState(null);

  // 2. Stock / Inventory Adjustment Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedInvProduct, setSelectedInvProduct] = useState(null);
  const [stockForm, setStockForm] = useState({
    product_id: '',
    variant_id: '',
    mode: 'delta', // 'delta' (+/-) or 'exact' (set quantity)
    quantity_delta: 5,
    new_quantity: 10,
    low_stock_threshold: 5,
    reason: 'Fresh artisan restock from studio',
  });

  // 3. Workshop Modal (Create / Edit)
  const [workshopModalOpen, setWorkshopModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    google_meet_url: '',
    date: '',
    time: '18:00',
    registration_link: '',
    is_published: true,
  });
  const [deleteWorkshopConfirm, setDeleteWorkshopConfirm] = useState(null);

  // 4. Order Fulfillment Modal
  const [editingOrder, setEditingOrder] = useState(null);
  const [fulfillmentForm, setFulfillmentForm] = useState({
    fulfillment_status: 'CONFIRMED',
    courier_name: 'Blue Dart',
    tracking_number: '',
    tracking_url: '',
    estimated_delivery_date: '',
    status_notes: '',
  });

  // 5. Custom Request Quote Modal
  const [quotingRequest, setQuotingRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    quote_amount: '',
    estimated_production_days: 7,
    quote_details: '',
  });

  // 6. Coupon Modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    min_order_amount: 0,
  });

  // Load All Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        prodsRes,
        catsRes,
        invRes,
        invHistRes,
        ordersRes,
        workshopsRes,
        custRes,
        couponsRes,
      ] = await Promise.all([
        api.get('/admin/dashboard/'),
        api.get('/admin/products/'),
        api.get('/categories/'),
        api.get('/admin/inventory/'),
        api.get('/admin/inventory/history/'),
        api.get('/orders/admin/orders/'),
        api.get('/admin/workshops/'),
        api.get('/customizations/admin/requests/'),
        api.get('/admin/coupons/'),
      ]);

      setStats(statsRes.data);
      setProducts(prodsRes.data || []);
      setCategories(catsRes.data || []);
      setInventory(invRes.data || []);
      setInventoryHistory(invHistRes.data || []);
      setOrders(ordersRes.data || []);
      setWorkshops(workshopsRes.data || []);
      setCustomRequests(custRes.data || []);
      setCoupons(couponsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      toast.error('Failed to load administrator data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      toast.error('Staff or Administrator access required.');
      navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/dashboard' } } });
      return;
    }
    loadAdminData();
  }, [isAdmin, authLoading, navigate]);

  const handleAdminLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: '',
      category_id: categories[0]?.id || '',
      price: '',
      sale_price: '',
      short_description: '',
      description: '',
      material: '100% Premium Cotton Yarn',
      dimensions: 'Handcrafted Standard',
      care_instructions: 'Hand wash gently in cold water. Lay flat on towel to dry.',
      estimated_dispatch_days: 3,
      is_ready_stock: true,
      is_customizable: true,
      is_featured: false,
      is_active: true,
      primary_image_url: '',
      stock: 10,
      low_stock_threshold: 5,
      image_urls: [''],
      variants: [],
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    const existingImages = prod.images?.map((i) => i.image_url) || (prod.primary_image_url ? [prod.primary_image_url] : ['']);
    setProductForm({
      name: prod.name,
      sku: prod.sku,
      category_id: prod.category_id || prod.category?.id || '',
      price: prod.price,
      sale_price: prod.sale_price || '',
      short_description: prod.short_description || '',
      description: prod.description || '',
      material: prod.material || '100% Premium Cotton Yarn',
      dimensions: prod.dimensions || 'Handcrafted Standard',
      care_instructions: prod.care_instructions || 'Hand wash gently in cold water.',
      estimated_dispatch_days: prod.estimated_dispatch_days || 3,
      is_ready_stock: prod.is_ready_stock ?? true,
      is_customizable: prod.is_customizable ?? true,
      is_featured: prod.is_featured ?? false,
      is_active: prod.is_active ?? true,
      primary_image_url: prod.primary_image_url || '',
      stock: prod.stock || 0,
      low_stock_threshold: prod.low_stock_threshold || 5,
      image_urls: existingImages.length > 0 ? existingImages : [''],
      variants: prod.variants?.map((v) => ({ ...v })) || [],
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        image_urls: productForm.image_urls.filter((url) => url && url.trim().length > 0),
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}/`, payload);
        toast.success(`Product "${productForm.name}" updated successfully.`);
      } else {
        await api.post('/admin/products/', payload);
        toast.success(`New product "${productForm.name}" published successfully.`);
      }

      setProductModalOpen(false);
      // Reload product and inventory data
      const [prodsRes, invRes, statsRes] = await Promise.all([
        api.get('/admin/products/'),
        api.get('/admin/inventory/'),
        api.get('/admin/dashboard/'),
      ]);
      setProducts(prodsRes.data || []);
      setInventory(invRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product details.');
    }
  };

  const handleToggleProductActive = async (prod) => {
    try {
      await api.put(`/admin/products/${prod.id}/`, { is_active: !prod.is_active });
      toast.success(`Product "${prod.name}" status updated to ${!prod.is_active ? 'Active' : 'Inactive'}.`);
      setProducts(products.map((p) => (p.id === prod.id ? { ...p, is_active: !p.is_active } : p)));
    } catch (err) {
      toast.error('Failed to toggle product status.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductConfirm) return;
    try {
      const res = await api.delete(`/admin/products/${deleteProductConfirm.id}/`);
      toast.success(res.data.message || 'Product removed.');
      setDeleteProductConfirm(null);

      const [prodsRes, invRes, statsRes] = await Promise.all([
        api.get('/admin/products/'),
        api.get('/admin/inventory/'),
        api.get('/admin/dashboard/'),
      ]);
      setProducts(prodsRes.data || []);
      setInventory(invRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Could not delete product.');
    }
  };

  // Add / Remove Variant in Product Form
  const handleAddVariant = () => {
    setProductForm({
      ...productForm,
      variants: [
        ...productForm.variants,
        { color: 'Standard', size: 'Standard', color_code: '#F8DDE0', price_adjustment: 0, stock: 5, is_active: true },
      ],
    });
  };

  const handleRemoveVariant = (idx) => {
    setProductForm({
      ...productForm,
      variants: productForm.variants.filter((_, i) => i !== idx),
    });
  };

  const handleVariantChange = (idx, field, value) => {
    const updated = [...productForm.variants];
    updated[idx][field] = value;
    setProductForm({ ...productForm, variants: updated });
  };

  // Multiple Image URL Handlers
  const handleAddImageUrl = () => {
    setProductForm({ ...productForm, image_urls: [...productForm.image_urls, ''] });
  };

  const handleImageUrlChange = (idx, value) => {
    const updated = [...productForm.image_urls];
    updated[idx] = value;
    setProductForm({ ...productForm, image_urls: updated });
  };

  const handleRemoveImageUrl = (idx) => {
    const updated = productForm.image_urls.filter((_, i) => i !== idx);
    setProductForm({ ...productForm, image_urls: updated.length ? updated : [''] });
  };

  // --- INVENTORY & STOCK HANDLERS ---
  const handleOpenStockAdjust = (invItem) => {
    setSelectedInvProduct(invItem);
    setStockForm({
      product_id: invItem.product_id,
      variant_id: invItem.variants?.[0]?.id || '',
      mode: 'delta',
      quantity_delta: 5,
      new_quantity: invItem.quantity,
      low_stock_threshold: invItem.low_stock_threshold,
      reason: 'Artisan stock restock',
    });
    setStockModalOpen(true);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        product_id: stockForm.product_id,
        variant_id: stockForm.variant_id || undefined,
        low_stock_threshold: stockForm.low_stock_threshold,
        reason: stockForm.reason,
        ...(stockForm.mode === 'delta'
          ? { quantity_delta: stockForm.quantity_delta }
          : { new_quantity: stockForm.new_quantity }),
      };

      const res = await api.post('/admin/inventory/adjust/', payload);
      toast.success(res.data.message || 'Inventory updated successfully.');
      setStockModalOpen(false);

      // Refresh inventory, products, and history
      const [invRes, histRes, statsRes, prodsRes] = await Promise.all([
        api.get('/admin/inventory/'),
        api.get('/admin/inventory/history/'),
        api.get('/admin/dashboard/'),
        api.get('/admin/products/'),
      ]);
      setInventory(invRes.data || []);
      setInventoryHistory(histRes.data || []);
      setStats(statsRes.data);
      setProducts(prodsRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to adjust inventory.');
    }
  };

  // --- WORKSHOP HANDLERS (GOOGLE MEET) ---
  const handleOpenAddWorkshop = () => {
    setEditingWorkshop(null);
    setWorkshopForm({
      title: '',
      description: '',
      google_meet_url: 'https://meet.google.com/sih-',
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      registration_link: '',
      is_published: true,
    });
    setWorkshopModalOpen(true);
  };

  const handleOpenEditWorkshop = (ws) => {
    setEditingWorkshop(ws);
    setWorkshopForm({
      title: ws.title,
      description: ws.description,
      google_meet_url: ws.google_meet_url,
      date: ws.date,
      time: ws.time?.slice(0, 5) || '18:00',
      registration_link: ws.registration_link || '',
      is_published: ws.is_published,
    });
    setWorkshopModalOpen(true);
  };

  const handleSaveWorkshop = async (e) => {
    e.preventDefault();
    try {
      if (editingWorkshop) {
        await api.put(`/admin/workshops/${editingWorkshop.id}/`, workshopForm);
        toast.success(`Workshop "${workshopForm.title}" updated.`);
      } else {
        await api.post('/admin/workshops/', workshopForm);
        toast.success(`Google Meet Workshop "${workshopForm.title}" published!`);
      }

      setWorkshopModalOpen(false);
      const wsRes = await api.get('/admin/workshops/');
      setWorkshops(wsRes.data || []);
    } catch (err) {
      toast.error('Failed to save workshop details.');
    }
  };

  const handleDeleteWorkshop = async () => {
    if (!deleteWorkshopConfirm) return;
    try {
      await api.delete(`/admin/workshops/${deleteWorkshopConfirm.id}/`);
      toast.success('Workshop removed.');
      setDeleteWorkshopConfirm(null);
      const wsRes = await api.get('/admin/workshops/');
      setWorkshops(wsRes.data || []);
    } catch (err) {
      toast.error('Could not delete workshop.');
    }
  };

  // --- ORDER FULFILLMENT HANDLERS ---
  const handleSaveFulfillment = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const res = await api.put(`/orders/admin/orders/${editingOrder.id}/fulfillment/`, fulfillmentForm);
      toast.success(res.data.message || 'Order fulfillment and tracking saved.');
      setOrders(orders.map((o) => (o.id === editingOrder.id ? res.data.order : o)));
      setEditingOrder(null);
    } catch (err) {
      toast.error('Failed to update courier tracking.');
    }
  };

  // --- CUSTOM REQUEST & COUPONS HANDLERS ---
  const handleSendQuote = async (e) => {
    e.preventDefault();
    if (!quotingRequest) return;
    try {
      const res = await api.post(`/customizations/admin/requests/${quotingRequest.id}/quote/`, quoteForm);
      toast.success(res.data.message);
      const custRes = await api.get('/customizations/admin/requests/');
      setCustomRequests(custRes.data || []);
      setQuotingRequest(null);
    } catch (err) {
      toast.error('Could not issue quotation.');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons/', couponForm);
      toast.success(`Coupon ${couponForm.code} created.`);
      setCouponModalOpen(false);
      const couponsRes = await api.get('/admin/coupons/');
      setCoupons(couponsRes.data || []);
    } catch (err) {
      toast.error('Failed to create coupon.');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = !productCatFilter || String(p.category_id) === String(productCatFilter);
    const matchStatus =
      !productStatusFilter ||
      (productStatusFilter === 'active' && p.is_active) ||
      (productStatusFilter === 'inactive' && !p.is_active) ||
      (productStatusFilter === 'low_stock' && p.stock <= 5 && p.stock > 0) ||
      (productStatusFilter === 'out_of_stock' && p.stock <= 0);
    return matchSearch && matchCat && matchStatus;
  });

  // Filtered Inventory
  const filteredInventory = inventory.filter((item) => {
    const matchSearch =
      !invSearch ||
      item.product_name.toLowerCase().includes(invSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(invSearch.toLowerCase());
    const matchStatus =
      invStatusFilter === 'all' ||
      (invStatusFilter === 'low' && item.is_low_stock) ||
      (invStatusFilter === 'out' && item.is_out_of_stock) ||
      (invStatusFilter === 'adequate' && !item.is_low_stock && !item.is_out_of_stock);
    return matchSearch && matchStatus;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !orderSearch ||
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shipping_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.tracking_number && o.tracking_number.toLowerCase().includes(orderSearch.toLowerCase()));
    const matchStatus = !orderStatusFilter || o.fulfillment_status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  if (authLoading || (loading && !stats)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-burgundy animate-spin" />
        <p className="text-xs font-semibold text-brand-chocolate tracking-wider uppercase">
          Loading Artisan Management Portal...
        </p>
      </div>
    );
  }

  const navTabs = [
    { key: 'overview', label: 'Store Overview', icon: Shield },
    { key: 'products', label: `Products (${products.length})`, icon: Package },
    { key: 'inventory', label: `Stock & Inventory`, icon: AlertTriangle, badge: stats?.low_stock_products || 0 },
    { key: 'orders', label: `Orders (${orders.length})`, icon: Truck },
    { key: 'workshops', label: `Google Meet Workshops (${workshops.length})`, icon: Video },
    { key: 'customizations', label: `Custom Requests (${customRequests.length})`, icon: Sparkles },
    { key: 'coupons', label: `Promo Coupons (${coupons.length})`, icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-pastel-cream/40 flex flex-col">
      
      {/* Top Staff Navigation Header */}
      <header className="bg-brand-burgundy text-white px-4 sm:px-6 lg:px-8 py-3.5 shadow-md flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-pastel-pink"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-pastel-peach">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-base sm:text-lg block leading-none">
                SiHA Atelier Management
              </span>
              <span className="text-[10px] text-pastel-pink/80 font-mono tracking-wider">
                ADMIN CONSOLE • {user?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-[11px] py-1.5 px-3 bg-white/15 hover:bg-white/25 text-white border-white/20 flex items-center gap-1.5"
          >
            <span>Live Boutique</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleAdminLogout}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Sign out of Admin Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container (Sidebar + Content) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-2">
          <div className="p-4 bg-white/90 rounded-2xl border border-pastel-pink/70 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-burgundy/70 px-2 block mb-1">
              Atelier Management
            </span>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-burgundy text-white shadow-sm'
                      : 'text-brand-chocolate hover:bg-pastel-pink/30 hover:text-brand-burgundy'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label.split(' (')[0]}</span>
                  </div>
                  {tab.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="p-4 rounded-2xl bg-pastel-cream border border-pastel-pink/60 text-xs text-brand-chocolate space-y-2">
            <span className="font-bold text-brand-burgundy text-[11px] uppercase tracking-wider block">
              Direct Database Mode
            </span>
            <p className="text-[11px] text-brand-chocolate/80">
              All product and inventory operations update the live Django MySQL database immediately.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 lg:hidden flex">
            <div className="w-72 bg-white h-full p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-pastel-pink">
                  <span className="font-heading font-bold text-brand-burgundy">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-pastel-pink/30">
                    <X className="w-5 h-5 text-brand-chocolate" />
                  </button>
                </div>
                <div className="space-y-1">
                  {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveTab(tab.key);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-brand-burgundy text-white'
                            : 'text-brand-chocolate hover:bg-pastel-pink/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleAdminLogout}
                className="w-full btn-secondary text-xs py-2 text-rose-700 border-rose-200"
              >
                Sign Out
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Tab Content Workspace */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* TAB 1: STORE OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-pastel-pink/60">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-brand-burgundy">
                    Atelier Overview & Pulse
                  </h1>
                  <span className="text-xs text-brand-chocolate/70">
                    Live operational metrics and store performance
                  </span>
                </div>
                <button
                  onClick={loadAdminData}
                  className="btn-secondary text-xs px-3 py-1.5 self-start sm:self-auto gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Metrics</span>
                </button>
              </div>

              {/* 6 Key Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-pastel p-5 bg-white/95 space-y-1">
                  <span className="text-[11px] text-brand-chocolate/70 uppercase tracking-wider font-semibold">
                    Total Products
                  </span>
                  <p className="font-heading text-3xl font-bold text-brand-burgundy">
                    {stats.total_products}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {stats.products_in_stock} In Stock
                  </span>
                </div>

                <div className="card-pastel p-5 bg-white/95 space-y-1">
                  <span className="text-[11px] text-brand-chocolate/70 uppercase tracking-wider font-semibold">
                    Available Stock
                  </span>
                  <p className="font-heading text-3xl font-bold text-brand-chocolate">
                    {stats.total_available_stock}
                  </p>
                  <span className="text-[11px] text-brand-chocolate/60">
                    Units across all creations
                  </span>
                </div>

                <div className="card-pastel p-5 bg-white/95 space-y-1">
                  <span className="text-[11px] text-brand-chocolate/70 uppercase tracking-wider font-semibold">
                    Low Stock Alerts
                  </span>
                  <p className="font-heading text-3xl font-bold text-amber-700">
                    {stats.low_stock_products}
                  </p>
                  <span className="text-[11px] text-amber-700 font-medium">
                    {stats.out_of_stock_products} completely sold out
                  </span>
                </div>

                <div className="card-pastel p-5 bg-white/95 space-y-1">
                  <span className="text-[11px] text-brand-chocolate/70 uppercase tracking-wider font-semibold">
                    Total Orders
                  </span>
                  <p className="font-heading text-3xl font-bold text-brand-burgundy">
                    {stats.total_orders}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    ₹{stats.verified_revenue.toFixed(2)} Paid Revenue
                  </span>
                </div>
              </div>

              {/* Recent Orders & Recent Inventory History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders Card */}
                <div className="card-pastel p-6 bg-white/95 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-pastel-pink/60">
                    <h3 className="font-heading text-base font-bold text-brand-burgundy flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>Recent Customer Orders</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-brand-burgundy hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {stats.recent_orders?.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-2xl bg-pastel-cream/50 border border-pastel-pink/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-brand-burgundy block font-mono">
                            #{ord.order_number}
                          </strong>
                          <span className="text-brand-chocolate/70">
                            {ord.customer_name} • {new Date(ord.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-right">
                          <strong className="text-brand-burgundy block">
                            ₹{ord.amount}
                          </strong>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ord.payment_status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.fulfillment_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Inventory Movements */}
                <div className="card-pastel p-6 bg-white/95 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-pastel-pink/60">
                    <h3 className="font-heading text-base font-bold text-brand-burgundy flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Recent Inventory Updates</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="text-xs font-semibold text-brand-burgundy hover:underline"
                    >
                      Stock Management →
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto">
                    {stats.recent_inventory_updates?.map((upd) => (
                      <div
                        key={upd.id}
                        className="p-3 rounded-2xl bg-white border border-pastel-pink/50 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-brand-burgundy">
                            {upd.product_name}
                          </strong>
                          <span
                            className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                              upd.quantity_delta >= 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {upd.quantity_delta >= 0 ? `+${upd.quantity_delta}` : upd.quantity_delta}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-brand-chocolate/70">
                          <span>Qty: {upd.quantity_before} → <strong>{upd.quantity_after}</strong></span>
                          <span>{new Date(upd.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-[10px] text-brand-chocolate/50 block italic">
                          {upd.reason} • by {upd.admin}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT (CRUD & GUI) */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-pastel-pink/60">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-brand-burgundy">
                    Catalog & Product Management
                  </h1>
                  <span className="text-xs text-brand-chocolate/70">
                    Add, edit, upload multiple images, manage variants, and publish creations
                  </span>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="btn-primary text-xs px-4 py-2.5 gap-1.5 self-start sm:self-auto shadow-pastel"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search & Filters Bar */}
              <div className="card-pastel p-4 bg-white/95 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-brand-burgundy/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title, SKU, or keywords..."
                    className="input-pastel text-xs pl-9 py-2 w-full"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={productCatFilter}
                    onChange={(e) => setProductCatFilter(e.target.value)}
                    className="input-pastel text-xs py-2"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="input-pastel text-xs py-2"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive</option>
                    <option value="low_stock">Low Stock (≤5)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="card-pastel overflow-hidden bg-white/95 rounded-3xl border border-pastel-pink shadow-pastel">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-pastel-cream text-brand-burgundy font-bold uppercase tracking-wider border-b border-pastel-pink/60">
                      <tr>
                        <th className="p-4">Creation</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Variants</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pastel-pink/40 text-brand-chocolate">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-pastel-peach/10 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.primary_image_url || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=200&q=80'}
                                alt={prod.name}
                                className="w-12 h-12 rounded-xl object-cover border border-pastel-pink shrink-0"
                              />
                              <div>
                                <strong className="font-heading text-sm text-brand-burgundy block leading-tight">
                                  {prod.name}
                                </strong>
                                <span className="text-[11px] text-brand-chocolate/70 line-clamp-1">
                                  {prod.short_description || 'Handcrafted creation'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-[11px] font-semibold text-brand-burgundy">
                            {prod.sku}
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full bg-pastel-pink/60 text-brand-burgundy font-medium text-[11px]">
                              {prod.category_name}
                            </span>
                          </td>

                          <td className="p-4">
                            <div>
                              <strong className="font-bold text-brand-burgundy">
                                ₹{prod.sale_price || prod.price}
                              </strong>
                              {prod.sale_price && (
                                <span className="text-[10px] text-brand-chocolate/50 line-through block">
                                  ₹{prod.price}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`font-bold text-xs px-2.5 py-1 rounded-full ${
                                prod.stock <= 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : prod.stock <= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {prod.stock} units
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="text-brand-chocolate/70">
                              {prod.variants_count || prod.variants?.length || 0} variant(s)
                            </span>
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => handleToggleProductActive(prod)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                                prod.is_active
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title="Click to toggle active status"
                            >
                              {prod.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{prod.is_active ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 rounded-lg text-brand-burgundy hover:bg-pastel-pink/50 transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteProductConfirm(prod)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center text-xs text-brand-chocolate/60">
                    No products matched your search or filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY & STOCK MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-pastel-pink/60">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-brand-burgundy">
                    Stock & Inventory Control
                  </h1>
                  <span className="text-xs text-brand-chocolate/70">
                    Monitor stock levels, set low-stock thresholds, and track audit history
                  </span>
                </div>
              </div>

              {/* Status Filter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setInvStatusFilter('all')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    invStatusFilter === 'all'
                      ? 'bg-brand-burgundy text-white shadow-sm'
                      : 'bg-white/90 border-pastel-pink/60 text-brand-chocolate hover:bg-pastel-peach/30'
                  }`}
                >
                  <span className="text-[11px] block opacity-80 uppercase tracking-wider font-semibold">Total Tracked</span>
                  <strong className="text-xl font-heading">{inventory.length}</strong>
                </button>

                <button
                  onClick={() => setInvStatusFilter('adequate')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    invStatusFilter === 'adequate'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white/90 border-pastel-pink/60 text-brand-chocolate hover:bg-pastel-peach/30'
                  }`}
                >
                  <span className="text-[11px] block opacity-80 uppercase tracking-wider font-semibold">Adequate Stock</span>
                  <strong className="text-xl font-heading">
                    {inventory.filter((i) => !i.is_low_stock && !i.is_out_of_stock).length}
                  </strong>
                </button>

                <button
                  onClick={() => setInvStatusFilter('low')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    invStatusFilter === 'low'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white/90 border-pastel-pink/60 text-brand-chocolate hover:bg-pastel-peach/30'
                  }`}
                >
                  <span className="text-[11px] block opacity-80 uppercase tracking-wider font-semibold">Low Stock Warning</span>
                  <strong className="text-xl font-heading">
                    {inventory.filter((i) => i.is_low_stock).length}
                  </strong>
                </button>

                <button
                  onClick={() => setInvStatusFilter('out')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    invStatusFilter === 'out'
                      ? 'bg-rose-700 text-white shadow-sm'
                      : 'bg-white/90 border-pastel-pink/60 text-brand-chocolate hover:bg-pastel-peach/30'
                  }`}
                >
                  <span className="text-[11px] block opacity-80 uppercase tracking-wider font-semibold">Out of Stock</span>
                  <strong className="text-xl font-heading">
                    {inventory.filter((i) => i.is_out_of_stock).length}
                  </strong>
                </button>
              </div>

              {/* Current Stock Levels Table */}
              <div className="card-pastel overflow-hidden bg-white/95 rounded-3xl border border-pastel-pink shadow-pastel">
                <div className="p-4 border-b border-pastel-pink/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <h3 className="font-heading text-base font-bold text-brand-burgundy flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>Current Inventory Levels</span>
                  </h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-brand-burgundy/60 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={invSearch}
                      onChange={(e) => setInvSearch(e.target.value)}
                      placeholder="Filter inventory..."
                      className="input-pastel text-xs pl-8 py-1.5 w-full"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-pastel-cream text-brand-burgundy font-bold uppercase tracking-wider border-b border-pastel-pink/60">
                      <tr>
                        <th className="p-3.5">Product Name</th>
                        <th className="p-3.5">SKU</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Current Stock</th>
                        <th className="p-3.5">Alert Threshold</th>
                        <th className="p-3.5">Stock Condition</th>
                        <th className="p-3.5 text-right">Quick Stock Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pastel-pink/40 text-brand-chocolate">
                      {filteredInventory.map((inv) => (
                        <tr key={inv.id} className="hover:bg-pastel-peach/10 transition-colors">
                          <td className="p-3.5 font-semibold text-brand-burgundy">
                            {inv.product_name}
                          </td>
                          <td className="p-3.5 font-mono text-[11px]">
                            {inv.sku}
                          </td>
                          <td className="p-3.5">{inv.category}</td>
                          <td className="p-3.5 font-bold text-sm text-brand-burgundy">
                            {inv.quantity}
                          </td>
                          <td className="p-3.5 text-brand-chocolate/70">
                            ≤ {inv.low_stock_threshold} units
                          </td>
                          <td className="p-3.5">
                            {inv.is_out_of_stock ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                Out of Stock
                              </span>
                            ) : inv.is_low_stock ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Low Stock Alert
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleOpenStockAdjust(inv)}
                              className="btn-primary text-[11px] px-3 py-1 gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Adjust Stock</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Complete Inventory Audit History Table */}
              <div className="card-pastel overflow-hidden bg-white/95 rounded-3xl border border-pastel-pink shadow-pastel space-y-4 p-6">
                <div className="flex items-center justify-between pb-2 border-b border-pastel-pink/60">
                  <div>
                    <h3 className="font-heading text-base font-bold text-brand-burgundy flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Complete Inventory Movement History</span>
                    </h3>
                    <span className="text-[11px] text-brand-chocolate/70">
                      Audit log showing previous quantity, updated quantity, timestamp, and the responsible administrator
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-pastel-cream text-brand-burgundy font-bold uppercase tracking-wider sticky top-0 border-b border-pastel-pink/60">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Product / SKU</th>
                        <th className="p-3">Variant</th>
                        <th className="p-3">Movement Type</th>
                        <th className="p-3">Stock Delta</th>
                        <th className="p-3">Quantity Trail</th>
                        <th className="p-3">Reason / Details</th>
                        <th className="p-3">Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pastel-pink/40 text-brand-chocolate">
                      {inventoryHistory.map((hist) => (
                        <tr key={hist.id} className="hover:bg-pastel-peach/10">
                          <td className="p-3 text-[11px] text-brand-chocolate/70 whitespace-nowrap">
                            {new Date(hist.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-3">
                            <strong className="text-brand-burgundy block">{hist.product_name}</strong>
                            <span className="text-[10px] font-mono text-brand-chocolate/60">{hist.sku}</span>
                          </td>
                          <td className="p-3 text-[11px] text-brand-chocolate/70">
                            {hist.variant_name || 'Standard'}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-pastel-pink/60 text-brand-burgundy text-[10px] font-bold">
                              {hist.movement_type_display}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold">
                            <span className={hist.quantity_delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {hist.quantity_delta >= 0 ? `+${hist.quantity_delta}` : hist.quantity_delta}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-[11px]">
                            {hist.quantity_before} → <span className="text-brand-burgundy font-bold">{hist.quantity_after}</span>
                          </td>
                          <td className="p-3 text-[11px] text-brand-chocolate/80">
                            {hist.reason}
                          </td>
                          <td className="p-3 text-[11px] font-medium text-brand-burgundy">
                            {hist.admin_email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDER FULFILLMENT & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-pastel-pink/60">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-brand-burgundy">
                    Customer Orders & Dispatch Tracking
                  </h1>
                  <span className="text-xs text-brand-chocolate/70">
                    Assign courier tracking, update fulfillment status, and add estimated delivery dates
                  </span>
                </div>
              </div>

              {/* Order Search & Status Filter */}
              <div className="card-pastel p-4 bg-white/95 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-brand-burgundy/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order number, customer name, or tracking ID..."
                    className="input-pastel text-xs pl-9 py-2 w-full"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="input-pastel text-xs py-2 w-full sm:w-auto"
                >
                  <option value="">All Fulfillment Statuses</option>
                  <option value="CONFIRMED">Order Confirmed</option>
                  <option value="PROCESSING">Processing / Handcrafting</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="card-pastel p-6 bg-white/95 rounded-3xl border border-pastel-pink space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-pastel-pink/50 gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-brand-burgundy/70 uppercase">
                          Placed {new Date(ord.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-brand-burgundy">
                          #{ord.order_number}
                        </h3>
                        <p className="text-xs text-brand-chocolate/80">
                          Customer: <strong>{ord.shipping_name}</strong> ({ord.guest_email || ord.shipping_phone})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            ord.payment_status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.payment_status}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy">
                          {ord.fulfillment_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Order Details & Courier Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-brand-chocolate">
                      <div>
                        <h4 className="font-semibold text-brand-burgundy mb-1">Items In Shipment:</h4>
                        {ord.items?.map((it) => (
                          <p key={it.id} className="leading-relaxed">
                            {it.quantity}x {it.product_name} {it.variant_name ? `(${it.variant_name})` : ''} - ₹{it.total_price}
                          </p>
                        ))}
                        <strong className="text-brand-burgundy block mt-2">
                          Total Amount: ₹{ord.total_amount}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-pastel-cream/50 border border-pastel-pink/50 space-y-1">
                        <h4 className="font-semibold text-brand-burgundy">Shipping Destination & Courier:</h4>
                        <p>{ord.shipping_address_line1}, {ord.shipping_city}, {ord.shipping_state} {ord.shipping_postal_code}</p>
                        <p className="pt-1">
                          Courier Partner: <strong>{ord.courier_name || 'Not assigned'}</strong>
                        </p>
                        <p>
                          Tracking ID / AWB: <strong className="font-mono">{ord.tracking_number || 'Pending'}</strong>
                        </p>
                        {ord.estimated_delivery_date && (
                          <p>
                            Estimated Delivery: <strong>{ord.estimated_delivery_date}</strong>
                          </p>
                        )}
                        {ord.tracking_url && (
                          <a
                            href={ord.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-burgundy underline font-medium pt-1"
                          >
                            <span>Customer Courier Tracking Link</span>
                            <ExternalLink className="w-3 h-3" />
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
                        className="btn-primary text-xs px-4 py-2 gap-1.5 shadow-pastel"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Update Order Status & Tracking ID</span>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="card-pastel p-8 text-center text-xs text-brand-chocolate/60 bg-white">
                    No customer orders found matching your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE MEET WORKSHOPS MANAGEMENT */}
          {activeTab === 'workshops' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-pastel-pink/60">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-brand-burgundy">
                    Google Meet Workshops Management
                  </h1>
                  <span className="text-xs text-brand-chocolate/70">
                    Publish live Google Meet session links, descriptions, dates, and optional registrations directly to the website
                  </span>
                </div>
                <button
                  onClick={handleOpenAddWorkshop}
                  className="btn-primary text-xs px-4 py-2.5 gap-1.5 self-start sm:self-auto shadow-pastel"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Workshop</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workshops.map((ws) => (
                  <div
                    key={ws.id}
                    className="card-pastel p-6 bg-white/95 rounded-3xl border border-pastel-pink shadow-pastel flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            ws.is_published
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ws.is_published ? '● Published on Website' : 'Draft / Unpublished'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditWorkshop(ws)}
                            className="p-1.5 rounded-lg text-brand-burgundy hover:bg-pastel-pink/50"
                            title="Edit Workshop"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteWorkshopConfirm(ws)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete Workshop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-brand-burgundy">
                        {ws.title}
                      </h3>

                      <p className="text-xs text-brand-chocolate/80 leading-relaxed">
                        {ws.description}
                      </p>

                      <div className="p-3 rounded-xl bg-pastel-cream/70 border border-pastel-pink/50 text-xs space-y-1">
                        <p className="flex items-center gap-1.5 text-brand-chocolate/80">
                          <Calendar className="w-3.5 h-3.5 text-brand-burgundy" />
                          <span>Date: <strong>{ws.date}</strong> at <strong>{ws.time?.slice(0, 5)}</strong></span>
                        </p>
                        <p className="truncate text-brand-burgundy font-medium flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Meet Link: {ws.google_meet_url}</span>
                        </p>
                        {ws.registration_link && (
                          <p className="text-[11px] text-brand-chocolate/60 truncate">
                            Registration: {ws.registration_link}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-pastel-pink/50">
                      <a
                        href={ws.google_meet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs px-3 py-1.5 gap-1.5 flex-1 justify-center"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Test Google Meet Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}

                {workshops.length === 0 && (
                  <div className="col-span-2 card-pastel p-10 text-center text-xs text-brand-chocolate/60 bg-white">
                    No Google Meet workshops created yet. Click "Publish New Workshop" to schedule one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOM COMMISSIONS */}
          {activeTab === 'customizations' && (
            <div className="space-y-6 animate-in fade-in">
              <h1 className="font-heading text-2xl font-bold text-brand-burgundy pb-2 border-b border-pastel-pink/60">
                Custom Crochet Commissions & Quotes
              </h1>

              <div className="space-y-4">
                {customRequests.map((req) => (
                  <div key={req.id} className="card-pastel p-6 bg-white/95 rounded-3xl border border-pastel-pink space-y-4">
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
                        <p className="text-[11px] text-brand-chocolate/60">
                          Production: {req.quote.estimated_production_days} days | Accepted: {req.quote.is_accepted ? 'Yes' : 'No'}
                        </p>
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
            </div>
          )}

          {/* TAB 7: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-pastel-pink/60">
                <h1 className="font-heading text-2xl font-bold text-brand-burgundy">
                  Promotional Coupons
                </h1>
                <button
                  onClick={() => setCouponModalOpen(true)}
                  className="btn-primary text-xs px-4 py-2 gap-1.5 shadow-pastel"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coupons.map((c) => (
                  <div key={c.id} className="card-pastel p-6 bg-white/95 rounded-3xl border border-pastel-pink space-y-2">
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
                      Min Order: ₹{c.min_order_amount} • Times Used: {c.times_used}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- ALL MODALS & DIALOGS --- */}

      {/* 1. PRODUCT ADD / EDIT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="card-pastel p-6 sm:p-8 bg-white max-w-3xl w-full my-8 space-y-6 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pastel-pink/60">
              <h3 className="font-heading text-xl font-bold text-brand-burgundy">
                {editingProduct ? `Edit Creation: ${editingProduct.name}` : 'Add New Handcrafted Creation'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-lg hover:bg-pastel-pink/30 text-brand-chocolate"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Product Title *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Blossom Bunny Plushie"
                  className="input-pastel text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">SKU Reference *</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                  placeholder="e.g. SIHA-BUNNY-01"
                  className="input-pastel text-xs font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Assign to Category *</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="input-pastel text-xs"
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="899"
                    className="input-pastel text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-chocolate block mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.sale_price}
                    onChange={(e) => setProductForm({ ...productForm, sale_price: e.target.value })}
                    placeholder="799"
                    className="input-pastel text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Short Description</label>
                <input
                  type="text"
                  value={productForm.short_description}
                  onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                  placeholder="One sentence summary for product cards..."
                  className="input-pastel text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Full Story & Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  placeholder="Artisan yarn details, stitching method, inspiration..."
                  className="input-pastel text-xs"
                />
              </div>
            </div>

            {/* Product Images (Multiple Uploads / URLs) */}
            <div className="p-4 rounded-2xl bg-pastel-cream/50 border border-pastel-pink space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-burgundy uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Product Images (Multiple URLs)
                </label>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="text-xs font-semibold text-brand-burgundy hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Image URL
                </button>
              </div>

              <div className="space-y-2">
                {productForm.image_urls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                      placeholder={`https://images.unsplash.com/... (Image ${idx + 1}${idx === 0 ? ' - Primary Cover' : ''})`}
                      className="input-pastel text-xs flex-1"
                    />
                    {productForm.image_urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(idx)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stock & Low-Stock Alert Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Initial Total Stock *</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                  className="input-pastel text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  value={productForm.low_stock_threshold}
                  onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: parseInt(e.target.value) || 5 })}
                  className="input-pastel text-xs"
                />
              </div>
            </div>

            {/* Product Variants Section */}
            <div className="p-4 rounded-2xl bg-pastel-cream/50 border border-pastel-pink space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-brand-burgundy uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Product Variants (Color, Size & Stock)
                  </h4>
                  <span className="text-[11px] text-brand-chocolate/70">
                    Add specific size/color options with individual stock
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="text-xs font-semibold text-brand-burgundy hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Variant
                </button>
              </div>

              {productForm.variants.map((v, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-pastel-pink/60 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center text-xs">
                  <div>
                    <label className="text-[10px] text-brand-chocolate/60 block">Color</label>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                      placeholder="e.g. Pastel Rose"
                      className="input-pastel text-xs py-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-chocolate/60 block">Size</label>
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                      placeholder="e.g. Medium (20cm)"
                      className="input-pastel text-xs py-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-chocolate/60 block">Price Adjust (+/- ₹)</label>
                    <input
                      type="number"
                      value={v.price_adjustment}
                      onChange={(e) => handleVariantChange(idx, 'price_adjustment', parseFloat(e.target.value) || 0)}
                      className="input-pastel text-xs py-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-chocolate/60 block">Variant Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value) || 0)}
                      className="input-pastel text-xs py-1"
                    />
                  </div>
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Visibility Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-brand-chocolate">
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                  className="rounded text-brand-burgundy"
                />
                <span>Active & Published on Website</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-brand-chocolate">
                <input
                  type="checkbox"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  className="rounded text-brand-burgundy"
                />
                <span>Feature on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-brand-chocolate">
                <input
                  type="checkbox"
                  checked={productForm.is_ready_stock}
                  onChange={(e) => setProductForm({ ...productForm, is_ready_stock: e.target.checked })}
                  className="rounded text-brand-burgundy"
                />
                <span>Ready to Ship Immediately</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-pastel-pink/60">
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="btn-secondary text-xs px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs px-6 py-2.5 shadow-pastel"
              >
                {editingProduct ? 'Save Product Changes' : 'Create & Publish Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. INVENTORY ADJUSTMENT MODAL */}
      {stockModalOpen && selectedInvProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStock}
            className="card-pastel p-6 sm:p-8 bg-white max-w-lg w-full space-y-4 rounded-3xl shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pastel-pink/60">
              <div>
                <h3 className="font-heading text-lg font-bold text-brand-burgundy">
                  Adjust Inventory Stock
                </h3>
                <span className="text-xs text-brand-chocolate/70">
                  {selectedInvProduct.product_name} ({selectedInvProduct.sku})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStockModalOpen(false)}
                className="p-1 rounded-lg hover:bg-pastel-pink/30"
              >
                <X className="w-5 h-5 text-brand-chocolate" />
              </button>
            </div>

            {/* Current Stock Banner */}
            <div className="p-3 rounded-2xl bg-pastel-cream flex items-center justify-between text-xs">
              <span>Current Stock on Store:</span>
              <strong className="text-sm text-brand-burgundy font-bold">
                {selectedInvProduct.quantity} units
              </strong>
            </div>

            {/* If product has variants, choose target variant */}
            {selectedInvProduct.variants?.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                  Target Product Variant
                </label>
                <select
                  value={stockForm.variant_id}
                  onChange={(e) => setStockForm({ ...stockForm, variant_id: e.target.value })}
                  className="input-pastel text-xs"
                >
                  <option value="">All Variants / Overall Product Stock</option>
                  {selectedInvProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.color} / {v.size} (Current: {v.stock} units)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Adjustment Mode Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStockForm({ ...stockForm, mode: 'delta' })}
                className={`py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                  stockForm.mode === 'delta'
                    ? 'bg-brand-burgundy text-white'
                    : 'bg-white border-pastel-pink text-brand-chocolate'
                }`}
              >
                Add / Subtract (+ / -)
              </button>

              <button
                type="button"
                onClick={() => setStockForm({ ...stockForm, mode: 'exact' })}
                className={`py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                  stockForm.mode === 'exact'
                    ? 'bg-brand-burgundy text-white'
                    : 'bg-white border-pastel-pink text-brand-chocolate'
                }`}
              >
                Set Exact Quantity
              </button>
            </div>

            {stockForm.mode === 'delta' ? (
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                  Quantity Delta (Positive for restock, negative for deduction) *
                </label>
                <input
                  type="number"
                  value={stockForm.quantity_delta}
                  onChange={(e) => setStockForm({ ...stockForm, quantity_delta: parseInt(e.target.value) || 0 })}
                  className="input-pastel text-xs"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                  New Authoritative Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockForm.new_quantity}
                  onChange={(e) => setStockForm({ ...stockForm, new_quantity: parseInt(e.target.value) || 0 })}
                  className="input-pastel text-xs"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Low-Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={stockForm.low_stock_threshold}
                onChange={(e) => setStockForm({ ...stockForm, low_stock_threshold: parseInt(e.target.value) || 5 })}
                className="input-pastel text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Reason for Audit Trail *
              </label>
              <input
                type="text"
                value={stockForm.reason}
                onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                placeholder="e.g. Received fresh batch of 10 from master artisan"
                className="input-pastel text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-pastel-pink/60">
              <button
                type="button"
                onClick={() => setStockModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs shadow-pastel">
                Save & Update Live Availability
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. WORKSHOP ADD / EDIT MODAL (GOOGLE MEET) */}
      {workshopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveWorkshop}
            className="card-pastel p-6 sm:p-8 bg-white max-w-lg w-full space-y-4 rounded-3xl shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pastel-pink/60">
              <h3 className="font-heading text-xl font-bold text-brand-burgundy flex items-center gap-2">
                <Video className="w-5 h-5" />
                <span>{editingWorkshop ? 'Edit Workshop' : 'Publish Google Meet Workshop'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setWorkshopModalOpen(false)}
                className="p-1 rounded-lg hover:bg-pastel-pink/30"
              >
                <X className="w-5 h-5 text-brand-chocolate" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Workshop Title *
              </label>
              <input
                type="text"
                value={workshopForm.title}
                onChange={(e) => setWorkshopForm({ ...workshopForm, title: e.target.value })}
                placeholder="e.g. Mindful Crochet: Sunflower Coasters Workshop"
                className="input-pastel text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Description *
              </label>
              <textarea
                value={workshopForm.description}
                onChange={(e) => setWorkshopForm({ ...workshopForm, description: e.target.value })}
                rows={3}
                placeholder="What participants will learn, required materials, session pace..."
                className="input-pastel text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Google Meet Session URL *
              </label>
              <input
                type="url"
                value={workshopForm.google_meet_url}
                onChange={(e) => setWorkshopForm({ ...workshopForm, google_meet_url: e.target.value })}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="input-pastel text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                  Workshop Date *
                </label>
                <input
                  type="date"
                  value={workshopForm.date}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, date: e.target.value })}
                  className="input-pastel text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                  Workshop Time *
                </label>
                <input
                  type="time"
                  value={workshopForm.time}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, time: e.target.value })}
                  className="input-pastel text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Optional Registration Link
              </label>
              <input
                type="url"
                value={workshopForm.registration_link}
                onChange={(e) => setWorkshopForm({ ...workshopForm, registration_link: e.target.value })}
                placeholder="https://forms.google.com/... (optional)"
                className="input-pastel text-xs"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-chocolate">
                <input
                  type="checkbox"
                  checked={workshopForm.is_published}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, is_published: e.target.checked })}
                  className="rounded text-brand-burgundy"
                />
                <span>Publish on Website (Only published workshops are visible to visitors)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-pastel-pink/60">
              <button
                type="button"
                onClick={() => setWorkshopModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs shadow-pastel">
                {editingWorkshop ? 'Save Changes' : 'Publish Workshop Link'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. ORDER FULFILLMENT & TRACKING MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveFulfillment}
            className="card-pastel p-6 sm:p-8 bg-white max-w-lg w-full space-y-4 rounded-3xl shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pastel-pink/60">
              <div>
                <h3 className="font-heading text-lg font-bold text-brand-burgundy">
                  Update Shipment for #{editingOrder.order_number}
                </h3>
                <span className="text-xs text-brand-chocolate/70">
                  Recipient: {editingOrder.shipping_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-lg hover:bg-pastel-pink/30"
              >
                <X className="w-5 h-5 text-brand-chocolate" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Fulfillment Status *
              </label>
              <select
                value={fulfillmentForm.fulfillment_status}
                onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, fulfillment_status: e.target.value })}
                className="input-pastel text-xs font-semibold"
              >
                <option value="CONFIRMED">Order Confirmed</option>
                <option value="PROCESSING">Processing / Artisan Crafting</option>
                <option value="SHIPPED">Shipped (Handed to Courier)</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered with Love</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                  Courier Partner
                </label>
                <input
                  type="text"
                  value={fulfillmentForm.courier_name}
                  onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, courier_name: e.target.value })}
                  placeholder="Blue Dart / DTDC / Delhivery"
                  className="input-pastel text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                  Tracking ID / AWB Number
                </label>
                <input
                  type="text"
                  value={fulfillmentForm.tracking_number}
                  onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, tracking_number: e.target.value })}
                  placeholder="AWB12345678"
                  className="input-pastel text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Official Tracking URL
              </label>
              <input
                type="url"
                value={fulfillmentForm.tracking_url}
                onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, tracking_url: e.target.value })}
                placeholder="https://track.bluedart.com/awb=..."
                className="input-pastel text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={fulfillmentForm.estimated_delivery_date}
                onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, estimated_delivery_date: e.target.value })}
                className="input-pastel text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">
                Audit Log Timeline Message
              </label>
              <input
                type="text"
                value={fulfillmentForm.status_notes}
                onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, status_notes: e.target.value })}
                placeholder="e.g. Package dispatched via Blue Dart Express"
                className="input-pastel text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-pastel-pink/60">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs shadow-pastel">
                Save Tracking Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteProductConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-pastel p-6 sm:p-8 bg-white max-w-md w-full space-y-4 rounded-3xl shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-heading text-lg font-bold text-brand-burgundy">
                Confirm Product Deletion
              </h3>
              <p className="text-xs text-brand-chocolate/80">
                Are you sure you want to delete <strong>"{deleteProductConfirm.name}"</strong> ({deleteProductConfirm.sku})?
              </p>
              <p className="text-[11px] text-brand-chocolate/60">
                If the product has past order records, it will be safely deactivated to protect order history.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteProductConfirm(null)}
                className="btn-secondary text-xs flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="btn-primary text-xs flex-1 bg-rose-700 hover:bg-rose-800"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE WORKSHOP CONFIRMATION MODAL */}
      {deleteWorkshopConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-pastel p-6 sm:p-8 bg-white max-w-md w-full space-y-4 rounded-3xl shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-heading text-lg font-bold text-brand-burgundy">
                Delete Workshop
              </h3>
              <p className="text-xs text-brand-chocolate/80">
                Are you sure you want to delete <strong>"{deleteWorkshopConfirm.title}"</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteWorkshopConfirm(null)}
                className="btn-secondary text-xs flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWorkshop}
                className="btn-primary text-xs flex-1 bg-rose-700 hover:bg-rose-800"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CUSTOM REQUEST QUOTE MODAL */}
      {quotingRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSendQuote}
            className="card-pastel p-6 sm:p-8 bg-white max-w-md w-full space-y-4 rounded-3xl shadow-2xl"
          >
            <h3 className="font-heading text-xl font-bold text-brand-burgundy">
              Quotation for #{quotingRequest.request_number}
            </h3>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Quote Amount (₹) *</label>
              <input
                type="number"
                value={quoteForm.quote_amount}
                onChange={(e) => setQuoteForm({ ...quoteForm, quote_amount: e.target.value })}
                className="input-pastel text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Production Time (Days) *</label>
              <input
                type="number"
                value={quoteForm.estimated_production_days}
                onChange={(e) => setQuoteForm({ ...quoteForm, estimated_production_days: parseInt(e.target.value) || 7 })}
                className="input-pastel text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Quotation Specifications *</label>
              <textarea
                value={quoteForm.quote_details}
                onChange={(e) => setQuoteForm({ ...quoteForm, quote_details: e.target.value })}
                rows={3}
                className="input-pastel text-xs"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
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

      {/* 8. CREATE COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="card-pastel p-6 sm:p-8 bg-white max-w-md w-full space-y-4 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-pastel-pink/60">
              <h3 className="font-heading text-lg font-bold text-brand-burgundy">Create Promo Coupon</h3>
              <button type="button" onClick={() => setCouponModalOpen(false)}>
                <X className="w-5 h-5 text-brand-chocolate" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Coupon Code *</label>
              <input
                type="text"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="PROMO10"
                className="input-pastel text-xs font-mono uppercase"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Type</label>
                <select
                  value={couponForm.discount_type}
                  onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                  className="input-pastel text-xs"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Discount Value</label>
                <input
                  type="number"
                  value={couponForm.discount_value}
                  onChange={(e) => setCouponForm({ ...couponForm, discount_value: parseFloat(e.target.value) || 0 })}
                  className="input-pastel text-xs"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                value={couponForm.min_order_amount}
                onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: parseFloat(e.target.value) || 0 })}
                className="input-pastel text-xs"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setCouponModalOpen(false)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs">
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
