import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  Boxes,
  KeyRound,
  History,
  ArrowUpDown,
  Filter,
  X,
  ExternalLink,
  AlertTriangle,
  Archive,
  ShieldAlert,
  Upload,
  Link2,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StockBadge from '../../components/StockBadge';
import { getProductCoverImage } from '../../services/productImageService';
import { ADMIN_ROUTES } from '../../constants/adminRoutes';
import ProductImageUploadField from '../../components/ProductImageUploadField';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Dedicated Cyberpunk Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteMode, setDeleteMode] = useState('safe'); // 'safe' (archive preserving order refs) or 'permanent'
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Quick Add Stock Modal State
  const [quickStockProduct, setQuickStockProduct] = useState(null);
  const [quickStockKeys, setQuickStockKeys] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(false);

  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    product_type: 'license_key',
    inventory_mode: 'unique_items',
    delivery_method: 'instant_key',
    description: '',
    cover_image: '',
    banner_image: '',
    category_id: '',
    platform: 'Steam',
    region: 'Global',
    activation_instructions: '',
    current_price: 29.99,
    comparison_price: 49.99,
    low_stock_threshold: 3,
    is_published: true,
    is_featured: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.admin.getProducts(),
        api.getCategories(),
      ]);
      if (pRes.success) setProducts(pRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      sku: '',
      product_type: 'license_key',
      inventory_mode: 'unique_items',
      delivery_method: 'instant_key',
      description: '',
      cover_image: '',
      banner_image: '',
      category_id: categories[0]?.id || '',
      platform: 'Steam',
      region: 'Global',
      activation_instructions: '1. Launch platform client.\n2. Click Games -> Activate a Product.\n3. Enter the key.',
      current_price: 29.99,
      comparison_price: 49.99,
      low_stock_threshold: 3,
      is_published: true,
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku || '',
      product_type: prod.product_type || 'license_key',
      inventory_mode: prod.inventory_mode || 'unique_items',
      delivery_method: prod.delivery_method || 'instant_key',
      description: prod.description || '',
      cover_image: prod.cover_image,
      banner_image: prod.banner_image || '',
      category_id: prod.category_id || categories[0]?.id || '',
      platform: prod.platform,
      region: prod.region,
      activation_instructions: prod.activation_instructions,
      current_price: prod.current_price,
      comparison_price: prod.comparison_price || '',
      low_stock_threshold: prod.low_stock_threshold || 3,
      is_published: prod.is_published,
      is_featured: prod.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (prod) => {
    try {
      const updatedStatus = !prod.is_published;
      const res = await api.admin.updateProduct(prod.id, { is_published: updatedStatus });
      if (res.success) {
        showToast(`Product ${updatedStatus ? 'published' : 'unpublished'}`, 'success');
        setProducts(products.map((p) => (p.id === prod.id ? { ...p, is_published: updatedStatus } : p)));
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cover_image || !formData.cover_image.trim()) {
      showToast('Please upload or provide a Cover Image for the product', 'error');
      return;
    }
    try {
      if (editingProduct) {
        const res = await api.admin.updateProduct(editingProduct.id, formData);
        if (res.success) {
          showToast('Product updated successfully', 'success');
          setIsModalOpen(false);
          loadData();
          window.dispatchEvent(new CustomEvent('refresh-store-products'));
          window.dispatchEvent(new CustomEvent('product-updated', {
            detail: { id: editingProduct.id, cover_image: formData.cover_image }
          }));
        }
      } else {
        const res = await api.admin.createProduct(formData);
        if (res.success) {
          showToast('Product created successfully', 'success');
          setIsModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDuplicate = async (product) => {
    try {
      setIsDuplicating(true);
      const res = await api.admin.duplicateProduct(product.id);
      if (res.success && res.data) {
        showToast(`Product duplicated: "${res.data.name}"`, 'success');
        setProducts([res.data, ...products]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to duplicate product', 'error');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const isPermanent = deleteMode === 'permanent';
      const res = await api.admin.deleteProduct(deleteTarget.id, isPermanent);
      if (res.success) {
        showToast(res.message || 'Product removed successfully', 'success');
        const targetId = deleteTarget.id;
        const targetRealId = deleteTarget.real_id;
        setProducts((prev) =>
          prev.filter(
            (p) =>
              p.id !== targetId &&
              p.real_id !== targetId &&
              (!targetRealId || (p.id !== targetRealId && p.real_id !== targetRealId))
          )
        );
        setDeleteTarget(null);

        // Broadcast events so Store, Home, and navigation reflect deletion immediately
        window.dispatchEvent(new CustomEvent('refresh-store-products'));
        window.dispatchEvent(
          new CustomEvent('product-deleted', { detail: { id: targetId, real_id: targetRealId } })
        );
      }
    } catch (err) {
      showToast(err.message || 'Could not delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Add Stock submission
  const handleQuickAddStockSubmit = async (e) => {
    e.preventDefault();
    if (!quickStockProduct) return;
    try {
      setIsAddingStock(true);
      const lines = quickStockKeys
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) {
        showToast('Please enter at least one key or account', 'error');
        return;
      }

      const res = await api.admin.addProductStock(quickStockProduct.id, {
        type: quickStockProduct.product_type === 'digital_account' ? 'digital_accounts' : 'license_keys',
        items: lines,
        notes: 'Quick stock import via Product Catalog',
      });

      if (res.success) {
        showToast(`Added ${res.data?.addedCount || lines.length} items to stock!`, 'success');
        setQuickStockProduct(null);
        setQuickStockKeys('');
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add stock', 'error');
    } finally {
      setIsAddingStock(false);
    }
  };

  // Filter & Sort
  const filtered = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.platform.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && p.is_published) ||
        (statusFilter === 'draft' && !p.is_published) ||
        (statusFilter === 'low_stock' && p.availableStock <= p.low_stock_threshold && p.availableStock > 0) ||
        (statusFilter === 'out_of_stock' && p.availableStock === 0);

      const matchPlatform = platformFilter === 'all' || p.platform === platformFilter;

      return matchSearch && matchStatus && matchPlatform;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const platforms = ['All Platforms', 'Steam', 'Xbox', 'PlayStation', 'Nintendo', 'PC', 'Minecraft', 'Epic Games', 'Ubisoft', 'EA App'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage digital game titles, live stock statuses, and fulfillment settings.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ADMIN_ROUTES.STOCK}
            className="px-3.5 py-2.5 rounded-xl bg-[#0c1224] border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Boxes className="w-4 h-4 text-purple-400" />
            <span>Stock Management</span>
          </Link>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by game name, platform, SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#06080F] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value === 'All Platforms' ? 'all' : e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#06080F] border border-white/10 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500"
          >
            {platforms.map((plat) => (
              <option key={plat} value={plat === 'All Platforms' ? 'all' : plat}>
                {plat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#06080F] border border-white/10 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft / Unpublished</option>
            <option value="low_stock">Low Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>

          {/* Sorting */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, ord] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(ord);
            }}
            className="px-3 py-2 rounded-xl bg-[#06080F] border border-white/10 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="current_price-asc">Price (Low to High)</option>
            <option value="current_price-desc">Price (High to Low)</option>
            <option value="availableStock-desc">Stock (Highest)</option>
            <option value="availableStock-asc">Stock (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Main Table matching exact spec: GAME | PLATFORM | PRICE | LIVE STOCK | STATUS | ACTIONS */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070b18] text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
              <tr>
                <th className="p-4">GAME</th>
                <th className="p-4">PLATFORM</th>
                <th className="p-4">PRICE</th>
                <th className="p-4">LIVE STOCK</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                    Loading product catalog...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                paginated.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors group">
                    {/* Game */}
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={getProductCoverImage(prod)}
                        alt={prod.name}
                        className="w-10 h-10 object-cover rounded-xl bg-slate-950 shrink-0 border border-white/10"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block truncate max-w-[210px] group-hover:text-purple-300 transition-colors">
                          {prod.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{prod.sku || `SKU-${prod.id.slice(0, 5).toUpperCase()}`}</span>
                          <span>•</span>
                          <span>{prod.region}</span>
                        </div>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="p-4 font-mono font-semibold text-cyan-300">
                      {prod.platform}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-white font-mono text-sm">
                      ${prod.current_price?.toFixed(2)}
                    </td>

                    {/* Live Stock */}
                    <td className="p-4">
                      <StockBadge status={prod.stockStatus} availableStock={prod.availableStock} />
                    </td>

                    {/* Status (Published / Draft) */}
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublish(prod)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                          prod.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Click to toggle Published / Draft status"
                      >
                        {prod.is_published ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit, Add Stock, View Inventory, Stock History, Delete */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Add Stock Quick Button */}
                        <button
                          onClick={() => setQuickStockProduct(prod)}
                          className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                          title="Quick Add Stock"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Stock</span>
                        </button>

                        {/* View Inventory */}
                        <Link
                          to={ADMIN_ROUTES.INVENTORY}
                          className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all"
                          title="View Digital Keys Inventory"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </Link>

                        {/* Stock History */}
                        <Link
                          to={ADMIN_ROUTES.STOCK}
                          className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-purple-500/40 text-slate-400 hover:text-purple-300 transition-all"
                          title="View Stock Movements"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Link>

                        {/* Duplicate Product */}
                        <button
                          onClick={() => handleDuplicate(prod)}
                          disabled={isDuplicating}
                          className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-300 transition-all"
                          title="Duplicate Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Product */}
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-white/30 text-slate-300 hover:text-white transition-all"
                          title="Edit Product Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Product */}
                        <button
                          onClick={() => {
                            setDeleteTarget(prod);
                            setDeleteMode('safe');
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/20 hover:bg-rose-900/60 text-rose-300 hover:text-white transition-all"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#070b18] border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} products
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#06080F] border border-white/10 hover:border-white/20 text-slate-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* QUICK ADD STOCK MODAL                                                  */}
      {/* ====================================================================== */}
      {quickStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0c1022] border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span>Quick Add Stock</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{quickStockProduct.name}</p>
              </div>
              <button
                onClick={() => setQuickStockProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddStockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Paste Digital Keys or Account Credentials (one per line)
                </label>
                <textarea
                  rows={6}
                  required
                  value={quickStockKeys}
                  onChange={(e) => setQuickStockKeys(e.target.value)}
                  placeholder={'XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY'}
                  className="w-full p-3 rounded-xl bg-[#06080F] border border-white/10 font-mono text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setQuickStockProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingStock}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30"
                >
                  {isAddingStock ? 'Storing...' : 'Add Stock Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* PRODUCT CREATE / EDIT MODAL                                            */}
      {/* ====================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0c1022] border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product Details' : 'Add New Game Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: !editingProduct ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : formData.slug,
                      });
                    }}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* SKU, Product Type, Delivery Method */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. CP77-STEAM-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Type</label>
                  <select
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="license_key">Digital License Key</option>
                    <option value="digital_account">Digital Account</option>
                    <option value="downloadable_mod">Downloadable Mod</option>
                    <option value="service_quantity">Service / Quantity Pool</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Delivery Method</label>
                  <select
                    value={formData.delivery_method}
                    onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="instant_key">Instant Key Delivery</option>
                    <option value="account_credentials">Account Credentials</option>
                    <option value="secure_download">Secure Signed Download</option>
                    <option value="manual_fulfillment">Manual Fulfillment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    {platforms.filter((p) => p !== 'All Platforms').map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Comparison Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comparison_price}
                    onChange={(e) => setFormData({ ...formData, comparison_price: e.target.value ? parseFloat(e.target.value) : '' })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Low Stock Alert Level</label>
                  <input
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value, 10) || 3 })}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Cover Image Upload & URL */}
              <ProductImageUploadField
                label="Cover Image (Artwork / Thumbnail) *"
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url })}
                required
              />

              {/* Banner Image Upload & URL */}
              <ProductImageUploadField
                label="Banner Image (Header Artwork - Optional)"
                value={formData.banner_image || ''}
                onChange={(url) => setFormData({ ...formData, banner_image: url })}
              />

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#06080F] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded bg-slate-900 border-white/20 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-white font-semibold">Published in Store</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded bg-slate-900 border-white/20 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-white font-semibold">Featured on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = editingProduct;
                      setIsModalOpen(false);
                      setDeleteTarget(target);
                      setDeleteMode('safe');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Product</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Cyberpunk Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#0D1329] border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(244,63,94,0.15)] space-y-5"
            >
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
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Preview Card */}
              <div className="p-3.5 rounded-2xl bg-[#111A33] border border-white/5 flex items-center gap-3.5">
                <img
                  src={getProductCoverImage(deleteTarget)}
                  alt={deleteTarget.name}
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                />
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-bold text-white truncate">{deleteTarget.name}</h4>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                    <span>{deleteTarget.platform}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">${Number(deleteTarget.current_price).toFixed(2)}</span>
                    <span>•</span>
                    <span className={deleteTarget.availableStock > 0 ? 'text-cyan-400' : 'text-rose-400'}>
                      {deleteTarget.availableStock} in stock
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
                    name="deleteMode"
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
                    name="deleteMode"
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
                <span>Please confirm you want to proceed with deleting "{deleteTarget.name}".</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
