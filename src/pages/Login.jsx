import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, RotateCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithDiscord, loginWithGoogle, loginWithEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isCaptchaChecking, setIsCaptchaChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from
    ? (typeof location.state.from === 'string'
        ? location.state.from
        : ((location.state.from.pathname || '/dashboard') + (location.state.from.search || '')))
    : '/dashboard';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleCaptchaToggle = () => {
    if (isCaptchaVerified) return;
    setIsCaptchaChecking(true);
    setTimeout(() => {
      setIsCaptchaChecking(false);
      setIsCaptchaVerified(true);
    }, 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (!isCaptchaVerified) {
      setErrorMsg('Please verify the reCAPTCHA checkbox to proceed.');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithEmail(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscordLogin = async () => {
    try {
      setOauthLoading('discord');
      await loginWithDiscord();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to connect with Discord');
      setOauthLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setOauthLoading('google');
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to connect with Google');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden bg-[#06080F]">
      {/* Halloween Eerie Background with Jack-o'-Lantern Atmosphere */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed scale-105 opacity-60"
        style={{ backgroundImage: `url('/halloween-bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#06080F]/70 via-[#06080F]/85 to-[#06080F]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#06080F_75%)] opacity-90" />

      {/* Floating Halloween Sparks & Embers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute top-[16%] left-[10%] w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_12px_#f97316] animate-particle" style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <span className="absolute top-[34%] left-[86%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-particle" style={{ animationDelay: '1.5s', animationDuration: '8s' }} />
        <span className="absolute top-[65%] left-[8%] w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_14px_#a855f7] animate-particle" style={{ animationDelay: '2.8s', animationDuration: '6.5s' }} />
        <span className="absolute top-[80%] left-[88%] w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_#fb923c] animate-particle" style={{ animationDelay: '0.8s', animationDuration: '9s' }} />
      </div>

      {/* Main Login Split-Card with Halloween Hero Artwork */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl rounded-3xl bg-[#090d19]/95 border border-orange-500/20 shadow-[0_0_50px_-10px_rgba(249,115,22,0.25)] backdrop-blur-2xl relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12"
      >
        {/* Left Column: Epic Halloween Artwork Banner (Desktop & Mobile) */}
        <div className="relative md:col-span-5 min-h-[260px] md:min-h-full overflow-hidden flex flex-col justify-between p-6 sm:p-7 bg-[#0a0f1d]">
          {/* Background Image with Dark Vignette */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/halloween-login-hero.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d19]/95 via-[#090d19]/25 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#090d19]" />

          {/* Top Halloween Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-black/60 text-orange-400 border border-orange-500/40 backdrop-blur-md shadow-lg shadow-orange-500/10">
              <span className="text-sm">🎃</span> HALLOWEEN EDITION
            </span>
          </div>

          {/* Bottom Card Content */}
          <div className="relative z-10 space-y-1.5 pt-20 md:pt-0">
            <p className="text-xs text-orange-200/90 font-medium drop-shadow line-clamp-2 md:line-clamp-none">
              Instant game keys, verified digital licenses & exclusive spooky discounts.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[10px] font-semibold text-amber-300">
              <span className="px-2 py-0.5 rounded-md bg-black/60 border border-orange-500/30 backdrop-blur-sm">⚡ Instant Delivery</span>
              <span className="px-2 py-0.5 rounded-md bg-black/60 border border-purple-500/30 backdrop-blur-sm">🛡️ 100% Safe</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="md:col-span-7 p-6 sm:p-8 md:p-9 space-y-5">
          {/* Brand Header */}
          <div className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center border border-orange-500/30 bg-[#080d1a] shadow-sm">
                  <img
                    src="/logo.png"
                    alt="Nightmare Store"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <span className="text-base font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  Nightmare<span className="text-orange-500">Store</span>
                </span>
              </Link>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Secure Portal
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight pt-2">
              Welcome back
            </h1>
            <p className="text-xs text-slate-400">
              Please enter your credentials to sign in
            </p>

            {location.state?.message && (
              <div className="mt-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2 text-left shadow-sm">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{location.state.message}</span>
              </div>
            )}
          </div>

          {/* Social Buttons (Discord + Google) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Discord Button */}
            <button
              type="button"
              disabled={!!oauthLoading}
              onClick={handleDiscordLogin}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0e1424] hover:bg-[#141d34] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-60"
            >
              {oauthLoading === 'discord' ? (
                <RotateCw className="w-4 h-4 text-[#5865F2] animate-spin" />
              ) : (
                <svg className="w-4 h-4 fill-[#5865F2]" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              )}
              <span>{oauthLoading === 'discord' ? 'Connecting...' : 'Discord'}</span>
            </button>

            {/* Google Button */}
            <button
              type="button"
              disabled={!!oauthLoading}
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0e1424] hover:bg-[#141d34] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-60"
            >
              {oauthLoading === 'google' ? (
                <RotateCw className="w-4 h-4 text-[#4285F4] animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{oauthLoading === 'google' ? 'Connecting...' : 'Google'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-white/5" />
            <span className="absolute bg-[#090d19] px-3 text-[11px] text-slate-500 font-medium">
              or sign in with email
            </span>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#060a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#060a14] border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* reCAPTCHA Mock Box */}
            <div
              onClick={handleCaptchaToggle}
              className="rounded-xl bg-[#0b1020] border border-white/10 p-3 flex items-center justify-between cursor-pointer hover:border-orange-500/30 transition-all select-none shadow-inner"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    isCaptchaVerified
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                      : 'bg-[#060a14] border-white/20 hover:border-orange-400'
                  }`}
                >
                  {isCaptchaChecking ? (
                    <RotateCw className="w-3 h-3 text-orange-400 animate-spin" />
                  ) : isCaptchaVerified ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : null}
                </div>
                <span className="text-xs font-medium text-slate-200">
                  I'm not a robot
                </span>
              </div>

              {/* reCAPTCHA Badge */}
              <div className="flex flex-col items-center">
                <svg className="w-5 h-5 text-[#1A73E8]" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 6L16 10L12 14"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[7px] font-black tracking-tighter text-slate-400 mt-0.5">
                  reCAPTCHA
                </span>
              </div>
            </div>

            {/* Submit Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In to Account'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-1 text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              state={location.state}
              className="font-bold text-orange-400 hover:text-orange-300 underline-offset-2 hover:underline transition-colors ml-1"
            >
              Create one now
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
