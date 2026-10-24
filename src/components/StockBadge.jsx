import React from 'react';

export default function StockBadge({ status, availableStock, className = '' }) {
  if (status === 'Unlimited') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono shadow-sm ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        Unlimited
      </span>
    );
  }

  if (status === 'Reserved') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono shadow-sm ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Reserved
      </span>
    );
  }

  if (status === 'Out of Stock' || availableStock <= 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono shadow-sm ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        Out of Stock
      </span>
    );
  }

  if (status === 'Low Stock' || (availableStock !== undefined && availableStock <= 4)) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono shadow-sm ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        {availableStock !== undefined ? `${availableStock} Left` : 'Low Stock'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono shadow-sm ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {availableStock !== undefined ? `${availableStock} Left` : 'In Stock'}
    </span>
  );
}
