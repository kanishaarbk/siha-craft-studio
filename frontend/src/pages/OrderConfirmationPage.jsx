import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      api.get(`/orders/detail/${orderNumber}/`)
        .then((res) => setOrder(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-8 text-center">
      
      {/* Celebration Icon */}
      <div className="w-20 h-20 rounded-full bg-pastel-sage text-emerald-800 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-pastel animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">
          Payment Successfully Verified
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Thank You for Supporting Slow Handcraft!
        </h1>
        <p className="text-sm text-brand-chocolate/80 max-w-md mx-auto">
          Your order has been recorded in our atelier ledger. Our artisans will carefully prepare, pack, and dispatch your handmade treasures.
        </p>
      </div>

      {/* Order Summary Box */}
      <div className="card-pastel p-6 sm:p-8 text-left bg-white/95 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pastel-pink/60 gap-2">
          <div>
            <span className="text-xs text-brand-chocolate/60">Order Reference</span>
            <p className="font-heading text-xl font-bold text-brand-burgundy">
              #{orderNumber}
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-brand-chocolate/60">Status</span>
            <p className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full w-fit sm:ml-auto mt-0.5">
              Confirmed & Paid
            </p>
          </div>
        </div>

        {order && (
          <div className="space-y-4 text-xs text-brand-chocolate">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-brand-burgundy mb-1">Shipping Destination:</h4>
                <p>{order.shipping_name}</p>
                <p>{order.shipping_address_line1}</p>
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                <p>Phone: {order.shipping_phone}</p>
              </div>
              <div>
                <h4 className="font-semibold text-brand-burgundy mb-1">Total Paid:</h4>
                <p className="font-heading text-lg font-bold text-brand-burgundy">₹{order.total_amount}</p>
                <p className="text-brand-chocolate/60 mt-1">Payment via Razorpay Test/Live Gateway</p>
              </div>
            </div>

            {/* Ordered items preview */}
            <div className="pt-4 border-t border-pastel-pink/50 space-y-2">
              <h4 className="font-semibold text-brand-burgundy">Ordered Items:</h4>
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.product_name} {item.variant_name ? `(${item.variant_name})` : ''}</span>
                  <span className="font-medium text-brand-burgundy">₹{item.total_price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <Link
            to={`/order-tracking?order=${orderNumber}`}
            className="btn-primary text-xs flex-1 gap-2 justify-center"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order & Courier Details</span>
          </Link>
          <Link
            to="/shop"
            className="btn-secondary text-xs flex-1 justify-center"
          >
            Continue Exploring
          </Link>
        </div>
      </div>
    </div>
  );
}
