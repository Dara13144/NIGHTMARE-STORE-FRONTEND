import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  ShieldCheck,
  History,
  Save,
  Sparkles,
  ExternalLink,
  Tag,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Percent,
  Link2,
  MousePointer,
  Power,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ADMIN_ROUTES } from '../../constants/adminRoutes';

const BANNER_PRESETS = [
  { id: 'nightmare-3d', label: 'Nightmare 3D Official', url: '/nightmare-promo-banner.png', desc: 'Neon Cyber Storefront' },
  { id: 'rockstar', label: 'Rockstar Edition', url: '/card-rockstar-hd.png', desc: 'Gold & Black Key Visual' },
  { id: 'gta5', label: 'GTA V Premium', url: '/card-gta5.png', desc: 'GTA V Online Key Visual' },
  { id: 'minecraft', label: 'Minecraft Realm', url: '/card-minecraft-hd.png', desc: 'Minecraft World Art' },
  { id: 'nitro', label: 'Discord Nitro', url: '/card-nitro-boosts-hd.png', desc: 'Nitro Boost Visual' },
  { id: 'gemini', label: 'Gemini Pro AI', url: '/card-gemini.png', desc: 'AI Pro Visual' },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    lowStockThreshold: 3,
    storeCurrency: 'USD',
    maintenanceMode: false,
  });
  const [promoBanner, setPromoBanner] = useState({
    enabled: true,
    title: 'NightmareStore',
    subtitle: 'Official Nightmare Gang Store',
    code: 'NIGHTMARE',
    discountPercent: 15,
    buttonText: 'CHECKOUT NOW!',
    targetUrl: '/products',
    imageUrl: '/nightmare-promo-banner.png',
    badgeText: 'CODE NIGHTMARE',
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [sRes, aRes] = await Promise.all([
          api.admin.getSettings(),
          api.admin.getAuditLogs(),
        ]);
        if (sRes.success && sRes.data) {
          setSettings(sRes.data);
          if (sRes.data.promoBanner) {
            setPromoBanner(prev => ({ ...prev, ...sRes.data.promoBanner }));
          }
        }
        if (aRes.success) setAuditLogs(aRes.data);
      } catch (err) {
        console.warn('Failed to load settings:', err.message);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.admin.updateSettings(settings);
      if (res.success) {
        showToast('Store parameters saved successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setPromoBanner(prev => ({ ...prev, imageUrl: base64Url }));
      setUploadingImage(false);
      showToast('Custom banner image loaded into preview', 'success');
    };
    reader.onerror = () => {
      setUploadingImage(false);
      showToast('Failed to load image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e) => {
    if (e) e.preventDefault();
    try {
      setSavingBanner(true);
      const cleanCode = (promoBanner.code || 'NIGHTMARE').trim().toUpperCase();
      const cleanDiscount = Math.max(1, Math.min(100, Number(promoBanner.discountPercent) || 15));
      const cleanPayload = {
        ...promoBanner,
        code: cleanCode,
        discountPercent: cleanDiscount,
        badgeText: `CODE ${cleanCode}`,
      };

      const updatedSettings = {
        ...settings,
        promoBanner: cleanPayload,
      };

      const res = await api.admin.updateSettings(updatedSettings);
      if (res.success) {
        setSettings(res.data);
        if (res.data.promoBanner) {
          setPromoBanner(res.data.promoBanner);
        }
        showToast(`Promo banner updated! Coupon CODE: ${cleanCode} (${cleanDiscount}% OFF) synced storewide.`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save promo banner', 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleResetDefaultBanner = () => {
    setPromoBanner({
      enabled: true,
      title: 'NightmareStore',
      subtitle: 'Official Nightmare Gang Store',
      code: 'NIGHTMARE',
      discountPercent: 15,
      buttonText: 'CHECKOUT NOW!',
      targetUrl: '/products',
      imageUrl: '/nightmare-promo-banner.png',
      badgeText: 'CODE NIGHTMARE',
    });
    showToast('Reset banner values to defaults. Click "Save Banner" to apply.', 'info');
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Store Settings & Hero Promo Banner</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure operational thresholds, customize the storefront hero promotional banner, and audit administrative events.
        </p>
      </div>

      {/* Operational Parameters Form */}
      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#111629]/90 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-400" />
          <span>Operational Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Low-Stock Warning Threshold (Keys)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value, 10) || 3 })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-purple-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Products with stock at or below this count will trigger amber warning badges.
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Store Default Currency
            </label>
            <select
              value={settings.storeCurrency}
              onChange={(e) => setSettings({ ...settings, storeCurrency: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-purple-500 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-900 border-white/20 text-purple-600 focus:ring-0"
            />
            <span>Store Maintenance Mode (Temporarily pause checkout)</span>
          </label>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Parameters'}</span>
          </button>
        </div>
      </form>

      {/* Storefront Hero Promo Banner Management System */}
      <div id="promo-banner" className="glass-card p-6 sm:p-8 rounded-3xl border border-blue-500/25 bg-[#0e1428]/95 space-y-8 relative overflow-hidden shadow-2xl">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Title and Live Status */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-white tracking-wide">
                Storefront Hero Promo Banner
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Control the top promotional campaign banner on the homepage. Change banner visuals, discount rates, promo codes, and call-to-action buttons with instant storewide synchronization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 border ${
                promoBanner.enabled
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-800 text-slate-400 border-white/10'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  promoBanner.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              {promoBanner.enabled ? 'LIVE ON STOREFRONT' : 'PAUSED (HIDDEN)'}
            </span>

            <button
              type="button"
              onClick={() => setPromoBanner(p => ({ ...p, enabled: !p.enabled }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 border transition-all ${
                promoBanner.enabled
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{promoBanner.enabled ? 'Turn Off' : 'Turn On'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Preview vs Form */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Interactive Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Live Storefront Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                16:9 Aspect Ratio
              </span>
            </div>

            {/* Simulated Banner Card */}
            <div className="relative rounded-2xl overflow-hidden border border-blue-400/30 bg-[#06102B] shadow-2xl group">
              <img
                src={promoBanner.imageUrl || '/nightmare-promo-banner.png'}
                alt="Promo Banner Visual"
                className="w-full h-auto max-h-[300px] object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/nightmare-promo-banner.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Dynamic Overlay Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-cyan-300 font-black font-mono text-[11px] border border-cyan-400/40 shadow-lg">
                  CODE: {promoBanner.code || 'NIGHTMARE'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/80 backdrop-blur-md text-white font-black font-mono text-[11px] border border-emerald-300/40 shadow-lg">
                  {promoBanner.discountPercent || 15}% OFF
                </span>
              </div>

              {/* Simulated Button Preview */}
              <div className="absolute bottom-3 right-3 pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-blue-500/40 flex items-center gap-1.5">
                  <MousePointer className="w-3 h-3 text-cyan-300" />
                  <span>{promoBanner.buttonText || 'CHECKOUT NOW!'}</span>
                </div>
              </div>
            </div>

            {/* Key Promo Metrics Display */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Code</span>
                <span className="text-sm font-black font-mono text-cyan-300 truncate block">
                  {promoBanner.code || 'NIGHTMARE'}
                </span>
                <span className="text-[10px] text-slate-500 block">Auto-copied on click</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Discount</span>
                <span className="text-sm font-black font-mono text-emerald-400 block">
                  {promoBanner.discountPercent || 15}% Storewide
                </span>
                <span className="text-[10px] text-slate-500 block">Synced to Coupons</span>
              </div>
            </div>

            {/* External Links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>View Storefront</span>
              </a>
              <Link
                to={ADMIN_ROUTES.COUPONS}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-500/30 transition-all"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Coupons Rules</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Configuration Form & Presets */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Quick Visual Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Select Visual Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BANNER_PRESETS.map((preset) => {
                  const isSelected = promoBanner.imageUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPromoBanner(p => ({ ...p, imageUrl: preset.url }))}
                      className={`p-2 rounded-xl text-left border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400'
                          : 'bg-slate-900/80 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="w-full h-14 rounded-lg overflow-hidden bg-black/40 border border-white/5">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <span className={`text-[11px] font-bold block truncate ${isSelected ? 'text-blue-300' : 'text-slate-300'}`}>
                          {preset.label}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate font-mono">
                          {preset.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Custom Image URL & File Upload */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Banner Image Source (Custom URL or Local Upload)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={promoBanner.imageUrl || ''}
                    onChange={(e) => setPromoBanner(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="Enter image URL (/banner.png or https://...)"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-white/10 shrink-0 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{uploadingImage ? 'Reading...' : 'Upload Image'}</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Supports web URLs (e.g. Unsplash, Imgur) or local upload from computer storage.
              </span>
            </div>

            {/* 3. Promo Code & Discount Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Promo Coupon Code
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={promoBanner.code || ''}
                    onChange={(e) => setPromoBanner(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="NIGHTMARE"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-cyan-300 font-mono font-bold uppercase focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Automatically created in store coupon system on save.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discount Percentage (%)
                </label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={promoBanner.discountPercent || ''}
                    onChange={(e) => setPromoBanner(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                    placeholder="15"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Applies percentage reduction across the total checkout price.
                </span>
              </div>
            </div>

            {/* 4. Button Text & Target Destination Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  CTA Button Label
                </label>
                <div className="relative">
                  <MousePointer className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={promoBanner.buttonText || ''}
                    onChange={(e) => setPromoBanner(p => ({ ...p, buttonText: e.target.value }))}
                    placeholder="CHECKOUT NOW!"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-blue-400 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination Link
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={promoBanner.targetUrl || ''}
                    onChange={(e) => setPromoBanner(p => ({ ...p, targetUrl: e.target.value }))}
                    placeholder="/products"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. Campaign Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={promoBanner.title || ''}
                  onChange={(e) => setPromoBanner(p => ({ ...p, title: e.target.value }))}
                  placeholder="NightmareStore"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Campaign Subtitle
                </label>
                <input
                  type="text"
                  value={promoBanner.subtitle || ''}
                  onChange={(e) => setPromoBanner(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Official Nightmare Gang Store"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetDefaultBanner}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={savingBanner}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingBanner ? 'Saving Promo Banner...' : 'Save Promo Banner Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Security Audit Trail</span>
        </h2>

        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold border-b border-white/5">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor Role</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-purple-300">{log.action}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{log.target_resource}</td>
                    <td className="p-4 font-mono text-slate-500 text-[11px]">{log.ip_address}</td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
