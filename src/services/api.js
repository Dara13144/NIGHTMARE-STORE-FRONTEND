/**
 * Global Backend & API URL configuration
 * - Supports VITE_BACKEND_URL or VITE_API_URL from environment
 * - Defaults to same-origin '/api' in browser so requests seamlessly flow through Vite dev proxy
 * - Exports BACKEND_URL for full backend root resolution (e.g. assets, Discord links, webhooks)
 */
export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  'https://nightmare-store-backend.onrender.com'
).replace(/\/+$/, '');

export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  `${BACKEND_URL}/api`
).replace(/\/+$/, '');

/**
 * Universal asset/upload URL resolver
 * Converts relative /uploads/... paths to full backend URLs when backend is external
 */
export function getAssetUrl(path) {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/uploads') && BACKEND_URL) {
    return `${BACKEND_URL}${path}`;
  }
  return path;
}

/**
 * Get or create unique guest session token for cart persistence
 */
export function getCartSessionToken() {
  let token = localStorage.getItem('dara_cart_session');
  if (!token) {
    token = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('dara_cart_session', token);
  }
  return token;
}

export function getAuthToken() {
  return localStorage.getItem('dara_auth_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('dara_auth_token', token);
  } else {
    localStorage.removeItem('dara_auth_token');
  }
}

