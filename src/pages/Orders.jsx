import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, ShieldCheck, KeyRound, ChevronRight, AlertCircle, Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedKeyIds, setRevealedKeyIds] = useState(new Set());
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  const toggleReveal = (id) => {
    setRevealedKeyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const localSaved = JSON.parse(localStorage.getItem('sbay_purchase_history') || '[]');
        const res = await api.getOrders({ limit: 50 }).catch(() => null);
        const apiData = res && res.success && res.data ? res.data : [];

        const seenNumbers = new Set();
        const combined = [];

        for (const ord of apiData) {
          const num = ord.order_number || ord.id;
          if (!seenNumbers.has(num)) {
            seenNumbers.add(num);
            combined.push(ord);
          }
        }

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
        console.warn('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Orders</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track order status and access activation receipts.
          </p>
        </div>
        <Link
          to="/keys"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600/30 transition-all self-start sm:self-auto"
        >
          <KeyRound className="w-4 h-4" />
          <span>Go to My Digital Keys</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-900/50 rounded-2xl border border-white/5" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">No Orders Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't purchased any game keys or gift cards yet.
          </p>
          <Link
            to="/store"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            Explore Game Keys
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="glass-card p-6 rounded-3xl border border-white/10 bg-[#111629]/90 space-y-6 shadow-xl"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black text-cyan-300">
                      {ord.order_number}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        ord.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ord.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Placed on {new Date(ord.created_at).toLocaleDateString()} at{' '}
                    {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Paid</span>
                    <span className="text-xl font-black text-white">${ord.total_amount?.toFixed(2)}</span>
                  </div>
                  {ord.status === 'completed' && (
                    <Link
                      to="/keys"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
                    >
                      Unlock Keys
                    </Link>
                  )}
                </div>
              </div>

              {/* Animated Order Status Timeline */}
              <div className="py-2">
                <div className="grid grid-cols-3 gap-2 relative">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">Order Placed</span>
                    <span className="text-[10px] text-slate-500">Inventory Reserved</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        ord.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border border-white/5'
                      }`}
                    >
                      {ord.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-slate-200">Payment Verified</span>
                    <span className="text-[10px] text-slate-500">Test Gateway</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        ord.status === 'completed'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-500 border border-white/5'
                      }`}
                    >
                      {ord.status === 'completed' ? <KeyRound className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-slate-200">Keys Delivered</span>
                    <span className="text-[10px] text-slate-500">Ready in Dashboard</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Purchased Items ({ord.items?.length || 1})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ord.items?.map((item, idx) => (
                    <div key={item.id || idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.cover_image ? (
                          <img src={item.cover_image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-slate-200 block truncate">{item.product_name}</span>
                          <span className="text-[10px] text-slate-500">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-mono text-slate-300 font-bold shrink-0">${((item.unit_price || item.subtotal || ord.total_amount || 0)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivered Digital Keys Card */}
              {((Array.isArray(ord.keys) && ord.keys.length > 0) || ord.deliveredKey) && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Delivered Keys & Codes</span>
                    </span>
                    <Link
                      to="/dashboard?tab=purchases"
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline transition-colors"
                    >
                      <span>Purchase History</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {(Array.isArray(ord.keys) && ord.keys.length > 0
                      ? ord.keys
                      : [{ keyId: `k-${ord.id}`, key: ord.deliveredKey, productName: ord.items?.[0]?.product_name }]
                    ).map((kItem, kIdx) => {
                      const kId = kItem.keyId || `k-${ord.id}-${kIdx}`;
                      const rawKey = kItem.key || ord.deliveredKey || '';
                      const isRevealed = revealedKeyIds.has(kId);

                      return (
                        <div key={kId} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-white/5">
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 block truncate">{kItem.productName || 'License Key'}</span>
                            <span className="font-mono text-xs text-cyan-300 font-bold select-all break-all">
                              {isRevealed ? rawKey : '••••••••-••••••••-••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleReveal(kId)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                              title={isRevealed ? 'Hide Code' : 'Reveal Code'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(kId, rawKey)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              {copiedKeyId === kId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKeyId === kId ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
