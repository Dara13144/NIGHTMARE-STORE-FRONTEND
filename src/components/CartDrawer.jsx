import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, subtotal, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#0d1222] border-l border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    Your Cart <span className="text-purple-400">({items.length})</span>
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Your cart is empty</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Discover the latest digital keys, game codes, and gift cards at steep discounts.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/store');
                      }}
                      className="mt-5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/30"
                    >
                      Browse Store
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 relative group"
                    >
                      <img
                        src={item.coverImage}
                        alt={item.name}
                        className="w-18 h-16 w-20 object-cover rounded-lg bg-slate-950 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-100 truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                            {item.platform}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ${item.unitPrice.toFixed(2)} each
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity selector */}
                          <div className="flex items-center gap-1.5 bg-slate-950/80 rounded-lg p-0.5 border border-white/10">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1);
                                } else {
                                  removeFromCart(item.id);
                                }
                              }}
                              className="p-1 hover:text-purple-400 text-slate-400 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-white px-1.5 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.availableStock !== undefined && item.quantity >= item.availableStock}
                              className="p-1 hover:text-purple-400 text-slate-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-white">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 self-start transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout */}
              {items.length > 0 && (
                <div className="p-5 border-t border-white/10 bg-slate-950/40 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-xl font-black text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Instant automated digital delivery via email & account dashboard.
                  </p>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      if (!isAuthenticated) {
                        showToast('Please sign in or register to proceed to checkout', 'info');
                        navigate('/login', {
                          state: {
                            from: { pathname: '/checkout' },
                            message: 'Please sign in or register to complete your purchase and secure your keys.',
                          },
                        });
                        return;
                      }
                      navigate('/checkout');
                    }}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <span>{isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