/**
 * Universal API fetch helper
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
  const authToken = getAuthToken();
  const cartSession = getCartSessionToken();

  const reqHeaders = {
    'Content-Type': 'application/json',
    'x-cart-session': cartSession,
    ...headers,
  };

  if (authToken) {
    reqHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers: reqHeaders,
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const requestUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE}${cleanEndpoint}`;

  let res;
  let data;

  try {
    res = await fetch(requestUrl, options);
    data = await res.json().catch(() => ({}));

    // If remote returned 429 while deploying, failover to local backend
    if (res.status === 429 && requestUrl.includes('onrender.com')) {
      const localUrl = requestUrl.replace('https://nightmare-store-backend.onrender.com', 'http://localhost:5050');
      try {
        const localRes = await fetch(localUrl, options);
        if (localRes.ok) {
          return await localRes.json();
        }
      } catch {
        // use original response
      }
    }
  } catch (netErr) {
    if (requestUrl.includes('onrender.com')) {
      const localUrl = requestUrl.replace('https://nightmare-store-backend.onrender.com', 'http://localhost:5050');
      try {
        const localRes = await fetch(localUrl, options);
        if (localRes.ok) {
          return await localRes.json();
        }
      } catch {
        // continue to throw
      }
    }
    throw netErr;
  }

  if (!res.ok) {
    const errorMsg = data.error || (data.details ? data.details.map((d) => d.message).join(', ') : 'Network request failed');
    const err = new Error(errorMsg);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  return data;
}

// ============================================================================
// Typed Service Endpoints
// ============================================================================

export const api = {
  // Auth
  getMe: () => apiRequest('/auth/me'),
  login: (email, password, isAdminLogin = false) => apiRequest('/auth/login', { method: 'POST', body: { email, password, isAdminLogin } }),
  register: (username, email, password) => apiRequest('/auth/register', { method: 'POST', body: { username, email, password } }),
  getDiscordAuthUrl: (redirectUri) => apiRequest(`/auth/discord/url${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ''}`),
  devLogin: (role) => apiRequest('/auth/dev-login', { method: 'POST', body: { role } }),
  discordCallback: (code, state, redirectUri) => apiRequest('/auth/discord/callback', { method: 'POST', body: { code, state, redirect_uri: redirectUri } }),
  getGoogleAuthUrl: (redirectUri) => apiRequest(`/auth/google/url${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ''}`),
  googleCallback: (code, state, redirectUri) => apiRequest('/auth/google/callback', { method: 'POST', body: { code, state, redirect_uri: redirectUri } }),
  loginWithGoogle: (payload = {}) => apiRequest('/auth/google/login', { method: 'POST', body: payload }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getLinkedAccounts: () => apiRequest('/account/linked'),
  unlinkAccount: (provider) => apiRequest('/account/unlink', { method: 'POST', body: { provider } }),

  // Products & Store
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiRequest(`/products?${query.toString()}`);
  },
  getProductBySlug: (slug) => apiRequest(`/products/${slug}`),
  getCategories: () => apiRequest('/categories'),
  search: (q) => apiRequest(`/search?q=${encodeURIComponent(q)}`),
  submitReview: (review) => apiRequest('/reviews', { method: 'POST', body: review }),
  submitSupportTicket: (ticket) => apiRequest('/support/ticket', { method: 'POST', body: ticket }),
  getPromoBanner: () => apiRequest('/promo-banner'),

  // Cart
  getCart: () => apiRequest('/cart'),
  addToCart: (productId, quantity = 1) => apiRequest('/cart/items', { method: 'POST', body: { product_id: productId, quantity } }),
  updateCartQuantity: (itemId, quantity) => apiRequest(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } }),
  removeFromCart: (itemId) => apiRequest(`/cart/items/${itemId}`, { method: 'DELETE' }),

  // Orders & Checkout
  validateCoupon: (code, subtotal) => apiRequest('/orders/validate-coupon', { method: 'POST', body: { code, subtotal } }),
  createOrder: (orderData) => apiRequest('/orders', { method: 'POST', body: orderData }),
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/orders${query ? `?${query}` : ''}`);
  },
  getOrderById: (orderId) => apiRequest(`/orders/${orderId}`),
  getOrderKeys: (orderId) => apiRequest(`/orders/${orderId}/keys`),

  // Payments
  createPaymentSession: (orderId, customerEmail) => apiRequest('/payments/create-session', { method: 'POST', body: { order_id: orderId, customer_email: customerEmail } }),
  confirmTestPayment: (orderId, transactionId) => apiRequest('/payments/confirm-test', { method: 'POST', body: { order_id: orderId, transaction_id: transactionId } }),

  // CutLuy KHQR Auto Payments & Wallet Balance
  cutluy: {
    createPayment: (data) => apiRequest('/payments/cutluy/create', { method: 'POST', body: data }),
    checkStatus: (paymentId) => apiRequest(`/payments/cutluy/status/${paymentId}`),
    simulatePayment: (paymentId) => apiRequest(`/payments/cutluy/simulate/${paymentId}`, { method: 'POST' }),
    topUpWallet: (amount) => apiRequest('/payments/cutluy/topup', { method: 'POST', body: { amount } }),
    getWallet: () => apiRequest('/payments/wallet'),
  },

  // Admin 2FA Authentication
  adminAuth: {
    login: (email, password) => apiRequest('/admin/auth/login', { method: 'POST', body: { email, password } }),
    verifyOtp: (challengeId, email, otp) => apiRequest('/admin/auth/verify-otp', { method: 'POST', body: { challengeId, email, otp } }),
    resendOtp: (challengeId) => apiRequest('/admin/auth/resend-otp', { method: 'POST', body: { challengeId } }),
    getMe: () => apiRequest('/admin/auth/me'),
    logout: () => apiRequest('/admin/auth/logout', { method: 'POST' }),
  },

  // Admin
  admin: {
    getDashboard: (range = '7d') => apiRequest(`/admin/dashboard?range=${range}`),
    search: (query) => apiRequest(`/admin/search?q=${encodeURIComponent(query)}`),
    getNotifications: () => apiRequest('/admin/notifications'),
    getProducts: () => apiRequest('/admin/products'),
    createProduct: (product) => apiRequest('/admin/products', { method: 'POST', body: product }),
    duplicateProduct: (id) => apiRequest(`/admin/products/${id}/duplicate`, { method: 'POST' }),
    updateProduct: (id, product) => apiRequest(`/admin/products/${id}`, { method: 'PATCH', body: product }),
    deleteProduct: (id, permanent = false) => apiRequest(`/admin/products/${id}?permanent=${permanent}`, { method: 'DELETE' }),
    uploadImage: (imageData) => apiRequest('/admin/upload-image', { method: 'POST', body: imageData }),
    getInventory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/inventory${query ? `?${query}` : ''}`);
    },
    importInventory: (data) => apiRequest('/admin/inventory/import', { method: 'POST', body: data }),
    getOrders: () => apiRequest('/admin/orders'),
    updateOrderStatus: (id, status) => apiRequest(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
    deleteOrder: (id) => apiRequest(`/admin/orders/${id}`, { method: 'DELETE' }),
    clearAllOrders: () => apiRequest('/admin/orders/clear-all', { method: 'POST' }),
    getCoupons: () => apiRequest('/admin/coupons'),
    createCoupon: (coupon) => apiRequest('/admin/coupons', { method: 'POST', body: coupon }),
    deleteCoupon: (id) => apiRequest(`/admin/coupons/${id}`, { method: 'DELETE' }),
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
    },
    updateUserRole: (id, role) => apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
    updateUserStatus: (id, status) => apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: { status } }),
    getAuditLogs: () => apiRequest('/admin/audit-logs'),
    getSettings: () => apiRequest('/admin/settings'),
    updateSettings: (settings) => apiRequest('/admin/settings', { method: 'PATCH', body: settings }),
    getDiscordVerifications: () => apiRequest('/discord/admin/verifications'),
    postDiscordPanel: (panelData) => apiRequest('/discord/admin/panel', { method: 'POST', body: panelData }),

    // Stock Management
    getStockOverview: () => apiRequest('/admin/stock/overview'),
    getStockProducts: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/stock/products${query ? `?${query}` : ''}`);
    },
    getProductStock: (id) => apiRequest(`/admin/stock/products/${id}`),
    addProductStock: (id, payload) => apiRequest(`/admin/stock/products/${id}/add`, { method: 'POST', body: payload }),
    adjustProductStock: (id, payload) => apiRequest(`/admin/stock/products/${id}/adjust`, { method: 'POST', body: payload }),
    getProductStockHistory: (id) => apiRequest(`/admin/stock/products/${id}/history`),
    importStockCsv: (payload) => apiRequest('/admin/stock/import', { method: 'POST', body: payload }),
    restockAllProducts: (payload) => apiRequest('/admin/stock/restock-all', { method: 'POST', body: payload }),
    clearAllStock: () => apiRequest('/admin/stock/clear-all', { method: 'POST' }),
    getStockAlerts: () => apiRequest('/admin/stock/alerts'),
  },

  getProductAvailability: (id) => apiRequest(`/products/${id}/availability`),

  // Discord Verification System
  discord: {
    getStatus: (discordUserId, sessionToken) => {
      const q = new URLSearchParams();
      if (discordUserId) q.append('discord_user_id', discordUserId);
      if (sessionToken) q.append('session_token', sessionToken);
      return apiRequest(`/discord/verification/status${q.toString() ? `?${q.toString()}` : ''}`);
    },
    startVerification: (discordUserId) =>
      apiRequest('/discord/verification/start', { method: 'POST', body: { discord_user_id: discordUserId } }),
    completeVerification: (payload) =>
      apiRequest('/discord/verification/complete', { method: 'POST', body: payload }),
  },
};
