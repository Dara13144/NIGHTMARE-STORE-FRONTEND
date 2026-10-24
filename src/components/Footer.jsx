import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Clock, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#06080F] text-slate-400 relative z-10 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Footer matching Screenshot 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              {/* Nightmare Store Logo Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_22px_rgba(59,130,246,0.8)] transition-all">
                <div className="w-full h-full bg-[#080d1a] rounded-[10px] overflow-hidden flex items-center justify-center p-0.5">
                  <img
                    src="/logo.png"
                    alt="Nightmare Store"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>
              <span className="text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                Nightmare<span className="text-blue-500">Store</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              NightmareStore is a legit digital marketplace for accounts and digital keys, providing secure checkout and fast digital delivery.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/store" className="hover:text-blue-400 transition-colors">Products</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-blue-400 transition-colors">Cart</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a>
              </li>
              <li>
                <Link to="/support" className="hover:text-blue-400 transition-colors">Support</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-400 transition-colors">Terms</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href="mailto:mdara9695@gmail.com" className="hover:text-blue-400 transition-colors">
                  mdara9695@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href="tel:+85511315401" className="hover:text-blue-400 transition-colors">
                  +855 11315401
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>7:00 AM – 12:00 AM (Daily)</span>
              </li>
            </ul>

            {/* Follow Us */}
            <div className="pt-2">
              <span className="text-xs font-bold text-white block mb-2">Follow Us</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://discord.gg/PyjjHvdf2"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Join Discord Server"
                  className="w-8 h-8 rounded-lg bg-[#0d1322] hover:bg-[#5865F2]/20 border border-white/10 hover:border-[#5865F2]/50 flex items-center justify-center transition-all p-1.5 group"
                >
                  <img
                    src="/discord-logo.png"
                    alt="Discord"
                    className="w-full h-full object-contain rounded-sm group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                  className="w-8 h-8 rounded-lg bg-[#0d1322] hover:bg-[#229ED9]/20 border border-white/10 hover:border-[#229ED9]/50 flex items-center justify-center transition-all p-1.5 group"
                >
                  <img
                    src="/telegram-logo.png"
                    alt="Telegram"
                    className="w-full h-full object-contain rounded-full group-hover:scale-110 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NightmareStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
