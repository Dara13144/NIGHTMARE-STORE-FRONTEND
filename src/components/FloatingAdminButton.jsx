import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { ADMIN_BASE_PATH } from '../constants/adminRoutes';

export default function FloatingAdminButton() {
  const location = useLocation();

  // Hide when already inside the Admin Suite
  if (
    location.pathname.startsWith(ADMIN_BASE_PATH) ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <Link
      to={ADMIN_BASE_PATH}
      aria-label="Access NMC Admin Dashboard"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#080e20]/95 hover:bg-[#0c1636] border border-blue-600/80 hover:border-blue-400 text-xs sm:text-sm font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_28px_rgba(37,99,235,0.7)] backdrop-blur-md transition-all active:scale-95 group"
      title="Access NMC Admin Dashboard"
    >
      <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
      <span className="tracking-wide">NMC Admin Dashboard</span>
    </Link>
  );
}
