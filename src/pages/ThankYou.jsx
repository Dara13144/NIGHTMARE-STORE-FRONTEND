import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, KeyRound, ShoppingBag, Wallet, ArrowRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const { walletBalance, refreshWallet, refreshUser } = useAuth();
  const paymentId = searchParams.get('payment_id') || searchParams.get('id');

  useEffect(() => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (refreshWallet) refreshWallet();
    if (refreshUser) refreshUser();
  }, []);

  return (
    <div className="sbay-grid-bg min-h-[85vh] flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg rounded-3xl bg-[#090e1c] border border-emerald-500/30 p-8 sm:p-10 shadow-2xl text-center space-y-6"
      >
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
            Payment Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Thank You for Your Payment!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Your ABA KHQR payment has been verified and processed successfully. Your account balance and digital keys have been updated.
          </p>
        </div>

        {paymentId && (
          <div className="p-3 rounded-xl bg-[#060a16] border border-white/5 text-xs text-slate-400 font-mono">
            Transaction ID: <span className="text-white font-bold">{paymentId}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to="/keys"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>View My Digital Keys</span>
          </Link>
          <Link
            to="/dashboard?tab=topup"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0d1428] hover:bg-[#131f3e] border border-blue-500/30 text-slate-200 text-xs font-bold transition-all active:scale-95"
          >
            <Wallet className="w-4 h-4 text-blue-400" />
            <span>Wallet & Balance</span>
          </Link>
        </div>

        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
