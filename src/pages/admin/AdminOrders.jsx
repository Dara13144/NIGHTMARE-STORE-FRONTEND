import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Filter,
  Eye,
  KeyRound,
  RotateCcw,
  Ban,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  CreditCard,
  DollarSign,
  User,
  Calendar,
  X,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [deleteModalOrder, setDeleteModalOrder] = useState(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { showToast } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setIsProcessing(true);
      const res = await api.admin.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!refundModalOrder) return;
    try {
      setIsProcessing(true);
      const res = await api.admin.updateOrderStatus(refundModalOrder.id, 'refunded');
      if (res.success) {
        showToast(`Order #${refundModalOrder.order_number} refunded successfully`, 'success');
        setOrders(orders.map((o) => (o.id === refundModalOrder.id ? { ...o, status: 'refunded' } : o)));
        setRefundModalOrder(null);
        if (selectedOrder && selectedOrder.id === refundModalOrder.id) {
          setSelectedOrder({ ...selectedOrder, status: 'refunded' });
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to process refund', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteModalOrder) return;
    try {
      setIsProcessing(true);
      const res = await api.admin.deleteOrder(deleteModalOrder.id);
      if (res.success) {
        showToast(res.message || 'Order removed successfully', 'success');
        setOrders(orders.filter((o) => o.id !== deleteModalOrder.id));
        setDeleteModalOrder(null);
        if (selectedOrder && selectedOrder.id === deleteModalOrder.id) {
          setSelectedOrder(null);
        }
      } else {
        showToast(res.error || 'Failed to delete order', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete order', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAllOrders = async () => {
    try {
      setIsClearingAll(true);
      const res = await api.admin.clearAllOrders();
      if (res.success) {
        showToast(res.message || 'All orders cleared successfully!', 'success');
        setOrders([]);
        setSelectedOrder(null);
        setIsClearAllModalOpen(false);
      } else {
        showToast(res.error || 'Failed to clear orders', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear orders', 'error');
    } finally {
      setIsClearingAll(false);
    }
  };

  const filtered = orders.filter((o) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (o.order_number && o.order_number.toLowerCase().includes(query)) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(query)) ||
      (o.payment_reference && o.payment_reference.toLowerCase().includes(query)) ||
      (o.id && o.id.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === 'all' ? true : o.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesPayment =
      paymentFilter === 'all'
        ? true
        : paymentFilter === 'paid'
        ? o.status === 'completed' || o.status === 'paid'
        : paymentFilter === 'pending'
        ? o.status === 'pending'
        : o.status === 'refunded' || o.status === 'cancelled';

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Delivered</span>
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'pending':
      case 'awaiting payment':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Awaiting Payment</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 w-fit">
            <RotateCcw className="w-3 h-3" />
            <span>Refunded</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-fit">
            <XCircle className="w-3 h-3" />
            <span>Canceled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Order Management</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Monitor real-time customer purchases, key fulfillments, and authorized refund requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {orders.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              title="Clear All Orders"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All Orders</span>
            </button>
          )}

          <button
            onClick={loadOrders}
            className="px-3.5 py-2.5 rounded-xl bg-[#111A33] border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111A33] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by order #, customer email, or payment ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0D1329] border border-white/10 hover:border-purple-500/40 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Order Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0D1329] border border-white/10 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Order Statuses</option>
            <option value="completed">Completed / Delivered</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0D1329] border border-white/10 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid & Verified</option>
            <option value="pending">Awaiting Payment</option>
            <option value="refunded">Refunded / Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Responsive Orders Table */}
      <div className="rounded-3xl bg-[#111A33] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0D1329] text-slate-400 uppercase tracking-wider font-bold border-b border-white/5">
              <tr>
                <th className="p-4">Order Reference</th>
                <th className="p-4">Customer Email</th>
                <th className="p-4">Items & Keys</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 italic">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Order Reference */}
                    <td className="p-4 font-mono font-bold text-cyan-300">
                      <div className="flex items-center gap-2">
                        <span className="text-white">#{ord.order_number || ord.id.slice(0, 8)}</span>
                        {ord.payment_method && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase">
                            {ord.payment_method}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer Email */}
                    <td className="p-4 text-white font-medium">
                      <div className="truncate max-w-[200px]">{ord.customer_email}</div>
                    </td>

                    {/* Items */}
                    <td className="p-4 text-slate-400">
                      <div className="truncate max-w-[220px]">
                        {ord.items?.map((i) => `${i.product_name} (×${i.quantity})`).join(', ') || 'Game Keys'}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 font-black text-white font-mono text-sm">
                      ${Number(ord.total_amount || 0).toFixed(2)}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">{getStatusBadge(ord.status)}</td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {ord.status !== 'refunded' && (
                          <button
                            onClick={() => setRefundModalOrder(ord)}
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white transition-all"
                            title="Process Refund"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModalOrder(ord)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-white transition-all"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-[#0D1329] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Meta Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#111A33] border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Customer</span>
                  <div className="font-bold text-white truncate">{selectedOrder.customer_email}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#111A33] border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Total Paid</span>
                  <div className="font-bold text-emerald-400 font-mono text-sm">
                    ${Number(selectedOrder.total_amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Status Update Row */}
              <div className="p-3.5 rounded-2xl bg-[#111A33] border border-white/5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Fulfillment Status</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-[#0D1329] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="completed">Completed / Delivered</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Purchased Items</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#111A33] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{item.product_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Quantity: {item.quantity} • Unit: ${item.unit_price?.toFixed(2)}
                        </div>
                      </div>
                      <span className="font-bold text-white font-mono">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setRefundModalOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold transition-all"
                >
                  Issue Refund
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refund Confirmation Modal */}
      <AnimatePresence>
        {refundModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0D1329] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Authorize Order Refund?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to refund order #{refundModalOrder.order_number} ($
                {refundModalOrder.total_amount?.toFixed(2)}) for {refundModalOrder.customer_email}? This action
                will update the payment ledger and mark keys as returned.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setRefundModalOrder(null)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessRefund}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Single Order Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0D1329] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Order?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete order{' '}
                <span className="font-mono text-white font-bold">#{deleteModalOrder.order_number || deleteModalOrder.id}</span>{' '}
                (${Number(deleteModalOrder.total_amount || 0).toFixed(2)}) for{' '}
                <span className="text-cyan-400">{deleteModalOrder.customer_email}</span>?
                This will remove it from the database and dashboard metrics.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteModalOrder(null)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
                >
                  {isProcessing ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Orders Confirmation Modal */}
      <AnimatePresence>
        {isClearAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0D1329] border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Clear ALL Orders?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will permanently remove <span className="font-bold text-rose-400">EVERY order</span> from the store,
                resetting total revenue to <span className="font-bold text-emerald-400">$0.00</span> across the admin dashboard
                and database. This action cannot be undone.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsClearAllModalOpen(false)}
                  disabled={isClearingAll}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllOrders}
                  disabled={isClearingAll}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-xl shadow-rose-600/40 transition-all"
                >
                  {isClearingAll ? 'Clearing All...' : 'Yes, Clear All Orders'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
