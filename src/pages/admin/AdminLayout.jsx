import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Gamepad2,
  KeyRound,
  ShoppingBag,
  Tag,
  Users,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Bot,
  Boxes,
  Sparkles,
  Search,
  Bell,
  SunMoon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Key,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, setAuthToken } from '../../services/api';
import { ADMIN_BASE_PATH, ADMIN_ROUTES } from '../../constants/adminRoutes';

function AdminLoginGate() {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP validity (5 min) and resend cooldown (60s)
  useEffect(() => {
    if (step !== 'otp') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.adminAuth.login(email.trim(), password);
      if (res.success && res.challengeId) {
        setChallengeId(res.challengeId);
        setMaskedEmail(res.maskedEmail || res.email);
        setTimerSeconds(res.expiresIn || 300);
        setResendCooldown(60);
        setSuccessMsg(`Verification code sent to ${res.maskedEmail || res.email || 'your email'}`);
        setStep('otp');
      } else {
        throw new Error(res.error || 'Login failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.adminAuth.verifyOtp(challengeId, email.trim(), otp.trim());
      if (res.success && res.token) {
        setAuthToken(res.token);
        await refreshUser();
      } else {
        throw new Error(res.error || 'Verification failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setErrorMsg('');
    try {
      setIsResending(true);
      const res = await api.adminAuth.resendOtp(challengeId);
      if (res.success) {
        setResendCooldown(60);
        setTimerSeconds(300);
        setSuccessMsg('New 6-digit verification code sent to your email.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#070B17]/85 backdrop-blur-sm relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#070B17_85%)] pointer-events-none" />

      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative max-w-md w-full p-8 sm:p-9 rounded-3xl bg-[#0D1329]/95 border border-purple-500/30 shadow-[0_0_60px_rgba(147,51,234,0.22)] backdrop-blur-2xl space-y-6 z-10"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-500/25">
              {step === 'credentials' ? (
                <ShieldCheck className="w-8 h-8 text-purple-400" />
              ) : (
                <KeyRound className="w-8 h-8 text-purple-400 animate-pulse" />
              )}
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0D1329]" />
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {step === 'credentials' ? 'Login Admin' : 'Two-Factor Verification'}
            </h1>
            {step === 'otp' && (
              <p className="text-xs text-slate-400 mt-1">
                Enter the 6-digit code sent to <strong className="text-purple-300 font-mono">{maskedEmail || 'your email'}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="flex-1 font-medium">{errorMsg}</span>
          </motion.div>
        )}

        {/* Success Alert */}
        {successMsg && !errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1">{successMsg}</span>
          </motion.div>
        )}

        {/* STEP 1: CREDENTIALS FORM */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300 flex items-center">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  Email
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070B17] border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300 flex items-center">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#070B17] border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In & Send OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT EMAIL OTP FORM */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="space-y-2 text-center">
              <label className="text-xs font-semibold text-slate-300 block">
                6-Digit Security Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  required
                  className="w-full py-3.5 px-4 rounded-xl bg-[#070B17] border-2 border-purple-500/40 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-white placeholder-slate-600 text-2xl font-mono text-center tracking-[0.4em] outline-none transition-all shadow-inner"
                />
              </div>

              {/* Countdown and Resend Controls */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span className={timerSeconds < 60 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    Expires: {formatTimer(timerSeconds)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-purple-400 hover:text-purple-300 disabled:text-slate-600 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full py-3.5 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Verify & Enter Dashboard</span>
                </>
              )}
            </button>

            {/* Back to Step 1 Button */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setOtp('');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email / Back</span>
              </button>
            </div>
          </form>
        )}

        {/* Back Link */}
        <div className="pt-2 text-center border-t border-white/5">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, isAdmin, loading, logout, devLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Top Bar Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Profile Dropdown State
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Gaming Theme Glow Mode
  const [neonMode, setNeonMode] = useState(true);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real database notifications
  useEffect(() => {
    if (!isAdmin) return;
    let isMounted = true;
    async function fetchNotifs() {
      try {
        const res = await api.admin.getNotifications();
        if (res.success && isMounted) {
          setNotifications(res.data || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {
        // Fallback quiet
      }
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin]);

  // Handle Global Search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.admin.search(searchQuery);
        if (res.success) {
          setSearchResults(res.data);
          setSearchOpen(true);
        }
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070B17]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center animate-spin">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-xs font-mono text-slate-400 tracking-wider">INITIALIZING ADMIN SUITE...</p>
        </div>
      </div>
    );
  }

  // Enforce server-side validated admin role
  if (!isAdmin) {
    return <AdminLoginGate />;
  }

  // Exact 9 Sidebar Nav items in required order
  const navItems = [
    { label: 'Overview', to: ADMIN_ROUTES.OVERVIEW, icon: LayoutDashboard, end: true },
    { label: 'Products', to: ADMIN_ROUTES.PRODUCTS, icon: Gamepad2 },
    { label: 'Inventory (CSV)', to: ADMIN_ROUTES.INVENTORY, icon: KeyRound },
    { label: 'Orders', to: ADMIN_ROUTES.ORDERS, icon: ShoppingBag },
    { label: 'Coupons', to: ADMIN_ROUTES.COUPONS, icon: Tag },
    { label: 'Users & Roles', to: ADMIN_ROUTES.USERS, icon: Users },
    { label: 'Discord Verification', to: ADMIN_ROUTES.DISCORD, icon: Bot, badge: 'Bot #0556' },
    { label: 'Stock Management', to: ADMIN_ROUTES.STOCK, icon: Boxes, badge: 'Realtime' },
    { label: 'Store Settings', to: ADMIN_ROUTES.SETTINGS, icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      navigate('/login');
    }
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between">
      {/* Top Header & Navigation */}
      <div className="space-y-6">
        {/* Exact Header matching spec */}
        <div className="px-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-1.5 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-400/30 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="NMC"
                className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
              />
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm tracking-wide text-white flex items-center gap-1.5">
                <span className="truncate">NMC Admin Dashboard</span>
              </div>
              <p className="text-[10px] font-bold text-purple-400 tracking-wider uppercase font-mono">
                GAME STORE MANAGEMENT
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group overflow-hidden ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-[#9333EA] to-[#2563EB] shadow-[0_0_20px_rgba(147,51,234,0.45)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 z-10">
                    <item.icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${
                        isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-purple-400'
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight ${
                        isActive
                          ? 'bg-black/30 text-white'
                          : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Hover ambient highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-6 border-t border-white/5 space-y-4 px-1">
        {/* System telemetry pill */}
        <div className="p-3 rounded-2xl bg-[#111A33]/80 border border-white/5 space-y-2 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Status</span>
            </span>
            <span className="text-emerald-400 font-bold">All Systems Live</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Bot #0556</span>
            <span className="text-cyan-400 font-bold">Online</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Payment Gateway</span>
            <span className="text-purple-400 font-bold">ABA KHQR</span>
          </div>
        </div>

        {/* Back to Customer View Link */}
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-500/60 text-xs font-bold text-purple-300 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Customer View</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070B17]/85 backdrop-blur-sm text-[#F8FAFC] flex flex-col antialiased">
      {/* Background Ambient Glow Orbs */}
      <div
        className={`fixed top-0 left-64 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10 transition-opacity duration-700 ${
          neonMode ? 'opacity-100 animate-pulse duration-1000' : 'opacity-40'
        }`}
      />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Desktop Fixed Sidebar (#0D1329) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 xl:w-72 bg-[#0D1329]/90 backdrop-blur-xl border-r border-white/5 z-40 p-5 flex-col shadow-2xl overflow-y-auto">
        {renderNavContent()}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0D1329] border-r border-white/10 z-50 p-5 flex flex-col overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/5">
                <span className="text-xs font-bold font-mono text-purple-400">NAVIGATION</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderNavContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Container Layout with desktop offset for fixed sidebar */}
      <div className="lg:pl-64 xl:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#070B17]/85 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-3.5 transition-all">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Burger & Global Search */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[#0D1329] border border-white/10 text-slate-300 hover:text-white"
                aria-label="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global Search Input */}
              <div ref={searchRef} className="relative flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products, orders, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults) setSearchOpen(true);
                    }}
                    className="w-full bg-[#0D1329] border border-white/10 hover:border-purple-500/40 focus:border-purple-500 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {searchLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                  {searchQuery && !searchLoading && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults(null);
                        setSearchOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Global Search Dropdown Results */}
                <AnimatePresence>
                  {searchOpen && searchResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-[#0D1329] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 space-y-3 max-h-[420px] overflow-y-auto backdrop-blur-2xl"
                    >
                      {searchResults.totalMatches === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No matching products, orders, or users found for "{searchQuery}".
                        </div>
                      ) : (
                        <>
                          {/* Products */}
                          {searchResults.products?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider px-2 pb-1.5 flex items-center justify-between">
                                <span>Products ({searchResults.products.length})</span>
                                <Link
                                  to={ADMIN_ROUTES.PRODUCTS}
                                  onClick={() => setSearchOpen(false)}
                                  className="text-[10px] text-slate-400 hover:text-white"
                                >
                                  View all
                                </Link>
                              </div>
                              <div className="space-y-1">
                                {searchResults.products.map((p) => (
                                  <Link
                                    key={p.id}
                                    to={ADMIN_ROUTES.PRODUCTS}
                                    onClick={() => setSearchOpen(false)}
                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={p.cover_image || '/card-rockstar-hd.png'}
                                        alt={p.name}
                                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10"
                                      />
                                      <div>
                                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                          {p.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                          {p.platform} • {p.availableStock} in stock
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-emerald-400">
                                      ${p.price}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Orders */}
                          {searchResults.orders?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider px-2 pb-1.5 flex items-center justify-between">
                                <span>Orders ({searchResults.orders.length})</span>
                                <Link
                                  to={ADMIN_ROUTES.ORDERS}
                                  onClick={() => setSearchOpen(false)}
                                  className="text-[10px] text-slate-400 hover:text-white"
                                >
                                  View all
                                </Link>
                              </div>
                              <div className="space-y-1">
                                {searchResults.orders.map((o) => (
                                  <Link
                                    key={o.id}
                                    to={ADMIN_ROUTES.ORDERS}
                                    onClick={() => setSearchOpen(false)}
                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors font-mono">
                                          #{o.order_number}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                          {o.customer_email}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-white">
                                      ${o.total_amount?.toFixed(2)}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Users */}
                          {searchResults.users?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider px-2 pb-1.5 flex items-center justify-between">
                                <span>Users ({searchResults.users.length})</span>
                                <Link
                                  to={ADMIN_ROUTES.USERS}
                                  onClick={() => setSearchOpen(false)}
                                  className="text-[10px] text-slate-400 hover:text-white"
                                >
                                  View all
                                </Link>
                              </div>
                              <div className="space-y-1">
                                {searchResults.users.map((u) => (
                                  <Link
                                    key={u.id}
                                    to={ADMIN_ROUTES.USERS}
                                    onClick={() => setSearchOpen(false)}
                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                        <Users className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                          {u.displayName}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                                      </div>
                                    </div>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-slate-300">
                                      {u.role}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Tools: Notification Bell, Theme Button, Admin Profile */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button (Neon / Normal Glow) */}
              <button
                onClick={() => setNeonMode(!neonMode)}
                className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-center ${
                  neonMode
                    ? 'bg-purple-600/15 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                    : 'bg-[#0D1329] border-white/10 text-slate-400 hover:text-white'
                }`}
                title={neonMode ? 'Neon Mode Active' : 'Enable Neon Glow'}
              >
                <SunMoon className="w-4 h-4" />
              </button>

              {/* Notification Bell Dropdown */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2.5 rounded-xl bg-[#0D1329] border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black flex items-center justify-center animate-bounce shadow-md">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0D1329] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-3 backdrop-blur-2xl"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-white">Live System Events</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                          {unreadCount} new
                        </span>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No active notifications.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n.id}
                              to={n.link || ADMIN_BASE_PATH}
                              onClick={() => setNotifOpen(false)}
                              className={`block p-3 rounded-xl border transition-all text-xs group ${
                                n.type === 'warning'
                                  ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                                  : n.type === 'success'
                                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                            </Link>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Admin Avatar & Profile Dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-[#0D1329] border border-white/10 hover:border-purple-500/40 transition-all text-left group"
                >
                  <img
                    src={user?.avatar_url || user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user?.displayName || 'Admin'}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-purple-500/50"
                  />
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {user?.displayName || user?.username || 'Administrator'}
                    </div>
                    <div className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                      Root Admin
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {/* Profile Popover Menu */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[#0D1329] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <div className="text-xs font-bold text-white truncate">
                          {user?.displayName || user?.username}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate font-mono">
                          {user?.email || 'admin@nightmarestore.com'}
                        </div>
                      </div>

                      <Link
                        to={ADMIN_ROUTES.SETTINGS}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-purple-400" />
                        <span>Store Settings</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                        <span>Customer Portal</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
