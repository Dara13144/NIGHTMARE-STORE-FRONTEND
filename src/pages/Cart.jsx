import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, LogIn, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart, addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddSampleItem = () => {
    addToCart({
      id: 'fivem-activation-code',
      name: 'FiveM Activation Code',
      platform: 'Fivem',
      unitPrice: 0.50,
      price: 0.50,
      coverImage: '/card-rockstar-hd.png',
      availableStock: 99,
    }, 1, false);
  };

  return (
    <div className="sbay-grid-bg min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-6 max-w-6xl mx-auto relative z-10">
      {/* Title & Item Counter matching Screenshot 1 */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          You have {items.length} item(s) in your cart.
        </p>
      </div>

      {/* Auth Notification Banner (Screenshot 1: Please login to manage your cart and checkout. Login here.) */}
      {!isAuthenticated && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#090e1c] border border-white/5 text-xs text-slate-400 flex items-center justify-center gap-1.5 shadow-sm text-center">
          <span className="text-slate-400">ⓘ</span>
          <span>Please login to manage your cart and checkout.</span>
          <Link
            to="/login"
            state={{
              from: { pathname: '/checkout' },
              message: 'Please sign in or register to complete your purchase and secure your keys.',
            }}
            className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors"
          >
            Login here.
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#090d18] p-10 sm:p-14 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Your Shopping Cart is Empty</h2>
            <p className="text-xs text-slate-400">
              Browse authentic game keys, activation codes, and subscriptions to get started.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/products"
              className="px-6 py-2.5 rounded-xl btn-primary-blue text-xs sm:text-sm font-bold shadow-lg"
            >
              Browse Products
            </Link>

            <button
              onClick={handleAddSampleItem}
              className="px-5 py-2.5 rounded-xl bg-[#0d1322] hover:bg-[#131b30] border border-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-bold transition-colors"
            >
              + Add FiveM Activation Code ($0.50)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Table Card (Screenshot 1) */}
          <div className="rounded-2xl border border-white/5 bg-[#090d18] overflow-hidden shadow-2xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-3.5 border-b border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-12 sm:col-span-6">PRODUCT</div>
              <div className="hidden sm:block sm:col-span-2 text-center">PRICE</div>
              <div className="hidden sm:block sm:col-span-2 text-center">QUANTITY</div>
              <div className="hidden sm:block sm:col-span-2 text-right">TOTAL</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0, padding: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-12 px-4 sm:px-6 py-4 sm:py-5 items-center gap-3 sm:gap-4 hover:bg-white/[0.015] transition-colors"
                  >
                    {/* Product Column */}
                    <div className="col-span-12 sm:col-span-6 flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#080d1a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-1">
                        <img
                          src={item.coverImage || '/card-rockstar-hd.png'}
                          alt={item.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-white">{item.name}</h3>
                          {item.availableStock !== undefined && item.availableStock <= 0 && (
                            <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 capitalize">
                          {item.platform || 'Digital Activation'}
                        </span>
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="col-span-4 sm:col-span-2 sm:text-center text-xs sm:text-sm font-bold text-white">
                      <span className="sm:hidden text-slate-400 font-normal mr-1">Price:</span>
                      ${item.unitPrice?.toFixed(2) || (item.price?.toFixed(2) || '0.50')}
                    </div>

                    {/* Quantity Selector Column */}
                    <div className="col-span-4 sm:col-span-2 flex items-center sm:justify-center">
                      <div className="inline-flex items-center rounded-lg bg-[#050811] border border-white/10 px-1 py-0.5">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.id, item.quantity - 1);
                            } else {
                              removeFromCart(item.id);
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <motion.span
                          key={item.quantity}
                          initial={{ scale: 0.7 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                          className="w-7 text-center font-bold text-xs text-white"
                        >
                          {item.quantity}
                        </motion.span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.availableStock !== undefined && item.quantity >= item.availableStock}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 active:scale-90 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Total & Remove Button Column */}
                    <div className="col-span-4 sm:col-span-2 flex flex-col items-end gap-1.5">
                      <motion.span
                        key={item.quantity}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="font-black text-sm sm:text-base text-white"
                      >
                        ${(item.subtotal || item.quantity * (item.unitPrice || item.price || 0.5)).toFixed(2)}
                      </motion.span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold border border-rose-500/20 transition-all active:scale-95"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Card / Checkout Action Bar (Screenshot 1) */}
          <div className="rounded-2xl border border-white/5 bg-[#090d18] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            {/* Subtotal */}
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 block font-medium">Subtotal</span>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/products"
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#0d1322] hover:bg-[#131b30] border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>← Continue Shopping</span>
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  state={{
                    from: { pathname: '/checkout' },
                    message: 'Please sign in or register to complete your purchase and secure your keys.',
                  }}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl btn-primary-blue text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login to Checkout</span>
                </Link>
              ) : (
                <Link
                  to="/checkout"
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl btn-primary-blue text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
