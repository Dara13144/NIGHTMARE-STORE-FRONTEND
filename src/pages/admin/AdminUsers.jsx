import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.admin.updateUserRole(userId, newRole);
      if (res.success) {
        showToast(`Role updated to ${newRole}`, 'success');
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await api.admin.updateUserStatus(userId, newStatus);
      if (res.success) {
        showToast(`Account status set to ${newStatus}`, 'success');
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.username?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.discordId?.toLowerCase().includes(q) ||
      u.googleSub?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (providerFilter === 'google') return u.googleConnected;
    if (providerFilter === 'discord') return u.discordConnected;
    if (providerFilter === 'both') return u.googleConnected && u.discordConnected;
    return true;
  });

  const totalUsers = users.length;
  const googleUsers = users.filter((u) => u.googleConnected).length;
  const discordUsers = users.filter((u) => u.discordConnected).length;
  const dualLinkedUsers = users.filter((u) => u.googleConnected && u.discordConnected).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Users & OAuth Accounts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage registered store customers, OAuth 2.0 provider links, account statuses, and admin roles.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#090e1c] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TOTAL REGISTERED</span>
          <div className="text-2xl font-black text-white">{totalUsers}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090e1c] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>GOOGLE USERS</span>
          </span>
          <div className="text-2xl font-black text-blue-400">{googleUsers}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090e1c] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3 h-3 fill-[#5865F2]" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>DISCORD USERS</span>
          </span>
          <div className="text-2xl font-black text-[#5865F2]">{discordUsers}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090e1c] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DUAL LINKED</span>
          <div className="text-2xl font-black text-emerald-400">{dualLinkedUsers}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username, email, Discord ID, Google ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-[#080d1a] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Providers ({totalUsers})</option>
            <option value="google">Google Connected ({googleUsers})</option>
            <option value="discord">Discord Connected ({discordUsers})</option>
            <option value="both">Both Linked ({dualLinkedUsers})</option>
          </select>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold border-b border-white/5">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Connected OAuth</th>
                <th className="p-4">Email</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Role</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No users matching search filters found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User profile */}
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={u.username}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-500/40 shrink-0"
                      />
                      <div className="overflow-hidden max-w-[160px]">
                        <span className="font-bold text-white block truncate">{u.displayName || u.username}</span>
                        <span className="text-[11px] text-slate-500 block truncate font-mono">ID: {u.id}</span>
                      </div>
                    </td>

                    {/* OAuth Providers Badges */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {u.googleConnected ? (
                          <span
                            title={`Google Sub ID: ${u.googleSub || '—'}`}
                            className="px-2 py-0.5 rounded-full bg-[#4285F4]/15 text-[#4285F4] text-[10px] font-bold border border-[#4285F4]/30 flex items-center gap-1"
                          >
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span>Google</span>
                          </span>
                        ) : null}

                        {u.discordConnected ? (
                          <span
                            title={`Discord ID: ${u.discordId || '—'}`}
                            className="px-2 py-0.5 rounded-full bg-[#5865F2]/15 text-[#5865F2] text-[10px] font-bold border border-[#5865F2]/30 flex items-center gap-1"
                          >
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            <span>Discord</span>
                          </span>
                        ) : null}

                        {!u.googleConnected && !u.discordConnected && (
                          <span className="text-[10px] text-slate-500 font-mono">Email / Password</span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 text-slate-200 font-mono text-[11px]">
                      <div>{u.email}</div>
                      {u.emailVerified && (
                        <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </td>

                    {/* Account Status (Enable / Disable / Suspend) */}
                    <td className="p-4">
                      <select
                        value={u.status || 'active'}
                        onChange={(e) => handleStatusChange(u.id, e.target.value)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                          u.status === 'suspended' || u.status === 'disabled'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        <option value="active" className="bg-slate-900 text-white">Active (Enabled)</option>
                        <option value="suspended" className="bg-slate-900 text-white">Suspended</option>
                        <option value="disabled" className="bg-slate-900 text-white">Disabled</option>
                      </select>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <select
                        value={u.role || 'customer'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-900 text-slate-300 border-white/10'
                        }`}
                      >
                        <option value="customer" className="bg-slate-900 text-white">Customer</option>
                        <option value="admin" className="bg-slate-900 text-white">Administrator</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
