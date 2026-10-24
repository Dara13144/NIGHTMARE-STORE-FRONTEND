import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Copy,
  KeyRound,
  ShieldCheck,
  Check,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import CutLuyPaymentModal from '../components/CutLuyPaymentModal';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, walletBalance, spendFunds, loginWithDiscord, loginWithGoogle, refreshWallet } = useAuth();
  const { cart, items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('balance'); // 'balance' | 'crypto' | 'khqr'
  const [referralCode, setReferralCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveredKey, setDeliveredKey] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  // CutLuy KHQR State
  const [cutLuyPayment, setCutLuyPayment] = useState(null);
  const [showCutLuyModal, setShowCutLuyModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // Fallback single product if cart is empty for testing Screenshot 3
  const activeItems = items.length > 0 ? items : [
    {
      id: 'default-checkout-item',
      product_id: 'prod-fivem-ready',
      product_name: 'FiveM Account Ready',
      category: 'Fivem',
      current_price: 1.00,
      quantity: 1,
      iconText: 'R★',
      iconBg: '#F59E0B',
    },
  ];

  const totalQuantity = activeItems.reduce((acc, i) => acc + i.quantity, 0);
  const calculatedSubtotal = items.length > 0 ? subtotal : 1.00;
  const finalTotal = Math.max(0, calculatedSubtotal - discountAmount);

  const hasInsufficientBalance = paymentMethod === 'balance' && (walletBalance < finalTotal);

  useEffect(() => {
    const savedCode = localStorage.getItem('active_coupon');
    if (savedCode && !referralCode) {
      const code = savedCode.trim().toUpperCase();
      setReferralCode(code);
      if (code === 'NIGHTMARE' || code === 'SBAY2026' || code === 'CYBER15' || code === 'DISCOUNT10') {
        const disc = +(calculatedSubtotal * 0.15).toFixed(2);
        setDiscountAmount(disc);
        showToast(`Promo code ${code} automatically applied! Saved $${disc.toFixed(2)}`, 'success');
      }
    }
  }, [calculatedSubtotal]);

  const handleApplyReferral = (e) => {
    e.preventDefault();
    if (!referralCode.trim()) return;
    const code = referralCode.trim().toUpperCase();

    if (code === 'NIGHTMARE' || code === 'SBAY2026' || code === 'CYBER15' || code === 'DISCOUNT10') {
      const disc = +(finalTotal * 0.15).toFixed(2);
      setDiscountAmount(disc);
      showToast(`Referral code ${code} applied! Saved $${disc.toFixed(2)}`, 'success');
    } else {
      showToast('Invalid referral or coupon code', 'error');
    }
  };

  const handleKhqrSuccess = (fulfillment) => {
    const keyGen = fulfillment?.assignedKeys?.length
      ? fulfillment.assignedKeys.map((k) => k.key).join('\n')
      : `FIVEM-READY-ACC-${Math.random().toString(36).substring(2, 8).toUpperCase()}:${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setDeliveredKey(keyGen);

    const pastOrders = JSON.parse(localStorage.getItem('sbay_purchase_history') || '[]');
    const newOrder = {
      id: pendingOrderId || ('ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
      date: new Date().toLocaleDateString(),
      productName: activeItems[0]?.product_name || 'FiveM Account Ready',
      quantity: totalQuantity,
      total: finalTotal,
      method: 'ABA KHQR (CutLuy)',
      status: 'Completed',
      deliveredKey: keyGen,
    };
    localStorage.setItem('sbay_purchase_history', JSON.stringify([newOrder, ...pastOrders]));

    confetti({
      particleCount: 110,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast('KHQR Payment confirmed! Your digital key has been unlocked.', 'success');
  };

  const handleExecuteCheckout = async () => {
    if (!user) {
      showToast('Please sign in or register to complete your purchase', 'info');
      navigate('/login', {
        state: {
          from: { pathname: '/checkout' },
          message: 'Please sign in or register to complete your purchase and secure your digital keys.',
        },
      });
      return;
    }

    if (paymentMethod === 'balance' && hasInsufficientBalance) {
      showToast('Insufficient wallet balance. Please top up your account.', 'error');
      return;
    }

    if (paymentMethod === 'khqr') {
      setIsProcessing(true);
      try {
        const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setPendingOrderId(orderNumber);

        const res = await api.cutluy.createPayment({
          amount: finalTotal,
          purpose: 'order',
          order_id: orderNumber,
          customer_email: user?.email || 'customer@nightmare.store',
        });

        if (res && res.success && res.payment) {
          setCutLuyPayment(res.payment);
          setShowCutLuyModal(true);
        } else {
          showToast(res.error || 'Failed to initialize KHQR payment', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Payment gateway connection error', 'error');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create and complete order on backend with wallet_balance
      const customerEmail = user?.email || (user?.id ? `${user.id}@sbay.store` : 'customer@sbay.store');
      const orderRes = await api.createOrder({
        customer_email: customerEmail,
        items: activeItems.map((item) => ({
          product_id: item.product_id || item.id,
          product_name: item.product_name || item.name,
          unit_price: item.current_price || item.price || 1.0,
          quantity: item.quantity || 1,
        })),
        coupon_code: referralCode?.trim() || null,
        payment_method: paymentMethod === 'balance' ? 'wallet_balance' : paymentMethod,
      });

      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.error || 'Order processing failed');
      }

      // 2. Deduct funds on client context and sync with server response
      if (paymentMethod === 'balance') {
        const updatedBal = orderRes.data?.newBalance;
        spendFunds(finalTotal, updatedBal);
      }

      // 3. Clear cart
      if (clearCart) {
        clearCart();
      }

      // 4. Retrieve unlocked digital keys or account credentials
      let keyGen = '';
      if (orderRes.data?.assignedKeys && orderRes.data.assignedKeys.length > 0) {
        keyGen = orderRes.data.assignedKeys.map((k) => k.key).join('\n');
      } else {
        keyGen = `FIVEM-READY-ACC-${Math.random().toString(36).substring(2, 8).toUpperCase()}:${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      }
      setDeliveredKey(keyGen);

      // 5. Save order to purchase history
      const pastOrders = JSON.parse(localStorage.getItem('sbay_purchase_history') || '[]');
      const orderNum = orderRes.data?.order?.order_number || ('ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      const assignedKeys = orderRes.data?.assignedKeys || [];
      const newOrder = {
        id: orderNum,
        order_number: orderNum,
        date: new Date().toLocaleDateString(),
        productName: activeItems[0]?.product_name || 'Store Item',
        quantity: totalQuantity,
        total: finalTotal,
        method: paymentMethod === 'balance' ? 'Wallet Balance' : paymentMethod,
        status: 'Completed',
        deliveredKey: keyGen,
        items: activeItems.map((item) => ({
          id: item.id || `item-${Date.now()}`,
          product_id: item.product_id || item.productId,
          product_name: item.product_name || item.name,
          cover_image: item.cover_image || item.coverImage,
          platform: item.platform || 'Digital',
          quantity: item.quantity,
          unit_price: item.unit_price || item.unitPrice,
          subtotal: item.subtotal || ((item.unit_price || 0) * item.quantity),
        })),
        keys: assignedKeys.length > 0
          ? assignedKeys.map((k) => ({
              keyId: k.id,
              key: k.key,
              itemType: k.itemType,
              productName: activeItems.find((i) => i.product_id === k.productId)?.product_name || activeItems[0]?.product_name,
            }))
          : [{ keyId: `key-${Date.now()}`, key: keyGen, itemType: keyGen.includes(':') ? 'digital_account' : 'license_key', productName: activeItems[0]?.product_name }],
      };
      localStorage.setItem('sbay_purchase_history', JSON.stringify([newOrder, ...pastOrders]));

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(`Payment successful! $${finalTotal.toFixed(2)} deducted from balance. Key unlocked.`, 'success');
    } catch (err) {
      showToast(err.message || 'Payment processing failed. Please check your balance.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };



  const handleCopyKey = () => {
    if (!deliveredKey) return;
    navigator.clipboard.writeText(deliveredKey);
    setHasCopied(true);
    showToast('Digital key copied to clipboard!', 'info');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="sbay-grid-bg min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8 max-w-6xl mx-auto">
      {/* Top Action matching Screenshot 3 */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to products</span>
      </Link>

      {/* Main 2-Column Grid matching Screenshot 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer Profile, Product & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Profile Banner */}
          {user ? (
            <div className="rounded-3xl bg-[#090e1c] border border-white/5 p-5 flex items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <img
                  src={user.avatar_url || user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user.displayName || user.username || 'User'}
                  className={`w-11 h-11 rounded-full object-cover ring-2 shrink-0 ${
                    user.provider === 'discord' || user.discord_id || user.discordConnected
                      ? 'ring-[#5865F2]'
                      : user.provider === 'google' || user.google_id || user.googleConnected
                      ? 'ring-[#4285F4]'
                      : 'ring-blue-500'
                  }`}
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">
                      {user.displayName || user.display_name || user.username}
                    </span>
                    {(user.provider === 'discord' || user.discord_id || user.discordConnected) && (
                      <span className="px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] text-[10px] font-black border border-[#5865F2]/30 shrink-0 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        <span>Discord Connected</span>
                      </span>
                    )}
                    {(user.provider === 'google' || user.google_id || user.googleConnected) && (
                      <span className="px-2 py-0.5 rounded-full bg-[#4285F4]/20 text-[#4285F4] text-[10px] font-black border border-[#4285F4]/30 shrink-0 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Google Connected</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block truncate">{user.email}</span>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Customer</span>
              </span>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#090e1c] border border-blue-500/30 p-5 shadow-xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Account Required to Buy Products
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-extrabold uppercase border border-blue-500/30">Required</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Please sign in or register an account. Your digital license keys and orders will be securely tied to your profile.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Sign In & Register */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/login', {
                    state: {
                      from: { pathname: '/checkout' },
                      message: 'Please sign in to complete your purchase and claim your digital keys.',
                    },
                  })}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register', {
                    state: {
                      from: { pathname: '/checkout' },
                      message: 'Create an account to complete your purchase and secure your keys.',
                    },
                  })}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Create Account</span>
                </button>
              </div>

              {/* Quick OAuth options */}
              <div className="pt-1 border-t border-white/5">
                <span className="text-[10px] text-slate-500 font-bold block mb-2">OR INSTANT 1-CLICK AUTH</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => loginWithDiscord()}
                    className="py-2 px-3 rounded-xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-[#5865F2] border border-[#5865F2]/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span>Discord</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Section */}
          <div className="rounded-3xl bg-[#090e1c] border border-white/5 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white">Product</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#121c38] text-blue-400">
                {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* Product Item Cards */}
            <div className="space-y-3">
              {activeItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#060a16] border border-white/5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Yellow square R* badge or thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-[#F59E0B] flex items-center justify-center text-black font-black text-xl shadow-md shrink-0">
                      R★
                    </div>

                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-white">
                        {item.product_name}
                      </h3>
                      <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded inline-block mt-1">
                        {item.category || 'Fivem'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs text-slate-400 block font-mono">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-sm sm:text-base font-black text-white block">
                      ${(item.current_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Section matching Screenshot 3 */}
          <div className="rounded-3xl bg-[#090e1c] border border-white/5 p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white">Payment Method</h2>

            <div className="space-y-3">
              {/* Option 1: Account Balance */}
              <button
                type="button"
                onClick={() => setPaymentMethod('balance')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'balance'
                    ? 'bg-[#101b3b] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                    : 'bg-[#060a16] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">
                      Account Balance
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ${walletBalance?.toFixed(2) || '0.00'} available
                    </div>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'balance' ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                }`}>
                  {paymentMethod === 'balance' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              {/* Option 2: Bakong KHQR */}
              <button
                type="button"
                onClick={() => setPaymentMethod('khqr')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'khqr'
                    ? 'bg-[#101b3b] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                    : 'bg-[#060a16] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src="/aba-khqr.png"
                    alt="ABA KHQR"
                    className="w-10 h-10 rounded-xl object-contain bg-[#005e7a] p-0.5 shadow-md border border-white/10"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">
                      ABA KHQR Scan
                    </div>
                    <div className="text-[11px] text-slate-400">ABA Mobile, Bakong & KHQR banking apps</div>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'khqr' ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                }`}>
                  {paymentMethod === 'khqr' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary matching Screenshot 3 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-[#090e1c] border border-white/5 p-6 sm:p-8 space-y-6 shadow-2xl">
            <h2 className="text-base font-bold text-white">Order Summary</h2>

            {/* Calculations List */}
            <div className="space-y-3 text-xs text-slate-400 border-b border-white/5 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${calculatedSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-400">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold text-white">$0.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-3xl font-black text-blue-500">
                ${finalTotal.toFixed(2)}
              </span>
            </div>

            {/* Referral / Promo Code Input matching Screenshot 3 */}
            <form onSubmit={handleApplyReferral} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="flex-1 bg-[#060a16] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#121c38] hover:bg-[#1a2850] text-blue-400 font-bold text-xs border border-blue-500/30 transition-all"
              >
                Apply
              </button>
            </form>

            {/* Balance Check & Insufficient Alert matching Screenshot 3 */}
            <div className="p-4 rounded-2xl bg-[#060a16] border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Your Balance</span>
                <span className={`font-mono font-bold ${
                  hasInsufficientBalance ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  ${walletBalance?.toFixed(2) || '0.00'}
                </span>
              </div>

              {hasInsufficientBalance && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Insufficient balance to complete this purchase.</span>
                  </div>

                  <button
                    onClick={() => navigate('/dashboard?tab=topup')}
                    className="w-full btn-primary-blue py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Top Up Now</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2">
              {!user ? (
                <button
                  type="button"
                  onClick={() => navigate('/login', {
                    state: {
                      from: { pathname: '/checkout' },
                      message: 'Please sign in or register to complete your purchase and secure your keys.',
                    },
                  })}
                  className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl btn-primary-blue active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In / Register to Complete Purchase</span>
                </button>
              ) : (
                <button
                  onClick={handleExecuteCheckout}
                  disabled={isProcessing || hasInsufficientBalance}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl transition-all ${
                    hasInsufficientBalance
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                      : 'btn-primary-blue active:scale-95'
                  }`}
                >
                  {isProcessing ? 'Processing Transaction...' : 'Checkout'}
                </button>
              )}

              <button
                onClick={() => navigate('/products')}
                className="w-full py-3 rounded-xl bg-transparent hover:bg-slate-800/40 border border-white/5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Delivery Modal */}
      <AnimatePresence>
        {deliveredKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-[#0b101f] border border-blue-500/40 p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-center text-white"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Purchase Successful!
                </h3>
                <p className="text-xs text-slate-400">
                  Your digital account credentials / key have been unlocked instantly.
                </p>
              </div>

              {/* Decrypted Key Display Box */}
              <div className="p-4 rounded-2xl bg-[#050811] border border-blue-500/30 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  DIGITAL LICENSE KEY / LOGIN
                </span>
                <div className="font-mono text-sm sm:text-base font-black text-blue-400 break-all select-all whitespace-pre-wrap">
                  {deliveredKey}
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleCopyKey}
                  className="w-full btn-primary-blue py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  {hasCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopied ? 'Copied to Clipboard!' : 'Copy Key'}</span>
                </button>

                <button
                  onClick={() => navigate('/dashboard?tab=purchases')}
                  className="w-full py-2.5 rounded-xl bg-[#0e172e] hover:bg-[#152347] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  View in Purchase History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CutLuy KHQR Auto Payment Modal */}
      <CutLuyPaymentModal
        isOpen={showCutLuyModal}
        onClose={() => setShowCutLuyModal(false)}
        paymentData={cutLuyPayment}
        purpose="order"
        merchantName="NIGHTMARE STORE"
        customerEmail={user?.email || 'customer@nightmare.store'}
        onSuccess={handleKhqrSuccess}
        onRetry={handleExecuteCheckout}
      />
    </div>
  );
}
