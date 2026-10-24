import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 15,
    min_spend: 20,
    max_uses: 500,
    is_active: true,
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getCoupons();
      if (res.success) setCoupons(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await api.admin.createCoupon(formData);
      if (res.success) {
        showToast('Coupon created successfully', 'success');
        setIsModalOpen(false);
        setFormData({
          code: '',
          discount_type: 'percentage',
          discount_value: 15,
          min_spend: 20,
          max_uses: 500,
          is_active: true,
        });
        loadCoupons();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await api.admin.deleteCoupon(id);
      if (res.success) {
        showToast('Coupon deleted', 'info');
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (err) {
      showToast(err.message || 'Could not delete coupon', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Coupons & Promo Codes</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage promotional codes, percentage discounts, and spending minimums.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="glass-card p-6 rounded-2xl border border-white/5 bg-[#111629]/90 space-y-4 relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-cyan-300 tracking-wider px-3 py-1 bg-slate-950 rounded-lg border border-cyan-500/30">
                  {c.code}
                </span>
                {c.code === 'NIGHTMARE' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Storefront Banner
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteCoupon(c.id)}
                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Discount:</span>
                <span className="font-bold text-white">
                  {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `$${c.discount_value.toFixed(2)} OFF`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Min Spend:</span>
                <span>${c.min_spend?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Times Used:</span>
                <span className="text-purple-400 font-bold">{c.times_used} {c.max_uses ? `/ ${c.max_uses}` : ''}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className={`px-2 py-0.5 rounded font-semibold ${c.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {c.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1428] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-400" />
              <span>Create Coupon Code</span>
            </h2>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono uppercase tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Order Spend ($)</label>
                  <input
                    type="number"
                    value={formData.min_spend}
                    onChange={(e) => setFormData({ ...formData, min_spend: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value, 10) || null })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
