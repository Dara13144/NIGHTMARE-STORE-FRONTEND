import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Lock className="w-8 h-8 text-cyan-400" />
          <span>Privacy Policy</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Last revised: October 2026</p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#111629]/80 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
          <p>
            When you register via Discord OAuth, we only collect your Discord user ID, username, avatar URL, and verified email address. We do not request your contact list, server details, or private messages.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Encryption at Rest</h2>
          <p>
            All digital game keys stored in our database are encrypted using AES-256-GCM. Decryption happens dynamically on-demand only when authorized customers request their own purchased keys.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Third-Party Payments</h2>
          <p>
            Payment processing is conducted via secure signed gateways. We do not store credit card numbers, CVVs, or bank credentials on our servers.
          </p>
        </section>
      </div>
    </div>
  );
}
