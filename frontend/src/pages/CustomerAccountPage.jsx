import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, Video, Sparkles, Heart, MapPin, ExternalLink, Download, Check, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CustomerAccountPage() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const toast = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [classBookings, setClassBookings] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
  });

  // New Address form
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/account');
      return;
    }

    const loadAccountData = async () => {
      setLoading(true);
      try {
        const [ordersRes, classesRes, customRes, wishlistRes, addrRes] = await Promise.all([
          api.get('/orders/my-orders/'),
          api.get('/classes/user/my-bookings/'),
          api.get('/customizations/my-requests/'),
          api.get('/wishlist/'),
          api.get('/auth/addresses/'),
        ]);

        setOrders(ordersRes.data || []);
        setClassBookings(classesRes.data || []);
        setCustomRequests(customRes.data || []);
        setWishlist(wishlistRes.data || []);
        setAddresses(addrRes.data || []);
      } catch (err) {
        console.error('Error loading customer records:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, [isAuthenticated, navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(profileForm);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/addresses/', newAddress);
      setAddresses([...addresses, res.data]);
      setShowAddressForm(false);
      setNewAddress({ full_name: '', phone_number: '', address_line1: '', address_line2: '', city: 'Bengaluru', state: 'Karnataka', postal_code: '' });
      toast.success('Address saved.');
    } catch (err) {
      toast.error('Could not save address.');
    }
  };

  const handleAcceptQuote = async (requestId) => {
    try {
      const res = await api.post(`/customizations/${requestId}/accept-quote/`);
      toast.success('Quotation accepted! Redirecting to checkout for custom piece...');
      navigate(`/order-confirmation/${res.data.order_number}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not accept quote.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-pastel-cream border border-pastel-pink/70 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pastel-pink text-brand-burgundy flex items-center justify-center font-heading font-bold text-xl border border-pastel-pink">
            {user?.first_name ? user.first_name[0] : 'S'}
          </div>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-brand-burgundy">
              Welcome, {user?.first_name || 'Artisan Collector'}!
            </h1>
            <p className="text-xs text-brand-chocolate/70">
              {user?.email} • Customer Portal
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn-secondary text-xs px-4 py-2 gap-1.5 self-end sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-pastel-pink/60">
        {[
          { key: 'orders', label: `My Orders (${orders.length})`, icon: Package },
          { key: 'classes', label: `My Crochet Classes (${classBookings.length})`, icon: Video },
          { key: 'custom', label: `Custom Orders (${customRequests.length})`, icon: Sparkles },
          { key: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
          { key: 'profile', label: 'Profile & Addresses', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSearchParams({ tab: tab.key })}
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

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((ord) => (
              <div key={ord.id} className="card-pastel p-6 bg-white/95 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-pastel-pink/50 gap-2">
                  <div>
                    <span className="text-[11px] text-brand-chocolate/60">Order Reference</span>
                    <h3 className="font-heading text-lg font-bold text-brand-burgundy">
                      #{ord.order_number}
                    </h3>
                    <span className="text-xs text-brand-chocolate/70">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      ord.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Payment: {ord.payment_status}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy">
                      {ord.fulfillment_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {ord.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-brand-chocolate">
                      <span>{item.quantity}x {item.product_name} {item.variant_name ? `(${item.variant_name})` : ''}</span>
                      <span className="font-semibold text-brand-burgundy">₹{item.total_price}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-pastel-pink/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-brand-chocolate/70">Total Amount: </span>
                    <strong className="text-sm font-bold text-brand-burgundy">₹{ord.total_amount}</strong>
                    {ord.courier_name && (
                      <span className="ml-3 text-[11px] text-brand-chocolate/80">
                        Courier: <strong>{ord.courier_name}</strong> {ord.tracking_number ? `(${ord.tracking_number})` : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {ord.tracking_url && (
                      <a
                        href={ord.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
                      >
                        <span>Courier Tracking</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Link
                      to={`/order-tracking?order=${ord.order_number}`}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      Status Timeline
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/70 border border-pastel-pink space-y-4">
              <Package className="w-12 h-12 text-brand-burgundy/40 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-brand-burgundy">No Orders Placed Yet</h3>
              <p className="text-xs text-brand-chocolate/70">Your future handcrafted treasures will appear here.</p>
              <Link to="/shop" className="btn-primary text-xs">Explore Shop</Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY CLASSES */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {classBookings.length > 0 ? (
            classBookings.map((b) => (
              <div key={b.id} className="card-pastel p-6 bg-white/95 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-pastel-pink/50 gap-2">
                  <div>
                    <span className="text-[11px] text-brand-chocolate/60">Booking #{b.booking_reference}</span>
                    <h3 className="font-heading text-xl font-bold text-brand-burgundy">{b.class_title}</h3>
                    <p className="text-xs text-brand-chocolate/75">
                      Instructor: {b.instructor_name} • Fee: ₹{b.amount_paid}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                    {b.booking_status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-pastel-cream/70 border border-pastel-pink/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-brand-chocolate/60 block">Live Session Date & Time:</span>
                    <strong className="text-sm text-brand-burgundy">
                      {new Date(b.start_time).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(b.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                  </div>

                  {/* Google Meet Link Button */}
                  {b.google_meet_link ? (
                    <a
                      href={b.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs px-5 py-2.5 gap-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Live on Google Meet</span>
                    </a>
                  ) : (
                    <span className="text-xs text-brand-chocolate/60 italic">
                      Meeting link will activate prior to class.
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <Link
                    to={`/classes/${b.class_slug}/resources`}
                    className="text-brand-burgundy font-bold hover:underline flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Class Pattern & Stitch Guides
                  </Link>
                  <Link to={`/classes/${b.class_slug}`} className="text-brand-chocolate/70 hover:text-brand-burgundy">
                    View Syllabus Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/70 border border-pastel-pink space-y-4">
              <Video className="w-12 h-12 text-brand-burgundy/40 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-brand-burgundy">No Class Enrollments Yet</h3>
              <p className="text-xs text-brand-chocolate/70">Join our upcoming live crochet workshops held over Google Meet.</p>
              <Link to="/classes" className="btn-primary text-xs">Browse Workshops</Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOM REQUESTS */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {customRequests.length > 0 ? (
            customRequests.map((req) => {
              const quote = req.quote;
              return (
                <div key={req.id} className="card-pastel p-6 bg-white/95 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-pastel-pink/50 gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-brand-chocolate/60">#{req.request_number}</span>
                      <h3 className="font-heading text-lg font-bold text-brand-burgundy">{req.title}</h3>
                      <span className="text-xs text-brand-chocolate/70">
                        Category: {req.category_display} • Qty: {req.quantity}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy self-start sm:self-auto">
                      {req.status_display}
                    </span>
                  </div>

                  <p className="text-xs text-brand-chocolate/80 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Quotation Details (if sent by admin) */}
                  {quote && (
                    <div className="p-5 rounded-2xl bg-pastel-peach/40 border border-pastel-pink space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-burgundy uppercase tracking-wider">
                          Artisan Quotation
                        </span>
                        <span className="font-heading text-xl font-bold text-brand-burgundy">
                          ₹{quote.quote_amount}
                        </span>
                      </div>
                      <p className="text-xs text-brand-chocolate/85">{quote.quote_details}</p>
                      <p className="text-[11px] text-brand-chocolate/60">
                        Estimated Handcrafting Time: <strong>{quote.estimated_production_days} days</strong>
                      </p>

                      {!quote.is_accepted ? (
                        <div className="pt-2">
                          <button
                            onClick={() => handleAcceptQuote(req.id)}
                            className="btn-primary text-xs gap-1.5"
                          >
                            <span>Accept Quote & Proceed to Order</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          Quote Accepted • Order In Progress
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/70 border border-pastel-pink space-y-4">
              <Sparkles className="w-12 h-12 text-brand-burgundy/40 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-brand-burgundy">No Custom Commissions Yet</h3>
              <p className="text-xs text-brand-chocolate/70">Have a unique crochet dream? Share your idea and get an artisan quote.</p>
              <Link to="/custom-orders" className="btn-primary text-xs">Request Customization</Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item.id} className="card-pastel p-4 flex gap-4 items-center bg-white/95">
                  <img
                    src={item.product?.primary_image_url || '/images/siha-logo.png'}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover bg-pastel-peach/30 border border-pastel-pink shrink-0"
                  />
                  <div className="flex-1 truncate">
                    <h4 className="font-heading font-bold text-sm text-brand-burgundy truncate">
                      {item.product?.name}
                    </h4>
                    <span className="text-xs font-bold text-brand-burgundy block mt-0.5">
                      ₹{item.product?.current_price || item.product?.price}
                    </span>
                    <Link
                      to={`/product/${item.product?.slug || item.product?.id}`}
                      className="text-[11px] text-brand-burgundy font-medium underline mt-1 block"
                    >
                      View Piece
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/70 border border-pastel-pink space-y-4">
              <Heart className="w-12 h-12 text-brand-burgundy/40 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-brand-burgundy">Your Wishlist is Empty</h3>
              <p className="text-xs text-brand-chocolate/70">Tap the heart on any handmade creation to save it for later.</p>
              <Link to="/shop" className="btn-primary text-xs">Browse Boutique</Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE & ADDRESSES */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Profile Details Form */}
          <form onSubmit={handleProfileSubmit} className="card-pastel p-6 sm:p-8 space-y-4 bg-white/95">
            <h3 className="font-heading text-xl font-bold text-brand-burgundy pb-3 border-b border-pastel-pink/60">
              Personal Profile
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">First Name</label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="input-pastel text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-chocolate block mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="input-pastel text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-pastel text-xs bg-gray-50 opacity-70"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Contact Phone</label>
              <input
                type="tel"
                value={profileForm.phone_number}
                onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                className="input-pastel text-xs"
              />
            </div>
            <button type="submit" className="btn-primary text-xs">
              Save Profile Details
            </button>
          </form>

          {/* Saved Addresses */}
          <div className="card-pastel p-6 sm:p-8 space-y-4 bg-white/95">
            <div className="flex items-center justify-between pb-3 border-b border-pastel-pink/60">
              <h3 className="font-heading text-xl font-bold text-brand-burgundy">Saved Addresses</h3>
              <button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                {showAddressForm ? 'Cancel' : '+ New Address'}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="space-y-3 p-4 rounded-2xl bg-pastel-cream/70 border border-pastel-pink">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={newAddress.full_name}
                  onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                  className="input-pastel text-xs py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newAddress.phone_number}
                  onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                  className="input-pastel text-xs py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Street Address Line 1"
                  value={newAddress.address_line1}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                  className="input-pastel text-xs py-2"
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="input-pastel text-xs py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="input-pastel text-xs py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                    className="input-pastel text-xs py-2"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary text-xs w-full py-2">
                  Save Address
                </button>
              </form>
            )}

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-3 rounded-xl bg-pastel-cream/50 border border-pastel-pink/60 text-xs text-brand-chocolate">
                  <strong className="block text-brand-burgundy">{addr.full_name}</strong>
                  <p>{addr.address_line1}</p>
                  <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                  <p>Phone: {addr.phone_number}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
