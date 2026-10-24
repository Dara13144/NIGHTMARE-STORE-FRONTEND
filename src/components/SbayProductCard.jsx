import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Folder, Check, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { getProductCoverImage } from '../services/productImageService';

export default function SbayProductCard({ product, onOpenGroup }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const displayImage = product.cover_image || product.coverImage || product.image || getProductCoverImage(product);

  const isOutOfStock = Boolean(
    product.stockStatus === 'out_of_stock' ||
    product.stockStatus === 'Out of Stock' ||
    product.isOutOfStock ||
    (product.availableStock !== undefined && Number(product.availableStock) <= 0)
  );
  const isGroup = Boolean(product.isGroup || product.priceRange || product.variants);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    const cover = displayImage || '/card-rockstar-hd.png';
    await addToCart({
      id: product.id || `prod-${Date.now()}`,
      name: product.title,
      platform: product.category || 'Digital Account',
      price: typeof product.price === 'number' ? product.price : 0.50,
      unitPrice: typeof product.price === 'number' ? product.price : 0.50,
      coverImage: cover,
      availableStock: product.availableStock !== undefined ? Number(product.availableStock) : 99,
    }, 1, false);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const cover = displayImage || '/card-rockstar-hd.png';
    await addToCart({
      id: product.id || `prod-${Date.now()}`,
      name: product.title,
      platform: product.category || 'Digital Account',
      price: typeof product.price === 'number' ? product.price : 0.50,
      unitPrice: typeof product.price === 'number' ? product.price : 0.50,
      coverImage: cover,
      availableStock: product.availableStock !== undefined ? Number(product.availableStock) : 99,
    }, 1, false);

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
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="sbay-card group rounded-2xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden border border-white/5 bg-[#090e1c] hover:border-blue-500/40 cursor-pointer"
      onClick={() => {
        if (isGroup && onOpenGroup) {
          onOpenGroup(product);
        } else {
          const targetSlug = product.slug || (
            product.id === 'prod-fivem-ready' || product.id === 'prod-fivem-code' ? 'rockstar-account' :
            product.id === 'prod-gemini-18m' ? 'gemini-pro-18month' :
            product.id === 'prod-discord-group' ? 'discord-account' :
            product.id === 'prod-nitro-boosts' ? '14x-1-month-server-boosts' :
            product.id === 'prod-nitro-3m' ? '14x-1-month-server-boosts' :
            product.id === 'prod-mc-group' ? 'minecraft-account' :
            product.id
          );
          navigate(`/products/${targetSlug}`);
        }
      }}
      style={{
        boxShadow: `0 0 30px -10px ${product.glow || 'rgba(59, 130, 246, 0.3)'}`,
      }}
    >
      {/* Radial Ambient Glow (Vibrant matching Screenshot 1 & 2) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-55 sm:opacity-45 group-hover:opacity-75 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 32%, ${product.glow || 'rgba(59, 130, 246, 0.45)'} 0%, transparent 68%)`,
        }}
      />

      {/* Top Header: Stock Badge */}
      <div className="flex items-center justify-end relative z-10 min-h-[22px]">
        {isOutOfStock ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Out of Stock
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {product.availableStock !== undefined && product.availableStock > 0
              ? `${product.availableStock} In Stock`
              : 'In Stock'}
          </span>
        )}
      </div>

      {/* Center Visual Area */}
      <div className="py-5 flex flex-col items-center justify-center relative z-10 flex-1 min-h-[110px]">
        {displayImage ? (
          <div
            className={`${
              displayImage.includes('card-rockstar')
                ? 'w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-300'
                : 'w-24 h-16 flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300'
            }`}
          >
            <img
              src={displayImage}
              alt={product.title}
              className={`${
                displayImage.includes('card-rockstar')
                  ? 'w-14 h-14 object-contain rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.65)]'
                  : displayImage.includes('card-gemini')
                  ? 'w-full h-full object-contain p-1 rounded-xl'
                  : 'w-full h-full object-cover rounded-xl'
              }`}
              onError={(e) => {
                e.currentTarget.src = '/card-rockstar-hd.png';
              }}
            />
          </div>
        ) : product.iconBadge === '✦ Gemini' ? (
          <div className="group-hover:scale-105 transition-transform">
            <img
              src="/card-gemini.png"
              alt="Gemini"
              className="w-24 h-12 object-contain rounded-xl shadow-xl ring-1 ring-white/10"
            />
          </div>
        ) : product.iconBadge === 'NITRO' ? (
          <div className="group-hover:scale-105 transition-transform">
            <img
              src="/card-nitro.png"
              alt="Discord Nitro"
              className="max-h-14 w-auto object-contain rounded-xl shadow-xl"
            />
          </div>
        ) : product.iconBadge === 'Nord VPN' ? (
          <div className="w-14 h-14 rounded-full bg-[#3876F2] text-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13H5.5L12 6.5z" />
            </svg>
          </div>
        ) : product.iconBadge === 'Outlook' ? (
          <div className="w-16 h-14 rounded-xl bg-gradient-to-tr from-[#0078D4] to-[#28A8EA] text-white flex items-center justify-center font-black text-xl shadow-xl group-hover:scale-105 transition-transform relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow">
              <span className="text-white font-black text-sm">O</span>
            </div>
          </div>
        ) : product.iconBadge === 'Steam' ? (
          <div className="w-14 h-14 rounded-xl bg-[#171a21] border border-white/10 text-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
            <svg className="w-8 h-8 fill-current text-white" viewBox="0 0 24 24">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12S18.605 0 11.979 0z"/>
            </svg>
          </div>
        ) : product.iconBadge === 'IPVanish' ? (
          <div className="w-16 h-14 rounded-xl bg-black border border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center font-bold text-xs shadow-xl group-hover:scale-105 transition-transform p-1">
            <div className="text-emerald-400 font-mono font-black text-sm flex items-center gap-1">
              <span>VPN</span>
            </div>
            <span className="text-[10px] font-black text-white tracking-wide">IP Vanish</span>
          </div>
        ) : product.iconBadge === 'Discord' ? (
          <div className="w-14 h-14 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/card-rockstar-hd.png"
              alt="Rockstar"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        )}

        {/* Small subtitle or account ready under icon */}
        {(product.iconSubtext || product.subtext) && (
          <span className="text-xs text-white font-bold mt-2.5 tracking-tight text-center drop-shadow">
            {product.iconSubtext || product.subtext}
          </span>
        )}
      </div>

      {/* Product Tag & Title */}
      <div className="relative z-10 space-y-1.5 pt-2 text-left">
        {product.category && (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400">
            {product.category}
          </span>
        )}

        <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {product.title}
        </h3>
      </div>

      {/* Pricing & Action Buttons Footer */}
      <div className="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-3">
        {/* Price Display */}
        <div className="font-bold text-white text-xs sm:text-sm">
          {product.priceRange ? product.priceRange : `$${product.price?.toFixed(2) || '0.50'}`}
        </div>

        {/* Actions */}
        {isGroup ? (
          <button
            onClick={() => onOpenGroup(product)}
            className="btn-primary-blue px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Folder className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Group</span>
          </button>
        ) : isOutOfStock ? (
          <button
            disabled
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#121829] text-slate-500 text-[10px] sm:text-xs font-semibold cursor-not-allowed border border-white/5"
          >
            Sold Out
          </button>
        ) : (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handleAddToCart}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#131b2e] hover:bg-[#1a253e] border border-white/10 text-[10px] sm:text-xs font-semibold text-slate-200 transition-all flex items-center gap-1 active:scale-95"
              title="Add to Cart"
            >
              {isAdding ? <Check className="w-3 h-3 text-emerald-400" /> : <ShoppingCart className="w-3 h-3 text-slate-400" />}
              <span>Add</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="btn-primary-blue px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
