import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Bot,
  Send,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Activity,
  Server,
  Key,
  Hash,
  Radio,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminDiscordVerification() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [postingPanel, setPostingPanel] = useState(false);

  const [verifications, setVerifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [botStatus, setBotStatus] = useState(null);
  const [settings, setSettings] = useState({
    guildId: '',
    verifiedRoleId: '',
    channelId: '',
  });

  const [activeTab, setActiveTab] = useState('verified'); // 'verified', 'logs', 'config'
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getDiscordVerifications();
      if (res.success) {
        setVerifications(res.verifications || []);
        setLogs(res.logs || []);
        setBotStatus(res.botStatus || null);
        if (res.settings) {
          setSettings({
            guildId: res.settings.guildId || '',
            verifiedRoleId: res.settings.verifiedRoleId || '',
            channelId: res.settings.channelId || '',
          });
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load Discord verifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostPanel = async (e) => {
    e.preventDefault();
    if (!settings.channelId) {
      showToast('Please provide a Discord Channel ID to post the verification panel.', 'error');
      return;
    }

    setPostingPanel(true);
    try {
      const res = await api.admin.postDiscordPanel({
        channelId: settings.channelId,
        roleId: settings.verifiedRoleId,
        guildId: settings.guildId,
      });

      if (res.success) {
        showToast(res.message || 'Verification panel deployed to Discord!', 'success');
        loadData();
      } else {
        showToast(res.error || 'Failed to post panel', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to deploy panel to Discord', 'error');
    } finally {
      setPostingPanel(false);
    }
  };

  const filteredVerifications = verifications.filter((v) => {
    const q = searchQuery.toLowerCase();
    const discordId = (v.discord_user_id || '').toLowerCase();
    const profileName = (v.profiles?.username || v.profiles?.display_name || '').toLowerCase();
    return discordId.includes(q) || profileName.includes(q);
  });

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    const event = (l.event_type || '').toLowerCase();
    const status = (l.status || '').toLowerCase();
    const discordId = (l.discord_user_id || '').toLowerCase();
    return event.includes(q) || status.includes(q) || discordId.includes(q);
  });

  const failedAttemptsCount = logs.filter((l) => l.status.includes('FAIL') || l.status.includes('ERROR')).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <span>Discord Verification System</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage automated Discord role verification, bot status, and security audit logs.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Verified Members */}
        <div className="p-5 rounded-2xl bg-[#0c1326] border border-white/5 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{verifications.length}</p>
          <p className="text-[10px] text-emerald-400 font-semibold">Active role assignments</p>
        </div>

        {/* Failed Verification Attempts */}
        <div className="p-5 rounded-2xl bg-[#0c1326] border border-white/5 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Security Blocks</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{failedAttemptsCount}</p>
          <p className="text-[10px] text-slate-400">Failed CAPTCHAs & duplicate blocks</p>
        </div>

        {/* Bot Status */}
        <div className="p-5 rounded-2xl bg-[#0c1326] border border-white/5 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bot Status</span>
            <Bot className="w-4 h-4 text-[#5865F2]" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                botStatus?.isReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <p className="text-lg font-bold text-white">
              {botStatus?.isReady ? 'Online & Ready' : 'API Standby Mode'}
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-mono truncate">
            {botStatus?.botInfo?.tag || 'Discord Gateway'}
          </p>
        </div>

        {/* Target Guild */}
        <div className="p-5 rounded-2xl bg-[#0c1326] border border-white/5 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Connected Server</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono truncate">
            {settings.guildId || 'Not Configured'}
          </p>
          <p className="text-[10px] text-blue-400 font-semibold">Role ID: {settings.verifiedRoleId || 'Auto'}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'verified'
              ? 'bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Verified Users ({verifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Verification Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'config'
              ? 'bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Bot & Panel Settings</span>
        </button>
      </div>

      {/* TAB 1: VERIFIED USERS LIST */}
      {activeTab === 'verified' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Discord ID or Username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0c1326] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Showing {filteredVerifications.length} verified accounts
            </span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#090e1c] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1424] text-slate-400 uppercase tracking-wider font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Discord ID</th>
                    <th className="py-3 px-4">Guild ID</th>
                    <th className="py-3 px-4">Role ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Verified At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredVerifications.length > 0 ? (
                    filteredVerifications.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                          <img
                            src={
                              item.profiles?.avatar_url ||
                              'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100'
                            }
                            alt=""
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-[#5865F2]"
                          />
                          <div>
                            <span className="block text-white font-bold">
                              {item.profiles?.display_name || item.profiles?.username || 'Discord Member'}
                            </span>
                            {item.profiles?.email && (
                              <span className="text-[10px] text-slate-400 block">{item.profiles.email}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-blue-400 text-[11px]">
                          {item.discord_user_id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {item.discord_guild_id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-purple-400 text-[11px]">
                          {item.verified_role_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            Verified
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {new Date(item.verified_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No verified members found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT & SECURITY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search event type, status, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0c1326] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Total Recorded Logs: {filteredLogs.length}
            </span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#090e1c] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1424] text-slate-400 uppercase tracking-wider font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Discord ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const isFail =
                        log.status.includes('FAIL') ||
                        log.status.includes('ERROR') ||
                        log.status.includes('REJECT');
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-white">{log.event_type}</td>
                          <td className="py-3 px-4 font-mono text-blue-400 text-[11px]">
                            {log.discord_user_id || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isFail
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                            {log.ip_address || '127.0.0.1'}
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[10px] max-w-xs truncate">
                            {JSON.stringify(log.details || {})}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No verification logs recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURATION & BOT PANEL DEPLOY */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel Deployment Form */}
          <form
            onSubmit={handlePostPanel}
            className="p-6 rounded-3xl bg-[#090e1c] border border-white/5 space-y-5 shadow-xl"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <span className="p-2 rounded-xl bg-[#5865F2]/20 text-[#5865F2]">
                <Send className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Deploy Verification Panel</h3>
                <p className="text-xs text-slate-400">
                  Sends or updates the rich embed verification panel with button in your Discord channel.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Target Discord Channel ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456789012345678 (verification channel)"
                  value={settings.channelId}
                  onChange={(e) => setSettings({ ...settings, channelId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0c1326] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Verified Role ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456789012345679 (Role ID to assign)"
                  value={settings.verifiedRoleId}
                  onChange={(e) => setSettings({ ...settings, verifiedRoleId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0c1326] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Discord Server (Guild) ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1562068415655714836"
                  value={settings.guildId}
                  onChange={(e) => setSettings({ ...settings, guildId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0c1326] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <button
                type="submit"
                disabled={postingPanel}
                className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs shadow-lg shadow-[#5865F2]/25 flex items-center justify-center gap-2 transition-all"
              >
                {postingPanel ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deploying to Discord...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Verification Panel</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bot Setup Instructions & Security Architecture */}
          <div className="p-6 rounded-3xl bg-[#090e1c] border border-white/5 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <span>Discord Bot Setup Guide</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#0c1326] border border-white/5 space-y-1">
                <span className="font-bold text-white block">1. Bot Role Hierarchy</span>
                <p className="text-slate-400">
                  Ensure the bot's role is positioned <strong>higher</strong> than the "Verified" role in your Discord Server Settings → Roles. Otherwise, Discord prevents the bot from granting the role.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0c1326] border border-white/5 space-y-1">
                <span className="font-bold text-white block">2. Required Bot Permissions</span>
                <p className="text-slate-400">
                  The bot requires <strong>Manage Roles</strong> (<code>MANAGE_ROLES</code>), <strong>View Channels</strong>, and <strong>Send Messages</strong> permissions.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0c1326] border border-white/5 space-y-1">
                <span className="font-bold text-white block">3. In-Discord Slash Command</span>
                <p className="text-slate-400">
                  Administrators can also run <code>/verify-setup</code> directly in any Discord channel to instantly post the verification card.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
