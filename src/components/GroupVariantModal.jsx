import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingCart, Zap, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function GroupVariantModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const variants = product.variants || [
    { id: 'v1', name: 'Standard Edition / Tier 1', price: product.price || 5.0, stock: 'In Stock' },
    { id: 'v2', name: 'Premium Access / Tier 2', price: (product.price || 5.0) * 1.5, stock: 'In Stock' },
    { id: 'v3', name: 'Lifetime Ultimate Pass', price: (product.price || 5.0) * 2.5, stock: 'In Stock' },
  ];

  const isParentOutOfStock = Boolean(
    product.stockStatus === 'out_of_stock' ||
    product.stockStatus === 'Out of Stock' ||
    (product.availableStock !== undefined && Number(product.availableStock) <= 0)
  );

  const currentVariant = selectedVariant || variants[0];
  const isVariantOutOfStock = isParentOutOfStock || currentVariant.inStock === false || currentVariant.stock === 'Out of Stock';
  const variantStock = isParentOutOfStock ? 0 : (currentVariant.stockCount !== undefined ? currentVariant.stockCount : 99);

  const handleAddToCart = async () => {
    if (isVariantOutOfStock) return;
    setIsAdding(true);
    await addToCart({
      id: `${product.id || 'prod-grp'}-${currentVariant.id}`,
      name: `${product.title} - ${currentVariant.name}`,
      platform: product.category || 'Digital Account',
      price: currentVariant.price || product.price || 1.0,
      unitPrice: currentVariant.price || product.price || 1.0,
      coverImage: currentVariant.image || product.image || (product.iconBadge === 'Discord' ? '/card-discord.png' : '/card-minecraft-java.png'),
      availableStock: variantStock,
    }, quantity, false);
    setIsAdding(false);
    onClose();
  };

  const handleBuyNow = async () => {
    if (isVariantOutOfStock) return;
    await addToCart({
      id: `${product.id || 'prod-grp'}-${currentVariant.id}`,
      name: `${product.title} - ${currentVariant.name}`,
      platform: product.category || 'Digital Account',
      price: currentVariant.price || product.price || 1.0,
      unitPrice: currentVariant.price || product.price || 1.0,
      coverImage: currentVariant.image || product.image || (product.iconBadge === 'Discord' ? '/card-discord.png' : '/card-minecraft-java.png'),
      availableStock: variantStock,
    }, quantity, false);
    onClose();

    if (!isAuthenticated) {
      showToast('Please sign in or register to buy products and complete your order', 'info');
      navigate('/login', {
        state: {
          from: { pathname: '/checkout' },
          message: 'Please sign in or register to complete your purchase and secure your digital keys.',
        },
      });
      return;
    }

    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#0b101f] border border-blue-500/30 p-5 sm:p-6 shadow-2xl z-10 space-y-5 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                {product.category || 'Group Products'}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {product.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#12182b] hover:bg-[#1a233d] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Variant Image Preview Banner */}
          {(currentVariant.image || product.image) && (
            <div className="w-full h-32 sm:h-40 rounded-xl overflow-hidden border border-white/10 shadow-lg relative bg-[#070b16]">
              <img
                src={currentVariant.image || product.image}
                alt={currentVariant.name || product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b101f] via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute bottom-2 left-3 text-xs font-bold text-white drop-shadow">
                {currentVariant.name}
              </div>
            </div>
          )}

          {/* Variants Selector matching Image 1 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Choose Product Package / Variant:
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {variants.map((v) => {
                const isSelected = currentVariant.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 relative ${
                      isSelected
                        ? 'bg-[#0a152d] border-[#2563eb] ring-1 ring-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                        : 'bg-[#070b16] border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-bold text-xs sm:text-sm text-white">{v.name}</span>
                      <span className="font-black text-sm sm:text-base text-blue-400 shrink-0">
                        ${v.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-400">
                      {v.stock || 'In Stock'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f1629] border border-white/5">
            <span className="text-xs font-semibold text-slate-300">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg bg-[#141d33] hover:bg-[#1c2948] text-white font-bold text-sm flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-xs">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg bg-[#141d33] hover:bg-[#1c2948] text-white font-bold text-sm flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Bottom Total & Actions */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Price</span>
              <span className="text-xl font-black text-white">
                ${(currentVariant.price * quantity).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isVariantOutOfStock ? (
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed border border-white/5"
                >
                  Sold Out
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="px-4 py-2.5 rounded-xl bg-[#141d33] hover:bg-[#1c2948] border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="btn-primary-blue px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
