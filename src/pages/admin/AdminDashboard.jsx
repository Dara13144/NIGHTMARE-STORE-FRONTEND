import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  KeyRound,
  Tag,
  Clock,
  Bot,
  ExternalLink,
  ChevronRight,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X,
  Layers,
  Sparkles,
  Edit3,
  Trash2,
  Plus,
  Zap,
  Search,
  Eye,
  Filter,
  Check,
  Folder,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

const PRESET_GAME_COVERS = [
  { name: 'Rockstar Account ($4.50)', url: '/card-rockstar-account.png', tag: 'Rockstar' },
  { name: 'FiveM GTA V', url: '/card-gta5.png', tag: 'Fivem' },
  { name: 'Rockstar HD', url: '/card-rockstar-hd.png', tag: 'Fivem' },
  { name: 'Discord Nitro', url: '/card-nitro.png', tag: 'Discord' },
  { name: 'Discord Boosts', url: '/card-nitro-boosts-hd.png', tag: 'Discord' },
  { name: 'Discord Account', url: '/card-discord.png', tag: 'Discord' },
  { name: 'Gemini Pro AI', url: '/card-gemini.png', tag: 'AI' },
  { name: 'Minecraft Java', url: '/card-minecraft-java.png', tag: 'Minecraft' },
  { name: 'Minecraft Bedrock', url: '/card-minecraft-bedrock.png', tag: 'Minecraft' },
  { name: 'Cyberpunk 2077', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80', tag: 'Steam' },
  { name: 'Elden Ring', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', tag: 'Steam' },
  { name: 'Black Myth Wukong', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80', tag: 'Steam' },
  { name: 'Helldivers 2', url: 'https://images.unsplash.com/photo-1552824722-ddab1374e622?w=800&auto=format&fit=crop&q=80', tag: 'Steam' },
  { name: 'PlayStation Card', url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80', tag: 'Gift Card' },
  { name: 'Xbox Game Pass', url: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&auto=format&fit=crop&q=80', tag: 'Xbox' },
  { name: 'NordVPN', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', tag: 'VPN' },
  { name: 'Outlook Mail', url: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80', tag: 'Email' },
];
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getProductCoverImage } from '../../services/productImageService';
import { ADMIN_ROUTES } from '../../constants/adminRoutes';
import ProductImageUploadField from '../../components/ProductImageUploadField';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState('7d');
  const [viewAllActivitiesModal, setViewAllActivitiesModal] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [promoBanner, setPromoBanner] = useState({
    enabled: true,
    title: 'NightmareStore',
    subtitle: 'Official Nightmare Gang Store',
    code: 'NIGHTMARE',
    discountPercent: 15,
    buttonText: 'CHECKOUT NOW!',
    imageUrl: '/nightmare-promo-banner.png',
  });
  const { showToast } = useToast();
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const navigate = useNavigate();

  // Products and Quick Stock State
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productTab, setProductTab] = useState('all'); // 'all' | 'out_of_stock' | 'in_stock'
  const [quickStockProduct, setQuickStockProduct] = useState(null);
  const [quickStockType, setQuickStockType] = useState('license_keys');
  const [quickStockKeys, setQuickStockKeys] = useState('');
  const [quickStockQuantity, setQuickStockQuantity] = useState(5);
  const [isSubmittingQuickStock, setIsSubmittingQuickStock] = useState(false);

  // Add Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    platform: 'Fivem',
    current_price: 1.0,
    cover_image: '',
    description: '',
    initialStock: '',
    category_id: 'c1111111-1111-1111-1111-111111111111',
  });
  const [isSubmittingNewProduct, setIsSubmittingNewProduct] = useState(false);

  // Change Product Image & Card Style State
  const [imageModalProduct, setImageModalProduct] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedSubtext, setSelectedSubtext] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedGlow, setSelectedGlow] = useState('rgba(59, 130, 246, 0.45)');
  const [selectedPrice, setSelectedPrice] = useState(1.0);
  const [isSavingImage, setIsSavingImage] = useState(false);

  const handleOpenChangeImage = (prod) => {
    setImageModalProduct(prod);
    const currentCover = prod.cover_image || prod.coverImage || prod.image || getProductCoverImage(prod);
    setSelectedImageUrl(currentCover || '');
    const isRockstarAccount = (prod.name?.toLowerCase().includes('account') && prod.name?.toLowerCase().includes('rockstar')) || currentCover?.includes('card-rockstar-account');
    setSelectedSubtext(
      prod.iconSubtext || prod.subtext || (isRockstarAccount ? 'Rockstar Account' : currentCover?.includes('card-rockstar-hd') ? 'rockstar activation codes' : prod.name)
    );
    setSelectedName(prod.name || '');
    setSelectedGlow(
      prod.glow || (currentCover?.includes('rockstar') ? 'rgba(245, 158, 11, 0.55)' : 'rgba(59, 130, 246, 0.45)')
    );
    setSelectedPrice(prod.current_price !== undefined ? prod.current_price : prod.price || 1.0);
    setIsImageModalOpen(true);
  };

  const handleSaveImage = async (e) => {
    if (e) e.preventDefault();
    if (!imageModalProduct) return;
    if (!selectedImageUrl || !selectedImageUrl.trim()) {
      showToast('Please select or upload an image', 'error');
      return;
    }

    try {
      setIsSavingImage(true);
      const newImg = selectedImageUrl.trim();
      const newSubtext = selectedSubtext?.trim() || '';
      const newName = selectedName?.trim() || imageModalProduct.name;
      const newGlow = selectedGlow || 'rgba(59, 130, 246, 0.45)';
      const newPrice = parseFloat(selectedPrice) || imageModalProduct.current_price || 1.0;

      const payload = {
        cover_image: newImg,
        iconSubtext: newSubtext,
        subtext: newSubtext,
        name: newName,
        glow: newGlow,
        current_price: newPrice,
      };

      const res = await api.admin.updateProduct(imageModalProduct.id, payload);

      if (res?.success) {
        showToast(`Product card updated for "${newName}"!`, 'success');
        setIsImageModalOpen(false);

        // Update local products state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === imageModalProduct.id || p.slug === imageModalProduct.slug || p.name?.toLowerCase() === imageModalProduct.name?.toLowerCase()
              ? { ...p, ...payload, image: newImg }
              : p
          )
        );

        // Broadcast to store and product pages
        window.dispatchEvent(new CustomEvent('refresh-store-products'));
        window.dispatchEvent(
          new CustomEvent('product-updated', {
            detail: { id: imageModalProduct.id, ...payload, image: newImg },
          })
        );

        // Reload dashboard
        loadDashboard(range);
      } else {
        showToast(res?.error || 'Failed to update image', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update image', 'error');
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleClearAllStock = async () => {
    try {
      setIsClearingAll(true);
      const res = await api.admin.clearAllStock();
      if (res.success) {
        showToast(res.message || 'All product stock cleared successfully!', 'success');
        setIsClearAllModalOpen(false);
        loadDashboard(range);
      } else {
        showToast(res.error || 'Failed to clear stock', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear stock', 'error');
    } finally {
      setIsClearingAll(false);
    }
  };

  async function loadDashboard(selectedRange = range) {
    try {
      if (!data) setLoading(true);
      else setRefreshing(true);

      const [res, pRes, prodRes] = await Promise.allSettled([
        api.admin.getDashboard(selectedRange),
        api.getPromoBanner(),
        api.admin.getProducts(),
      ]);

      if (res.status === 'fulfilled' && res.value?.success && res.value?.data) {
        setData(res.value.data);
      }
      if (pRes.status === 'fulfilled' && pRes.value?.success && pRes.value?.data) {
        setPromoBanner(pRes.value.data);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.success && prodRes.value?.data) {
        setProducts(prodRes.value.data);
      }
    } catch (err) {
      console.warn('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Open Quick Stock Modal for any product
  const handleOpenQuickStock = (prod) => {
    setQuickStockProduct(prod);
    const isAccount =
      prod.platform?.toLowerCase().includes('fivem') ||
      prod.platform?.toLowerCase().includes('discord') ||
      prod.name?.toLowerCase().includes('account');
    setQuickStockType(isAccount ? 'digital_accounts' : 'license_keys');
    setQuickStockKeys('');
    setQuickStockQuantity(5);
  };

  // 1-Click Fast Stock Presets Generator
  const handleApplyPresetKeys = (count) => {
    if (!quickStockProduct) return;
    const isAccount =
      quickStockProduct.platform?.toLowerCase().includes('fivem') ||
      quickStockProduct.platform?.toLowerCase().includes('discord') ||
      quickStockProduct.name?.toLowerCase().includes('account');

    const lines = [];
    for (let i = 1; i <= count; i++) {
      const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      const randNum = Math.floor(1000 + Math.random() * 9000);
      if (isAccount) {
        lines.push(`gamer_${randHex.toLowerCase()}${randNum}@nightcity.io:P@ss${randHex}!`);
      } else {
        lines.push(`KEY-${randHex}-${randNum}-NIGHTMARE`);
      }
    }
    setQuickStockKeys((prev) => (prev ? `${prev}\n${lines.join('\n')}` : lines.join('\n')));
    showToast(`Generated ${count} stock items ready to deposit!`, 'info');
  };

  // Submit Quick Add Stock
  const handleQuickAddStockSubmit = async (e) => {
    e.preventDefault();
    if (!quickStockProduct) return;

    try {
      setIsSubmittingQuickStock(true);
      let payload = {
        type: quickStockType,
        notes: `Restocked via Admin Dashboard (${quickStockProduct.name})`,
      };

      if (quickStockType === 'license_keys' || quickStockType === 'digital_accounts') {
        const lines = quickStockKeys
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length === 0) {
          showToast('Please enter at least one key or account row', 'error');
          return;
        }
        payload.items = lines;
      } else {
        payload.quantity = parseInt(quickStockQuantity, 10) || 5;
      }

      const res = await api.admin.addProductStock(quickStockProduct.id, payload);
      if (res.success) {
        showToast(
          res.message || `Added ${payload.items?.length || payload.quantity} stock items to "${quickStockProduct.name}"!`,
          'success'
        );
        setQuickStockProduct(null);
        setQuickStockKeys('');
        loadDashboard(range);
      } else {
        showToast(res.error || 'Failed to add stock', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add stock', 'error');
    } finally {
      setIsSubmittingQuickStock(false);
    }
  };

  // Submit Add Product
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    try {
      setIsSubmittingNewProduct(true);
      const slug =
        newProductForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || `prod-${Date.now()}`;

      const payload = {
        name: newProductForm.name.trim(),
        slug,
        description: newProductForm.description.trim() || `${newProductForm.name.trim()} - Instant Digital Delivery`,
        cover_image: newProductForm.cover_image.trim() || '/card-rockstar-hd.png',
        category_id: newProductForm.category_id || 'c1111111-1111-1111-1111-111111111111',
        platform: newProductForm.platform || 'Fivem',
        current_price: parseFloat(newProductForm.current_price) || 1.0,
        currency: 'USD',
        is_published: true,
        region: 'Global',
        low_stock_threshold: 3,
      };

      const res = await api.admin.createProduct(payload);
      if (res.success && res.data) {
        const createdId = res.data.id;
        // If initial keys were supplied, deposit them
        if (newProductForm.initialStock && newProductForm.initialStock.trim()) {
          const lines = newProductForm.initialStock
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

          if (lines.length > 0) {
            await api.admin.addProductStock(createdId, {
              type: newProductForm.platform?.toLowerCase().includes('account')
                ? 'digital_accounts'
                : 'license_keys',
              items: lines,
              notes: 'Initial stock deposited on creation',
            });
          }
        }

        showToast(`Product "${payload.name}" created and live on website!`, 'success');
        setIsAddProductModalOpen(false);
        setNewProductForm({
          name: '',
          platform: 'Fivem',
          current_price: 1.0,
          cover_image: '',
          description: '',
          initialStock: '',
          category_id: 'c1111111-1111-1111-1111-111111111111',
        });
        loadDashboard(range);
      } else {
        showToast(res.error || 'Failed to create product', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create product', 'error');
    } finally {
      setIsSubmittingNewProduct(false);
    }
  };

  useEffect(() => {
    loadDashboard(range);
  }, [range]);

  const handleRefresh = () => {
    loadDashboard(range);
  };

  if (loading && !data) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center animate-spin">
          <RefreshCw className="w-6 h-6 text-purple-400" />
        </div>
        <p className="text-xs font-mono tracking-wider text-slate-400">RETRIEVING LIVE SUPABASE TELEMETRY...</p>
      </div>
    );
  }

  const {
    metrics = {
      totalProductsCount: 20,
      productsGrowth: 12.5,
      totalOrdersCount: 0,
      ordersGrowth: 8.2,
      totalRevenue: 0,
      revenueGrowth: 15.4,
      verifiedUsersCount: 0,
      usersGrowth: 24.1,
    },
    chartData = [],
    stockStatus = {
      inStock: 15,
      lowStock: 3,
      outOfStock: 2,
      total: 20,
      inStockPct: 75,
      lowStockPct: 15,
      outOfStockPct: 10,
    },
    lowStockProducts = [],
    activities = [],
  } = data || {};

  // Donut chart data configuration
  const donutData = [
    { name: 'In Stock', value: stockStatus.inStock, color: '#00D492' },
    { name: 'Low Stock', value: stockStatus.lowStock, color: '#F59E0B' },
    { name: 'Out of Stock', value: stockStatus.outOfStock, color: '#F43F5E' },
  ].filter((item) => item.value > 0);

  // Fallback if stock is 0 everywhere
  const finalDonutData = donutData.length > 0 ? donutData : [{ name: 'In Stock', value: 1, color: '#00D492' }];

  // Pagination for Activities modal
  const activitiesPerPage = 8;
  const totalActivityPages = Math.ceil((activities.length || 1) / activitiesPerPage);
  const paginatedActivities = activities.slice((activityPage - 1) * activitiesPerPage, activityPage * activitiesPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const displayedProducts = products.filter((p) => {
    const q = (productSearch || '').toLowerCase().trim();
    const matchSearch =
      !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.platform || '').toLowerCase().includes(q);
    const isOut = (p.availableStock || 0) <= 0;
    if (productTab === 'out_of_stock') return matchSearch && isOut;
    if (productTab === 'in_stock') return matchSearch && !isOut;
    return matchSearch;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dashboard Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Realtime Live</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, revenue trajectory, digital stock reserves, and active audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111A33] border border-white/10 hover:border-purple-500/40 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
            title="Refresh All Statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#2563EB] hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 5. DASHBOARD OVERVIEW — 4 EXACT STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 — Total Products (Purple Gradient) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="relative group p-6 rounded-3xl bg-[#111A33] border border-purple-500/20 hover:border-purple-500/50 shadow-xl transition-all overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/25 transition-all -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8]">Total Products</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {metrics.totalProductsCount}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{metrics.productsGrowth}% compared to last month</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2 — Total Orders (Blue Gradient) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="relative group p-6 rounded-3xl bg-[#111A33] border border-blue-500/20 hover:border-blue-500/50 shadow-xl transition-all overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/25 transition-all -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8]">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {metrics.totalOrdersCount}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{metrics.ordersGrowth}% order growth rate</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3 — Revenue (Green Gradient) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="relative group p-6 rounded-3xl bg-[#111A33] border border-emerald-500/20 hover:border-emerald-500/50 shadow-xl transition-all overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/25 transition-all -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8]">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              ${Number(metrics.totalRevenue || 0).toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{metrics.revenueGrowth}% verified net sales</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4 — Verified Users (Orange Gradient) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="relative group p-6 rounded-3xl bg-[#111A33] border border-amber-500/20 hover:border-amber-500/50 shadow-xl transition-all overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl group-hover:bg-amber-600/25 transition-all -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8]">Verified Users</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {metrics.verifiedUsersCount}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{metrics.usersGrowth}% verified membership</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 6. SALES OVERVIEW CHART & 7. STOCK STATUS CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Recharts Chart (lg:col-span-8) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-[#111A33] border border-white/5 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
        >
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">Sales Overview</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Revenue & Orders
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Verified transactions and order volumes over the selected timeline
              </p>
            </div>

            {/* Date-Range Selector Buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0D1329] border border-white/10 self-start sm:self-auto">
              {[
                { label: '7 Days', value: '7d' },
                { label: '30 Days', value: '30d' },
                { label: '90 Days', value: '90d' },
                { label: '1 Year', value: '1y' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setRange(tab.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    range === tab.value
                      ? 'bg-gradient-to-r from-[#9333EA] to-[#2563EB] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Recharts Line & Area Chart */}
          <div className="pt-6 pb-2 h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333EA" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9333EA" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="blueOrdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-2xl bg-[#0D1329]/95 border border-purple-500/30 shadow-2xl backdrop-blur-xl text-xs space-y-1.5 font-mono">
                          <div className="font-bold text-white border-b border-white/10 pb-1">{label}</div>
                          <div className="flex items-center gap-2 text-purple-300 font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#9333EA]" />
                            <span>Revenue: ${Number(payload[0]?.value || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-300 font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                            <span>Orders: {payload[1]?.value || 0}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#9333EA"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleRevGrad)"
                  name="Revenue ($)"
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#blueOrdGrad)"
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend indicator */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/5 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-md bg-[#9333EA] shadow-[0_0_10px_rgba(147,51,234,0.6)]" />
              <span>Revenue (USD)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-md bg-[#2563EB] shadow-[0_0_10px_rgba(37,99,235,0.6)]" />
              <span>Orders Placed</span>
            </div>
          </div>
        </motion.div>

        {/* 7. Stock Status Donut Chart (lg:col-span-4) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#111A33] border border-white/5 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Stock Status</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Live inventory distribution</p>
              </div>
              <Link
                to={ADMIN_ROUTES.STOCK}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 group"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Donut Chart with Center Total */}
            <div className="relative h-56 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finalDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {finalDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#111A33" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="px-3 py-1.5 rounded-xl bg-[#0D1329] border border-white/10 text-xs font-mono font-bold text-white shadow-xl">
                            {payload[0].name}: {payload[0].value} products
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Exact Center Overlay: Total Products */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-white font-mono">{stockStatus.total}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Products</span>
              </div>
            </div>
          </div>

          {/* Breakdown legend with actual counts and percentages */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#0D1329]/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00D492]" />
                <span className="text-slate-300 font-medium">In Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono">{stockStatus.inStock}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                  {stockStatus.inStockPct}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#0D1329]/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-slate-300 font-medium">Low Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 font-mono">{stockStatus.lowStock}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">
                  {stockStatus.lowStockPct}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#0D1329]/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                <span className="text-slate-300 font-medium">Out of Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-400 font-mono">{stockStatus.outOfStock}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-bold">
                  {stockStatus.outOfStockPct}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* ⚡ LIVE STORE PRODUCTS & STOCK CONTROL CENTER                             */}
      {/* Exact storefront product card replica (e.g. FiveM Account Ready, Out of  */}
      {/* Stock badge, $1.00, GTA 5 cover image, direct Add Stock and Add Product) */}
      {/* ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="p-6 sm:p-7 rounded-3xl bg-[#111A33] border border-white/5 shadow-2xl backdrop-blur-xl space-y-6"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                <Boxes className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Live Store Products & Stock Control
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Live Website Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive replica of storefront cards. Add new products or replenish stock keys instantly with real-time website updates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddProductModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Product</span>
            </button>
            <Link
              to={ADMIN_ROUTES.STOCK}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Stock Manager</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar: Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#090e1c] border border-white/5 w-fit flex-wrap">
            <button
              onClick={() => setProductTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                productTab === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setProductTab('out_of_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                productTab === 'out_of_stock'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Out of Stock ({products.filter((p) => (p.availableStock || 0) === 0).length})</span>
            </button>
            <button
              onClick={() => setProductTab('in_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                productTab === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>In Stock ({products.filter((p) => (p.availableStock || 0) > 0).length})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Filter products or platform..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090e1c] border border-white/10 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-sans"
            />
          </div>
        </div>

        {/* Storefront Cards Grid (Matching reference screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No products found matching filters.
            </div>
          ) : (
            displayedProducts.map((prod) => {
              const cover = getProductCoverImage(prod);
              const isOut = (prod.availableStock || 0) <= 0;
              return (
                <div
                  key={prod.id}
                  className="rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden border border-white/10 bg-[#090e1c] hover:border-cyan-500/40 shadow-xl group transition-all"
                  style={{
                    boxShadow: isOut ? 'none' : '0 0 25px -10px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {/* Radial Ambient Glow */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-45 group-hover:opacity-75 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at 50% 32%, ${prod.glow || (cover?.includes('rockstar') ? 'rgba(245, 158, 11, 0.55)' : 'rgba(59, 130, 246, 0.45)')} 0%, transparent 68%)`,
                    }}
                  />

                  {/* Top Header: Stock Badge */}
                  <div className="flex items-center justify-end relative z-10 min-h-[22px]">
                    {isOut ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {prod.availableStock} In Stock
                      </span>
                    )}
                  </div>

                  {/* Center Visual Area */}
                  <div className="py-4 flex flex-col items-center justify-center relative z-10 flex-1 min-h-[110px] text-center">
                    <div
                      onClick={() => handleOpenChangeImage(prod)}
                      className="w-24 h-16 relative flex items-center justify-center mb-2 overflow-hidden rounded-xl bg-black/40 border border-white/10 shadow-lg group-hover:scale-105 transition-all cursor-pointer group/img"
                      title="Click to Change Image & Subtext"
                    >
                      <img
                        src={cover}
                        alt={prod.name}
                        className={`${
                          cover.includes('card-rockstar-hd') || cover === '/card-rockstar.png'
                            ? 'w-14 h-14 object-contain'
                            : 'w-full h-full object-cover'
                        } rounded-xl`}
                        onError={(e) => {
                          e.currentTarget.src = '/card-rockstar-hd.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 text-white backdrop-blur-[2px]">
                        <Camera className="w-4 h-4 text-cyan-300" />
                        <span className="text-[9px] font-bold tracking-tight text-cyan-200">Change</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-200 truncate max-w-[170px] mt-1">
                      {prod.iconSubtext || prod.subtext || ((prod.name?.toLowerCase().includes('rockstar') && prod.name?.toLowerCase().includes('account')) || cover?.includes('card-rockstar-account') ? 'Rockstar Account' : cover?.includes('card-rockstar-hd') ? 'rockstar activation codes' : prod.name)}
                    </p>
                  </div>

                  {/* Platform & Product Info */}
                  <div className="space-y-1 relative z-10 mb-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono">
                      {prod.platform || 'Fivem'}
                    </span>
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Pricing & Actions Footer */}
                  <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="font-black text-white text-base font-mono">
                      ${Number(prod.current_price || prod.price || 1).toFixed(2)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenChangeImage(prod)}
                        className="px-2 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        title="Change Product Cover Image / Artwork"
                      >
                        <Camera className="w-3 h-3 text-purple-300" />
                        <span>Image</span>
                      </button>

                      <button
                        onClick={() => handleOpenQuickStock(prod)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-cyan-600/30 active:scale-95 transition-all cursor-pointer"
                        title="Add Stock for this product"
                      >
                        <Zap className="w-3 h-3 text-cyan-200" />
                        <span>Add Stock</span>
                      </button>

                      {isOut ? (
                        <span className="px-2.5 py-1.5 rounded-xl bg-[#121829] text-slate-500 text-[11px] font-semibold border border-white/5 cursor-not-allowed">
                          Sold Out
                        </span>
                      ) : (
                        <Link
                          to={`/products/${prod.slug || prod.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold border border-emerald-500/20 transition-all flex items-center gap-1"
                          title="View on live storefront"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Live</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* STOREFRONT PROMO BANNER & CAMPAIGN WIDGET */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1633] via-[#111A33] to-[#0c1633] border border-blue-500/20 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Banner Graphic Preview */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-blue-400/30 group bg-[#06102B]">
            <img
              src={promoBanner?.imageUrl || '/nightmare-promo-banner.png'}
              alt="Storefront Promo Banner"
              className="w-full h-auto max-h-[160px] object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/nightmare-promo-banner.png';
              }}
            />
          </div>

          {/* Campaign Details & Stats */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                  promoBanner?.enabled !== false
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    : 'bg-slate-800 text-slate-400 border-white/10'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    promoBanner?.enabled !== false ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                <span>{promoBanner?.enabled !== false ? 'Storefront Featured Campaign (Live)' : 'Campaign Paused'}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {promoBanner?.discountPercent || 15}% OFF Storewide
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>{promoBanner?.title || 'NightmareStore'} Promo Campaign</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {promoBanner?.subtitle || 'Active 3D hero promotional banner displayed on the storefront homepage with instant one-click coupon activation.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#0D1329] border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Code</span>
                <span className="text-sm font-black font-mono text-cyan-300">{promoBanner?.code || 'NIGHTMARE'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1329] border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Discount Rate</span>
                <span className="text-sm font-black font-mono text-emerald-400">{promoBanner?.discountPercent || 15}% OFF</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1329] border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Delivery Trigger</span>
                <span className="text-sm font-black font-mono text-purple-300 truncate block">
                  {promoBanner?.buttonText || 'CHECKOUT NOW!'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
            <Link
              to={`${ADMIN_ROUTES.SETTINGS}#promo-banner`}
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Banner Settings</span>
            </Link>
            <Link
              to={ADMIN_ROUTES.COUPONS}
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Manage Coupons</span>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-[#0D1329] border border-white/10 hover:border-blue-500/40 text-slate-300 hover:text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* 12. QUICK TOOLS PANEL */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono text-purple-400">
            Quick Tools & Operations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Tool 1: Import Inventory */}
          <Link
            to={ADMIN_ROUTES.INVENTORY}
            className="p-4 rounded-2xl bg-[#111A33] border border-white/5 hover:border-cyan-500/40 transition-all shadow-lg group flex items-center justify-between hover:bg-[#152042]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Import Inventory
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Upload CSV & Key Batches</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Quick Tool 2: Manage Coupons */}
          <Link
            to={ADMIN_ROUTES.COUPONS}
            className="p-4 rounded-2xl bg-[#111A33] border border-white/5 hover:border-purple-500/40 transition-all shadow-lg group flex items-center justify-between hover:bg-[#152042]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  Manage Coupons
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Discounts & Promo Codes</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Quick Tool 3: View Pending Orders */}
          <Link
            to={ADMIN_ROUTES.ORDERS}
            className="p-4 rounded-2xl bg-[#111A33] border border-white/5 hover:border-amber-500/40 transition-all shadow-lg group flex items-center justify-between hover:bg-[#152042]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  Pending Orders
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Fulfillment Queue</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Quick Tool 4: Discord Verification */}
          <Link
            to={ADMIN_ROUTES.DISCORD}
            className="p-4 rounded-2xl bg-[#111A33] border border-white/5 hover:border-indigo-500/40 transition-all shadow-lg group flex items-center justify-between hover:bg-[#152042]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Discord Verification
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Bot #0556 Role Sync</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </motion.div>

      {/* 8. RECENT ACTIVITY PANEL & 11. LOW STOCK ALERTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 8. Recent Activity Panel (lg:col-span-7) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-[#111A33] border border-white/5 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">Recent Activity</h2>
                  <p className="text-xs text-[#94A3B8]">Audit trail of real transactions and administrator actions</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivityPage(1);
                  setViewAllActivitiesModal(true);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                View All
              </button>
            </div>

            {/* List of 5-6 Recent Activities */}
            <div className="divide-y divide-white/5 mt-3">
              {activities.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No recent activity logged yet.
                </div>
              ) : (
                activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-[#0D1329] border border-white/10 flex items-center justify-center text-purple-400 shrink-0 group-hover:border-purple-500/40 transition-colors">
                        {act.type.includes('order') ? (
                          <ShoppingCart className="w-4 h-4 text-emerald-400" />
                        ) : act.type.includes('stock') ? (
                          <Boxes className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {act.description}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          Ref: {act.reference}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          act.badgeColor === 'emerald'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        }`}
                      >
                        {act.badge || 'System'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Verified PostgreSQL Audit Pipeline</span>
            <span className="text-emerald-400 font-bold">100% Synced</span>
          </div>
        </motion.div>

        {/* 11. Low Stock Alerts Panel (lg:col-span-5) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#111A33] border border-white/5 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">Low Stock Alerts</h2>
                  <p className="text-xs text-[#94A3B8]">Items below threshold requiring key imports</p>
                </div>
              </div>
              <Link
                to={ADMIN_ROUTES.STOCK}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center gap-1"
              >
                <span>Restock</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List of Low Stock Products matching reference image */}
            <div className="space-y-2.5 mt-3">
              {lowStockProducts.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                  <p className="text-xs text-slate-400 italic">All products meet healthy stock thresholds.</p>
                </div>
              ) : (
                lowStockProducts.slice(0, 5).map((p) => {
                  const cover = getProductCoverImage(p);
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-[#0D1329] border border-white/5 hover:border-amber-500/30 flex items-center justify-between gap-3 text-xs transition-all group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={cover}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-white block group-hover:text-amber-300 transition-colors truncate">
                            {p.name}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px] block">
                            {p.platform} • Threshold: {p.threshold || 3}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono inline-flex items-center gap-1.5 ${
                            p.availableStock === 0
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.availableStock === 0 ? 'bg-rose-400 animate-ping' : 'bg-amber-400 animate-ping'
                            }`}
                          />
                          <span>{p.availableStock} Left</span>
                        </span>

                        <button
                          onClick={() => handleOpenQuickStock(p)}
                          className="px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/35 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title="Restock now"
                        >
                          <Zap className="w-3 h-3 text-cyan-300" />
                          <span>+ Stock</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <Link
              to={ADMIN_ROUTES.INVENTORY}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Import Digital Keys via CSV</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* View All Activities Modal with Pagination */}
      <AnimatePresence>
        {viewAllActivitiesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[#0D1329] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Full System Audit Log</h3>
                    <p className="text-xs text-slate-400">Chronological history of operations and sales</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewAllActivitiesModal(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1">
                {paginatedActivities.map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-purple-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{act.description}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Reference: {act.reference} • {new Date(act.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {act.badge || 'Audit'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Page {activityPage} of {totalActivityPages || 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activityPage <= 1}
                    onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={activityPage >= totalActivityPages}
                    onClick={() => setActivityPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}



        {/* ========================================================================= */}
        {/* ⚡ QUICK ADD STOCK MODAL WITH LIVE STOREFRONT CARD PREVIEW                 */}
        {/* ========================================================================= */}
        {quickStockProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingQuickStock && setQuickStockProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl rounded-3xl bg-[#0c1022] border border-cyan-500/40 p-6 sm:p-7 shadow-2xl z-10 space-y-5 text-white max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Add Stock: {quickStockProduct.name}
                    </h3>
                    <p className="text-xs text-cyan-300/80 font-mono">
                      Current Stock: {quickStockProduct.availableStock || 0} Available • {quickStockProduct.platform || 'Fivem'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickStockProduct(null)}
                  disabled={isSubmittingQuickStock}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Top Banner: Exact Storefront Card Preview */}
              <div className="p-4 rounded-2xl bg-[#070b18] border border-white/5 flex flex-col sm:flex-row items-center gap-5">
                {/* Visual Card (User's Screenshot Match) */}
                <div className="w-48 sm:w-52 shrink-0 rounded-2xl p-3 relative overflow-hidden border border-white/10 bg-[#090e1c] shadow-xl text-center">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                      background: 'radial-gradient(circle at 50% 32%, rgba(59, 130, 246, 0.45) 0%, transparent 68%)',
                    }}
                  />
                  <div className="flex items-center justify-end relative z-10 mb-2">
                    {(quickStockProduct.availableStock || 0) <= 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                        {quickStockProduct.availableStock} In Stock
                      </span>
                    )}
                  </div>
                  <div className="w-20 h-14 mx-auto overflow-hidden rounded-xl bg-black/40 border border-white/10 mb-1.5 flex items-center justify-center">
                    <img
                      src={getProductCoverImage(quickStockProduct)}
                      alt={quickStockProduct.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = '/card-rockstar-hd.png';
                      }}
                    />
                  </div>
                  <p className="text-[10px] font-medium text-slate-300 truncate">{quickStockProduct.name}</p>
                  <div className="mt-2 text-left space-y-0.5">
                    <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-blue-500/15 text-blue-400 font-mono">
                      {quickStockProduct.platform || 'Fivem'}
                    </span>
                    <p className="text-xs font-bold text-white truncate">{quickStockProduct.name}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white">
                      ${Number(quickStockProduct.current_price || quickStockProduct.price || 1).toFixed(2)}
                    </span>
                    {(quickStockProduct.availableStock || 0) <= 0 ? (
                      <span className="text-[9px] px-2 py-1 rounded bg-[#121829] text-slate-500 font-semibold border border-white/5">
                        Sold Out
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation & 1-Click Fast Stock Presets */}
                <div className="flex-1 space-y-2 text-xs">
                  <p className="font-bold text-white">⚡ Instant 1-Click Stock Presets</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Click any preset below to auto-generate formatted keys or digital account credentials for immediate deposit:
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetKeys(5)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      +5 Auto Ready
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetKeys(10)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      +10 Auto Ready
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetKeys(25)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      +25 Auto Ready
                    </button>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleQuickAddStockSubmit} className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickStockType('digital_accounts')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      quickStockType === 'digital_accounts'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#090e1c] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Digital Accounts (user:pass)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickStockType('license_keys')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      quickStockType === 'license_keys'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-[#090e1c] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    License Keys (1 per line)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickStockType('quantity_pool')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      quickStockType === 'quantity_pool'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#090e1c] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Numeric Quantity Pool
                  </button>
                </div>

                {quickStockType === 'quantity_pool' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Quantity to Add into Store
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={quickStockQuantity}
                      onChange={(e) => setQuickStockQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070b18] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">
                        Enter Keys or Accounts (One per line)
                      </label>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {quickStockKeys.split('\n').filter((l) => l.trim().length > 0).length} Items Detected
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={quickStockKeys}
                      onChange={(e) => setQuickStockKeys(e.target.value)}
                      placeholder={
                        quickStockType === 'digital_accounts'
                          ? 'fivem_gamer1@nightcity.io:P@ssword123\nfivem_gamer2@nightcity.io:P@ssword456'
                          : 'KEY-XXXX-XXXX-XXXX-1\nKEY-XXXX-XXXX-XXXX-2'
                      }
                      className="w-full p-3 rounded-xl bg-[#070b18] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-600"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmittingQuickStock}
                    onClick={() => setQuickStockProduct(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingQuickStock}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30 disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-cyan-200" />
                    <span>{isSubmittingQuickStock ? 'Depositing Stock...' : 'Deposit Stock & Update Website'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ➕ ADD PRODUCT MODAL WITH LIVE STOREFRONT CARD PREVIEW                     */}
        {/* ========================================================================= */}
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingNewProduct && setIsAddProductModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl rounded-3xl bg-[#0c1022] border border-purple-500/40 p-6 sm:p-7 shadow-2xl z-10 space-y-5 text-white max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Create New Product</h3>
                    <p className="text-xs text-purple-300/80 font-mono">
                      Add product to catalog with live storefront preview & instant stock deposit
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddProductModalOpen(false)}
                  disabled={isSubmittingNewProduct}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left Column: Form Fields (7 cols) */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Product Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Product Title / Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProductForm.name}
                        onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                        placeholder="e.g. FiveM Account Ready"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#070b18] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Platform & Price Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Platform *</label>
                        <select
                          value={newProductForm.platform}
                          onChange={(e) => setNewProductForm({ ...newProductForm, platform: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#070b18] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                        >
                          <option value="Fivem">Fivem</option>
                          <option value="Giftlink">Giftlink</option>
                          <option value="Discord">Discord</option>
                          <option value="Minecraft">Minecraft</option>
                          <option value="Steam">Steam</option>
                          <option value="PC">PC</option>
                          <option value="PlayStation">PlayStation</option>
                          <option value="Xbox">Xbox</option>
                          <option value="mail">Mail</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Price ($ USD) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={newProductForm.current_price}
                          onChange={(e) => setNewProductForm({ ...newProductForm, current_price: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#070b18] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Image Upload Component */}
                    <ProductImageUploadField
                      label="Cover Image (Upload file or paste URL)"
                      value={newProductForm.cover_image}
                      onChange={(url) => setNewProductForm({ ...newProductForm, cover_image: url })}
                    />

                    {/* Initial Stock Keys */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-300">
                          Initial Stock Keys / Accounts (Optional)
                        </label>
                        <span className="text-[10px] text-purple-400 font-mono">
                          {newProductForm.initialStock
                            ? `${newProductForm.initialStock.split('\n').filter((l) => l.trim()).length} Keys`
                            : '0 Keys (Out of Stock)'}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={newProductForm.initialStock}
                        onChange={(e) => setNewProductForm({ ...newProductForm, initialStock: e.target.value })}
                        placeholder="Paste game keys or user:pass accounts (1 per line) to immediately stock the product"
                        className="w-full p-2.5 rounded-xl bg-[#070b18] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Storefront Card Preview (5 cols) */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#070b18] border border-white/5 space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      Live Storefront Card Preview
                    </span>

                    {/* Exact Replica of Storefront Card */}
                    <div className="w-full max-w-[210px] rounded-2xl p-3.5 relative overflow-hidden border border-white/10 bg-[#090e1c] shadow-2xl text-center">
                      <div
                        className="absolute inset-0 pointer-events-none opacity-45"
                        style={{
                          background: 'radial-gradient(circle at 50% 32%, rgba(59, 130, 246, 0.45) 0%, transparent 68%)',
                        }}
                      />
                      <div className="flex items-center justify-end relative z-10 mb-2">
                        {newProductForm.initialStock && newProductForm.initialStock.trim() ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                            {newProductForm.initialStock.split('\n').filter((l) => l.trim()).length} In Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="w-24 h-16 mx-auto overflow-hidden rounded-xl bg-black/40 border border-white/10 mb-2 flex items-center justify-center">
                        <img
                          src={
                            newProductForm.cover_image ||
                            (newProductForm.platform?.toLowerCase().includes('fivem')
                              ? '/card-gta5.png'
                              : '/card-rockstar-hd.png')
                          }
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.src = '/card-rockstar-hd.png';
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-medium text-slate-300 truncate">
                        {newProductForm.name || 'Fivem Account Ready'}
                      </p>

                      <div className="mt-2 text-left space-y-0.5">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-blue-500/15 text-blue-400 font-mono">
                          {newProductForm.platform || 'Fivem'}
                        </span>
                        <p className="text-xs font-bold text-white truncate">
                          {newProductForm.name || 'FiveM Account Ready'}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-white">
                          ${parseFloat(newProductForm.current_price || 1).toFixed(2)}
                        </span>
                        {newProductForm.initialStock && newProductForm.initialStock.trim() ? (
                          <span className="text-[9px] px-2 py-1 rounded bg-blue-600 text-white font-bold">
                            Buy Now
                          </span>
                        ) : (
                          <span className="text-[9px] px-2 py-1 rounded bg-[#121829] text-slate-500 font-semibold border border-white/5">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 text-center">
                      Card updates live to reflect what users will see on NightmareStore
                    </p>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isSubmittingNewProduct}
                    onClick={() => setIsAddProductModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNewProduct}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmittingNewProduct ? 'Creating Product...' : 'Publish Product to Website'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* CHANGE PRODUCT IMAGE & CARD STYLE MODAL */}
        {isImageModalOpen && imageModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl rounded-3xl bg-[#090e1c] border border-white/10 shadow-2xl p-6 sm:p-7 relative text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <span>Edit Product Card & Artwork</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {imageModalProduct.platform || 'Store Product'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Customize artwork, subtext, and ambient glow for <strong className="text-white">{imageModalProduct.name}</strong> across all website pages
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveImage} className="space-y-6">
                {/* 1-Click FiveM / Rockstar Style Presets */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>1-Click FiveM / Rockstar Quick Presets:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Instant Card Switch</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Account Rockstar Preset */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageUrl('/card-rockstar-account.png');
                        setSelectedSubtext('Account rockstar');
                        setSelectedGlow('rgba(245, 158, 11, 0.55)');
                        setSelectedName('Account rockstar');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left group ${
                        selectedImageUrl === '/card-rockstar-account.png' && selectedSubtext === 'Account rockstar'
                          ? 'border-amber-500 bg-amber-500/20 text-white shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/50'
                          : 'border-white/10 bg-slate-900/80 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-black/60 flex items-center justify-center p-0.5 shrink-0 border border-amber-500/30 overflow-hidden">
                        <img src="/card-rockstar-account.png" alt="Rockstar Account" className="w-full h-full object-cover rounded-md" />
                      </div>
                      <div className="truncate flex-1">
                        <span className="text-[11px] font-bold block text-amber-300 flex items-center justify-between">
                          <span>Account rockstar</span>
                          {selectedImageUrl === '/card-rockstar-account.png' && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Account rockstar</span>
                      </div>
                    </button>

                    {/* FiveM Account Ready Preset */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageUrl('/card-gta5.png');
                        setSelectedSubtext('Fivem Account Ready');
                        setSelectedGlow('rgba(59, 130, 246, 0.55)');
                        if (!selectedName || selectedName.toLowerCase().includes('rockstar')) {
                          setSelectedName('FiveM Account Ready');
                        }
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left group ${
                        selectedImageUrl === '/card-gta5.png' && selectedSubtext === 'Fivem Account Ready'
                          ? 'border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50'
                          : 'border-white/10 bg-slate-900/80 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-black/60 flex items-center justify-center p-0.5 shrink-0 border border-blue-500/30 overflow-hidden">
                        <img src="/card-gta5.png" alt="GTA 5" className="w-full h-full object-cover rounded-md" />
                      </div>
                      <div className="truncate flex-1">
                        <span className="text-[11px] font-bold block text-blue-300 flex items-center justify-between">
                          <span>FiveM Account Ready</span>
                          {selectedImageUrl === '/card-gta5.png' && (
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Fivem Account Ready</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Controls (7 cols) */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Card Subtext Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Card Subtext (Under Artwork) *</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Shows directly on store card</span>
                      </label>
                      <input
                        type="text"
                        value={selectedSubtext}
                        onChange={(e) => setSelectedSubtext(e.target.value)}
                        placeholder="e.g. rockstar activation codes or Fivem Account Ready"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium transition-colors"
                      />
                      {/* Quick Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {[
                          'Rockstar Account',
                          'Account rockstar',
                          'Fivem Account Ready',
                          'Instant Rockstar Key',
                          'Pre-Activated Account',
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setSelectedSubtext(chip)}
                            className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 hover:text-white font-mono transition-all cursor-pointer"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Product Title & Price Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Product Title
                        </label>
                        <input
                          type="text"
                          value={selectedName}
                          onChange={(e) => setSelectedName(e.target.value)}
                          placeholder="Product Name"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Price ($ USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={selectedPrice}
                          onChange={(e) => setSelectedPrice(e.target.value)}
                          placeholder="1.00"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                        />
                      </div>
                    </div>

                    {/* Ambient Glow Color Chooser */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Card Ambient Glow Color</span>
                        <span className="text-[10px] text-slate-400 font-normal">Backdrop Lighting</span>
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[
                          { name: 'Amber Gold (Rockstar)', value: 'rgba(245, 158, 11, 0.55)', bg: '#f59e0b' },
                          { name: 'Electric Blue (FiveM)', value: 'rgba(59, 130, 246, 0.55)', bg: '#3b82f6' },
                          { name: 'Cyber Purple (Nitro)', value: 'rgba(168, 85, 247, 0.55)', bg: '#a855f7' },
                          { name: 'Emerald Green (Minecraft)', value: 'rgba(34, 197, 94, 0.55)', bg: '#22c55e' },
                          { name: 'Crimson Red', value: 'rgba(244, 63, 94, 0.55)', bg: '#f43f5e' },
                        ].map((glow) => (
                          <button
                            key={glow.value}
                            type="button"
                            onClick={() => setSelectedGlow(glow.value)}
                            className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              selectedGlow === glow.value
                                ? 'border-white text-white shadow-md'
                                : 'border-white/10 bg-slate-900/80 text-slate-400 hover:text-white'
                            }`}
                            style={{
                              backgroundColor: selectedGlow === glow.value ? `${glow.bg}30` : undefined,
                            }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: glow.bg }} />
                            <span>{glow.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Device Upload / Drag & Drop */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span>Custom File Upload</span>
                        </label>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 15MB)</span>
                      </div>
                      <ProductImageUploadField
                        label=""
                        value={selectedImageUrl}
                        onChange={(url) => setSelectedImageUrl(url)}
                      />
                    </div>

                    {/* Direct Image URL Input */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="text-cyan-400 font-mono">#</span>
                        <span>Or Direct Image / CDN URL</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedImageUrl}
                          onChange={(e) => setSelectedImageUrl(e.target.value)}
                          placeholder="https://... or /card-gta5.png"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                        />
                        {selectedImageUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedImageUrl('')}
                            className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Preset Game Artwork Gallery */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Quick Preset Gallery</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Click to apply image</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 rounded-xl bg-black/30 border border-white/5">
                        {PRESET_GAME_COVERS.map((preset) => {
                          const isSelected = selectedImageUrl === preset.url;
                          return (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => {
                                setSelectedImageUrl(preset.url);
                                if (preset.url === '/card-rockstar-hd.png') {
                                  setSelectedSubtext('rockstar activation codes');
                                  setSelectedGlow('rgba(245, 158, 11, 0.55)');
                                } else if (preset.url === '/card-gta5.png') {
                                  setSelectedSubtext('Fivem Account Ready');
                                  setSelectedGlow('rgba(59, 130, 246, 0.55)');
                                }
                              }}
                              className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center group relative overflow-hidden ${
                                isSelected
                                  ? 'border-cyan-500 bg-cyan-500/20 shadow-md shadow-cyan-500/30'
                                  : 'border-white/5 bg-slate-900/60 hover:border-white/20 hover:bg-white/5'
                              }`}
                            >
                              <div className="w-full h-11 rounded-lg overflow-hidden bg-black/50 flex items-center justify-center p-0.5">
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className={`w-full h-full ${preset.url.includes('card-rockstar') ? 'object-contain' : 'object-cover'} group-hover:scale-105 transition-transform`}
                                  onError={(e) => {
                                    e.currentTarget.src = '/card-rockstar-hd.png';
                                  }}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-slate-300 truncate w-full group-hover:text-white">
                                {preset.name}
                              </span>
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Storefront Card Preview (5 cols) */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Live Card Preview</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                        Real-time Sync
                      </span>
                    </div>

                    {/* Preview Card */}
                    <div className="w-full max-w-[210px] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden border border-white/10 bg-[#090e1c] shadow-2xl">
                      <div
                        className="absolute inset-0 pointer-events-none opacity-50"
                        style={{
                          background: `radial-gradient(circle at 50% 32%, ${selectedGlow || 'rgba(59, 130, 246, 0.45)'} 0%, transparent 68%)`,
                        }}
                      />

                      {/* Top Header */}
                      <div className="flex items-center justify-end relative z-10 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Out of Stock
                        </span>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="py-3 flex flex-col items-center justify-center relative z-10 min-h-[90px]">
                        <div className="w-24 h-16 flex items-center justify-center overflow-hidden rounded-xl bg-black/50 border border-white/10 shadow-lg">
                          {selectedImageUrl ? (
                            <img
                              src={selectedImageUrl}
                              alt={selectedName || imageModalProduct.name}
                              className={`w-full h-full ${selectedImageUrl.includes('card-rockstar') ? 'object-contain p-1' : 'object-cover'} rounded-xl`}
                              onError={(e) => {
                                e.currentTarget.src = '/card-rockstar-hd.png';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">
                              No image
                            </div>
                          )}
                        </div>
                        {/* Subtext under icon */}
                        <p className="text-[11px] font-bold text-slate-200 truncate max-w-[170px] mt-2 text-center">
                          {selectedSubtext || imageModalProduct.name}
                        </p>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-0.5 relative z-10 mb-2">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-blue-500/15 text-blue-400 font-mono">
                          {imageModalProduct.platform || 'Fivem'}
                        </span>
                        <h4 className="font-bold text-xs text-white truncate">
                          {selectedName || imageModalProduct.name}
                        </h4>
                      </div>

                      {/* Price Footer */}
                      <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-white">
                          ${parseFloat(selectedPrice || imageModalProduct.current_price || 1).toFixed(2)}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-[#121829] text-slate-500 text-[10px] font-semibold border border-white/5">
                          Sold Out
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                      Artwork, subtext & glow will update across Admin Dashboard, Storefront, and Product Details immediately.
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isSavingImage}
                    onClick={() => setIsImageModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingImage || !selectedImageUrl}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    {isSavingImage ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{isSavingImage ? 'Saving Changes...' : 'Save & Apply to Website'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
