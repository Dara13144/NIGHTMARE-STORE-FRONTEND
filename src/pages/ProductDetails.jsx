import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Zap,
  Check,
  ChevronRight,
  ShieldCheck,
  Package,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

// Comprehensive catalog data supporting single and group/variant products
const SEED_CATALOG = {
  // 1. Gemini Pro 18-Month Gift Link (Exact Match to Screenshot 1)
  'gemini-pro-18month': {
    id: 'prod-gemini-18m',
    name: 'gemini pro 18month',
    category: 'GIFTLINK',
    price: 3.00,
    stock: 0,
    isOutOfStock: true,
    image: '/card-gemini.png',
    glow: 'rgba(6, 182, 212, 0.45)',
    subtitle: 'Gemini Pro+ 18Month',
    defaultLang: 'kh',
    format: 'Direct Activation Gift Link',
    formatNote: 'Instantly add to your existing or newly created Google accounts',
    guide: [
      'Open the provided Gift Link in your web browser',
      'Log in to your target Google (Gmail) account',
      'Click "Redeem / Accept" to activate the 18-month plan',
      'Open Gemini app and enjoy full Pro & Advanced features immediately',
    ],
    features: [
      { icon: '🧾', title: '100% Authentic & Legal', desc: 'genuine activation link, ultra-safe with zero risk of sudden termination' },
      { icon: '🔐', title: 'Direct Personal Account Upgrade', desc: 'activates directly on your personal Google (Gmail) account' },
      { icon: '🌍', title: 'Worldwide Accessible', desc: 'works in Cambodia and globally with no region lock (No Region Lock)' },
      { icon: '⚡', title: 'Instant Automated Delivery', desc: 'link delivered automatically right after payment' },
      { icon: '🛡️', title: 'Effortless & Powerful', desc: 'instant Gemini Pro/Advanced access + 2TB Google One cloud storage in seconds' },
    ],
    included: [
      { icon: '⚡', text: 'Instant automated delivery' },
      { icon: '🛡️', text: '100% fresh, authentic and unused 18-Month Gift Link' },
      { icon: '🔄', text: 'Full replacement warranty on initial activation' },
    ],
    khmer: {
      title: '✨ Gemini Pro 18-Month Gift Link (ដំឡើងលើគណនីផ្ទាល់ខ្លួន)',
      format: 'លីងសម្រាប់បើកដំណើរការផ្ទាល់ (Direct Activation Gift Link)',
      formatNote: 'អាចដាក់ចូលក្នុងគណនី Google ចាស់ ឬថ្មីរបស់អ្នកបានភ្លាមៗ',
      guide: [
        'ចុចបើក Gift Link ដែលបានផ្តល់ជូននៅក្នុង Browser របស់អ្នក',
        'ចូលគណនី (Log in) Google របស់អ្នកដែលចង់ធ្វើការដំឡើង',
        'ចុចពាក្យ Redeem/Accept ដើម្បីបើកដំណើរការគម្រោង 18 ខែ',
        'ចូលទៅកាន់កម្មវិធី Gemini ហើយរីករាយជាមួយមុខងារ Pro ពេញលេញភ្លាមៗ',
      ],
      features: [
        { icon: '🧾', title: 'ថ្មី និងស្របច្បាប់ 100%', desc: 'លីងបើកដំណើរការពិតប្រាកដ សុវត្ថិភាពខ្ពស់ គ្មានហានិភ័យដាច់កណ្តាលទី' },
        { icon: '🔐', title: 'ដំឡើងលើគណនីផ្ទាល់ខ្លួន', desc: 'បើកដំណើរការផ្ទាល់លើគណនី Google (Gmail) របស់អ្នកផ្ទាល់តែម្តង' },
        { icon: '🌍', title: 'ប្រើបានទូទាំងពិភពលោក', desc: 'ប្រើនៅកម្ពុជា និងគ្រប់ប្រទេសបានធម្មតា ដោយគ្មានការបិទតំបន់ (No Region Lock)' },
        { icon: '⚡', title: 'ទទួលបានភ្លាមៗ', desc: 'លីងនឹងត្រូវបានផ្ញើជូនដោយស្វ័យប្រវត្តិភ្លាមៗបន្ទាប់ពីទូទាត់ប្រាក់' },
        { icon: '🛡️', title: 'ងាយស្រួលប្រើប្រាស់', desc: 'ទទួលបានមុខងារ Gemini Pro/Advanced និងទំហំផ្ទុក Google One 2TB ភ្លាមៗក្នុងរយៈពេលប៉ុន្មានវិនាទី' },
      ],
      included: [
        { icon: '⚡', text: 'ការផ្ញើជូនភ្លាមៗដោយស្វ័យប្រវត្តិ' },
        { icon: '🛡️', text: 'លីង Gift Link 18 ខែ ដែលថ្មី ត្រឹមត្រូវ និងមិនទាន់បានប្រើប្រាស់ 100%' },
        { icon: '🔄', text: 'មានការធានាត្រឹមត្រូវ (ប្តូរលីងថ្មីជូនដោយឥតគិតថ្លៃ ប្រសិនបើមានបញ្ហាពេលបើកដំណើរការដំបូង)' },
      ],
    },
  },

  // Aliases for gemini
  'gemini-pro': {
    redirect: 'gemini-pro-18month',
  },
  'prod-gemini-18m': {
    redirect: 'gemini-pro-18month',
  },
  'gemini': {
    redirect: 'gemini-pro-18month',
  },

  // 2. Discord Account Group / Variant (Exact Match to Screenshot 2)
  'discord-account': {
    id: 'prod-discord-group',
    name: 'Discord Account',
    category: 'DISCORD',
    price: 2.00,
    stock: 0,
    isOutOfStock: true,
    image: '/card-discord.png',
    glow: 'rgba(88, 101, 242, 0.45)',
    subtitle: 'Discord Account',
    isGroup: true,
    noDescription: true, // Screenshot 2 shows "No description available for this product."
    variants: [
      { id: 'v1', name: '4 Letters Nick E-Mail + SMS', price: 2.00, inStock: false },
      { id: 'v2', name: 'E-Mail Verified', price: 0.30, inStock: true, stockCount: 15 },
      { id: 'v3', name: 'E-Mail Verified + Phone Verified', price: 0.50, inStock: true, stockCount: 22 },
      { id: 'v4', name: '2023 Accounts', price: 0.50, inStock: true, stockCount: 8 },
      { id: 'v5', name: '3 Month Nitro + 2 Boosts', price: 6.00, inStock: false },
    ],
    format: 'EMAIL:PASSWORD:TOKEN',
    formatNote: 'Full email access and recovery credentials provided',
    guide: [
      'Receive your credentials upon order completion',
      'Go to discord.com/login and sign in with the provided details',
      'Change password and secure with your 2FA authenticator',
    ],
    features: [
      { icon: '⚡', title: 'Instant Automated Delivery', desc: 'Credentials sent instantly after checkout' },
      { icon: '🛡️', title: 'Verified Security', desc: 'Clean IP creation with verified phone/email' },
      { icon: '🌍', title: 'Global Access', desc: 'No region locks, works worldwide' },
    ],
    included: [
      { icon: '🔑', text: 'Full Discord account credentials' },
      { icon: '⚡', text: 'Instant automated delivery' },
      { icon: '🛡️', text: 'Replacement guarantee on first-time login' },
    ],
    khmer: {
      title: 'គណនី Discord (Discord Account)',
      format: 'EMAIL:PASSWORD:TOKEN',
      formatNote: 'ទទួលបានព័ត៌មានគណនីពេញលេញ និងចូលប្រើប្រាស់បានភ្លាមៗ',
      guide: [
        'ទទួលបានព័ត៌មានគណនីភ្លាមៗបន្ទាប់ពីការទូទាត់ប្រាក់ជោគជ័យ',
        'ចូលទៅកាន់គេហទំព័រ discord.com/login ហើយបញ្ចូល Email និង Password',
        'ប្តូរលេខសម្ងាត់ផ្ទាល់ខ្លួនរបស់អ្នកដើម្បីសុវត្ថិភាព',
      ],
      features: [
        { icon: '⚡', title: 'ទទួលបានភ្លាមៗ', desc: 'ព័ត៌មានគណនីត្រូវបានផ្ញើជូនដោយស្វ័យប្រវត្តិ' },
        { icon: '🛡️', title: 'សុវត្ថិភាពខ្ពស់', desc: 'គណនីបានផ្ទៀងផ្ទាត់ត្រឹមត្រូវ និងស្អាត' },
        { icon: '🌍', title: 'ប្រើបានទូទាំងពិភពលោក', desc: 'គ្មានការបិទតំបន់ ប្រើប្រាស់បានគ្រប់ទីកន្លែង' },
      ],
      included: [
        { icon: '🔑', text: 'ព័ត៌មានគណនី Discord ពេញលេញ (Email និង Password)' },
        { icon: '⚡', text: 'ការផ្ញើជូនស្វ័យប្រវត្តិភ្លាមៗ' },
        { icon: '🛡️', text: 'ការធានាប្តូរជូនថ្មីក្នុងករណីមានបញ្ហាពេលចូលលើកដំបូង' },
      ],
    },
  },

  // Aliases for discord
  'prod-discord-group': {
    redirect: 'discord-account',
  },
  'discord': {
    redirect: 'discord-account',
  },

  // 3. Rockstar Account (Account rockstar)
  'rockstar-account': {
    id: 'prod-fivem-ready',
    name: 'Account rockstar',
    category: 'FIVEM',
    price: 4.50,
    stock: 12,
    isOutOfStock: false,
    image: '/card-rockstar-account.png',
    glow: 'rgba(245, 158, 11, 0.45)',
    subtitle: 'Account rockstar',
    format: 'username:password',
    formatNote: 'Delivered instantly with verified login credentials',
    guide: [
      'Receive your instant account credentials (username:password)',
      'Log in to the Rockstar Games Launcher with the provided credentials',
      'Verify account details and security settings',
      'Launch FiveM and link your fresh Rockstar account',
    ],
    features: [
      { icon: '🎮', title: 'Full Rockstar Account', desc: 'verified and ready for instant play' },
      { icon: '⚡', title: 'Instant Delivery', desc: 'credentials delivered immediately in vault' },
      { icon: '🛡️', title: 'FiveM Ready', desc: 'clean and ready for all roleplay servers' },
      { icon: '🔐', title: 'Private & Secure', desc: '100% full access guaranteed' },
    ],
    included: [
      { icon: '🔑', text: 'Full Rockstar account credentials (user:pass)' },
      { icon: '⚡', text: 'Instant automated delivery to vault' },
      { icon: '🛡️', text: '100% verified and clean account' },
      { icon: '🚫', text: 'Warranty and instant customer support' },
    ],
    khmer: {
      title: 'គណនី Account Rockstar',
      formatNote: 'ទទួលបានព័ត៌មានគណនីចូលភ្លាមៗ (username:password)',
      guide: [
        'ទទួលបានព័ត៌មានគណនីចូលភ្លាមៗ (username:password)',
        'ចូលប្រើប្រាស់កម្មវិធី Rockstar Games Launcher',
        'ផ្ទៀងផ្ទាត់ព័ត៌មានគណនី និងការកំណត់សុវត្ថិភាព',
        'ដំណើរការ FiveM ហើយរីករាយជាមួយការលេងហ្គេម',
      ],
      features: [
        { icon: '🎮', title: 'គណនី Rockstar ពេញលេញ', desc: 'បានផ្ទៀងផ្ទាត់ និងរួចរាល់សម្រាប់ការលេងភ្លាមៗ' },
        { icon: '⚡', title: 'ការដឹកជញ្ជូនរហ័សភ្លាមៗ', desc: 'ទទួលបានព័ត៌មានចូលភ្លាមៗបន្ទាប់ពីទិញ' },
        { icon: '🛡️', title: 'ស័ក្តិសមសម្រាប់ FiveM Ready', desc: 'រួចរាល់សម្រាប់ម៉ាស៊ីនបម្រើ FiveM ទាំងអស់' },
        { icon: '🔐', title: 'ឯកជន និងសុវត្ថិភាព', desc: 'ធានាភាពជាម្ចាស់ 100%' },
      ],
      included: [
        { icon: '🛡️', text: 'គណនី Rockstar ពេញលេញ (user:pass)' },
        { icon: '⚡', text: 'ដឹកជញ្ជូនដោយស្វ័យប្រវត្តិក្នង Key Vault' },
      ],
    },
  },
  'fivem-activation-code': {
    id: 'prod-fivem-ready',
    name: 'Account rockstar',
    category: 'FIVEM',
    price: 4.50,
    stock: 12,
    isOutOfStock: false,
    image: '/card-rockstar-account.png',
    glow: 'rgba(245, 158, 11, 0.45)',
    subtitle: 'Account rockstar',
    format: 'username:password',
    formatNote: 'Delivered instantly with verified login credentials',
    guide: [
      'Receive your instant account credentials (username:password)',
      'Log in to the Rockstar Games Launcher with the provided credentials',
      'Verify account details and security settings',
      'Launch FiveM and link your fresh Rockstar account',
    ],
    features: [
      { icon: '🎮', title: 'Full Rockstar Account', desc: 'verified and ready for instant play' },
      { icon: '⚡', title: 'Instant Delivery', desc: 'credentials delivered immediately in vault' },
      { icon: '🛡️', title: 'FiveM Ready', desc: 'clean and ready for all roleplay servers' },
      { icon: '🔐', title: 'Private & Secure', desc: '100% full access guaranteed' },
    ],
    included: [
      { icon: '🔑', text: 'Full Rockstar account credentials (user:pass)' },
      { icon: '⚡', text: 'Instant automated delivery to vault' },
      { icon: '🛡️', text: '100% verified and clean account' },
    ],
  },

  // 4. 14x 1 Month Server Boosts (Exact Match to Screenshot)
  '14x-1-month-server-boosts': {
    id: 'prod-nitro-boosts',
    name: '14x 1 Month Server Boosts',
    category: 'GIFTLINK',
    price: 7.00,
    stock: 3,
    isOutOfStock: false,
    image: '/card-nitro-boosts-hd.png',
    glow: 'rgba(168, 85, 247, 0.45)',
    subtitle: '14x 1 Month Server Boosts',
    defaultLang: 'us',
    usTitle: '🛡️ 14× 1 Month Server Boosts – Instant Level 3',
    features: [
      { icon: '🚀', title: '14× Server Boosts (1 Month)', desc: 'Instantly upgrade any server to Level 3' },
      { icon: '⚡', title: 'Instant Delivery', desc: 'Boosts delivered right after payment' },
      { icon: '🖥️', title: 'Works on Any Server', desc: 'No restrictions' },
      { icon: '💬', title: 'Support Included', desc: 'Quick help whenever you need it' },
      { icon: '🌟', title: 'One-Time Purchase', desc: 'Full power, no subscription' },
    ],
    standoutTitle: 'Why 14× Server Boosts Stands Out',
    standoutFeatures: [
      { icon: '💡', text: 'Instantly unlocks Level 3 perks on your server' },
      { icon: '🛡️', text: 'Secure and fast delivery' },
      { icon: '🔁', text: 'Compatible with any Discord server' },
      { icon: '🖥️', text: 'Simple setup — no extra steps needed' },
    ],
    khmer: {
      title: '🛡️ 14× 1 Month Server Boosts – ឡើង Level 3 ភ្លាមៗ',
      features: [
        { icon: '🚀', title: '14× Server Boosts (1 ខែ)', desc: 'ដំឡើង Server ណាមួយទៅកាន់ Level 3 ភ្លាមៗ' },
        { icon: '⚡', title: 'ទទួលបានភ្លាមៗ', desc: 'Boosts ត្រូវបានផ្ញើជូនភ្លាមៗបន្ទាប់ពីទូទាត់ប្រាក់' },
        { icon: '🖥️', title: 'ប្រើបានលើគ្រប់ Server', desc: 'គ្មានការកំណត់ ឬលក្ខខណ្ឌស្មុគស្មាញ' },
        { icon: '💬', title: 'មានការគាំទ្រ និងជួយដោះស្រាយ', desc: 'ជំនួយរហ័សនៅពេលណាដែលអ្នកត្រូវការ' },
        { icon: '🌟', title: 'ទិញម្តងចប់', desc: 'ទទួលបានកម្លាំងពេញលេញ មិនមានការកាត់ប្រាក់ប្រចាំខែ (No Subscription)' },
      ],
      standoutTitle: 'ចំណុចលេចធ្លោនៃ 14× Server Boosts',
      standoutFeatures: [
        { icon: '💡', text: 'បើកដំណើរការមុខងារពិសេស Level 3 លើ Server របស់អ្នកភ្លាមៗ' },
        { icon: '🛡️', text: 'ការផ្ញើជូនប្រកបដោយសុវត្ថិភាព និងរហ័សទាន់ចិត្ត' },
        { icon: '🔁', text: 'អាចប្រើបានជាមួយគ្រប់ Discord Server' },
        { icon: '🖥️', text: 'ការដំឡើងងាយស្រួល — មិនចាំបាច់មានជំហានបន្ថែមស្មុគស្មាញឡើយ' },
      ],
    },
  },

  // Aliases for 14x Server Boosts
  '14x-1-month-server-boost': {
    redirect: '14x-1-month-server-boosts',
  },
  'prod-nitro-boosts': {
    redirect: '14x-1-month-server-boosts',
  },
  'nitro-boosts': {
    redirect: '14x-1-month-server-boosts',
  },
  '14x-server-boosts': {
    redirect: '14x-1-month-server-boosts',
  },
  'nitro-discord-3month': {
    redirect: '14x-1-month-server-boosts',
  },

  // 5. Minecraft Java & Bedrock Full Access (Exact Match to Image 1, 2, 3)
  'minecraft-account': {
    id: 'prod-mc-group',
    name: 'Minecraft Account [Full Access]',
    category: 'MINECRAFT',
    price: 7.50,
    stock: 20,
    isOutOfStock: false,
    image: '/card-minecraft-java.png',
    glow: 'rgba(34, 197, 94, 0.45)',
    subtitle: 'Minecraft Java + Bedrock',
    defaultLang: 'us',
    isGroup: true,
    variants: [
      {
        id: 'mc-migrated',
        name: 'Minecraft Java + Bedrock (Change Mail)',
        price: 7.50,
        inStock: true,
        stockCount: 12,
        image: '/card-minecraft-java.png',
        subtitle: 'Minecraft Java + Bedrock (Change Mail)',
      },
      {
        id: 'mc-full',
        name: 'Minecraft Lifetime Full Security Access',
        price: 10.00,
        inStock: true,
        stockCount: 8,
        image: '/card-minecraft-bedrock.png',
        subtitle: 'Minecraft Lifetime Full Security Access',
      },
    ],
    format: 'EMAIL:PASSWORD',
    formatNote: 'Full email access + Microsoft login credentials provided',
    guide: [
      'Download and launch official Minecraft Launcher',
      'Select Microsoft Login and enter the provided Email & Password',
      'Go to account.microsoft.com to change recovery email and password to your own',
      'Set up your custom Minecraft Gamertag and enjoy Java & Bedrock editions!',
    ],
    features: [
      { icon: '🎮', title: 'Java & Bedrock Editions', desc: 'both game versions included in one account' },
      { icon: '✉️', title: 'Full Email Change Access', desc: 'migrate the account to your personal email anytime' },
      { icon: '🛡️', title: '100% Lifetime Security', desc: 'permanent ownership with zero risk of recovery' },
      { icon: '⚡', title: 'Instant Delivery', desc: 'credentials delivered immediately after payment' },
      { icon: '🌍', title: 'Global Access', desc: 'play on Hypixel and any multiplayer server worldwide' },
    ],
    standoutTitle: 'Why Our Minecraft Accounts Stand Out',
    standoutFeatures: [
      { icon: '💡', text: 'Clean account history, zero server bans' },
      { icon: '🛡️', text: 'Direct Microsoft transfer with change mail support' },
      { icon: '🔁', text: 'Lifetime warranty against security issues' },
      { icon: '🖥️', text: 'Works on Windows, Mac, Linux and consoles' },
    ],
    included: [
      { icon: '🔑', text: 'Full Microsoft / Minecraft account login' },
      { icon: '📧', text: 'Associated email access for instant transfer' },
      { icon: '⚡', text: 'Instant automated delivery 24/7' },
      { icon: '🛡️', text: 'Full replacement warranty on initial setup' },
    ],
    khmer: {
      title: 'គណនី Minecraft Java + Bedrock (Full Access)',
      format: 'EMAIL:PASSWORD',
      formatNote: 'ទទួលបាន Email និង Password សម្រាប់ចូល និងប្តូរទៅ Email ផ្ទាល់ខ្លួនបាន',
      guide: [
        'ទាញយក និងបើកកម្មវិធី Minecraft Launcher ផ្លូវការ',
        'ជ្រើសរើស Microsoft Login ហើយបញ្ចូល Email និង Password ដែលទទួលបាន',
        'ចូលទៅកាន់ account.microsoft.com ដើម្បីប្តូរ Email និង Password ទៅជារបស់អ្នកផ្ទាល់',
        'កំណត់ឈ្មោះ Minecraft Gamertag របស់អ្នក ហើយរីករាយជាមួយ Java & Bedrock ភ្លាមៗ!',
      ],
      features: [
        { icon: '🎮', title: 'រួមបញ្ចូលទាំង Java & Bedrock', desc: 'ទទួលបានហ្គេមទាំងពីរប្រភេទក្នុងគណនីតែមួយ' },
        { icon: '✉️', title: 'អាចប្តូរ Email បាន (Change Mail)', desc: 'ផ្ទេរគណនីទៅ Email ផ្ទាល់ខ្លួនរបស់អ្នកបាន 100%' },
        { icon: '🛡️', title: 'សុវត្ថិភាពអាយុកាល Lifetime', desc: 'កម្មសិទ្ធិផ្តាច់មុខ គ្មានហានិភ័យដណ្តើមវិញ' },
        { icon: '⚡', title: 'ទទួលបានភ្លាមៗ', desc: 'ព័ត៌មានគណនីផ្ញើជូនដោយស្វ័យប្រវត្តភ្លាមៗបន្ទាប់ពីទូទាត់' },
        { icon: '🌍', title: 'លេងបានទូទាំងពិភពលោក', desc: 'លេងបានលើគ្រប់ Server រួមទាំង Hypixel គ្មានការបិទតំបន់' },
      ],
      standoutTitle: 'ចំណុចពិសេសនៃគណនី Minecraft',
      standoutFeatures: [
        { icon: '💡', text: 'គណនីស្អាត 100% គ្មានប្រវត្តិជាប់ Ban លើ Server ណាឡើយ' },
        { icon: '🛡️', text: 'ផ្ទេរទៅកាន់ Microsoft Account ផ្ទាល់ខ្លួនរបស់អ្នកបាន' },
        { icon: '🔁', text: 'មានការធានាត្រឹមត្រូវលើសុវត្ថិភាពគណនី' },
        { icon: '🖥️', text: 'ដំណើរការលើ Windows, Mac, Linux និង Console' },
      ],
      included: [
        { icon: '🔑', text: 'ព័ត៌មានគណនី Microsoft / Minecraft ពេញលេញ' },
        { icon: '📧', text: 'សិទ្ធិចូល Email ដើមដើម្បីប្តូរព័ត៌មាន' },
        { icon: '⚡', text: 'ការផ្ញើជូនភ្លាមៗដោយស្វ័យប្រវត្តិ 24/7' },
        { icon: '🛡️', text: 'ការធានាប្តូរជូនថ្មីប្រសិនបើមានបញ្ហាពេលចូលដំបូង' },
      ],
    },
  },

  // Aliases for Minecraft
  'prod-mc-group': {
    redirect: 'minecraft-account',
  },
  'minecraft': {
    redirect: 'minecraft-account',
  },
  'minecraft-java-bedrock': {
    redirect: 'minecraft-account',
  },
};

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  const normalizedSlug = (slug || 'fivem-activation-code').toLowerCase().trim();
  const resolvedKey = SEED_CATALOG[normalizedSlug]?.redirect || normalizedSlug;
  const baseProduct = useMemo(() => {
    return SEED_CATALOG[resolvedKey] || {
      ...SEED_CATALOG['fivem-activation-code'],
      name: slug
        ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'FiveM Activation Code',
    };
  }, [resolvedKey, slug]);

  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch live product from API to sync live stock, image, price from admin dashboard
  useEffect(() => {
    let mounted = true;
    async function fetchLiveProduct() {
      try {
        setLoading(true);
        // Try getting by direct slug
        const res = await api.getProductBySlug(normalizedSlug).catch(() => null);
        if (mounted && res?.success && res.data) {
          setLiveData(res.data);
          return;
        }

        // Fallback: search in all products
        const allRes = await api.getProducts({ limit: 100 }).catch(() => null);
        if (mounted && allRes?.success && allRes.data) {
          const match = allRes.data.find(
            (p) =>
              p.slug === normalizedSlug ||
              p.id === normalizedSlug ||
              p.slug === resolvedKey ||
              p.id === baseProduct.id ||
              p.name.toLowerCase() === baseProduct.name.toLowerCase()
          );
          if (match) {
            setLiveData(match);
          }
        }
      } catch (err) {
        console.warn('Failed to load live product details:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchLiveProduct();

    const handleRefresh = () => fetchLiveProduct();
    const handleProductUpdated = (e) => {
      if (
        e.detail?.id === normalizedSlug ||
        e.detail?.id === baseProduct.id ||
        e.detail?.id === resolvedKey
      ) {
        if (e.detail?.cover_image) {
          setLiveData((prev) => (prev ? { ...prev, cover_image: e.detail.cover_image } : { cover_image: e.detail.cover_image }));
        }
      }
      fetchLiveProduct();
    };

    window.addEventListener('refresh-store-products', handleRefresh);
    window.addEventListener('product-updated', handleProductUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('refresh-store-products', handleRefresh);
      window.removeEventListener('product-updated', handleProductUpdated);
    };
  }, [normalizedSlug, resolvedKey, baseProduct.id, baseProduct.name]);

  // Combine rich catalog documentation with live stock and prices
  const product = useMemo(() => {
    const p = { ...baseProduct };
    if (liveData) {
      if (liveData.cover_image) p.image = liveData.cover_image;
      if (liveData.banner_image) p.banner_image = liveData.banner_image;
      if (liveData.iconSubtext || liveData.subtext) p.subtitle = liveData.iconSubtext || liveData.subtext;
      if (liveData.current_price !== undefined) p.price = liveData.current_price;
      if (liveData.name) p.name = liveData.name;
      if (liveData.availableStock !== undefined) {
        p.stock = liveData.availableStock;
        p.availableStock = liveData.availableStock;
        p.isOutOfStock = liveData.availableStock <= 0 || liveData.stockStatus === 'Out of Stock';
        p.stockStatus = liveData.stockStatus;
      }
    }
    return p;
  }, [baseProduct, liveData]);

  // State management
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [lang, setLang] = useState(product.defaultLang || 'us'); // 'us' | 'kh'
  const [isAdding, setIsAdding] = useState(false);

  // Sync state if slug changes
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setLang(product.defaultLang || 'us');
    setQuantity(1);
  }, [slug, product.variants, product.defaultLang]);

  // Dynamic pricing and stock calculation
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const isOutOfStock = Boolean(
    product.isOutOfStock ||
    product.stock <= 0 ||
    (selectedVariant ? (!selectedVariant.inStock || (selectedVariant.stockCount !== undefined && selectedVariant.stockCount <= 0)) : false)
  );
  const stockDisplay = isOutOfStock
    ? 'Out of Stock'
    : selectedVariant
    ? `In Stock (${selectedVariant.stockCount || product.stock || 8})`
    : !product.isOutOfStock && product.stock > 0
    ? `In Stock (${product.stock})`
    : 'Out of Stock';

  const activeTitle = selectedVariant ? selectedVariant.name : product.name;
  const activeImage = selectedVariant?.image || product.image;
  const activeSubtitle = selectedVariant?.subtitle || product.subtitle;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    await addToCart({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
      platform: product.category,
      price: currentPrice,
      unitPrice: currentPrice,
      coverImage: activeImage,
      availableStock: isOutOfStock ? 0 : (selectedVariant ? (selectedVariant.stockCount || product.stock) : product.stock),
    }, quantity, true);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    const itemData = {
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
      platform: product.category,
      price: currentPrice,
      unitPrice: currentPrice,
      coverImage: activeImage,
      availableStock: isOutOfStock ? 0 : (selectedVariant ? (selectedVariant.stockCount || product.stock) : product.stock),
    };
    await addToCart(itemData, quantity, false);

    if (!isAuthenticated) {
      showToast('Please sign in or register to buy products and complete your order', 'info');
      navigate('/login', {
        state: {
          from: { pathname: '/checkout' },
          message: 'Please sign in or register to complete your purchase and claim your digital keys.',
        },
      });
      return;
    }

    navigate('/checkout');
  };

  return (
    <div className="sbay-grid-bg min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb Navigation matching Screenshots 1 & 2 */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <Link to="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <Link to="/products" className="hover:text-white transition-colors">
          Products
        </Link>
        {selectedVariant && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-slate-300 font-medium">{product.name}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-white font-bold truncate max-w-xs sm:max-w-md">{activeTitle}</span>
      </nav>

      {/* Main 2-Column Responsive Layout matching Screenshots 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop 7 cols): Hero Card & Description Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Media Showcase Card (Screenshots 1 & 2) */}
          <div
            className="rounded-2xl bg-[#090e1c] border border-white/10 p-10 sm:p-14 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl"
            style={{
              boxShadow: `0 0 50px -10px ${product.glow}`,
            }}
          >
            {/* Ambient Radial Glow on Top */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 18%, ${product.glow} 0%, transparent 75%)`,
              }}
            />

            {/* Artwork Icon Box matching Screenshots 1, 2, and 3 */}
            {/* Artwork Icon Box matching Screenshots 1, 2, and 3 */}
            <div className="relative z-10 flex items-center justify-center">
              {product.id === 'prod-gemini-18m' ? (
                <div className="w-48 sm:w-60 h-28 sm:h-32 rounded-2xl bg-white p-4 shadow-[0_0_35px_rgba(6,182,212,0.4)] flex items-center justify-center">
                  <img
                    src={activeImage}
                    alt={activeTitle}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : product.id === 'prod-discord-group' ? (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#5865F2] p-4 shadow-[0_0_35px_rgba(88,101,242,0.45)] flex items-center justify-center">
                  <img
                    src={activeImage}
                    alt={activeTitle}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : product.id === 'prod-nitro-boosts' ? (
                <div className="w-56 sm:w-72 h-32 sm:h-40 rounded-2xl overflow-hidden shadow-[0_0_45px_rgba(168,85,247,0.45)] flex items-center justify-center bg-[#58339b] border border-purple-400/20">
                  <img
                    src={activeImage}
                    alt={activeTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : product.id === 'prod-mc-group' || product.category === 'MINECRAFT' ? (
                <div className="w-64 sm:w-80 h-36 sm:h-44 rounded-2xl overflow-hidden shadow-[0_0_45px_rgba(34,197,94,0.35)] flex items-center justify-center bg-[#071322] border border-emerald-500/30">
                  <img
                    src={activeImage}
                    alt={activeTitle}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#F59E0B] p-2 shadow-[0_0_35px_rgba(245,158,11,0.4)] flex items-center justify-center">
                  <img
                    src={activeImage}
                    alt={activeTitle}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-black font-black text-5xl">R★</span>';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Subtitle centered below artwork */}
            <span className="relative z-10 text-xs sm:text-sm font-black text-white tracking-normal mt-5">
              {activeSubtitle}
            </span>
          </div>

          {/* Description Card (Screenshots 1, 2, and 3) */}
          <div className="rounded-2xl bg-[#090e1c] border border-white/10 p-5 sm:p-6 space-y-4 shadow-xl">
            {/* Header: Title on Left, Language Switcher Pill on Right */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                Description
              </h2>

              {/* Language Switcher Pill [ 🇺🇸 US | 🇰🇭 KH ] */}
              <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setLang('us')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    lang === 'us'
                      ? 'bg-[#182a4d] text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇺🇸</span>
                  <span>US</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLang('kh')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    lang === 'kh'
                      ? 'bg-[#182a4d] text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇰🇭</span>
                  <span>KH</span>
                </button>
              </div>
            </div>

            {/* Handle "No description available for this product." if configured */}
            {product.noDescription ? (
              <div className="py-6 text-xs sm:text-sm text-slate-400">
                No description available for this product.
              </div>
            ) : lang === 'us' ? (
              /* Description Body: US English Version */
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {/* Header Feature */}
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  {product.usTitle ? (
                    <span>{product.usTitle}</span>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>{product.name}</span>
                    </>
                  )}
                </div>

                {/* Key Features List */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>🛠️</span>
                      <span>Key Features</span>
                    </div>

                    <ul className="space-y-2 pl-0.5 text-slate-300">
                      {product.features.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>{item.icon}</span>
                          <span>
                            <strong className="text-white font-semibold">{item.title}</strong> — {item.desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Standout Features Section (if configured) */}
                {product.standoutFeatures && product.standoutFeatures.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>💥</span>
                        <span>{product.standoutTitle || 'Why 14× Server Boosts Stands Out'}</span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-0.5">
                        {product.standoutFeatures.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Format Section (if configured) */}
                {product.format && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>💻</span>
                        <span>Format</span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-200 tracking-wider pt-0.5">
                        {product.format}
                      </div>
                      {product.formatNote && (
                        <div className="text-xs text-slate-400">
                          {product.formatNote}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Activation Guide (if configured) */}
                {product.guide && product.guide.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <div className="space-y-2">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>🚀</span>
                        <span>Activation Guide</span>
                      </div>
                      <ol className="space-y-1.5 list-decimal list-inside text-xs sm:text-sm text-slate-300 pl-1">
                        {product.guide.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </>
                )}

                {/* What's Included (if configured) */}
                {product.included && product.included.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>✅</span>
                        <span>What's Included</span>
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 pl-0.5">
                        {product.included.map((inc, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span>{inc.icon}</span>
                            <span>{inc.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Description Body: Khmer (KH) Translation */
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  {product.khmer?.title?.startsWith('🛡️') ? (
                    <span>{product.khmer.title}</span>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>{product.khmer?.title || product.name}</span>
                    </>
                  )}
                </div>

                {product.khmer?.features && product.khmer.features.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>🛠️</span>
                      <span>មុខងារពិសេសៗ (Key Features)</span>
                    </div>

                    <ul className="space-y-2 pl-0.5 text-slate-300">
                      {product.khmer?.features?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>{item.icon}</span>
                          <span>
                            <strong className="text-white font-semibold">{item.title}</strong> — {item.desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Khmer Standout Features */}
                {product.khmer?.standoutFeatures && product.khmer.standoutFeatures.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>💥</span>
                        <span>{product.khmer.standoutTitle || 'ចំណុចលេចធ្លោ'}</span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-0.5">
                        {product.khmer.standoutFeatures.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Khmer Format */}
                {product.khmer?.format && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>💻</span>
                        <span>ទម្រង់ (Format)</span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-200 tracking-wider pt-0.5">
                        {product.khmer?.format}
                      </div>
                      {product.khmer?.formatNote && (
                        <div className="text-xs text-slate-400">
                          {product.khmer?.formatNote}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Khmer Activation Guide */}
                {product.khmer?.guide && product.khmer.guide.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <div className="space-y-2">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>🚀</span>
                        <span>របៀបបើកដំណើរការ (Activation Guide)</span>
                      </div>
                      <ol className="space-y-1.5 list-decimal list-inside text-xs sm:text-sm text-slate-300 pl-1">
                        {product.khmer?.guide?.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </>
                )}

                {/* Khmer What's Included */}
                {product.khmer?.included && product.khmer.included.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>✅</span>
                        <span>អ្វីដែលអ្នកនឹងទទួលបាន (What's Included)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 pl-0.5">
                        {product.khmer?.included?.map((inc, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span>{inc.icon}</span>
                            <span>{inc.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Desktop 5 cols): Purchase & Checkout Card */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-[#090e1c] border border-white/10 p-5 sm:p-7 space-y-5 shadow-2xl">
            {/* Category Badge & Title */}
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider bg-blue-900/40 text-blue-400 border border-blue-500/20">
                {product.category}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeTitle}
              </h1>

              {/* Price */}
              <div className="text-3xl sm:text-4xl font-black text-white pt-1">
                ${currentPrice.toFixed(2)}
              </div>
            </div>

            {/* Stock Badge (Out of Stock or In Stock) matching Screenshots 1 & 2 */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1f0d14] text-rose-400 border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Out of Stock</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#071714] text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  <span>{stockDisplay}</span>
                </span>
              )}
            </div>

            {/* Select Option Dropdown / List (Matching Image 1 & Screenshot 2) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Select Option ({product.variants.length})
                </label>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 relative ${
                          isSelected
                            ? 'bg-[#0a152d] border-[#2563eb] ring-1 ring-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                            : 'bg-[#070b16] border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="font-bold text-xs sm:text-sm text-white">{v.name}</span>
                          <span className="font-black text-sm sm:text-base text-blue-400 shrink-0">
                            ${v.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-400">
                          {v.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-300 block">
                Quantity
              </label>
              <div className="inline-flex items-center bg-[#0d1322] border border-white/10 rounded-xl overflow-hidden p-1">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-[#121a2d] hover:bg-[#1a2540] text-white font-bold flex items-center justify-center transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-[#121a2d] hover:bg-[#1a2540] text-white font-bold flex items-center justify-center transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart and Buy Now */}
            <div className="space-y-3 pt-3">
              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 rounded-xl bg-[#0e1424] border border-white/5 text-slate-500 font-bold text-xs sm:text-sm cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full py-3.5 rounded-xl bg-[#0d1322] hover:bg-[#131b30] border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 group"
                  >
                    {isAdding ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                    )}
                    <span>{isAdding ? 'Added to Cart!' : 'Add to Cart'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_28px_rgba(37,99,235,0.6)] transition-all active:scale-98"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Buy Now</span>
                  </button>
                </>
              )}

              {!isAuthenticated && !isOutOfStock && (
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Account sign-in required at checkout for instant key delivery</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
