import React, { useState } from 'react';
import { Headphones, Send, CheckCircle2, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Support() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.displayName || user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Key Activation');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitSupportTicket({
        name,
        email,
        subject,
        category,
        order_number: orderNumber || undefined,
        message,
      });

      if (res.success) {
        setSubmittedTicket(res.data);
        showToast('Support ticket opened! Our staff will respond shortly.', 'success');
        setSubject('');
        setMessage('');
        setOrderNumber('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Headphones className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Customer Support & Help Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Have questions regarding key activation, order tracking, or regional compatibility? We are here 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Support Ticket Form */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#111629]/90 shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span>Submit a Support Request</span>
            </h2>

            {submittedTicket && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket #{submittedTicket.id} Created</span>
                </div>
                <p className="text-slate-300">
                  A verification confirmation has been sent to {submittedTicket.email}.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Key Activation">Key Activation Assistance</option>
                    <option value="Order Tracking">Order & Payment Query</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Order # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. DARA-849201"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the error code, launcher error, or question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Ticket...' : 'Open Support Ticket'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Quick Help & FAQ Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#111629]/90 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span>Direct Support Channels</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-3">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="block font-semibold text-white">Email Desk</span>
                  <span className="text-slate-400 font-mono">support@darastore.gg</span>
                </div>
              </div>

              <a
                href="https://discord.gg/PyjjHvdf2"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-[#5865F2]/20 border border-white/5 hover:border-[#5865F2]/40 flex items-center gap-3 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 p-1 flex items-center justify-center shrink-0 border border-[#5865F2]/30">
                  <img src="/discord-logo.png" alt="Discord" className="w-full h-full object-contain rounded-sm group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="block font-semibold text-white group-hover:text-blue-300 transition-colors">Discord Community</span>
                  <span className="text-slate-400 text-xs">Join our Discord server for instant member support</span>
                </div>
              </a>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#111629]/90 space-y-4">
            <h3 className="text-base font-bold text-white">Common Activation Fixes</h3>
            <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside leading-relaxed">
              <li>Ensure you have selected the correct platform client (e.g. Steam vs EA App vs Microsoft Store).</li>
              <li>Keys with dashes should usually include hyphens (e.g. <span className="font-mono text-cyan-300">XXXXX-XXXXX-XXXXX</span>).</li>
              <li>Verify that your store account country matches the region tag of the code.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
