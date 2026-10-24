# 🎃 NIGHTMARE STORE — Modern Cyberpunk / Halloween E-Commerce Web App

Next-generation frontend web application for **NIGHTMARE STORE**, offering digital game licenses, FiveM accounts, gift cards, and automated key fulfillment. Built with React 18, Vite, Tailwind CSS, Framer Motion, and Lucide Icons.

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8.svg)](https://tailwindcss.com/)
[![Backend API](https://img.shields.io/badge/Backend-Render%20Live-46e3b7.svg)](https://nightmare-store-backend.onrender.com)

---

## ✨ Features

- **🛍️ Storefront & Interactive Catalog**:
  - Category pill filtering (`FiveM Ready`, `Grand Theft Auto V`, `Discord Services`, `Game Keys`, `Software`).
  - Search engine, stock status badges (`In Stock`, `Low Stock`, `Out of Stock`), and instant product modals.
  - Interactive product details page with system requirements, activation instructions, and verified reviews.
- **🛒 Shopping Cart & Checkout Experience**:
  - High-performance slide-over cart drawer and dedicated cart page.
  - Automatic balance deductions, promo coupon voucher redemption, and ABA KHQR automated payments.
  - Confetti celebration and instant digital license key reveal.
- **🔑 Purchase History & Digital Key Vault**:
  - Full order receipts with product images, order dates, and payment methods.
  - In-line license code reveal/hide with one-click clipboard copying.
  - Support for multi-field credentials (Username & Password) for digital accounts.
- **🎨 Premium Visual Aesthetics**:
  - Cyberpunk & Halloween dark-mode theme with glassmorphism, animated glow effects, and responsive navigation.
  - Animated particle background with ambient canvas particle system.
- **🛡️ Multi-Provider Authentication**:
  - Traditional email/password authentication.
  - Google OAuth2 and Discord OAuth2 integration.
  - Protected administrative dashboard suite.

---

## 🚀 Live Backend Integration

This frontend connects to the production backend hosted on Render:
- **API Base URL**: `https://nightmare-store-backend.onrender.com/api`
- **Health Check**: `https://nightmare-store-backend.onrender.com/health`

---

## 🛠️ Quick Start

### 1. Installation
```bash
git clone https://github.com/Dara13144/NIGHTMARE-STORE-FRONTEND.git
cd NIGHTMARE-STORE-FRONTEND
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
The optimized static build will be placed in the `dist/` directory, ready to deploy to Vercel, Netlify, Cloudflare Pages, or Render.

---

## 📁 Project Structure

```
client/
├── public/                 # Static assets, logos, and banners
├── src/
│   ├── components/         # Reusable UI components (Navbar, Footer, CartDrawer, etc.)
│   ├── constants/          # Static catalogs, admin routes, and configuration
│   ├── context/            # React context providers (AuthContext, CartContext, ToastContext)
│   ├── pages/              # Page views (Home, Store, ProductDetails, Checkout, Dashboard, Keys, Orders, etc.)
│   │   └── admin/          # Protected Administrative Suite
│   ├── services/           # Backend API client and universal request helpers
│   ├── App.jsx             # Route definitions and application layout
│   ├── main.jsx            # React root entrypoint
│   └── index.css           # Global typography, Tailwind utilities, and animations
├── package.json
└── vite.config.js
```

---

## 📄 License
This project is licensed under the MIT License.
