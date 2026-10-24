import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { useToast } from './ToastContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Wallet & Dashboard Stats
  const [walletBalance, setWalletBalance] = useState(() => {
    const token = getAuthToken();
    if (!token) return 0.00;
    const saved = localStorage.getItem('sbay_wallet_balance');
    return saved !== null ? parseFloat(saved) : 0.00;
  });
  const [totalDeposited, setTotalDeposited] = useState(() => {
    const saved = localStorage.getItem('sbay_total_deposited');
    return saved !== null ? parseFloat(saved) : 0.00;
  });
  const [totalSpent, setTotalSpent] = useState(() => {
    const saved = localStorage.getItem('sbay_total_spent');
    return saved !== null ? parseFloat(saved) : 0.00;
  });
  const [topUpHistory, setTopUpHistory] = useState(() => {
    const saved = localStorage.getItem('sbay_topup_history');
    return saved ? JSON.parse(saved) : [];
  });

  const depositFunds = (amount, method = 'ABA KHQR', notify = true) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;

    const currentSaved = parseFloat(localStorage.getItem('sbay_wallet_balance') || walletBalance.toString());
    const newBalance = parseFloat((currentSaved + numAmount).toFixed(2));
    const newDeposited = parseFloat((totalDeposited + numAmount).toFixed(2));
    const transaction = {
      id: 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      amount: numAmount,
      method,
      status: 'Completed',
    };
    const updatedHistory = [transaction, ...topUpHistory];

    setWalletBalance(newBalance);
    setTotalDeposited(newDeposited);
    setTopUpHistory(updatedHistory);

    localStorage.setItem('sbay_wallet_balance', newBalance.toString());
    localStorage.setItem('sbay_total_deposited', newDeposited.toString());
    localStorage.setItem('sbay_topup_history', JSON.stringify(updatedHistory));

    window.dispatchEvent(
      new CustomEvent('wallet-balance-updated', {
        detail: { balance: newBalance, history: updatedHistory },
      })
    );

    if (notify) {
      showToast(`Successfully added $${numAmount.toFixed(2)} to your wallet balance!`, 'success');
    }
    return newBalance;
  };

  const refreshWallet = async () => {
    try {
      const res = await api.cutluy.getWallet();
      if (res && res.success && typeof res.walletBalance === 'number') {
        const serverBal = parseFloat(res.walletBalance.toFixed(2));
        setWalletBalance(serverBal);
        localStorage.setItem('sbay_wallet_balance', serverBal.toString());
        if (res.topUpHistory && Array.isArray(res.topUpHistory)) {
          setTopUpHistory(res.topUpHistory);
          localStorage.setItem('sbay_topup_history', JSON.stringify(res.topUpHistory));
        }
        return serverBal;
      }
    } catch (err) {
      console.warn('Failed to refresh wallet:', err.message);
    }
    return walletBalance;
  };

  const spendFunds = (amount, explicitNewBalance = null) => {
    const numAmount = parseFloat(amount);
    let newBalance = explicitNewBalance !== null && explicitNewBalance !== undefined && typeof explicitNewBalance === 'number'
      ? parseFloat(explicitNewBalance.toFixed(2))
      : parseFloat((walletBalance - numAmount).toFixed(2));

    if (newBalance < 0) newBalance = 0;
    const newSpent = parseFloat(((totalSpent || 0) + numAmount).toFixed(2));

    setWalletBalance(newBalance);
    setTotalSpent(newSpent);

    localStorage.setItem('sbay_wallet_balance', newBalance.toString());
    localStorage.setItem('sbay_total_spent', newSpent.toString());

    window.dispatchEvent(
      new CustomEvent('wallet-balance-updated', {
        detail: { balance: newBalance, spent: newSpent },
      })
    );

    setTimeout(() => {
      refreshWallet().catch(() => {});
    }, 400);

    return true;
  };

  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        if (typeof res.user.walletBalance === 'number') {
          setWalletBalance(res.user.walletBalance);
          localStorage.setItem('sbay_wallet_balance', res.user.walletBalance.toString());
        }
      } else {
        setAuthToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to fetch auth profile:', err.message);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleWalletSync = (e) => {
      if (e.detail && typeof e.detail.balance === 'number') {
        setWalletBalance(e.detail.balance);
        if (e.detail.history && Array.isArray(e.detail.history)) {
          setTopUpHistory(e.detail.history);
        }
      }
    };

    window.addEventListener('wallet-balance-updated', handleWalletSync);
    window.addEventListener('storage', (e) => {
      if (e.key === 'sbay_wallet_balance' && e.newValue) {
        setWalletBalance(parseFloat(e.newValue));
      }
    });

    return () => {
      window.removeEventListener('wallet-balance-updated', handleWalletSync);
    };
  }, []);

  const loginWithDiscord = async (simulate = false) => {
    if (simulate) {
      return devLogin('discord');
    }
    try {
      const origin = window.location.origin.includes('nightmarestore.site')
        ? 'https://www.nightmarestore.site'
        : window.location.origin;
      const redirectUri = `${origin}/auth/discord/callback`;
      // Try to get auth url from backend
      const res = await api.getDiscordAuthUrl(redirectUri).catch(() => null);

      if (res && res.success && res.url) {
        window.location.href = res.url;
      } else {
        // Direct Discord OAuth authorization endpoint
        const clientId = '1562068415655714836';
        const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=identify%20email`;
        window.location.href = discordAuthUrl;
      }
    } catch (err) {
      showToast(err.message || 'Failed to initiate Discord OAuth', 'error');
    }
  };

  const loginWithGoogle = async (googleData = null, simulate = false) => {
    if (simulate) {
      return devLogin('google');
    }
    try {
      setLoading(true);

      // If simulated / quick profile payload passed
      if (googleData) {
        const res = await api.loginWithGoogle(googleData);
        if (res.success && res.token) {
          setAuthToken(res.token);
          setUser(res.user);
          showToast(`Welcome! Signed in with Google as ${res.user.displayName}`, 'success');
          return res.user;
        }
      }

      const origin = window.location.origin.includes('nightmarestore.site')
        ? 'https://www.nightmarestore.site'
        : window.location.origin;
      const redirectUri = `${origin}/auth/google/callback`;

      // 1. Fetch official Google OAuth URL from Backend API
      const backendRes = await api.getGoogleAuthUrl(redirectUri).catch(() => null);
      if (backendRes && backendRes.success && backendRes.url) {
        window.location.href = backendRes.url;
        return;
      }

      // 2. Direct Google OAuth 2.0 authorization endpoint fallback
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '759883518446-0pb9q8212u2k6rq7v8v2hgk3a8ipg7pd.apps.googleusercontent.com';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=consent`;
      window.location.href = googleAuthUrl;
    } catch (err) {
      showToast(err.message || 'Google sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const devLogin = async (role = 'customer') => {
    try {
      setLoading(true);
      const res = await api.devLogin(role);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        const roleLabel =
          role === 'admin'
            ? 'Administrator'
            : role === 'discord'
            ? 'Discord User'
            : role === 'google'
            ? 'Google User'
            : 'Customer';
        showToast(`Logged in as ${roleLabel} (${res.user.displayName || res.user.username})`, 'success');
        return res.user;
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password, isAdminLogin = false) => {
    try {
      setLoading(true);
      const res = await api.login(email, password, isAdminLogin);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        const bal = typeof res.user.walletBalance === 'number' ? res.user.walletBalance : 0.00;
        setWalletBalance(bal);
        localStorage.setItem('sbay_wallet_balance', bal.toString());
        showToast(`Welcome back, ${res.user.displayName || res.user.username}!`, 'success');
        refreshWallet();
        return res.user;
      }
      throw new Error(res.error || 'Failed to sign in');
    } catch (err) {
      showToast(err.message || 'Invalid email or password', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (username, email, password) => {
    try {
      setLoading(true);
      const res = await api.register(username, email, password);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        const bal = typeof res.user.walletBalance === 'number' ? res.user.walletBalance : 0.00;
        setWalletBalance(bal);
        localStorage.setItem('sbay_wallet_balance', bal.toString());
        showToast('Account created successfully! Welcome to NightmareStore.', 'success');
        refreshWallet();
        return res.user;
      }
      throw new Error(res.error || 'Registration failed');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    setAuthToken(null);
    setUser(null);
    setWalletBalance(0.00);
    localStorage.removeItem('sbay_wallet_balance');
    localStorage.removeItem('sbay_total_deposited');
    localStorage.removeItem('sbay_total_spent');
    localStorage.removeItem('sbay_topup_history');
    showToast('Logged out successfully', 'info');
  };

  const value = {
    user,
    role: user?.role || 'guest',
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    loading,
    walletBalance,
    totalDeposited,
    totalSpent,
    topUpHistory,
    depositFunds,
    spendFunds,
    refreshWallet,
    loginWithDiscord,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    devLogin,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
