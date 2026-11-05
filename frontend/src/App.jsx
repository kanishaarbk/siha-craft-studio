import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingSocials from './components/FloatingSocials';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ClassesPage from './pages/ClassesPage';
import ClassDetailPage from './pages/ClassDetailPage';
import CustomOrderPage from './pages/CustomOrderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import CookiePreferencesPage from './pages/CookiePreferencesPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import PasswordResetPage from './pages/PasswordResetPage';
import CustomerAccountPage from './pages/CustomerAccountPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-pastel-cream text-brand-chocolate">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            {/* Smooth redirect for deprecated categories route */}
            <Route path="/categories" element={<Navigate to="/shop" replace />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
            <Route path="/order-tracking" element={<OrderTrackingPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/classes/:slug" element={<ClassDetailPage />} />
            <Route path="/custom-orders" element={<CustomOrderPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/cookie-preferences" element={<CookiePreferencesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
            
            {/* Customer Account Routes */}
            <Route path="/account" element={<CustomerAccountPage />} />
            <Route path="/account/orders" element={<CustomerAccountPage />} />
            <Route path="/account/classes" element={<CustomerAccountPage />} />
            <Route path="/account/custom-requests" element={<CustomerAccountPage />} />
            <Route path="/account/wishlist" element={<CustomerAccountPage />} />

            {/* Admin Management Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Routes>
        </main>
        <FloatingSocials />
        <Footer />
      </div>
    </Router>
  );
}
