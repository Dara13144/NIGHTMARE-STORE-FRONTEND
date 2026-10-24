import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-purple-400" />
          <span>Terms of Service</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Last revised: October 2026</p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#111629]/80 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using NightmareStore, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our digital marketplace or services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Digital Product Distribution</h2>
          <p>
            NightmareStore sells digital activation codes, gift cards, and game keys for third-party platforms including Steam, Xbox, PlayStation, and Minecraft. All product keys are digital goods delivered electronically to your account dashboard and email.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. User Responsibilities & Account Security</h2>
          <p>
            You are responsible for safeguarding your login credentials (including your linked Discord OAuth session). You agree not to resell, trade, or publicly distribute keys acquired on this platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Regional Restrictions & Compatibility</h2>
          <p>
            It is the customer's sole responsibility to check the platform, client compatibility, and region restrictions marked on the product page prior to concluding a purchase.
          </p>
        </section>
      </div>
    </div>
  );
}
