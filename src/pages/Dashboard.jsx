import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  Ticket,
  Package,
  MessageSquare,
  LogOut,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Clock,
  ArrowDownLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  CreditCard,
  Plus,
  Send,
  Lock,
  ShieldAlert,
  Link2,
  Unlink,
  UserCheck,
  RefreshCw,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import CutLuyPaymentModal from '../components/CutLuyPaymentModal';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout, walletBalance, totalDeposited, totalSpent, topUpHistory, depositFunds, spendFunds, refreshWallet, refreshUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const activeTab = searchParams.get('tab') || 'dashboard';
  const setTab = (t) => setSearchParams({ tab: t });

  // Require login/register to view wallet balance and add balance
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', {
        replace: true,
        state: {
          from: {
            pathname: '/dashboard',
            search: activeTab ? `?tab=${activeTab}` : '',
          },
          message: 'Please sign in or create an account to view your balance, add funds, and access your dashboard.',
        },
      });
    }
  }, [loading, user, navigate, activeTab]);

  // Linked Accounts State
  const [linkedAccounts, setLinkedAccounts] = useState({
    google: { connected: false },
    discord: { connected: false },
  });
  const [loadingLinked, setLoadingLinked] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState(null);
  const [showUnlinkModal, setShowUnlinkModal] = useState(null);

  // Top Up State
  const [depositAmount, setDepositAmount] = useState('5.00');
  const [selectedMethod, setSelectedMethod] = useState('bakong');
  const [topUpSubTab, setTopUpSubTab] = useState('balance');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cutLuyPayment, setCutLuyPayment] = useState(null);

  const handlePresetAmount = (val) => {
    setDepositAmount(val);
  };

  const handleStartDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 0.01) {
      showToast('Please enter a valid deposit amount (minimum $0.01 USD)', 'error');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await api.cutluy.topUpWallet(amt);
      if (res && res.success && res.payment) {
        setCutLuyPayment(res.payment);
        setShowQrModal(true);
      } else {
        showToast(res.error || 'Failed to initialize KHQR payment', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Payment gateway connection error', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDepositSuccess = async (fulfillment) => {
    const amt = parseFloat(fulfillment?.creditedAmount || depositAmount);
    depositFunds(amt, 'ABA KHQR (CutLuy)', false);
    if (refreshWallet) await refreshWallet();
    if (refreshUser) await refreshUser();
    showToast(`Payment confirmed! Successfully deposited $${amt.toFixed(2)} to your wallet balance.`, 'success');
  };

  // Orders State & Search Filters
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [viewingKeyModal, setViewingKeyModal] = useState(null);
  const [loadingOrderKeys, setLoadingOrderKeys] = useState(false);
  const [orderKeysData, setOrderKeysData] = useState([]);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState(new Set());

  const toggleReveal = (id) => {
    setRevealedKeyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenKeyModal = async (ord) => {
    setViewingKeyModal(ord);
    setLoadingOrderKeys(true);
    setOrderKeysData([]);

    // 1. If order already contains keys from server or local, use them directly
    if (Array.isArray(ord.keys) && ord.keys.length > 0) {
      setOrderKeysData(ord.keys);
      setLoadingOrderKeys(false);
      return;
    }

    try {
      const res = await api.getOrderKeys(ord.id);
      if (res.success && Array.isArray(res.data?.keys) && res.data.keys.length > 0) {
        setOrderKeysData(res.data.keys);
      } else if (ord.deliveredKey) {
        setOrderKeysData([{ key: ord.deliveredKey, productName: ord.items?.[0]?.product_name || 'Digital Item' }]);
      }
    } catch (err) {
      if (ord.deliveredKey) {
        setOrderKeysData([{ key: ord.deliveredKey, productName: ord.items?.[0]?.product_name || 'Digital Item' }]);
      }
    } finally {
      setLoadingOrderKeys(false);
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoadingOrders(true);
        const localSaved = JSON.parse(localStorage.getItem('sbay_purchase_history') || '[]');
        const res = await api.getOrders().catch(() => null);
        const apiData = res && res.success && res.data ? res.data : [];

        const seenNumbers = new Set();
        const combined = [];

        // Add API orders first
        for (const ord of apiData) {
          const num = ord.order_number || ord.id;
          if (!seenNumbers.has(num)) {
            seenNumbers.add(num);
            combined.push(ord);
          }
        }

        // Add local saved orders if not already in API orders
        for (const item of localSaved) {
          const num = item.order_number || item.id;
          if (!seenNumbers.has(num)) {
            seenNumbers.add(num);
            combined.push({
              id: item.id,
              order_number: item.order_number || item.id,
              created_at: item.date || new Date().toISOString(),
              total_amount: item.total || 0,
              payment_method: item.method || 'Wallet Balance',
              status: item.status || 'completed',
              deliveredKey: item.deliveredKey || 'FIVEM-READY-ACC-99214:8841',
              items: item.items || [{ product_name: item.productName || 'Digital Key Product', quantity: item.quantity || 1 }],
              keys: item.keys || (item.deliveredKey ? [{ key: item.deliveredKey, productName: item.productName || 'Digital Key Product' }] : []),
            });
          }
        }

        setOrders(combined);
      } catch (err) {
        console.warn('Failed to fetch orders:', err.message);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
    if (refreshWallet) refreshWallet();
  }, []);

  const loadLinkedAccounts = async () => {
    try {
      setLoadingLinked(true);
      const res = await api.getLinkedAccounts().catch(() => null);
      if (res && res.success && res.accounts) {
        setLinkedAccounts(res.accounts);
      } else {
        const hasG = Boolean(user?.googleId || user?.googleConnected || user?.provider === 'google');
        const hasD = Boolean(user?.discordId || user?.discordConnected || user?.provider === 'discord');
        setLinkedAccounts({
          google: {
            connected: hasG,
            provider: 'google',
            sub: user?.googleId || (hasG ? 'google-sub-id' : null),
            email: user?.email,
            emailVerified: user?.emailVerified ?? true,
            displayName: user?.displayName || user?.username,
          },
          discord: {
            connected: hasD,
            provider: 'discord',
            id: user?.discordId || (hasD ? '1562068415655714836' : null),
            username: user?.username,
            displayName: user?.displayName || user?.username,
            email: user?.email,
            avatarUrl: user?.avatarUrl,
          },
        });
      }
    } finally {
      setLoadingLinked(false);
    }
  };

  useEffect(() => {
    loadLinkedAccounts();
  }, [user]);

  const handleConnectDiscord = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/discord/callback`;
      const res = await api.getDiscordAuthUrl(redirectUri);
      if (res.success && res.url) {
        const linkUrl = new URL(res.url);
        linkUrl.searchParams.set('state', `link:${user?.id || 'usr'}:${Math.random().toString(36).substring(2, 8)}`);
        window.location.href = linkUrl.toString();
      }
    } catch (err) {
      showToast(err.message || 'Failed to initiate Discord link', 'error');
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const res = await api.getGoogleAuthUrl(redirectUri);
      if (res.success && res.url) {
        const linkUrl = new URL(res.url);
        linkUrl.searchParams.set('state', `link:${user?.id || 'usr'}:${Math.random().toString(36).substring(2, 8)}`);
        window.location.href = linkUrl.toString();
      }
    } catch (err) {
      showToast(err.message || 'Failed to initiate Google link', 'error');
    }
  };

  const handleUnlink = async (provider) => {
    try {
      setUnlinkingProvider(provider);
      const res = await api.unlinkAccount(provider);
      if (res.success) {
        showToast(res.message || `${provider} unlinked successfully`, 'success');
        setShowUnlinkModal(null);
        await loadLinkedAccounts();
        if (typeof refreshUser === 'function') await refreshUser();
      }
    } catch (err) {
      showToast(err.message || `Failed to unlink ${provider}`, 'error');
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const handleRedeemCoupon = () => {
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();

    if (code === 'SBAY2026' || code === 'NIGHTMARE2026') {
      depositFunds(2.0, `Voucher (${code})`);
      setCouponStatus({ type: 'success', message: `Coupon ${code} redeemed! $2.00 free credit added to your balance.` });
      setCouponCode('');
      confetti({ particleCount: 60 });
    } else if (code === 'NIGHTMARE' || code === 'SBAYSTORE' || code === 'CYBER15') {
      depositFunds(5.0, `Promo Coupon (${code})`);
      setCouponStatus({ type: 'success', message: `Coupon ${code} redeemed! $5.00 credit added to your balance.` });
      setCouponCode('');
      confetti({ particleCount: 60 });
    } else if (code === 'DISCOUNT10') {
      depositFunds(3.0, `Discount Voucher (${code})`);
      setCouponStatus({ type: 'success', message: `Coupon ${code} redeemed! $3.00 credit added to your balance.` });
      setCouponCode('');
      confetti({ particleCount: 60 });
    } else {
      setCouponStatus({ type: 'error', message: 'Invalid or expired coupon code. Try NIGHTMARE or CYBER15' });
    }
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;
    setFeedbackSubmitted(true);
    showToast('Thank you for your feedback! It will be reviewed and featured.', 'success');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#06080F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Loading your account & wallet...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-[#06080F]/80 backdrop-blur-sm text-[#F8FAFC] flex flex-col md:flex-row">
      {/* ====================================================================== */}
      {/* SIDEBAR (Matching Screenshots 3, 4, 5)                                 */}
      {/* ====================================================================== */}
      <aside className="w-full md:w-64 bg-[#090d18]/90 backdrop-blur-xl border-r border-white/5 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Nightmare Store Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_22px_rgba(59,130,246,0.8)] transition-all">
              <div className="w-full h-full bg-[#080d1a] rounded-[10px] overflow-hidden flex items-center justify-center p-0.5">
                <img
                  src="/logo.png"
                  alt="Nightmare Store"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
            <span className="text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
              Nightmare<span className="text-blue-500">Store</span>
            </span>
          </Link>

          {/* MAIN MENU */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2">
              MAIN MENU
            </span>

            {/* Dashboard Link */}
            <button
              onClick={() => setTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#122044] text-white border-l-2 border-blue-500 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Dashboard</span>
            </button>

            {/* Top Up Link */}
            <button
              onClick={() => setTab('topup')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'topup'
                  ? 'bg-[#122044] text-white border-l-2 border-blue-500 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>Top Up</span>
            </button>

            {/* Purchase History Link */}
            <button
              onClick={() => setTab('purchases')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'purchases'
                  ? 'bg-[#122044] text-white border-l-2 border-blue-500 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <span>Purchase History</span>
            </button>

            {/* Coupon Link */}
            <button
              onClick={() => setTab('coupon')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'coupon'
                  ? 'bg-[#122044] text-white border-l-2 border-blue-500 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              <span>Coupon</span>
            </button>

            {/* Products (Store link) */}
            <Link
              to="/store"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Products</span>
            </Link>
          </div>

          {/* ACCOUNT MENU */}
          <div className="space-y-1.5 pt-4 border-t border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2">
              ACCOUNT
            </span>

            {/* Account Settings */}
            <button
              onClick={() => setTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#122044] text-white border-l-2 border-blue-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Account Settings</span>
            </button>

            {/* Feedback */}
            <button
              onClick={() => setTab('feedback')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'feedback'
                  ? 'bg-[#122044] text-white border-l-2 border-blue-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Feedback</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="pt-6 border-t border-white/5 flex items-center gap-3">
          {user?.avatar_url || user?.avatarUrl ? (
            <img
              src={user?.avatar_url || user?.avatarUrl}
              alt={displayName}
              className={`w-9 h-9 rounded-full object-cover ring-2 shrink-0 ${
                user?.provider === 'discord' || user?.discord_id || user?.discordConnected
                  ? 'ring-[#5865F2]'
                  : user?.provider === 'google' || user?.google_id || user?.googleConnected
                  ? 'ring-[#4285F4]'
                  : 'ring-blue-500'
              }`}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white block truncate">{displayName}</span>
              {(user?.provider === 'discord' || user?.discord_id || user?.discordConnected) && (
                <span className="px-1.5 py-0.2 rounded bg-[#5865F2]/20 text-[#5865F2] text-[9px] font-black border border-[#5865F2]/30 shrink-0">
                  Discord
                </span>
              )}
              {(user?.provider === 'google' || user?.google_id || user?.googleConnected) && (
                <span className="px-1.5 py-0.2 rounded bg-[#4285F4]/20 text-[#4285F4] text-[9px] font-black border border-[#4285F4]/30 shrink-0">
                  Google
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block truncate">{displayEmail}</span>
          </div>
        </div>
      </aside>

      {/* ====================================================================== */}
      {/* MAIN VIEW CONTENT AREA                                                 */}
      {/* ====================================================================== */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {/* Top bar with Balance Button */}
        <div className="flex items-center justify-end gap-3 flex-wrap">

          <button
            onClick={() => setTab('topup')}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0c1326] border border-blue-500/40 text-xs font-semibold text-slate-200 hover:border-blue-400 shadow-md transition-all group"
          >
            <Wallet className="w-4 h-4 text-blue-400" />
            <span>Balance: <strong className="text-white">${walletBalance?.toFixed(2) || '0.00'}</strong></span>
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold group-hover:scale-110 transition-transform">
              +
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: DASHBOARD (Matching Screenshot 3)                          */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Greeting */}
            <div className="flex items-center gap-3.5">
              {user?.avatar_url || user?.avatarUrl ? (
                <img
                  src={user?.avatar_url || user?.avatarUrl}
                  alt={displayName}
                  className={`w-12 h-12 rounded-full object-cover ring-2 shadow-lg shrink-0 ${
                    user?.provider === 'discord' || user?.discord_id || user?.discordConnected
                      ? 'ring-[#5865F2]'
                      : user?.provider === 'google' || user?.google_id || user?.googleConnected
                      ? 'ring-[#4285F4]'
                      : 'ring-blue-500'
                  }`}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-base shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Welcome, {displayName}
                  </h1>
                  {(user?.provider === 'discord' || user?.discord_id || user?.discordConnected) && (
                    <span className="px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] text-[10px] font-black border border-[#5865F2]/30 flex items-center gap-1 shrink-0">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Discord Connected
                    </span>
                  )}
                  {(user?.provider === 'google' || user?.google_id || user?.googleConnected) && (
                    <span className="px-2 py-0.5 rounded-full bg-[#4285F4]/20 text-[#4285F4] text-[10px] font-black border border-[#4285F4]/30 flex items-center gap-1 shrink-0">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      Google Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{displayEmail}</p>
              </div>
            </div>

            {/* 4 Stat Summary Cards (Screenshot 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Wallet Balance */}
              <div className="p-5 rounded-2xl bg-[#0b101e] border border-white/5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    WALLET BALANCE
                  </span>
                  <Wallet className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  ${walletBalance?.toFixed(2) || '0.00'}
                </div>
              </div>

              {/* Card 2: Total Deposited */}
              <div className="p-5 rounded-2xl bg-[#0b101e] border border-white/5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    TOTAL DEPOSITED
                  </span>
                  <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  ${totalDeposited?.toFixed(2) || '0.00'}
                </div>
              </div>

              {/* Card 3: Total Spent */}
              <div className="p-5 rounded-2xl bg-[#0b101e] border border-white/5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    TOTAL SPENT
                  </span>
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  ${totalSpent?.toFixed(2) || '0.00'}
                </div>
              </div>

              {/* Card 4: Orders Placed */}
              <div className="p-5 rounded-2xl bg-[#0b101e] border border-white/5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    ORDERS PLACED
                  </span>
                  <Package className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {orders.length}
                </div>
              </div>
            </div>

            {/* Connected Providers (Google & Discord) */}
            <div className="p-6 rounded-2xl bg-[#090d18] border border-white/5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                <div>
                  <h2 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Connected Identity & Social Sign-In</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Connect both Google and Discord to one account for instant 1-click access and preserved wallet balances.
                  </p>
                </div>
                <button
                  onClick={() => setTab('settings')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  <span>Manage in Settings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    linkedAccounts.google.connected
                      ? 'bg-[#0c1326] border-emerald-500/30 shadow-lg'
                      : 'bg-[#090e1c] border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Google Account</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              linkedAccounts.google.connected
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {linkedAccounts.google.connected ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[210px] mt-0.5">
                          {linkedAccounts.google.connected
                            ? linkedAccounts.google.email || user?.email
                            : 'Sign in with your Google account'}
                        </p>
                      </div>
                    </div>

                    {linkedAccounts.google.connected ? (
                      <button
                        onClick={() => setShowUnlinkModal('google')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[10px] font-bold border border-rose-500/20 transition-all"
                      >
                        Unlink
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectGoogle}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Discord Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    linkedAccounts.discord.connected
                      ? 'bg-[#0c1326] border-[#5865F2]/40 shadow-lg'
                      : 'bg-[#090e1c] border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center p-2 shrink-0">
                        <svg className="w-full h-full fill-[#5865F2]" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Discord Account</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              linkedAccounts.discord.connected
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {linkedAccounts.discord.connected ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[210px] mt-0.5">
                          {linkedAccounts.discord.connected
                            ? `@${linkedAccounts.discord.username || user?.username}`
                            : 'Link your Discord profile'}
                        </p>
                      </div>
                    </div>

                    {linkedAccounts.discord.connected ? (
                      <button
                        onClick={() => setShowUnlinkModal('discord')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[10px] font-bold border border-rose-500/20 transition-all"
                      >
                        Unlink
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectDiscord}
                        className="px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-[11px] font-bold shadow transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Need More Balance CTA Banner (Screenshot 3) */}
            <div className="p-6 rounded-2xl bg-[#0b1226] border border-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Need more balance?
                </h3>
                <p className="text-xs text-slate-400">
                  Top up your wallet instantly with KHQR scan and start shopping.
                </p>
              </div>

              <button
                onClick={() => setTab('topup')}
                className="btn-primary-blue px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Top Up Balance</span>
              </button>
            </div>

            {/* Recent Activity Table (Screenshot 3) */}
            <div className="p-6 rounded-2xl bg-[#090d18] border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="font-bold text-sm text-white">Recent Activity</h2>
                <span className="px-3 py-1 rounded-lg bg-[#0e172e] border border-white/5 text-[11px] font-semibold text-slate-400">
                  Recent top-ups
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-white/5">
                      <th className="pb-3">DATE</th>
                      <th className="pb-3">TRANSACTION ID</th>
                      <th className="pb-3">AMOUNT</th>
                      <th className="pb-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUpHistory.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Clock className="w-6 h-6 text-slate-600" />
                            <p>No activity found yet for {displayEmail}.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      topUpHistory.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 text-slate-300">
                          <td className="py-3 font-mono text-[11px]">{item.date}</td>
                          <td className="py-3 font-mono text-blue-400">{item.id}</td>
                          <td className="py-3 font-bold text-white">+${item.amount.toFixed(2)}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: TOP UP WALLET (Matching Screenshot 4)                       */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'topup' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-5xl"
          >
            <h1 className="text-2xl font-black text-white tracking-tight">
              Top Up Wallet
            </h1>

            {/* Sub-tabs: Top Up Balance vs Top-up History */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTopUpSubTab('balance')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  topUpSubTab === 'balance'
                    ? 'btn-primary-blue shadow-lg'
                    : 'bg-[#0d1428] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Top Up Balance</span>
              </button>

              <button
                onClick={() => setTopUpSubTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  topUpSubTab === 'history'
                    ? 'btn-primary-blue shadow-lg'
                    : 'bg-[#0d1428] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Top-up History ({topUpHistory.length})</span>
              </button>
            </div>

            {topUpSubTab === 'balance' ? (
              /* Two-Column Top Up Layout (Screenshot 4) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Balance & Amount Input */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Current Balance Card */}
                  <div className="p-5 rounded-2xl bg-[#090e1c] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        CURRENT BALANCE
                      </span>
                      <Wallet className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-3xl font-black text-white">
                      ${walletBalance?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Deposit Amount Input */}
                  <div className="p-5 rounded-2xl bg-[#090e1c] border border-white/5 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        DEPOSIT AMOUNT (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-base">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="5.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-[#050811] border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white font-mono font-bold text-base focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Presets: $1.00, $5.00, $10.00, $25.00 */}
                    <div className="grid grid-cols-4 gap-2">
                      {['1.00', '5.00', '10.00', '25.00'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handlePresetAmount(val)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${
                            depositAmount === val
                              ? 'bg-blue-600/30 border border-blue-500 text-blue-300'
                              : 'bg-[#0d1428] hover:bg-[#131e3d] text-slate-300 border border-white/5'
                          }`}
                        >
                          ${val}
                        </button>
                      ))}
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={handleStartDeposit}
                      disabled={isProcessingPayment}
                      className="w-full btn-primary-blue py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating KHQR...</span>
                        </>
                      ) : (
                        <span>Confirm & Generate KHQR</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Column: PAYMENT METHOD (Screenshot 4) */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-[#090e1c] border border-white/5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    PAYMENT METHOD
                  </span>

                  {/* Method 1: ABA KHQR */}
                  <button
                    onClick={() => setSelectedMethod('bakong')}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedMethod === 'bakong'
                        ? 'bg-[#101b3b] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : 'bg-[#060a16] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="/aba-khqr.png"
                        alt="ABA KHQR"
                        className="w-10 h-10 rounded-xl object-contain bg-[#005e7a] p-0.5 shadow-md border border-white/10"
                      />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white">
                          ABA KHQR
                        </div>
                        <div className="text-[11px] text-slate-400">Auto checkpayment</div>
                      </div>
                    </div>
                  </button>

                </div>
              </div>
            ) : (
              /* Top-up History Sub-tab */
              <div className="p-6 rounded-2xl bg-[#090d18] border border-white/5">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-white/5">
                      <th className="pb-3">DATE</th>
                      <th className="pb-3">TRANSACTION ID</th>
                      <th className="pb-3">METHOD</th>
                      <th className="pb-3">AMOUNT</th>
                      <th className="pb-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUpHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-500">
                          No top-up records yet.
                        </td>
                      </tr>
                    ) : (
                      topUpHistory.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 text-slate-300">
                          <td className="py-3 font-mono text-[11px]">{item.date}</td>
                          <td className="py-3 font-mono text-blue-400">{item.id}</td>
                          <td className="py-3">{item.method}</td>
                          <td className="py-3 font-bold text-emerald-400">+${item.amount.toFixed(2)}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: PURCHASE HISTORY & DIGITAL KEYS                             */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'purchases' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header with Title and Search/Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Package className="w-6 h-6 text-cyan-400" />
                  <span>Purchase History & Keys</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  View purchased items, unlock digital game keys, and copy account credentials.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  to="/keys"
                  className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Key Vault</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const localSaved = JSON.parse(localStorage.getItem('sbay_purchase_history') || '[]');
                    api.getOrders().then((res) => {
                      if (res && res.success && res.data) {
                        const seen = new Set();
                        const combined = [];
                        for (const o of res.data) {
                          const n = o.order_number || o.id;
                          if (!seen.has(n)) { seen.add(n); combined.push(o); }
                        }
                        for (const it of localSaved) {
                          const n = it.order_number || it.id;
                          if (!seen.has(n)) {
                            seen.add(n);
                            combined.push({
                              id: it.id,
                              order_number: it.order_number || it.id,
                              created_at: it.date || new Date().toISOString(),
                              total_amount: it.total || 0,
                              payment_method: it.method || 'Wallet Balance',
                              status: it.status || 'completed',
                              deliveredKey: it.deliveredKey || 'FIVEM-READY-ACC-99214:8841',
                              items: it.items || [{ product_name: it.productName || 'Digital Key Product', quantity: it.quantity || 1 }],
                              keys: it.keys || (it.deliveredKey ? [{ key: it.deliveredKey, productName: it.productName || 'Digital Key Product' }] : []),
                            });
                          }
                        }
                        setOrders(combined);
                        showToast('Orders and keys refreshed!', 'success');
                      }
                    }).catch(() => showToast('Order history reloaded', 'info'));
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
                  title="Refresh Orders"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-[#090d18] border border-white/5">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Product Name, or Code..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                {['all', 'completed', 'pending'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderStatusFilter(st)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {st === 'all' ? `All (${orders.length})` : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List / Cards */}
            {loadingOrders ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-44 rounded-2xl bg-[#090d18] border border-white/5" />
                ))}
              </div>
            ) : (() => {
              const filtered = orders.filter((ord) => {
                const matchesStatus = orderStatusFilter === 'all' || ord.status?.toLowerCase() === orderStatusFilter.toLowerCase();
                if (!matchesStatus) return false;
                if (!orderSearchQuery.trim()) return true;
                const q = orderSearchQuery.toLowerCase();
                const num = (ord.order_number || ord.id || '').toLowerCase();
                const productNames = (ord.items || []).map((i) => i.product_name || i.name || '').join(' ').toLowerCase();
                const keyText = (ord.keys || []).map((k) => k.key || '').join(' ').toLowerCase();
                return num.includes(q) || productNames.includes(q) || keyText.includes(q);
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-16 text-center rounded-2xl bg-[#090d18] border border-white/5 space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">No Purchase Orders Found</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {orderSearchQuery ? 'No orders match your search criteria.' : "You haven't made any purchases yet. Your orders and activation keys will appear here."}
                      </p>
                    </div>
                    <Link
                      to="/store"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Browse Store Catalog</span>
                    </Link>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((ord) => {
                    // Extract all keys belonging to this order
                    let orderKeys = Array.isArray(ord.keys) && ord.keys.length > 0 ? ord.keys : [];
                    if (orderKeys.length === 0 && ord.deliveredKey) {
                      orderKeys = [{
                        keyId: `ord-key-${ord.id || ord.order_number}`,
                        key: ord.deliveredKey,
                        productName: ord.items?.[0]?.product_name || 'Store Item',
                        itemType: ord.deliveredKey.includes(':') ? 'digital_account' : 'license_key',
                      }];
                    }

                    return (
                      <div
                        key={ord.id || ord.order_number}
                        className="p-5 rounded-2xl bg-[#090d18] border border-white/10 hover:border-cyan-500/20 transition-all space-y-4 shadow-lg"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <span>#{ord.order_number}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`ord-${ord.order_number}`, ord.order_number)}
                                className="text-slate-400 hover:text-white"
                                title="Copy Order ID"
                              >
                                {copiedKeyId === `ord-${ord.order_number}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </span>

                            <span className="text-[11px] text-slate-500 font-mono">
                              {new Date(ord.created_at).toLocaleDateString()} at{' '}
                              {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-white/5 text-slate-300 border border-white/5">
                              {ord.payment_method || 'Wallet Balance'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                                ord.status === 'completed' || ord.status === 'paid'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : ord.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              {ord.status || 'Completed'}
                            </span>

                            <span className="text-sm font-black text-white font-mono">
                              ${(ord.total_amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Products in this order */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Purchased Products ({ord.items?.length || 1})
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {(ord.items || [{ product_name: 'Store Game Code', quantity: 1, unit_price: ord.total_amount }]).map((item, itemIdx) => (
                              <div
                                key={item.id || `item-${itemIdx}`}
                                className="p-3 rounded-xl bg-[#050811] border border-white/5 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {item.cover_image ? (
                                    <img
                                      src={item.cover_image}
                                      alt={item.product_name}
                                      className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                                      <Package className="w-5 h-5" />
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <h4 className="font-bold text-xs text-white truncate">
                                      {item.product_name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                      <span className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] font-bold text-cyan-300 uppercase">
                                        {item.platform || 'Digital'}
                                      </span>
                                      <span>Qty: {item.quantity || 1}</span>
                                    </div>
                                  </div>
                                </div>

                                <span className="font-mono text-xs font-bold text-slate-200 shrink-0">
                                  ${((item.unit_price || item.subtotal || ord.total_amount || 0)).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivered Digital Keys / Codes Section */}
                        {orderKeys.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Delivered Keys & Activation Codes</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => handleOpenKeyModal(ord)}
                                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2 transition-colors cursor-pointer"
                              >
                                <span>Open Full Key Details</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              {orderKeys.map((kItem, kIdx) => {
                                const kId = kItem.keyId || `k-${ord.id}-${kIdx}`;
                                const rawKey = kItem.key || ord.deliveredKey || '';
                                const isAccount = kItem.itemType === 'digital_account' || rawKey.includes(':');
                                let username = '';
                                let password = '';
                                if (isAccount && rawKey.includes(':')) {
                                  const cIdx = rawKey.indexOf(':');
                                  username = rawKey.slice(0, cIdx).trim();
                                  password = rawKey.slice(cIdx + 1).trim();
                                }
                                const isRevealed = revealedKeyIds.has(kId);

                                return (
                                  <div
                                    key={kId}
                                    className="p-3 rounded-xl bg-[#050811] border border-white/10 space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-slate-300 truncate max-w-[200px]">
                                        {kItem.productName || ord.items?.[0]?.product_name || 'Activation Key'}
                                      </span>
                                      <span className="text-[9px] font-mono uppercase font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded">
                                        {isAccount ? 'ACCOUNT CREDENTIALS' : 'GAME LICENSE CODE'}
                                      </span>
                                    </div>

                                    {isAccount && username ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {/* Username Box */}
                                        <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 flex items-center justify-between gap-2">
                                          <div className="min-w-0">
                                            <span className="text-[9px] uppercase font-bold text-slate-400 block">User / Email</span>
                                            <span className="font-mono text-xs text-cyan-300 font-bold select-all truncate block">
                                              {username}
                                            </span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => copyToClipboard(`${kId}-user`, username)}
                                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
                                          >
                                            {copiedKeyId === `${kId}-user` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedKeyId === `${kId}-user` ? 'Copied' : 'Copy'}</span>
                                          </button>
                                        </div>

                                        {/* Password Box */}
                                        <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 flex items-center justify-between gap-2">
                                          <div className="min-w-0">
                                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Password</span>
                                            <span className="font-mono text-xs text-amber-300 font-bold select-all truncate block">
                                              {isRevealed ? password : '••••••••••••'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => toggleReveal(kId)}
                                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                                              title={isRevealed ? 'Hide Password' : 'Show Password'}
                                            >
                                              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => copyToClipboard(`${kId}-pass`, password)}
                                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                                            >
                                              {copiedKeyId === `${kId}-pass` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                              <span>{copiedKeyId === `${kId}-pass` ? 'Copied' : 'Copy'}</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      /* License Key Bar */
                                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                                        <span className="font-mono text-xs text-cyan-300 font-bold select-all break-all">
                                          {isRevealed ? rawKey : '••••••••-••••••••-••••••••'}
                                        </span>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => toggleReveal(kId)}
                                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                                            title={isRevealed ? 'Hide Code' : 'Reveal Code'}
                                          >
                                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => copyToClipboard(kId, rawKey)}
                                            className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                          >
                                            {copiedKeyId === kId ? (
                                              <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                            <span>{copiedKeyId === kId ? 'Copied!' : 'Copy Code'}</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: COUPON REDEMPTION                                           */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'coupon' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-xl"
          >
            <h1 className="text-2xl font-black text-white tracking-tight">
              Redeem Promo Coupon
            </h1>

            <div className="p-6 rounded-2xl bg-[#090d18] border border-white/5 space-y-4">
              <p className="text-xs text-slate-400">
                Enter your voucher code to receive instant wallet balance credits or purchase discounts.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. NIGHTMARE, CYBER15"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleRedeemCoupon}
                  className="btn-primary-blue px-5 py-2.5 rounded-xl font-bold text-xs"
                >
                  Apply
                </button>
              </div>

              {couponStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    couponStatus.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {couponStatus.message}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: FEEDBACK (Matching Screenshot 1)                            */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl mx-auto pt-6"
          >
            {/* Centered Heading matching Screenshot 1 */}
            <div className="text-center space-y-1.5 pb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Share Your Feedback
              </h1>
              <p className="text-xs text-slate-400">
                Your reviews help us improve NightmareStore for everyone.
              </p>
            </div>

            {/* Centered Card matching Screenshot 1 */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#090e1c] border border-white/5 space-y-6 shadow-2xl">
              {feedbackSubmitted ? (
                <div className="text-center py-8 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">Feedback Received</h3>
                  <p className="text-xs text-slate-400">
                    Thank you for supporting NightmareStore! Your review has been added to our community testimonials.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  {/* RATE YOUR EXPERIENCE */}
                  <div className="text-center space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      RATE YOUR EXPERIENCE
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= feedbackRating
                                ? 'fill-[#1e293b] text-blue-500 stroke-blue-500'
                                : 'text-slate-800'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* YOUR FEEDBACK / MESSAGE */}
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      YOUR FEEDBACK / MESSAGE
                    </span>
                    <textarea
                      rows={5}
                      placeholder="Tell us what you liked or how we can improve..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full bg-[#050811] border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Full-Width Blue Submit Review Button */}
                  <button
                    type="submit"
                    className="w-full btn-primary-blue py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Review</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB: ACCOUNT SETTINGS & CONNECTED IDENTITIES                       */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-5xl"
          >
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
                <span>Account & Social Login Management</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage your website account, verified email, and connected Google and Discord authentication providers.
              </p>
            </div>

            {/* Main Profile Overview Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1c] border border-white/5 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500 shadow-xl shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-black text-xl shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-white">{displayName}</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {user?.role?.toUpperCase() || 'CUSTOMER'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active Account</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">@{user?.username || 'member'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/20 transition-all flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* Account Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#060a14] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">USER ID</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-300 truncate max-w-[140px]">{user?.id || 'usr-cust-1'}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user?.id || '');
                        showToast('User ID copied!', 'info');
                      }}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#060a14] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PRIMARY EMAIL</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 truncate max-w-[140px]">{displayEmail}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#060a14] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">MEMBER SINCE</span>
                  <div className="text-xs text-slate-300 font-mono">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Jan 15, 2026'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#060a14] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">LAST LOGIN</span>
                  <div className="text-xs text-slate-300 font-mono">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* SEPARATE CONNECTED PROVIDER SECTIONS (Requirement 4 & 5) */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Connected OAuth Providers
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect multiple login methods to sign in seamlessly. Your orders and wallet remain safely united under this account.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. GOOGLE ACCOUNT SECTION */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                    linkedAccounts.google.connected
                      ? 'bg-[#090e1c] border-emerald-500/30 shadow-2xl'
                      : 'bg-[#090e1c]/80 border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2.5 shrink-0 shadow-inner">
                        <svg className="w-full h-full" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Google Authentication</h3>
                        <span className="text-[11px] text-slate-400">OAuth 2.0 + OpenID Connect</span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                        linkedAccounts.google.connected
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          linkedAccounts.google.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      <span>{linkedAccounts.google.connected ? 'Connected' : 'Not Connected'}</span>
                    </span>
                  </div>

                  {linkedAccounts.google.connected ? (
                    /* Google Account Dashboard Example view */
                    <div className="py-5 space-y-3">
                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-400">Name</span>
                        <span className="font-semibold text-white">{linkedAccounts.google.displayName || displayName}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-400">Email</span>
                        <span className="font-semibold text-white font-mono">{linkedAccounts.google.email || displayEmail}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-400">Provider</span>
                        <span className="font-semibold text-blue-400">Google OAuth 2.0</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-400">Email Verified</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Yes</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-400">Google Subject ID (sub)</span>
                        <span className="font-mono text-[11px] text-slate-400 truncate max-w-[150px]">
                          {linkedAccounts.google.sub || user?.googleId || '104928172910482'}
                        </span>
                      </div>

                      <div className="pt-3">
                        <button
                          onClick={() => setShowUnlinkModal('google')}
                          className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>Unlink Google Account</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Connect Google View */
                    <div className="py-6 space-y-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Link your verified Google profile to enable fast, single-tap sign-ins while retaining your current store orders and balance.
                      </p>
                      <button
                        onClick={handleConnectGoogle}
                        className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Connect with Google</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. DISCORD ACCOUNT SECTION */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                    linkedAccounts.discord.connected
                      ? 'bg-[#090e1c] border-[#5865F2]/40 shadow-2xl'
                      : 'bg-[#090e1c]/80 border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center p-2.5 shrink-0 shadow-inner">
                        <svg className="w-full h-full fill-[#5865F2]" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">Discord Authentication</h3>
                          <span className="text-[11px] text-slate-400">OAuth2 Authorization Code</span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                          linkedAccounts.discord.connected
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            linkedAccounts.discord.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        <span>{linkedAccounts.discord.connected ? 'Connected' : 'Not Connected'}</span>
                      </span>
                    </div>

                    {linkedAccounts.discord.connected ? (
                      /* Discord Account Dashboard Example view */
                      <div className="py-5 space-y-3">
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-slate-400">Username</span>
                          <span className="font-semibold text-white">@{linkedAccounts.discord.username || user?.username}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-slate-400">Discord ID</span>
                          <span className="font-mono text-[11px] text-blue-400">
                            {linkedAccounts.discord.id || user?.discordId || '1562068415655714836'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-slate-400">Email</span>
                          <span className="font-semibold text-white font-mono">
                            {linkedAccounts.discord.email || displayEmail}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-slate-400">Provider</span>
                          <span className="font-semibold text-[#5865F2]">Discord OAuth2</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-slate-400">Connection Status</span>
                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Connected</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-slate-400">Server Membership</span>
                          <span className="font-semibold text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active in Discord Server</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-slate-400">Verified Role</span>
                          <span className="font-semibold text-purple-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#5865F2]" />
                            <span>Verified Role Active</span>
                          </span>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                          <Link
                            to="/discord/verify"
                            className="flex-1 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#5865F2]/20"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Open Verification Portal</span>
                          </Link>
                          <button
                            onClick={() => setShowUnlinkModal('discord')}
                            className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                            <span>Unlink</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Connect Discord View */
                      <div className="py-6 space-y-4">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Link your Discord account to join community giveaways, auto-verify roles, and enable instantaneous sign-in.
                        </p>
                        <button
                          onClick={handleConnectDiscord}
                          className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5"
                        >
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                          <span>Connect with Discord</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
      </main>

      {/* ====================================================================== */}
      {/* SAFE UNLINK CONFIRMATION MODAL (Requirement 4)                         */}
      {/* ====================================================================== */}
      <AnimatePresence>
        {showUnlinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUnlinkModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-[#0b101f] border border-rose-500/40 p-6 shadow-2xl z-10 space-y-4 text-center text-white"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Unlink {showUnlinkModal === 'google' ? 'Google' : 'Discord'} Account?
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to disconnect this authentication method? You must keep at least one active login method to access your purchases and wallet.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowUnlinkModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUnlink(showUnlinkModal)}
                  disabled={unlinkingProvider === showUnlinkModal}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  {unlinkingProvider === showUnlinkModal ? 'Unlinking...' : 'Confirm Unlink'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* VIEW KEY MODAL */}
        {viewingKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingKeyModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b101f] border border-blue-500/40 p-6 shadow-2xl z-10 space-y-5 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-white">Delivered Digital Keys</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Order #{viewingKeyModal.order_number || viewingKeyModal.id}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Verified
                </span>
              </div>

              {loadingOrderKeys ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Decrypting digital keys from vault...</p>
                </div>
              ) : orderKeysData.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">No delivered keys found for this order.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderKeysData.map((item, idx) => {
                    const itemId = item.keyId || `modal-key-${idx}`;
                    const rawKey = item.key || '';
                    const isAccount = item.itemType === 'digital_account' || rawKey.includes(':');
                    let username = '';
                    let password = '';
                    if (isAccount && rawKey.includes(':')) {
                      const firstColon = rawKey.indexOf(':');
                      username = rawKey.slice(0, firstColon).trim();
                      password = rawKey.slice(firstColon + 1).trim();
                    }
                    const isRevealed = revealedKeyIds.has(itemId);

                    return (
                      <div
                        key={itemId}
                        className="p-4 rounded-2xl bg-[#050811] border border-white/10 space-y-3"
                      >
                        {item.productName && (
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                            <span className="font-bold text-white truncate max-w-[240px]">
                              {item.productName}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                              {item.platform || (isAccount ? 'ACCOUNT' : 'CODE')}
                            </span>
                          </div>
                        )}

                        {isAccount && username ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                <span>Account Credentials</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`${itemId}-full`, rawKey)}
                                className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedKeyId === `${itemId}-full` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span>{copiedKeyId === `${itemId}-full` ? 'Full Copied!' : 'Copy user:pass'}</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {/* Username */}
                              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Username / Email
                                </span>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-mono text-xs text-cyan-300 font-bold select-all truncate">
                                    {username}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(`${itemId}-user`, username)}
                                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
                                  >
                                    {copiedKeyId === `${itemId}-user` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    <span>{copiedKeyId === `${itemId}-user` ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Password */}
                              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Password
                                </span>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-mono text-xs text-amber-300 font-bold select-all truncate">
                                    {isRevealed ? password : '••••••••••••'}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => toggleReveal(itemId)}
                                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                                      title={isRevealed ? 'Hide Password' : 'Show Password'}
                                    >
                                      {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(`${itemId}-pass`, password)}
                                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
                                    >
                                      {copiedKeyId === `${itemId}-pass` ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                      <span>{copiedKeyId === `${itemId}-pass` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Standard License Key Bar */
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>License Code / Key</span>
                            </span>
                            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/5">
                              <span className="font-mono text-xs sm:text-sm text-cyan-300 font-bold select-all break-all">
                                {isRevealed ? rawKey : '••••••••-••••••••-••••••••'}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleReveal(itemId)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                                  title={isRevealed ? 'Hide Key' : 'Reveal Key'}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(itemId, rawKey)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  {copiedKeyId === itemId ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span>{copiedKeyId === itemId ? 'Copied!' : 'Copy Code'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/keys"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Open Full Key Vault</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setViewingKeyModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CutLuy KHQR Auto Top-up Modal */}
      <CutLuyPaymentModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        paymentData={cutLuyPayment}
        purpose="topup"
        merchantName="NIGHTMARE STORE"
        customerEmail={user?.email || 'customer@nightmare.store'}
        onSuccess={handleDepositSuccess}
        onRetry={handleStartDeposit}
      />
    </div>
  );
}
