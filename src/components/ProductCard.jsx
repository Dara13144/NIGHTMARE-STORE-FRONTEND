import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Zap, ShieldCheck } from 'lucide-react';
import StockBadge from './StockBadge';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.availableStock <= 0;

  const discountPercent = product.comparison_price && product.comparison_price > product.current_price
    ? Math.round(((product.comparison_price - product.current_price) / product.comparison_price) * 100)
    : null;

  return (
    <div className="glass-card group rounded-2xl overflow-hidden flex flex-col justify-between border border-white/5 bg-[#111629]/80 hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)] transition-all duration-300">
      <div>
        {/* Thumbnail & Image Zoom Container */}
        <Link to={`/products/${product.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-900/50">
          <img
            src={product.cover_image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          />

          {/* Discount Pill */}
          {discountPercent && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-lg">
              -{discountPercent}%
            </span>
          )}

          {/* Platform Tag */}
          <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-md">
            {product.platform}
          </span>

          {/* Region Tag */}
          <span className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md text-slate-300 text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            {product.region}
          </span>
        </Link>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="mb-2">
            <StockBadge status={product.stockStatus} availableStock={product.availableStock} />
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Actions Footer */}
      <div className="p-4 sm:p-5 pt-0 mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-3">
        <div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ${product.current_price?.toFixed(2)}
          </div>
          {product.comparison_price && (
            <div className="text-xs text-slate-500 line-through">
              ${product.comparison_price.toFixed(2)}
            </div>
          )}
        </div>

        <button
          onClick={() => addToCart(product.id, 1, true)}
          disabled={isOutOfStock}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isOutOfStock
              ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98]'
          }`}
          title={isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">{isOutOfStock ? 'Sold Out' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
}
