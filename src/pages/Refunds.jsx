import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Refunds() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-amber-400" />
          <span>Refund Policy</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Last revised: October 2026</p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#111629]/80 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Nature of Digital Goods</h2>
          <p>
            Due to the immutable nature of digital activation keys and game codes, purchases are generally final once the digital key has been revealed or viewed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Defective or Invalid Codes Guarantee</h2>
          <p>
            In the rare event that an authentic key delivered by NightmareStore cannot be redeemed on the designated launcher (e.g. Steam, Xbox Network), our support team will verify the key log with the publisher and provide a replacement key or full refund within 48 hours.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. How to Request a Review</h2>
          <p>
            Please submit a support ticket via our Support Center including your Order Number, product title, and a full screenshot of the error message displayed by the game client.
          </p>
        </section>
      </div>
    </div>
  );
}
