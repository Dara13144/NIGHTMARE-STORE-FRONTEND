import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Game Categories & Gift Cards
        </h1>
        <p className="text-sm text-slate-400">
          Explore digital codes categorized by gaming platform, genre, and subscription tiers.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-900/60 rounded-2xl border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/store?category=${cat.slug}`}
              className="glass-card group p-6 rounded-2xl border border-white/5 bg-[#111629]/70 hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 group-hover:bg-cyan-500/20 text-purple-400 group-hover:text-cyan-300 flex items-center justify-center transition-colors mb-4">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 mt-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-400">
                  {cat.productCount} {cat.productCount === 1 ? 'Available Title' : 'Available Titles'}
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all">
                  Browse <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
