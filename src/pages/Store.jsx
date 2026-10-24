import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, ShieldAlert } from 'lucide-react';
import SbayProductCard from '../components/SbayProductCard';
import GroupVariantModal from '../components/GroupVariantModal';
import { api } from '../services/api';
import { CATEGORY_PILLS, CATALOG_ITEMS } from '../constants/catalog';

export default function Store() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const initialCategory = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [activeGroupProduct, setActiveGroupProduct] = useState(null);
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await api.getProducts({ limit: 100 });
        if (mounted && res?.success && res.data) {
          setLiveProducts(res.data);
        }
      } catch (err) {
        console.warn('Failed to load live store items:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProducts();

    const handleRefresh = () => fetchProducts();
    const handleProductDeleted = (e) => {
      const deletedId = e.detail?.id;
      const deletedRealId = e.detail?.real_id;
      if (mounted) {
        setLiveProducts((prev) =>
          prev.filter(
            (p) =>
              p.id !== deletedId &&
              p.real_id !== deletedId &&
              (!deletedRealId || (p.id !== deletedRealId && p.real_id !== deletedRealId))
          )
        );
      }
      fetchProducts();
    };
    const handleProductUpdated = (e) => {
      if (e.detail?.id && e.detail?.cover_image) {
        setLiveProducts((prev) =>
          prev.map((p) =>
            p.id === e.detail.id || p.slug === e.detail.id
              ? { ...p, cover_image: e.detail.cover_image, image: e.detail.cover_image }
              : p
          )
        );
      }
      fetchProducts();
    };

    window.addEventListener('refresh-store-products', handleRefresh);
    window.addEventListener('product-deleted', handleProductDeleted);
    window.addEventListener('product-updated', handleProductUpdated);
    window.addEventListener('storage', handleRefresh);

    return () => {
      mounted = false;
      window.removeEventListener('refresh-store-products', handleRefresh);
      window.removeEventListener('product-deleted', handleProductDeleted);
      window.removeEventListener('product-updated', handleProductUpdated);
      window.removeEventListener('storage', handleRefresh);
    };
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Synchronize catalog items with live database stock and newly added products
  const mergedCatalog = useMemo(() => {
    if (!liveProducts || liveProducts.length === 0) {
      return CATALOG_ITEMS;
    }

    // Build map of static metadata presets for glowing colors, tags, etc.
    const staticMap = new Map();
    CATALOG_ITEMS.forEach((ci) => {
      if (ci.id) staticMap.set(String(ci.id).toLowerCase(), ci);
      if (ci.slug) staticMap.set(String(ci.slug).toLowerCase(), ci);
      if (ci.title) staticMap.set(String(ci.title).toLowerCase().trim(), ci);
    });

    return liveProducts
      .filter((lp) => {
        if (lp.is_archived || lp.is_published === false) return false;
        if (
          lp.id === 'prod-fivem-code' ||
          lp.slug?.includes('activation-code') ||
          lp.name?.toLowerCase().includes('activation code')
        ) {
          return false;
        }
        return true;
      })
      .map((lp) => {
        const staticMeta =
          staticMap.get(String(lp.id).toLowerCase()) ||
          (lp.real_id ? staticMap.get(String(lp.real_id).toLowerCase()) : null) ||
          (lp.slug ? staticMap.get(String(lp.slug).toLowerCase()) : null) ||
          staticMap.get(String(lp.name || '').toLowerCase().trim()) ||
          CATALOG_ITEMS.find((ci) => {
            const pName = (lp.name || '').toLowerCase();
            const iTitle = (ci.title || '').toLowerCase();
            return pName.includes(iTitle) || iTitle.includes(pName);
          });

        const isLiveOut = lp.availableStock <= 0 || lp.stockStatus === 'Out of Stock';

        return {
          id: lp.id,
          real_id: lp.real_id,
          title: lp.name || lp.title || staticMeta?.title,
          slug: lp.slug || staticMeta?.slug,
          category: lp.category?.name || lp.platform || staticMeta?.category || 'Digital Key',
          stockStatus: isLiveOut ? 'out_of_stock' : 'in_stock',
          isOutOfStock: isLiveOut,
          availableStock: lp.availableStock !== undefined ? lp.availableStock : (staticMeta?.availableStock || 0),
          price: lp.current_price !== undefined ? lp.current_price : (staticMeta?.price || 0),
          image: lp.cover_image || lp.coverImage || lp.image || staticMeta?.image || '/card-rockstar-account.png',
          glow: staticMeta?.glow || (lp.cover_image?.includes('rockstar') ? 'rgba(245, 158, 11, 0.55)' : 'rgba(168, 85, 247, 0.55)'),
          iconSubtext: staticMeta?.iconSubtext || lp.name || staticMeta?.title,
          platform: lp.platform || staticMeta?.category,
          deliveryMethod: lp.deliveryMethod,
          productType: lp.productType,
        };
      });
  }, [liveProducts]);

  // Filter products by category and search keyword
  const filteredProducts = useMemo(() => {
    return mergedCatalog.filter((item) => {
      const matchCat =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [mergedCatalog, searchQuery, selectedCategory]);

  return (
    <div className="sbay-grid-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* 1. Page Title */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          All Products
        </h1>
      </div>

      {/* 2. Search & Filter Bar Container (Matching Screenshot 1) */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-[#090e1c]/80 border border-white/5 p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-5">
        {/* Search input with Blue Search Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1428] border border-white/10 rounded-2xl py-3 pl-10 sm:pl-11 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            className="btn-primary-blue w-11 h-11 sm:w-auto px-0 sm:px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
            aria-label="Search"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Filter Pills Grid (Matching Screenshot 1 & 2) */}
        <div className="space-y-2 text-center">
          {/* Row 1 (6 items matching screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {['All', 'Discord', 'Fivem', 'Giftlink', 'Minecraft', 'Social'].map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-105'
                      : 'bg-[#0d1428] hover:bg-[#131d38] text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Row 2 (4 items matching screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {['Steam', 'Tool', 'mail', 'vpn'].map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-105'
                      : 'bg-[#0d1428] hover:bg-[#131d38] text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Products Grid (Matching Screenshots 1 & 2: 2-column on mobile, 4-column on desktop) */}
      <div id="catalog-grid" className="max-w-6xl mx-auto">
        <motion.div
          layout
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <AnimatePresence>
            {filteredProducts.map((p) => (
              <SbayProductCard
                key={p.id}
                product={p}
                onOpenGroup={(item) => setActiveGroupProduct(item)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-[#0b101f] border border-white/5 rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="font-bold text-white text-base">No items found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try searching with another keyword or selecting 'All' categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl btn-primary-blue text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Group Variant Modal */}
      {activeGroupProduct && (
        <GroupVariantModal
          product={activeGroupProduct}
          onClose={() => setActiveGroupProduct(null)}
        />
      )}
    </div>
  );
}
