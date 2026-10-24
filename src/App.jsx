import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ADMIN_BASE_PATH } from './constants/adminRoutes';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ParticleBackground from './components/ParticleBackground';
import FloatingDiscordButton from './components/FloatingDiscordButton';

// Pages
import Home from './pages/Home';
import Store from './pages/Store';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Keys from './pages/Keys';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refunds from './pages/Refunds';
import DiscordVerify from './pages/DiscordVerify';
import ThankYou from './pages/ThankYou';
import PaymentFailed from './pages/PaymentFailed';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDiscordVerification from './pages/admin/AdminDiscordVerification';
import AdminStock from './pages/admin/AdminStock';

function AppLayout() {
  const location = useLocation();
  const isDashboardOrAdmin =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/topup') ||
    location.pathname.startsWith(ADMIN_BASE_PATH);

  return (
    <div className="min-h-screen flex flex-col bg-[#06080F]/85 text-[#F8FAFC] relative">
      <ParticleBackground />
      {!isDashboardOrAdmin && <Navbar />}
      <CartDrawer />

      <div className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/products" element={<Store />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/discord/callback" element={<AuthCallback />} />
          <Route path="/auth/google/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/topup" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/keys" element={<Keys />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/discord/verify" element={<DiscordVerify />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* Protected Admin Suite with Secret URL */}
          <Route path={ADMIN_BASE_PATH} element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="discord" element={<AdminDiscordVerification />} />
            <Route path="stock" element={<AdminStock />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </div>

      {!isDashboardOrAdmin && <FloatingDiscordButton />}
      {!isDashboardOrAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
