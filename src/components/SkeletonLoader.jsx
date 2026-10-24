import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111629]/60 p-4 animate-pulse">
      <div className="aspect-[16/10] bg-slate-800/50 rounded-xl mb-4" />
      <div className="w-24 h-4 bg-slate-800/60 rounded-full mb-3" />
      <div className="w-3/4 h-5 bg-slate-700/60 rounded mb-2" />
      <div className="w-1/2 h-3 bg-slate-800/40 rounded mb-4" />
      <div className="flex justify-between items-center pt-3 border-t border-white/5">
        <div className="w-16 h-6 bg-slate-700/50 rounded" />
        <div className="w-20 h-8 bg-slate-700/50 rounded-xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 p-4 rounded-xl bg-slate-800/30 border border-white/5">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="h-4 bg-slate-700/50 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
}
