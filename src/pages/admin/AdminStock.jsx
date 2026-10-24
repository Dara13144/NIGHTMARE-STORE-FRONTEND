import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  Package,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Clock,
  History,
  Plus,
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Layers,
  ArrowDownUp,
  Lock,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getProductCoverImage } from '../../services/productImageService';

export default function AdminStock() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modals
  const [selectedProductForAdd, setSelectedProductForAdd] = useState(null);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);
  const [productDetailsData, setProductDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Add Stock Form State
  const [addStockType, setAddStockType] = useState('license_keys');
  const [rawItemsInput, setRawItemsInput] = useState('');
  const [quantityInput, setQuantityInput] = useState(10);
  const [stockNotes, setStockNotes] = useState('');
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

  // Clear All Stock State
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Delete Product State
  const [deleteTargetProduct, setDeleteTargetProduct] = useState(null);
  const [deleteMode, setDeleteMode] = useState('safe'); // 'safe' | 'permanent'
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const handleConfirmDeleteProduct = async () => {
    if (!deleteTargetProduct) return;
    try {
      setIsDeletingProduct(true);
      const isPermanent = deleteMode === 'permanent';
      const targetId = deleteTargetProduct.productId || deleteTargetProduct.id;
      const res = await api.admin.deleteProduct(targetId, isPermanent);
      if (res.success) {
        showToast(res.message || 'Product removed successfully', 'success');
        setProducts((prev) => prev.filter((p) => p.productId !== targetId && p.id !== targetId));
        setDeleteTargetProduct(null);
        fetchOverview();

        // Broadcast events so Store, Home, and other components reflect deletion immediately
        window.dispatchEvent(new CustomEvent('refresh-store-products'));
        window.dispatchEvent(
          new CustomEvent('product-deleted', { detail: { id: targetId } })
        );
      } else {
        showToast(res.error || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Could not delete product', 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleClearAllStock = async () => {
    try {
      setIsClearingAll(true);
      const res = await api.admin.clearAllStock();
      if (res.success) {
        showToast(res.message || 'All product stock cleared successfully!', 'success');
        setIsClearAllModalOpen(false);
        fetchOverview();
        fetchProducts();
      } else {
        showToast(res.error || 'Failed to clear stock', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear stock', 'error');
    } finally {
      setIsClearingAll(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await api.admin.getStockOverview();
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      console.warn('Failed to load stock overview:', err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getStockProducts({
        search,
        status: statusFilter,
        type: typeFilter,
        page,
        limit: 30,
      });
      if (res.success && res.data) {
        setProducts(res.data.items);
        setTotalProducts(res.data.total);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load stock items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter, typeFilter, page]);

  // Open Add Stock Modal
  const handleOpenAddStock = (product) => {
    setSelectedProductForAdd(product);
    if (product.productType === 'digital_account') {
      setAddStockType('digital_accounts');
    } else if (product.inventoryMode === 'quantity_pool') {
      setAddStockType('quantity_pool');
    } else {
      setAddStockType('license_keys');
    }
    setRawItemsInput('');
    setQuantityInput(10);
    setStockNotes('');
  };

  // Submit Add Stock
  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductForAdd) return;

    try {
      setIsSubmittingStock(true);
      let payload = {
        type: addStockType,
        notes: stockNotes,
      };

      if (addStockType === 'license_keys' || addStockType === 'digital_accounts') {
        const lines = rawItemsInput
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length === 0) {
          showToast('Please enter at least one key or account row', 'error');
          return;
        }
        payload.items = lines;
      } else {
        payload.quantity = parseInt(quantityInput, 10) || 0;
      }

      const res = await api.admin.addProductStock(selectedProductForAdd.productId, payload);
      if (res.success) {
        showToast(res.message || 'Stock updated successfully!', 'success');
        setSelectedProductForAdd(null);
        fetchOverview();
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add stock', 'error');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  // Open Details & History Modal
  const handleOpenHistory = async (product) => {
    setSelectedProductForHistory(product);
    setLoadingDetails(true);
    try {
      const res = await api.admin.getProductStock(product.productId);
      if (res.success && res.data) {
        setProductDetailsData(res.data);
      }
    } catch (err) {
      showToast('Failed to load item inventory details', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Adjust/Revoke Item
  const handleAdjustInventoryItem = async (inventoryId, action) => {
    if (!selectedProductForHistory) return;
    try {
      const res = await api.admin.adjustProductStock(selectedProductForHistory.productId, {
        inventoryId,
        action,
        reason: `Admin flagged as ${action}`,
      });
      if (res.success) {
        showToast(`Item ${action} processed`, 'success');
        // Refresh details modal
        handleOpenHistory(selectedProductForHistory);
        fetchOverview();
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message || 'Adjustment failed', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            In Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Low Stock
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Out of Stock
          </span>
        );
      case 'Unlimited':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Unlimited
          </span>
        );
      case 'Reserved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Reserved
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  const metrics = overview?.metrics || {
    totalProducts: 0,
    totalAvailableStock: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    reservedStock: 0,
    soldProducts: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Stock & Inventory Management</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Supabase Realtime
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock control, atomic reservation pools, multi-format delivery, and automated deduplication.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">

          <button
            onClick={() => {
              fetchOverview();
              fetchProducts();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c1224] border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 w-fit cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span>Refresh Stock</span>
          </button>
        </div>
      </div>

      {/* 6 High-Level Stock Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Products</span>
          <div className="text-2xl font-black text-white font-mono">{metrics.totalProducts}</div>
          <span className="text-[10px] text-slate-500">Catalog items</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Available Stock</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.totalAvailableStock}</div>
          <span className="text-[10px] text-emerald-500/80">Ready to fulfill</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Low Stock</span>
          <div className="text-2xl font-black text-amber-300 font-mono">{metrics.lowStockProducts}</div>
          <span className="text-[10px] text-amber-500/80">&le; threshold</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Out of Stock</span>
          <div className="text-2xl font-black text-rose-400 font-mono">{metrics.outOfStockProducts}</div>
          <span className="text-[10px] text-rose-500/80">Needs restock</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Reserved Stock</span>
          <div className="text-2xl font-black text-blue-400 font-mono">{metrics.reservedStock}</div>
          <span className="text-[10px] text-blue-500/80">Cart checkouts</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Delivered Sold</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{metrics.soldProducts}</div>
          <span className="text-[10px] text-purple-500/80">Keys fulfilled</span>
        </div>
      </div>

      {/* Stock Alerts Notice Bar (if any alerts) */}
      {overview?.stockAlerts && overview.stockAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                {overview.stockAlerts.length} Product(s) Require Inventory Attention
              </div>
              <div className="text-[11px] text-slate-400">
                Items marked below minimum threshold will be disabled when available units reach zero.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {overview.stockAlerts.slice(0, 2).map((a) => (
              <span key={a.id} className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono text-amber-300 border border-amber-500/20">
                {a.sku}: {a.availableStock} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Search Controls */}
      <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#06080F] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#06080F] border border-white/10 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock (Green)</option>
            <option value="low_stock">Low Stock (Orange)</option>
            <option value="out_of_stock">Out of Stock (Red)</option>
            <option value="unlimited">Unlimited (Purple)</option>
            <option value="reserved">Reserved (Blue)</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#06080F] border border-white/10 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Product Types</option>
            <option value="license_key">Digital License Keys</option>
            <option value="digital_account">Digital Accounts</option>
            <option value="downloadable_mod">Downloadable Mods</option>
            <option value="service_quantity">Quantity Pool / Services</option>
          </select>
        </div>
      </div>

      {/* Main Stock Inventory Table */}
      <div className="rounded-3xl bg-[#0a0f22]/90 border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-[#070b18] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3.5 px-4">PRODUCT / SKU</th>
                <th className="py-3.5 px-4">TYPE & DELIVERY</th>
                <th className="py-3.5 px-4 text-center">AVAILABLE</th>
                <th className="py-3.5 px-4 text-center">RESERVED</th>
                <th className="py-3.5 px-4 text-center">SOLD</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    Loading live inventory stock levels...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.productId} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Product & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Product Image Thumbnail */}
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-inner">
                          <img
                            src={getProductCoverImage(item)}
                            alt={item.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-bold text-white block group-hover:text-purple-300 transition-colors truncate max-w-[200px]" title={item.productName}>
                            {item.productName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/5 text-slate-400 border border-white/5">
                              {item.sku}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {item.productId.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type & Delivery */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="capitalize font-semibold text-slate-300 block">
                          {item.productType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.deliveryMethod.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Available */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm">
                      <span className={item.availableStock === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {item.inventoryMode === 'unlimited' ? '∞' : item.availableStock}
                      </span>
                    </td>

                    {/* Reserved */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {item.reservedStock}
                    </td>

                    {/* Sold */}
                    <td className="py-3.5 px-4 text-center font-mono text-purple-300">
                      {item.soldStock}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.stockStatus)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAddStock(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Stock</span>
                        </button>

                        <button
                          onClick={() => handleOpenHistory(item)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all"
                          title="View Records & Movement History"
                        >
                          <History className="w-3.5 h-3.5 text-cyan-400" />
                        </button>

                        <button
                          onClick={() => setDeleteTargetProduct(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 transition-all"
                          title="Delete / Archive Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* MODAL 1: ADD STOCK TO PRODUCT                                          */}
      {/* ====================================================================== */}
      <AnimatePresence>
        {selectedProductForAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForAdd(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl rounded-3xl bg-[#0c1022] border border-purple-500/30 p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-white"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-inner">
                    <img
                      src={getProductCoverImage(selectedProductForAdd)}
                      alt={selectedProductForAdd.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-purple-400" />
                      <span>Add Inventory Stock</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Product: <strong className="text-purple-300">{selectedProductForAdd.productName}</strong> ({selectedProductForAdd.sku})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProductForAdd(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStockSubmit} className="space-y-4">
                {/* Inventory Mode Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Inventory Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAddStockType('license_keys')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        addStockType === 'license_keys'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                          : 'bg-[#06080F] text-slate-400 border-white/5 hover:border-white/20'
                      }`}
                    >
                      Digital Keys
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddStockType('digital_accounts')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        addStockType === 'digital_accounts'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                          : 'bg-[#06080F] text-slate-400 border-white/5 hover:border-white/20'
                      }`}
                    >
                      Digital Accounts
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddStockType('quantity_pool')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        addStockType === 'quantity_pool'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                          : 'bg-[#06080F] text-slate-400 border-white/5 hover:border-white/20'
                      }`}
                    >
                      Quantity Pool
                    </button>
                  </div>
                </div>

                {/* Conditional Input */}
                {addStockType === 'license_keys' && (
                  <div>
                    <div className="mb-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Paste Activation Keys (One per line)
                      </label>
                    </div>
                    <textarea
                      rows={6}
                      value={rawItemsInput}
                      onChange={(e) => setRawItemsInput(e.target.value)}
                      placeholder={'XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY\nZZZZZ-ZZZZZ-ZZZZZ'}
                      className="w-full p-3.5 rounded-xl bg-[#06080F] border border-white/10 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all resize-none"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      * Keys will be automatically deduplicated via SHA-256 and encrypted at rest with AES-256-GCM.
                    </p>
                  </div>
                )}

                {addStockType === 'digital_accounts' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Paste Authorized Accounts (<code className="text-purple-300">username:password</code> per line)
                    </label>
                    <textarea
                      rows={6}
                      value={rawItemsInput}
                      onChange={(e) => setRawItemsInput(e.target.value)}
                      placeholder={'player1@domain.com:Password123!\nplayer2@domain.com:SecretPass456!'}
                      className="w-full p-3.5 rounded-xl bg-[#06080F] border border-white/10 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all resize-none"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      * Credentials are encrypted and never shown in public product listings or API endpoints.
                    </p>
                  </div>
                )}

                {addStockType === 'quantity_pool' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Units to Add to Pool
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#06080F] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-500 transition-all"
                      required
                    />
                  </div>
                )}

                {/* Audit Notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Movement Audit Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={stockNotes}
                    onChange={(e) => setStockNotes(e.target.value)}
                    placeholder="e.g. Restock batch from authorized distributor"
                    className="w-full p-2.5 rounded-xl bg-[#06080F] border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForAdd(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingStock}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                  >
                    {isSubmittingStock ? 'Encrypting & Storing...' : 'Confirm Stock Addition'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================== */}
      {/* MODAL 2: INVENTORY RECORDS & STOCK MOVEMENT AUDIT TRAIL                 */}
      {/* ====================================================================== */}
      <AnimatePresence>
        {selectedProductForHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForHistory(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl bg-[#0c1022] border border-purple-500/30 p-6 sm:p-8 shadow-2xl z-10 flex flex-col space-y-5 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-cyan-400" />
                    <span>Inventory Records & Stock Audit Trail</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Product: <strong className="text-purple-300">{selectedProductForHistory.productName}</strong> ({selectedProductForHistory.sku})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProductForHistory(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingDetails ? (
                <div className="py-16 text-center text-slate-400 font-mono">Loading inventory records...</div>
              ) : (
                <div className="space-y-6 overflow-y-auto pr-1">
                  {/* Current Inventory Pool (Masked) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Encrypted Inventory Units ({productDetailsData?.inventoryItems?.length || 0})</span>
                    </h4>

                    {productDetailsData?.inventoryItems?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-black/30 border border-white/5">
                        No individual digital units registered in unique inventory table.
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto rounded-2xl bg-[#070b18] border border-white/5 divide-y divide-white/5 text-xs">
                        {productDetailsData?.inventoryItems?.map((inv) => (
                          <div key={inv.id} className="p-3 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-slate-200 block">{inv.maskedKey}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Type: {inv.itemType} • Added: {new Date(inv.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  inv.status === 'available'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : inv.status === 'reserved'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                }`}
                              >
                                {inv.status}
                              </span>

                              {inv.status === 'available' && (
                                <button
                                  onClick={() => handleAdjustInventoryItem(inv.id, 'damage')}
                                  className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 text-[10px] font-bold transition-all"
                                >
                                  Mark Damaged
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stock Movements History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Stock Movement Timeline</span>
                    </h4>

                    {productDetailsData?.movements?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-black/30 border border-white/5">
                        No recorded movements yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {productDetailsData?.movements?.map((m) => (
                          <div key={m.id} className="p-3 rounded-xl bg-[#070b18] border border-white/5 flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold capitalize ${
                                  m.movement_type === 'import' ? 'text-emerald-400' : m.movement_type === 'sale' ? 'text-purple-400' : 'text-amber-400'
                                }`}>
                                  {m.movement_type.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(m.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{m.notes}</p>
                            </div>
                            <div className="text-right">
                              <span className={`font-mono font-bold text-sm ${m.quantity > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Balance: {m.balance_after}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Delete / Archive Product Modal */}
        {deleteTargetProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl bg-[#090D1A] border border-white/10 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Delete Product</h3>
                    <p className="text-xs text-slate-400 font-mono">Stock Catalog Removal Safeguard</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTargetProduct(null)}
                  disabled={isDeletingProduct}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product Preview Card */}
              <div className="p-3.5 rounded-2xl bg-[#111A33] border border-white/5 flex items-center gap-3.5">
                <img
                  src={getProductCoverImage(deleteTargetProduct)}
                  alt={deleteTargetProduct.productName || deleteTargetProduct.name}
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-bold text-white truncate">
                    {deleteTargetProduct.productName || deleteTargetProduct.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                    <span className="capitalize">{deleteTargetProduct.productType?.replace('_', ' ') || 'Digital'}</span>
                    <span>•</span>
                    <span className="text-purple-300 font-bold">{deleteTargetProduct.sku || 'SKU'}</span>
                    <span>•</span>
                    <span className={deleteTargetProduct.availableStock > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {deleteTargetProduct.inventoryMode === 'unlimited' ? 'Unlimited Stock' : `${deleteTargetProduct.availableStock || 0} in stock`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safe Archive vs Permanent Deletion Selection */}
              <div className="space-y-2.5">
                <label
                  onClick={() => setDeleteMode('safe')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                    deleteMode === 'safe'
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-md'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="deleteModeStock"
                    checked={deleteMode === 'safe'}
                    onChange={() => setDeleteMode('safe')}
                    className="mt-0.5 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Safe Catalog Removal (Recommended)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                        SAFE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Removes this product from the storefront catalog while safely preserving historical customer purchases, delivered keys, and past order receipts.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setDeleteMode('permanent')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                    deleteMode === 'permanent'
                      ? 'bg-rose-950/30 border-rose-500/50 shadow-md'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="deleteModeStock"
                    checked={deleteMode === 'permanent'}
                    onChange={() => setDeleteMode('permanent')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                      <span>Permanent Database Purge</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-bold">
                        DESTRUCTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Completely purges the product record and all unassigned digital keys from the Supabase database.
                    </p>
                  </div>
                </label>
              </div>

              {/* Confirmation Notice */}
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Please confirm you want to proceed with deleting "{deleteTargetProduct.productName || deleteTargetProduct.name}".
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTargetProduct(null)}
                  disabled={isDeletingProduct}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteProduct}
                  disabled={isDeletingProduct}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isDeletingProduct ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Deletion</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
