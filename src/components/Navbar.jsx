import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, LogOut, ShieldAlert, KeyRound, Package, ChevronDown, Wallet, Plus, Menu, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ADMIN_BASE_PATH } from '../constants/adminRoutes';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, devLogin, logout, walletBalance } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 pt-4 pointer-events-none">
      <div className="max-w-6xl mx-auto sbay-nav rounded-2xl px-5 py-2.5 sm:py-3 flex items-center justify-between gap-4 pointer-events-auto relative border border-white/10 shadow-2xl">
        {/* Brand Logo matching Image 2 */}
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.35)] border border-blue-500/25 bg-[#080d1a] p-0.5">
            <img
              src="/logo.png"
              alt="NightmareStore"
              className="w-full h-full object-cover rounded-lg filter drop-shadow-[0_0_6px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
            Nightmare<span className="text-blue-500">Store</span>
          </span>
        </Link>

        {/* Center Pill Navigation matching Image 2 */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#080c18] border border-white/10 p-1 rounded-2xl">
          <Link
            to="/"
            className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
              isActive('/') ? 'bg-[#18233d] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Home</span>
            {isActive('/') && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] absolute bottom-0.5 left-1/2 -translate-x-1/2" />
            )}
          </Link>

          <Link
            to="/products"
            className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
              isActive('/store') || isActive('/products') ? 'bg-[#18233d] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Products</span>
            {(isActive('/store') || isActive('/products')) && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] absolute bottom-0.5 left-1/2 -translate-x-1/2" />
            )}
          </Link>

          <Link
            to="/cart"
            className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
              isActive('/cart') ? 'bg-[#18233d] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Cart</span>
            {isActive('/cart') && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] absolute bottom-0.5 left-1/2 -translate-x-1/2" />
            )}
          </Link>
        </nav>

        {/* Right Actions matching Image 2 */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Balance Pill Button - Shown for Logged In & Registered Accounts */}
          {isAuthenticated && (
            <button
              onClick={() => navigate('/dashboard?tab=topup')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b101e] hover:bg-[#12192d] border border-blue-500/30 text-xs font-semibold text-slate-200 transition-colors group cursor-pointer shadow-sm"
              title="Top Up Wallet Balance"
            >
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
              <span>Balance: <strong className="text-white font-mono">${walletBalance?.toFixed(2) || '0.00'}</strong></span>
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold group-hover:scale-110 transition-transform">
                +
              </span>
            </button>
          )}

          {/* Cart Icon Button */}
          <Link
            to="/cart"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0b101e] hover:bg-[#12192d] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all relative group"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span>Cart</span>
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1.3, 1], opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.8)] ring-2 ring-[#080d1a]"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>

          {/* User Auth or Login/Register Buttons */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0c1222] hover:bg-[#12192d] border border-white/10 hover:border-blue-500/30 text-xs transition-all shadow-sm group"
                aria-label="User Menu"
              >
                <div className="relative w-6 h-6 shrink-0">
                  <img
                    src={user?.avatar_url || user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user?.displayName || user?.display_name || user?.username || 'CyberGamer'}
                    className={`w-6 h-6 rounded-full object-cover ring-2 ${
                      user?.provider === 'discord' || user?.discord_id || user?.discordConnected
                        ? 'ring-[#5865F2]'
                        : user?.provider === 'google' || user?.google_id || user?.googleConnected
                        ? 'ring-[#4285F4]'
                        : 'ring-blue-500'
                    }`}
                  />
                  {(user?.provider === 'discord' || user?.discord_id || user?.discordConnected) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#5865F2] ring-1 ring-[#080d1a]" title="Discord Account" />
                  )}
                  {(user?.provider === 'google' || user?.google_id || user?.googleConnected) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4285F4] ring-1 ring-[#080d1a]" title="Google Account" />
                  )}
                </div>
                <span className="font-bold text-white text-xs sm:text-sm tracking-tight hidden sm:inline max-w-[120px] truncate">
                  {user?.displayName || user?.display_name || user?.username || 'CyberGamer'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-[#0d1322] border border-white/10 rounded-2xl shadow-2xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {/* Profile Header */}
                  <div className="p-2.5 border-b border-white/5 mb-1.5 flex items-center gap-2.5">
                    <img
                      src={user?.avatar_url || user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={user?.displayName || user?.display_name || user?.username}
                      className={`w-9 h-9 rounded-full object-cover ring-2 shrink-0 ${
                        user?.provider === 'discord' || user?.discord_id || user?.discordConnected
                          ? 'ring-[#5865F2]'
                          : user?.provider === 'google' || user?.google_id || user?.googleConnected
                          ? 'ring-[#4285F4]'
                          : 'ring-blue-500'
                      }`}
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-white truncate">{user?.displayName || user?.display_name || user?.username}</p>
                        {(user?.provider === 'discord' || user?.discord_id || user?.discordConnected) && (
                          <span className="px-1.5 py-0.5 rounded bg-[#5865F2]/20 text-[#5865F2] text-[9px] font-black border border-[#5865F2]/30 shrink-0 flex items-center gap-1">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            <span>Discord</span>
                          </span>
                        )}
                        {(user?.provider === 'google' || user?.google_id || user?.googleConnected) && (
                          <span className="px-1.5 py-0.5 rounded bg-[#4285F4]/20 text-[#4285F4] text-[9px] font-black border border-[#4285F4]/30 shrink-0 flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span>Google</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Wallet Balance Preview */}
                  <div className="px-2.5 py-1.5 mb-1 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-center justify-between text-slate-300">
                    <span className="text-[10px] text-slate-400">Balance</span>
                    <span className="font-extrabold text-blue-400 text-xs">${walletBalance?.toFixed(2) || '0.00'}</span>
                  </div>

                  <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/keys" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>My Digital Keys</span>
                  </Link>
                  <Link to="/dashboard?tab=purchases" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                    <span>Purchase History & Keys</span>
                  </Link>
                  <Link to="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors">
                    <Package className="w-3.5 h-3.5 text-emerald-400" />
                    <span>My Orders</span>
                  </Link>

                  {isAdmin && (
                    <Link to={ADMIN_BASE_PATH} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-xl bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 mt-1 transition-colors">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold">NMC Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-950/30 text-rose-300 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-xl bg-[#0b101e] hover:bg-[#12192d] border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 sm:px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.45)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={() => navigate('/dashboard?tab=topup')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0b101e] hover:bg-[#12192d] border border-blue-500/30 text-xs font-semibold text-slate-200 transition-colors group shadow-sm active:scale-95"
              title="Top Up Wallet Balance"
            >
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
              <strong className="text-white font-mono text-xs">${walletBalance?.toFixed(2) || '0.00'}</strong>
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                +
              </span>
            </button>
          )}

          {itemCount > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-xl bg-[#0d1322] hover:bg-[#131b30] border border-white/10 text-slate-200 relative transition-all active:scale-95"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.8)] ring-2 ring-[#080d1a]">
                {itemCount}
              </span>
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl bg-[#0d1322] hover:bg-[#131b30] border border-white/10 text-slate-200 transition-all flex items-center justify-center active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-white" />
            ) : (
              <Menu className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Animated Mobile Menu Dropdown Drawer (Screenshot 2) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="max-w-6xl mx-auto mt-2 rounded-2xl bg-[#080c18]/95 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl pointer-events-auto space-y-4"
          >
            {/* Navigation links with hairline dividers */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 text-sm font-bold border-b border-white/5 transition-colors ${
                  isActive('/') ? 'text-blue-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 text-sm font-bold border-b border-white/5 transition-colors ${
                  isActive('/products') || isActive('/store') ? 'text-blue-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                Products
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full text-left py-3 text-sm font-bold text-slate-300 hover:text-white border-b border-white/5 transition-colors flex items-center justify-between"
              >
                <span>Cart</span>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-600 text-white font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 text-sm font-bold transition-colors ${
                  isActive('/dashboard') ? 'text-blue-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to={ADMIN_BASE_PATH}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#080e20] hover:bg-[#0e1938] border border-blue-600/70 text-sm font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] my-2 transition-all active:scale-95"
                >
                  <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>NMC Admin Dashboard</span>
                </Link>
              )}
            </div>

            {/* Action buttons (Screenshot 2: Cart button, Login button, Register button) */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-[#0d1322] hover:bg-[#131b30] border border-white/10 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-slate-400" />
                <span>Cart</span>
                {itemCount > 0 && <span className="text-blue-400">({itemCount})</span>}
              </button>

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full block py-3 text-center rounded-xl bg-[#0d1322] hover:bg-[#131b30] border border-white/10 text-white font-bold text-sm transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full block py-3 text-center rounded-xl btn-primary-blue text-white font-bold text-sm transition-all shadow-lg"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3 px-2 py-1.5 bg-[#0b101e] rounded-xl border border-white/5">
                    <img
                      src={user?.avatar_url || user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={user?.displayName || user?.display_name || user?.username || 'User'}
                      className={`w-9 h-9 rounded-full object-cover ring-2 shrink-0 ${
                        user?.provider === 'discord' || user?.discord_id || user?.discordConnected
                          ? 'ring-[#5865F2]'
                          : user?.provider === 'google' || user?.google_id || user?.googleConnected
                          ? 'ring-[#4285F4]'
                          : 'ring-blue-500'
                      }`}
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{user?.displayName || user?.display_name || user?.username}</span>
                        {(user?.provider === 'discord' || user?.discord_id || user?.discordConnected) && (
                          <span className="px-1.5 py-0.5 rounded bg-[#5865F2]/20 text-[#5865F2] text-[9px] font-black border border-[#5865F2]/30 shrink-0 flex items-center gap-1">
                            <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            <span>Discord</span>
                          </span>
                        )}
                        {(user?.provider === 'google' || user?.google_id || user?.googleConnected) && (
                          <span className="px-1.5 py-0.5 rounded bg-[#4285F4]/20 text-[#4285F4] text-[9px] font-black border border-[#4285F4]/30 shrink-0 flex items-center gap-1">
                            <svg className="w-2 h-2" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span>Google</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{user?.email}</span>
                    </div>
                    <span className="font-extrabold text-blue-400 text-xs shrink-0">${walletBalance?.toFixed(2) || '0.00'}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/dashboard?tab=topup');
                    }}
                    className="w-full py-2.5 rounded-xl btn-primary-blue text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Top Up Balance (${walletBalance?.toFixed(2) || '0.00'})</span>
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">+</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
