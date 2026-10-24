import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  LogOut,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DiscordVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithDiscord } = useAuth();

  // URL Query Parameters
  const paramSession = searchParams.get('session');
  const paramUserId = searchParams.get('user_id') || searchParams.get('user');
  const paramGuildId = searchParams.get('guild_id') || searchParams.get('guild');

  // State Management
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionToken, setSessionToken] = useState(paramSession || '');
  const [discordUser, setDiscordUser] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const recaptchaContainerRef = useRef(null);
  const recaptchaWidgetId = useRef(null);

  const siteKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  // Determine active Discord ID from logged in user or query params
  const activeDiscordId =
    user?.discordId || user?.discord_id || paramUserId || null;

  // 1. Fetch initial status & start session if needed
  useEffect(() => {
    async function initVerification() {
      setLoading(true);
      setErrorMsg('');

      try {
        // Fetch current verification status
        const statusRes = await api.discord.getStatus(activeDiscordId, sessionToken).catch(() => null);
        if (statusRes?.success) {
          setStatusData(statusRes);
          if (statusRes.verified) {
            setVerificationResult({
              success: true,
              alreadyVerified: true,
              roleName: 'Verified',
              verifiedAt: statusRes.verifiedAt,
            });
            setLoading(false);
            return;
          }
        }

        // If no session token provided in URL, request a fresh session
        if (!sessionToken) {
          const startRes = await api.discord.startVerification(activeDiscordId).catch(() => null);
          if (startRes?.success && startRes.sessionToken) {
            setSessionToken(startRes.sessionToken);
          }
        }

        // Set user display info
        if (user && (user.discordId || user.discord_id || user.provider === 'discord')) {
          setDiscordUser({
            id: user.discordId || user.discord_id,
            username: user.username,
            displayName: user.displayName || user.display_name || user.username,
            avatarUrl:
              user.avatarUrl ||
              user.avatar_url ||
              'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200',
          });
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load verification status');
      } finally {
        setLoading(false);
      }
    }

    initVerification();
  }, [activeDiscordId, user]);

  // 2. Load Google reCAPTCHA v2 Script
  useEffect(() => {
    if (verificationResult?.success) return;

    const scriptId = 'google-recaptcha-v2-script';
    let script = document.getElementById(scriptId);

    const renderWidget = () => {
      if (window.grecaptcha && recaptchaContainerRef.current) {
        try {
          if (recaptchaWidgetId.current !== null) {
            window.grecaptcha.reset(recaptchaWidgetId.current);
          } else {
            recaptchaWidgetId.current = window.grecaptcha.render(recaptchaContainerRef.current, {
              sitekey: siteKey,
              theme: 'dark',
              callback: (token) => {
                setRecaptchaToken(token);
                setErrorMsg('');
              },
              'expired-callback': () => {
                setRecaptchaToken('');
                setErrorMsg('CAPTCHA expired. Please check the box again.');
              },
              'error-callback': () => {
                setErrorMsg('Failed to connect to Google reCAPTCHA. Please check your connection.');
              },
            });
          }
          setRecaptchaLoaded(true);
        } catch (e) {
          console.warn('reCAPTCHA render notice:', e.message);
        }
      }
    };

    if (!script) {
      window.onRecaptchaLoaded = () => {
        renderWidget();
      };

      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.grecaptcha && window.grecaptcha.render) {
      renderWidget();
    }
  }, [siteKey, loading, verificationResult]);

  // 3. Handle Verify Submission
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!activeDiscordId) {
      setErrorMsg('Please log in with Discord first to identify your account.');
      return;
    }

    if (!recaptchaToken) {
      setErrorMsg('Please complete the "I\'m not a robot" reCAPTCHA challenge.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.discord.completeVerification({
        sessionToken,
        recaptchaToken,
        discordUserId: activeDiscordId,
      });

      if (res.success && res.roleAdded) {
        setVerificationResult({
          success: true,
          captchaPassed: true,
          accountVerified: true,
          roleAdded: true,
          accessGranted: true,
          roleName: res.roleName || 'Verified',
          verifiedAt: res.verifiedAt,
        });
      } else {
        setErrorMsg(res.error || 'Verification could not be completed.');
        if (window.grecaptcha && recaptchaWidgetId.current !== null) {
          window.grecaptcha.reset(recaptchaWidgetId.current);
          setRecaptchaToken('');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during verification.');
      if (window.grecaptcha && recaptchaWidgetId.current !== null) {
        window.grecaptcha.reset(recaptchaWidgetId.current);
        setRecaptchaToken('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070714] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Discord Purple Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#5865F2]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-900/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Verification Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[500px] rounded-3xl bg-[#0e0e22]/90 border border-[#5865F2]/25 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6"
      >
        {/* Header & Official Discord Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/40 shadow-inner p-3 mx-auto">
            <svg className="w-full h-full fill-[#5865F2]" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Verify Your Discord Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Complete the CAPTCHA to verify your Discord account and unlock access to our Discord server.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#5865F2] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Connecting to Discord verification gateway...</p>
          </div>
        ) : verificationResult?.success ? (
          /* SUCCESS STATE — Displays exact checklist specified */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-[#09152a] border border-emerald-500/30 space-y-5 shadow-inner"
          >
            <div className="text-center space-y-1 pb-3 border-b border-white/5">
              <span className="inline-flex p-2.5 rounded-full bg-emerald-500/15 text-emerald-400 mb-1">
                <CheckCircle2 className="w-8 h-8" />
              </span>
              <h2 className="text-lg font-black text-white">Verification Completed</h2>
              <p className="text-xs text-slate-400">
                You now have full member privileges on our Discord server.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Verification Successful</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>CAPTCHA Passed</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Discord Account Verified</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Verified Role Added ({verificationResult.roleName || 'Verified'})</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Access Granted</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://discord.com/app"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#5865F2]/25 transition-all"
              >
                <span>Open Discord Server</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                to="/dashboard"
                className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs text-center transition-all"
              >
                Return to Store Dashboard
              </Link>
            </div>
          </motion.div>
        ) : (
          /* VERIFICATION FORM */
          <form onSubmit={handleVerifySubmit} className="space-y-5">
            {/* Authenticated Discord User Badge */}
            {discordUser ? (
              <div className="p-3.5 rounded-2xl bg-[#13132e] border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={discordUser.avatarUrl}
                    alt={discordUser.displayName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#5865F2] shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs sm:text-sm truncate">
                        {discordUser.displayName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-[#5865F2]/20 text-[#5865F2] text-[9px] font-black border border-[#5865F2]/30 shrink-0">
                        Discord
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono truncate block">
                      ID: {discordUser.id}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 shrink-0">
                  Ready to Verify
                </span>
              </div>
            ) : (
              /* User Not Logged In With Discord Notice */
              <div className="p-4 rounded-2xl bg-[#191938] border border-[#5865F2]/30 space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#5865F2] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Step 1: Authenticate with Discord</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Please log in with your Discord account so we can identify you and assign the Verified role.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loginWithDiscord}
                  className="w-full py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span>Continue with Discord</span>
                </button>
              </div>
            )}

            {/* Google reCAPTCHA v2 Container */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                Security Check:
              </label>
              <div className="flex justify-center p-2 rounded-2xl bg-[#090918] border border-white/5 overflow-x-auto min-h-[78px]">
                <div ref={recaptchaContainerRef} id="recaptcha-widget" />
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {/* Large Blue "Verify Account" Button */}
            <button
              type="submit"
              disabled={submitting || !activeDiscordId}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wide text-white transition-all shadow-xl flex items-center justify-center gap-2 ${
                submitting || !activeDiscordId
                  ? 'bg-blue-600/50 cursor-not-allowed opacity-75'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 active:scale-[0.99]'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying with Discord & Bot...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Account</span>
                </>
              )}
            </button>

            {/* Footer Notice */}
            <p className="text-[10px] text-center text-slate-400 leading-normal">
              Protected by Google reCAPTCHA. Privacy Policy and Terms of Service apply.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
