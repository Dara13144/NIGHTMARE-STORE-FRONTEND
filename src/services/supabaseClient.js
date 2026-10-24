import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Initiates Discord OAuth login
 * Automatically falls back to simulated OAuth when cloud keys are not configured yet
 */
export async function loginWithDiscord() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'identify email',
      },
    });
    if (error) throw error;
    return data;
  } else {
    // Development / evaluation fallback: redirect to callback with test code
    window.location.href = `/auth/callback?code=mock_discord_auth_code&state=dev_state`;
  }
}

/**
 * Initiates Google OAuth login via Supabase
 */
export async function loginWithGoogle() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=google`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
    return data;
  } else {
    // Development fallback
    window.location.href = `/auth/callback?provider=google&code=mock_google_auth_code&state=dev_state`;
  }
}

