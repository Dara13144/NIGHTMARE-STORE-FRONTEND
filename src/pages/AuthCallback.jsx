import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Gamepad2, AlertCircle } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function processOAuthCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error') || searchParams.get('error_description');
      const provider = searchParams.get('provider');

      if (error) {
        setErrorMsg(`Authorization was cancelled or rejected: ${error}`);
        return;
      }

      const currentRedirectUri = `${window.location.origin}${window.location.pathname}`;
      const isGoogleCallback = window.location.pathname.includes('/auth/google/callback') || provider === 'google' || (code && code.startsWith('4/'));
      const isDiscordCallback = window.location.pathname.includes('/auth/discord/callback') || provider === 'discord' || (!isGoogleCallback && Boolean(code));

      // 1. Process Code directly: Google OAuth & Discord OAuth via Backend API
      if (code && (isGoogleCallback || isDiscordCallback)) {
        try {
          const redirectUri = currentRedirectUri;

          if (isGoogleCallback) {
            const res = await api.googleCallback(code, state, redirectUri);
            if (res.success && res.token) {
              setAuthToken(res.token);
              await refreshUser();
              if (res.linked) {
                showToast('Google account connected successfully to your store profile!', 'success');
              } else {
                showToast(`Welcome back, ${res.user.displayName || res.user.username}!`, 'success');
              }
              navigate('/dashboard', { replace: true });
              return;
            } else {
              setErrorMsg(res.error || 'Failed to complete Google login');
              return;
            }
          }

          if (isDiscordCallback) {
            const res = await api.discordCallback(code, state, redirectUri);
            if (res.success && res.token) {
              setAuthToken(res.token);
              await refreshUser();
              if (res.linked) {
                showToast('Discord account connected successfully to your store profile!', 'success');
              } else {
                showToast(`Welcome back, ${res.user.displayName || res.user.username}!`, 'success');
              }
              navigate('/dashboard', { replace: true });
              return;
            } else {
              setErrorMsg(res.error || 'Failed to complete Discord login');
              return;
            }
          }
        } catch (err) {
          setErrorMsg(err.message || 'Error processing authentication callback');
          return;
        }
      }

      // 2. Check hash parameters (for implicit fragment OAuth)
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        if (accessToken) {
          setAuthToken(accessToken);
          await refreshUser();
          showToast('Signed in successfully!', 'success');
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      // 3. Fallback Supabase session verification
      if (isSupabaseConfigured && supabase) {
        try {
          if (code) {
            await supabase.auth.exchangeCodeForSession(code).catch(() => null);
          }
          const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: {} }));
          if (session?.user) {
            const sUser = session.user;
            const email = sUser.email;
            const name = sUser.user_metadata?.full_name || sUser.user_metadata?.name || email?.split('@')[0];
            const avatar = sUser.user_metadata?.avatar_url || sUser.user_metadata?.picture;
            const google_id = sUser.id || sUser.user_metadata?.sub;

            const res = await api.loginWithGoogle({ email, name, avatar, google_id });
            if (res.success && res.token) {
              setAuthToken(res.token);
              await refreshUser();
              showToast(`Welcome back, ${res.user.displayName || name}!`, 'success');
              navigate('/dashboard', { replace: true });
              return;
            }
          }
        } catch (sErr) {
          console.warn('[Supabase Session Check]:', sErr.message);
        }
      }

      if (!code) {
        setErrorMsg('Authorization code was not found in callback');
        return;
      }

      // 4. Generic callback
      try {
        const redirectUri = `${window.location.origin}/auth/callback${provider ? `?provider=${provider}` : ''}`;
        if (isGoogleCallback) {
          // Google OAuth flow
          const res = await api.googleCallback(code, state, redirectUri);
          if (res.success && res.token) {
            setAuthToken(res.token);
            await refreshUser();
            if (res.linked) {
              showToast('Google account connected successfully to your store profile!', 'success');
            } else {
              showToast(`Welcome back, ${res.user.displayName || res.user.username}!`, 'success');
            }
            navigate('/dashboard', { replace: true });
            return;
          } else {
            setErrorMsg(res.error || 'Failed to complete Google login');
            return;
          }
        }

        // Discord OAuth flow
        const res = await api.discordCallback(code, state, redirectUri);
        if (res.success && res.token) {
          setAuthToken(res.token);
          await refreshUser();
          if (res.linked) {
            showToast('Discord account connected successfully to your store profile!', 'success');
          } else {
            showToast(`Welcome back, ${res.user.displayName || res.user.username}!`, 'success');
          }
          navigate('/dashboard', { replace: true });
        } else {
          setErrorMsg(res.error || 'Failed to complete Discord login');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Error processing authentication callback');
      }
    }

    processOAuthCallback();
  }, [searchParams, navigate, refreshUser, showToast]);

  return (
    <div className="max-w-md mx-auto px-4 py-28 text-center space-y-6">
      {errorMsg ? (
        <div className="glass-card p-8 rounded-3xl border border-rose-500/30 bg-[#111629] space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Authentication Failed</h2>
          <p className="text-xs text-rose-300 leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Completing Secure Authorization...</h2>
          <p className="text-xs text-slate-400">Verifying session tokens and linking profile attributes.</p>
        </div>
      )}
    </div>
  );
}
