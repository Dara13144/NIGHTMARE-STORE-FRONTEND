import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  ChevronDown,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Keys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedKeyIds, setRevealedKeyIds] = useState(new Set());
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [openInstructionsId, setOpenInstructionsId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadCustomerKeys() {
      try {
        setLoading(true);
        // Fetch customer's orders and aggregate delivered keys
        const ordersRes = await api.getOrders();
        if (ordersRes.success && ordersRes.data) {
          const completed = ordersRes.data.filter((o) => o.status === 'completed');
          const allDelivered = [];

          for (const ord of completed) {
            try {
              const kRes = await api.getOrderKeys(ord.id);
              if (kRes.success && kRes.data?.keys) {
                allDelivered.push(...kRes.data.keys.map((k) => ({ ...k, orderNumber: ord.order_number })));
              }
            } catch (err) {
              console.warn(`Could not load keys for order ${ord.id}:`, err.message);
            }
          }

          setKeys(allDelivered);
        }
      } catch (err) {
        console.warn('Failed to load keys:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerKeys();
  }, []);

  const toggleReveal = (keyId) => {
    setRevealedKeyIds((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };

  const copyKey = (keyId, keyValue) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedKeyId(keyId);
    showToast('Digital key copied to clipboard!', 'info');
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-cyan-400" />
            <span>My Digital Keys</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access, reveal, and redeem your purchased digital keys and activation codes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Decrypted On-Demand (AES-256-GCM)</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-900/50 rounded-2xl border border-white/5" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">No Keys Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You do not currently have any purchased digital keys in this account.
          </p>
          <Link
            to="/store"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30"
          >
            Browse Game Keys
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {keys.map((k) => {
            const isRevealed = revealedKeyIds.has(k.keyId);
            const isCopied = copiedKeyId === k.keyId;
            const isInstructionsOpen = openInstructionsId === k.keyId;

            return (
              <div
                key={k.keyId}
                className="glass-card p-6 rounded-3xl border border-white/10 bg-[#111629]/90 space-y-5 shadow-xl"
              >
                {/* Product Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={k.coverImage}
                      alt={k.productName}
                      className="w-16 h-16 object-cover rounded-xl bg-slate-950 shrink-0 border border-white/5"
                    />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">{k.productName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-semibold">
                          {k.platform}
                        </span>
                        <span className="text-xs text-slate-400">{k.region} Region</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-400 font-mono">Order {k.orderNumber}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
                    <Zap className="w-3.5 h-3.5" />
                    Delivered & Verified
                  </span>
                </div>

                {/* Key or Account Display */}
                {(() => {
                  const isAccount = k.itemType === 'digital_account' || (k.key && k.key.includes(':'));
                  let username = '';
                  let password = '';
                  if (isAccount && k.key.includes(':')) {
                    const firstColon = k.key.indexOf(':');
                    username = k.key.slice(0, firstColon).trim();
                    password = k.key.slice(firstColon + 1).trim();
                  }

                  if (isAccount && username) {
                    return (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-purple-500/20 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <span className="text-[11px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>Digital Account Credentials</span>
                          </span>
                          <button
                            onClick={() => copyKey(`${k.keyId}-full`, k.key)}
                            className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedKeyId === `${k.keyId}-full` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKeyId === `${k.keyId}-full` ? 'Full Copied!' : 'Copy user:pass'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Username Field */}
                          <div className="p-3 rounded-xl bg-[#090d19] border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Username / Email
                            </span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs sm:text-sm text-cyan-300 font-bold select-all truncate">
                                {username}
                              </span>
                              <button
                                onClick={() => copyKey(`${k.keyId}-user`, username)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                                title="Copy Username"
                              >
                                {copiedKeyId === `${k.keyId}-user` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedKeyId === `${k.keyId}-user` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Password Field */}
                          <div className="p-3 rounded-xl bg-[#090d19] border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Password
                            </span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs sm:text-sm text-amber-300 font-bold select-all truncate">
                                {isRevealed ? password : '••••••••••••'}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => toggleReveal(k.keyId)}
                                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                  title={isRevealed ? 'Hide Password' : 'Show Password'}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => copyKey(`${k.keyId}-pass`, password)}
                                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                                  title="Copy Password"
                                >
                                  {copiedKeyId === `${k.keyId}-pass` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedKeyId === `${k.keyId}-pass` ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Standard License Key Code Bar
                  return (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                          Activation License Code
                        </span>
                        <div className="font-mono text-base sm:text-lg tracking-wider text-slate-200">
                          {isRevealed ? (
                            <span className="text-cyan-300 font-bold select-all">{k.key}</span>
                          ) : (
                            <span className="text-slate-500 select-none">••••-••••-••••-••••</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => toggleReveal(k.keyId)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <span>{isRevealed ? 'Hide' : 'Reveal Key'}</span>
                        </button>

                        <button
                          onClick={() => copyKey(k.keyId, k.key)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                          <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Activation Instructions Toggle */}
                <div>
                  <button
                    onClick={() => setOpenInstructionsId(isInstructionsOpen ? null : k.keyId)}
                    className="flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    <span>How to activate on {k.platform}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isInstructionsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isInstructionsOpen && (
                    <div className="mt-2 p-4 rounded-xl bg-slate-950/70 border border-white/5 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {k.activationInstructions}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
