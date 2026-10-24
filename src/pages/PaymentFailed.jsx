import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, MessageSquare, ArrowLeft } from 'lucide-react';

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id') || searchParams.get('id');

  return (
    <div className="sbay-grid-bg min-h-[85vh] flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg rounded-3xl bg-[#090e1c] border border-rose-500/30 p-8 sm:p-10 shadow-2xl text-center space-y-6"
      >
        {/* Failed Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
          <AlertCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-wider border border-rose-500/30">
            Payment Incomplete
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Payment Cancelled or Expired
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            The ABA KHQR transaction was not completed or the QR code reached its time limit. No charges have been made.
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
            to="/checkout"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Checkout Again</span>
          </Link>
          <Link
            to="/dashboard?tab=topup"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0d1428] hover:bg-[#131f3e] border border-blue-500/30 text-slate-200 text-xs font-bold transition-all active:scale-95"
          >
            <span>Top Up Wallet</span>
          </Link>
        </div>

        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link
            to="/support"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Need Help? Contact Support</span>
          </Link>
          <span>•</span>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
