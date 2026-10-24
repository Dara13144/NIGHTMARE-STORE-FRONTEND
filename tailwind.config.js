/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080A12',
          surface: '#111629',
          'surface-light': '#1A223E',
          card: 'rgba(17, 22, 41, 0.75)',
          purple: '#8B5CF6',
          'purple-glow': '#A78BFA',
          cyan: '#22D3EE',
          'cyan-glow': '#67E8F9',
          pink: '#F43F5E',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px -3px rgba(139, 92, 246, 0.4)',
        'neon-cyan': '0 0 20px -3px rgba(34, 211, 238, 0.4)',
        'neon-border': '0 0 15px rgba(139, 92, 246, 0.25)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        floatParticle: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-15px) translateX(8px)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 6s infinite ease-in-out',
        'float': 'floatParticle 8s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
