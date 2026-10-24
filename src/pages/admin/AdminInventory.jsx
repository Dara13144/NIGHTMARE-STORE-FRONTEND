import React, { useState, useEffect } from 'react';
import {
  Upload,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  ShieldCheck,
  Plus,
  RefreshCw,
  Package,
  Layers,
  Check,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getProductCoverImage } from '../../services/productImageService';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const { showToast } = useToast();

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [rawKeyInput, setRawKeyInput] = useState('');
  const [csvFileContent, setCsvFileContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);

  // Clear All Stock State
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Delete Product State
  const [deleteTargetProduct, setDeleteTargetProduct] = useState(null);
  const [deleteMode, setDeleteMode] = useState('safe');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDeleteProduct = async () => {
    if (!deleteTargetProduct) return;
    try {
      setIsDeleting(true);
      const isPermanent = deleteMode === 'permanent';
      const res = await api.admin.deleteProduct(deleteTargetProduct.id, isPermanent);
      if (res.success) {
        showToast(res.message || 'Product removed successfully', 'success');
        const targetId = deleteTargetProduct.id;
        const targetRealId = deleteTargetProduct.real_id;
        setProducts((prev) =>
          prev.filter(
            (p) =>
              p.id !== targetId &&
              p.real_id !== targetId &&
              (!targetRealId || (p.id !== targetRealId && p.real_id !== targetRealId))
          )
        );
        setDeleteTargetProduct(null);
        loadData();
        window.dispatchEvent(new CustomEvent('refresh-store-products'));
        window.dispatchEvent(
          new CustomEvent('product-deleted', { detail: { id: targetId, real_id: targetRealId } })
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllStock = async () => {
    try {
      setIsClearingAll(true);
      const res = await api.admin.clearAllStock();
      if (res.success) {
        showToast(res.message || 'All product stock cleared successfully!', 'success');
        setIsClearAllModalOpen(false);
        loadData();
      } else {
        showToast(res.error || 'Failed to clear stock', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear stock', 'error');
    } finally {
      setIsClearingAll(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, invRes] = await Promise.all([
        api.admin.getProducts(),
        api.admin.getInventory({ status: statusFilter, productId: productFilter }),
      ]);
      if (pRes.success) {
        setProducts(pRes.data);
        if (!selectedProductId && pRes.data.length > 0) {
          setSelectedProductId(pRes.data[0].id);
        }
      }
      if (invRes.success) {
        setInventoryItems(invRes.items);
        setTotalCount(invRes.total);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, productFilter]);

  const handleOpenAddStockForProduct = (prodId) => {
    setSelectedProductId(prodId);
    setImportReport(null);
    setRawKeyInput('');
    setIsImportModalOpen(true);
  };


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvFileContent(event.target.result);
      showToast(`CSV file "${file.name}" loaded`, 'info');
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      showToast('Please select a target product', 'warning');
      return;
    }

    let keys = [];
    if (rawKeyInput.trim()) {
      keys = rawKeyInput
        .split('\n')
        .map((k) => k.trim())
        .filter((k) => k.length >= 4);
    }

    if (keys.length === 0 && !csvFileContent) {
      showToast('Please provide keys via textarea or CSV file', 'warning');
      return;
    }

    try {
      setIsImporting(true);
      setImportReport(null);

      const res = await api.admin.importInventory({
        product_id: selectedProductId,
        keys: keys.length > 0 ? keys : undefined,
        csv: csvFileContent || undefined,
      });

      if (res.success && res.data) {
        setImportReport(res.data);
        showToast(res.message, 'success');
        setRawKeyInput('');
        setCsvFileContent('');
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Import failed', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add, import, and manage encrypted digital keys with AES-256-GCM military-grade security.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">

          <button
            onClick={() => {
              setImportReport(null);
              setIsImportModalOpen(true);
            }}
            className="btn-primary-blue px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Add Stock / Import Keys</span>
          </button>
        </div>
      </div>

      {/* Product Stock Summary Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <span>Product Stock Overview</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => {
            const isOutOfStock = p.availableStock <= 0;
            const isLowStock = p.availableStock > 0 && p.availableStock <= (p.low_stock_threshold || 3);

            return (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-[#090e1c] border border-white/5 flex items-center justify-between gap-3 hover:border-blue-500/40 transition-all group shadow-sm hover:shadow-blue-900/10"
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  {/* Product Image Thumbnail */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-inner">
                    <img
                      src={getProductCoverImage(p)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  <div className="overflow-hidden space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 shrink-0">
                        {p.platform}
                      </span>
                      <span className="text-xs font-bold text-white truncate block" title={p.name}>
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Stock:</span>
                      <strong className={`font-mono ${
                        isOutOfStock
                          ? 'text-rose-400'
                          : isLowStock
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {p.availableStock} available
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenAddStockForProduct(p.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d1428] hover:bg-blue-600 hover:text-white border border-white/10 text-xs font-bold text-slate-300 transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
                    title={`Add stock for ${p.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Stock</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeleteTargetProduct(p);
                      setDeleteMode('safe');
                    }}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-300 hover:text-white transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                    title={`Delete product: ${p.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="bg-[#090e1c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.platform})
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#090e1c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
          <option value="revoked">Revoked</option>
        </select>

        <span className="text-xs text-slate-400 ml-auto">
          Showing <span className="text-blue-400 font-bold">{inventoryItems.length}</span> of {totalCount} encrypted keys
        </span>
      </div>

      {/* Inventory Table (Masked Keys) */}
      <div className="rounded-2xl bg-[#090e1c] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#060a16] text-slate-400 uppercase tracking-wider font-bold border-b border-white/5 text-[10px]">
              <tr>
                <th className="p-4">Key ID</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Encrypted Key Value</th>
                <th className="p-4">Status</th>
                <th className="p-4">Imported At</th>
                <th className="p-4">Redeemed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    No keys found matching the current filter.
                  </td>
                </tr>
              ) : (
                inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-slate-400 text-[11px]">{item.id}</td>
                    <td className="p-4">
                      {(() => {
                        const matchedProd = products.find((p) => p.id === item.productId || p.name === item.productName);
                        return (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                              <img
                                src={getProductCoverImage(matchedProd || { name: item.productName, id: item.productId })}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
                                }}
                              />
                            </div>
                            <span className="font-bold text-white truncate max-w-[160px] block" title={item.productName}>
                              {item.productName}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-300 tracking-wider">
                      {item.maskedKey}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'available'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'sold'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : item.status === 'reserved'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {item.redeemedAt ? new Date(item.redeemedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV / Manual Key Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0b101f] border border-blue-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>Add Digital Keys to Stock</span>
              </h2>

              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AES-256-GCM</span>
              </span>
            </div>

            {/* Validation & Import Report */}
            {importReport && (
              <div className="p-4 rounded-2xl bg-[#060a16] border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Stock Update Report</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                  <div className="p-2 rounded bg-slate-950">
                    <span className="text-slate-400 block text-[10px]">Imported</span>
                    <span className="text-emerald-400 font-bold">{importReport.imported}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950">
                    <span className="text-slate-400 block text-[10px]">Duplicates Skipped</span>
                    <span className="text-amber-400 font-bold">{importReport.duplicates}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950">
                    <span className="text-slate-400 block text-[10px]">Errors</span>
                    <span className="text-rose-400 font-bold">
                      {importReport.errors?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Product *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#060a16] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.platform}) — Stock: {p.availableStock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Target Product Visual Preview */}
              {(() => {
                const targetProd = products.find((p) => p.id === selectedProductId) || products[0];
                if (!targetProd) return null;
                return (
                  <div className="p-3 rounded-2xl bg-[#060a16] border border-white/10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/15 shrink-0">
                      <img
                        src={getProductCoverImage(targetProd)}
                        alt={targetProd.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="overflow-hidden min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 shrink-0">
                          {targetProd.platform}
                        </span>
                        <span className="text-xs font-bold text-white truncate block">
                          {targetProd.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 font-mono">
                        <span>Price: <strong className="text-white">${targetProd.current_price}</strong></span>
                        <span>•</span>
                        <span>Available Stock: <strong className="text-emerald-400 font-bold">{targetProd.availableStock}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })()}


              {/* Manual Keys Paste */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold text-xs">
                    Paste Digital Keys (One Per Line)
                  </label>
                  <span className="text-[10px] text-blue-400 font-medium">
                    Keys or User:Password Accounts
                  </span>
                </div>
                <textarea
                  rows={5}
                  placeholder={`XXXXX-XXXXX-XXXXX-XXXXX (License Key)\nusername:password123 (Account Credentials)\nmdara9695@gmail.com:SecretPass2026!`}
                  value={rawKeyInput}
                  onChange={(e) => setRawKeyInput(e.target.value)}
                  className="w-full bg-[#060a16] border border-white/10 rounded-xl p-3 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Single codes import as <span className="text-blue-400 font-semibold">License Keys</span>. Text with <code className="text-amber-400">user:password</code> imports as <span className="text-emerald-400 font-semibold">Digital Accounts</span>.
                </p>
              </div>

              {/* CSV Upload */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Or Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full bg-[#060a16] border border-white/10 rounded-xl p-2 text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="btn-primary-blue px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                >
                  {isImporting ? 'Encrypting & Saving...' : 'Confirm & Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0D1329] border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(244,63,94,0.15)] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Delete Product</h3>
                  <p className="text-xs text-slate-400 font-mono">Store Catalog Removal Safeguard</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTargetProduct(null)}
                disabled={isDeleting}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Product Preview Card */}
            <div className="p-3.5 rounded-2xl bg-[#111A33] border border-white/5 flex items-center gap-3.5">
              <img
                src={getProductCoverImage(deleteTargetProduct)}
                alt={deleteTargetProduct.name}
                className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
              />
              <div className="overflow-hidden flex-1">
                <h4 className="text-sm font-bold text-white truncate">{deleteTargetProduct.name}</h4>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                  <span>{deleteTargetProduct.platform}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">${Number(deleteTargetProduct.current_price).toFixed(2)}</span>
                  <span>•</span>
                  <span className={deleteTargetProduct.availableStock > 0 ? 'text-cyan-400' : 'text-rose-400'}>
                    {deleteTargetProduct.availableStock} in stock
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
                  name="deleteModeInv"
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
                  name="deleteModeInv"
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
              <span>Please confirm you want to proceed with deleting "{deleteTargetProduct.name}".</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetProduct(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2"
              >
                {isDeleting ? (
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

    </div>
  );
}
