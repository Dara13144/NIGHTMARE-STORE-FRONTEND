import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeFaq, setActiveFaq] = useState(0);
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
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

  const handleCopyPromoCode = (e) => {
    if (e) e.stopPropagation();
    const code = promoBanner.code || 'NIGHTMARE';
    navigator.clipboard.writeText(code);
    localStorage.setItem('active_coupon', code);
    setCopiedCode(true);
    showToast(`🎟️ Coupon code ${code} copied (${promoBanner.discountPercent || 15}% OFF applied)!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePromoCheckout = () => {
    const code = promoBanner.code || 'NIGHTMARE';
    navigator.clipboard.writeText(code);
    localStorage.setItem('active_coupon', code);
    showToast(`🎟️ ${promoBanner.discountPercent || 15}% OFF Code ${code} applied! Directing to store...`, 'success');
    navigate(promoBanner.targetUrl || '/products');
  };

  useEffect(() => {
    async function load() {
      try {
        const [pRes, bRes] = await Promise.all([
          api.getProducts({ limit: 50 }),
          api.getPromoBanner().catch(() => null),
        ]);
        if (pRes?.success && pRes.data) {
          setProducts(pRes.data);
        }
        if (bRes?.success && bRes.data) {
          setPromoBanner(bRes.data);
        }
      } catch (err) {
        console.warn('Failed to load products/banner:', err.message);
      }
    }
    load();

    const handleRefresh = () => load();
    const handleProductDeleted = (e) => {
      const deletedId = e.detail?.id;
      const deletedRealId = e.detail?.real_id;
      setProducts((prev) =>
        prev.filter(
          (p) =>
            p.id !== deletedId &&
            p.real_id !== deletedId &&
            (!deletedRealId || (p.id !== deletedRealId && p.real_id !== deletedRealId))
        )
      );
      load();
    };

    window.addEventListener('refresh-store-products', handleRefresh);
    window.addEventListener('product-deleted', handleProductDeleted);

    return () => {
      window.removeEventListener('refresh-store-products', handleRefresh);
      window.removeEventListener('product-deleted', handleProductDeleted);
    };
  }, []);

  // 6 Popular Featured Products matching Screenshot 2 & 3
  const popularCatalog = [
    {
      id: 'prod-mc',
      title: 'Minecraft Account',
      tag: 'Minecraft & Java',
      image: '/card-minecraft-java.png',
      glow: 'rgba(34, 197, 94, 0.45)', // green ambient
      link: '/products/minecraft-account',
      isBanner: true,
    },
    {
      id: 'prod-rstar',
      title: 'Account rockstar',
      tag: 'Rockstar Games',
      image: '/card-rockstar-account.png',
      glow: 'rgba(245, 158, 11, 0.45)', // amber ambient
      link: '/products/rockstar-account',
      isIcon: true,
    },
    {
      id: 'prod-gemini',
      title: 'Gemini Pro+ 18Month',
      tag: 'AI Subscriptions',
      image: '/card-gemini.png',
      glow: 'rgba(56, 189, 248, 0.4)', // cyan/blue ambient
      link: '/products/gemini-pro-18month',
      isIcon: true,
    },
    {
      id: 'prod-nitro',
      title: '14x 1 Month Server Boosts',
      tag: 'Discord Boosts',
      image: '/card-nitro-boosts-hd.png',
      glow: 'rgba(168, 85, 247, 0.45)', // purple ambient
      link: '/products/14x-1-month-server-boosts',
      isBanner: true,
    },
    {
      id: 'prod-gta5',
      title: 'Grand Theft Auto V',
      tag: 'Steam / Rockstar Key',
      image: '/card-gta5.png',
      glow: 'rgba(59, 130, 246, 0.4)', // blue ambient
      link: '/store?category=Steam',
      isBanner: true,
    },
    {
      id: 'prod-discord-acc',
      title: 'Discord Account',
      tag: 'Verified Accounts',
      image: '/card-discord.png',
      glow: 'rgba(88, 101, 242, 0.4)', // discord blue ambient
      link: '/products/discord-account',
      isIcon: true,
    },
  ];

  const activePopularCatalog = useMemo(() => {
    if (!products || products.length === 0) return popularCatalog;
    return popularCatalog.filter((item) => {
      const slugFromLink = item.link?.replace('/products/', '');
      return products.some(
        (p) =>
          !p.is_archived &&
          p.is_published !== false &&
          (p.id === item.id ||
            p.real_id === item.id ||
            p.slug === slugFromLink ||
            p.name?.toLowerCase().includes(item.title.toLowerCase()) ||
            item.title.toLowerCase().includes((p.name || '').toLowerCase()))
      );
    });
  }, [products]);

  // FAQ items matching Screenshot 4
  const faqItems = [
    {
      emoji: '❓',
      question: 'What happens after I purchase?',
      answer: 'As soon as your payment goes through, your order is delivered instantly. All login info will be sent directly to your email and accessible inside your user dashboard.',
    },
    {
      emoji: '💳',
      question: 'What payment methods do you support?',
      answer: 'We support credit/debit cards, secure crypto, and instant test gateways with automated digital key delivery.',
    },
    {
      emoji: '⚡',
      question: 'How fast is delivery?',
      answer: 'Delivery is 100% automated and instantaneous immediately upon verified payment confirmation.',
    },
    {
      emoji: '🤝',
      question: 'Need help?',
      answer: 'Our dedicated support staff is active daily from 7:00 AM - 12:00 AM on Discord, Telegram, and via our Support Ticket desk.',
    },
  ];

  return (
    <div className="space-y-28 pb-16 sbay-grid-bg min-h-screen relative overflow-hidden">
      {/* Floating Cyber Particle Sparkles (Screenshots 1, 2, 4) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute top-[8%] left-[12%] w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#38bdf8] animate-particle" style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <span className="absolute top-[14%] left-[84%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-particle" style={{ animationDelay: '1.2s', animationDuration: '8s' }} />
        <span className="absolute top-[26%] left-[20%] w-1 h-1 rounded-full bg-blue-300 shadow-[0_0_8px_#60a5fa] animate-particle" style={{ animationDelay: '2.5s', animationDuration: '6s' }} />
        <span className="absolute top-[36%] left-[76%] w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] animate-particle" style={{ animationDelay: '0.8s', animationDuration: '9s' }} />
        <span className="absolute top-[48%] left-[6%] w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_12px_#3b82f6] animate-particle" style={{ animationDelay: '3s', animationDuration: '7.5s' }} />
        <span className="absolute top-[58%] left-[90%] w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9] animate-particle" style={{ animationDelay: '1.8s', animationDuration: '6.5s' }} />
        <span className="absolute top-[68%] left-[24%] w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_#38bdf8] animate-particle" style={{ animationDelay: '4s', animationDuration: '8s' }} />
        <span className="absolute top-[78%] left-[82%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#06b6d4] animate-particle" style={{ animationDelay: '2.1s', animationDuration: '7s' }} />
        <span className="absolute top-[88%] left-[16%] w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] animate-particle" style={{ animationDelay: '0.5s', animationDuration: '8.5s' }} />
      </div>

      {/* ====================================================================== */}
      {/* 1. HERO SECTION (Matching Screenshot 1)                               */}
      {/* ====================================================================== */}
      <section className="relative pt-16 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6 z-10">
        {/* Ambient Top Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[34rem] h-[20rem] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Pill Badges & Admin Quick Access */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#071026]/90 border border-blue-500/30 text-blue-400 text-xs font-semibold shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Legit & Trusted Digital Marketplace</span>
          </div>
        </div>

        {/* Main Headline (Screenshot 1) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Digital accounts &<br />
          keys, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">delivered</span><br />
          <span className="text-blue-500">instantly.</span>
        </h1>

        {/* Subtitle (Screenshot 1) */}
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          NightmareStore is a digital marketplace for accounts and digital keys. Shop with confidence, secure checkout, and fast delivery.
        </p>

        {/* Action Buttons (Screenshot 1) */}
        <div className="flex items-center justify-center gap-3.5 pt-2">
          <Link
            to="/store"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:shadow-[0_0_35px_rgba(37,99,235,0.65)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#popular"
            className="px-6 py-3 rounded-xl bg-[#0d1322] hover:bg-[#131b30] border border-white/10 text-slate-200 hover:text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            Learn More
          </a>
        </div>

      </section>

      {/* ====================================================================== */}
      {/* 2. POPULAR PRODUCTS (Exact Match to Screenshot 2)                     */}
      {/* ====================================================================== */}
      <section id="popular" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 z-10 relative">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-extrabold text-blue-500 uppercase tracking-widest">
            CATALOG
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Popular Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose from our most popular items today.
          </p>
        </div>

        {/* 6 Popular Cards Grid matching Screenshot 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePopularCatalog.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="group p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden bg-[#090e1c] border border-white/5 hover:border-blue-500/40 shadow-2xl transition-all duration-300 hover:-translate-y-1 min-h-[230px] sm:min-h-[250px]"
            >
              {/* Radial ambient background aura matching Screenshot 2 */}
              <div
                className="absolute inset-0 pointer-events-none opacity-45 group-hover:opacity-75 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at center 38%, ${item.glow} 0%, transparent 68%)`,
                }}
              />

              {/* Card Artwork matching Screenshot 2 */}
              <div className="w-full flex-1 flex items-center justify-center relative z-10 py-2">
                <img
                  src={item.image}
                  alt={item.title}
                  className={`${
                    item.id === 'prod-mc'
                      ? 'w-48 sm:w-56 h-28 object-contain rounded-xl drop-shadow-2xl'
                      : item.id === 'prod-rstar'
                      ? 'w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl bg-[#F59E0B] p-1 shadow-2xl drop-shadow-[0_10px_25px_rgba(245,158,11,0.4)]'
                      : item.id === 'prod-gemini'
                      ? 'w-40 sm:w-48 h-20 sm:h-22 object-contain rounded-xl shadow-2xl bg-white p-2 drop-shadow-xl'
                      : item.id === 'prod-nitro'
                      ? 'w-44 sm:w-52 h-24 object-contain rounded-xl shadow-2xl drop-shadow-2xl'
                      : item.id === 'prod-gta5'
                      ? 'w-36 sm:w-44 h-26 sm:h-28 object-contain rounded-xl shadow-2xl drop-shadow-2xl'
                      : 'w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl bg-[#5865F2] p-3 shadow-2xl drop-shadow-[0_10px_25px_rgba(88,101,242,0.4)]'
                  } group-hover:scale-105 transition-transform duration-300`}
                />
              </div>

              {/* Title Underneath Card matching Screenshot 2 */}
              <div className="relative z-10 pt-4">
                <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors tracking-tight">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>



      {/* ====================================================================== */}
      {/* 3. FAQ & PROMO BANNER (Matching Screenshot 4)                          */}
      {/* ====================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Nightmare Store Promotional Banner */}
          <div className="lg:col-span-5 space-y-4">
            {promoBanner.enabled !== false && (
              <div className="relative rounded-3xl overflow-hidden shadow-[0_0_35px_rgba(37,99,235,0.35)] border border-blue-500/30 group bg-[#06102B] transition-all hover:shadow-[0_0_50px_rgba(37,99,235,0.55)]">
                {/* High-Resolution 3D Promo Banner Image */}
                <img
                  src={promoBanner.imageUrl || '/nightmare-promo-banner.png'}
                  alt={promoBanner.title || 'NightmareStore Official Promo'}
                  className="w-full h-auto object-cover block group-hover:scale-[1.015] transition-transform duration-300"
                />

                {/* Interactive Quick-Action Pill Overlay (Top Right) */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                  <button
                    onClick={handleCopyPromoCode}
                    className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-blue-600/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
                    title={`Click to copy code ${promoBanner.code || 'NIGHTMARE'}`}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-300" />
                        <span>CODE {promoBanner.code || 'NIGHTMARE'}</span>
                      </>
                    )}
                  </button>
                </div>



                {/* Full Banner Click Area */}
                <div
                  onClick={handlePromoCheckout}
                  className="absolute inset-0 cursor-pointer z-0"
                  title={`Click to activate Code ${promoBanner.code || 'NIGHTMARE'} and Shop`}
                />
              </div>
            )}

            {/* Telegram & Discord Link Buttons Underneath */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://discord.gg/PyjjHvdf2"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-[#0d1322] hover:bg-[#5865F2]/20 border border-white/10 hover:border-[#5865F2]/50 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2.5 transition-all shadow-md group active:scale-95 cursor-pointer"
              >
                <img
                  src="/discord-logo.png"
                  alt="Discord"
                  className="w-5 h-5 rounded-md object-contain group-hover:scale-110 transition-transform shadow"
                />
                <span className="font-bold tracking-wide">Discord</span>
              </a>

              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-[#0d1322] hover:bg-[#229ED9]/20 border border-white/10 hover:border-[#229ED9]/50 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2.5 transition-all shadow-md group active:scale-95 cursor-pointer"
              >
                <img
                  src="/telegram-logo.png"
                  alt="Telegram"
                  className="w-5 h-5 rounded-full object-contain group-hover:scale-110 transition-transform shadow"
                />
                <span className="font-bold tracking-wide">Telegram</span>
              </a>
            </div>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                SUPPORT
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-2.5 pt-2">
              {faqItems.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="sbay-card rounded-xl border border-white/5 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span>{item.emoji}</span>
                        <span>{item.question}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-blue-400' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 5. READY TO FIND YOUR PRODUCTS CTA (Matching Screenshot 5)             */}
      {/* ====================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#0d162c] via-[#0f1d3d] to-[#0d162c] border border-blue-500/20 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ready to find your Products?
            </h2>
            <p className="text-xs text-slate-400">
              Browse the full category and purchase.
            </p>
          </div>

          <Link
            to="/store"
            className="btn-primary-blue px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-lg"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
