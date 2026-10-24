import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { renderSVG } from 'uqr';
import { api } from '../services/api';

/**
 * ABA PAYWAY Brand Header (Matching Screenshot 1 & 2)
 */
function ABAPayWayBrandHeader() {
  return (
    <div className="flex items-center justify-end px-2 py-1 select-none mb-1 text-white">
      <div className="flex items-center gap-1 font-black text-sm tracking-wider">
        <span className="font-extrabold tracking-tight">ABA'</span>
        <span className="font-black italic tracking-widest text-xs">PAYWAY</span>
      </div>
    </div>
  );
}

/**
 * KHQR Wordmark Component
 */
function KHQRWordmark() {
  return (
    <div className="flex items-center gap-1.5 text-white font-black tracking-wider text-base select-none">
      <span className="bg-white text-red-600 px-1.5 py-0.5 rounded font-black text-xs">KH</span>
      <span className="tracking-tight text-white font-extrabold text-sm">QR</span>
    </div>
  );
}

/**
 * Authentic ABA PayWay Success Hero Banner (Matching Screenshot 1)
 */
function SuccessHeroBanner() {
  return (
    <div className="relative w-full h-44 overflow-hidden bg-gradient-to-b from-[#daf0ff] via-[#e8f6ff] to-[#f4faff] flex items-center justify-center select-none">
      {/* Soft Clouds */}
      <div className="absolute top-3 left-6 w-16 h-7 bg-white/70 rounded-full blur-[1px]" />
      <div className="absolute top-5 right-8 w-24 h-9 bg-white/80 rounded-full blur-[1px]" />
      <div className="absolute top-9 left-28 w-16 h-6 bg-white/60 rounded-full blur-[1px]" />

      {/* Gentle Hills Horizon */}
      <svg className="absolute bottom-0 w-full h-20 text-[#cbe9ff]" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0,80 Q100,20 200,60 T400,35 L400,100 L0,100 Z" fill="currentColor" opacity="0.6" />
        <path d="M0,90 Q150,45 300,75 T400,50 L400,100 L0,100 Z" fill="#b9e1fd" opacity="0.8" />
      </svg>

      {/* Blue Desert Cactus 1 (Left) */}
      <svg className="absolute bottom-4 left-9 w-9 h-16 text-[#3582ca]" viewBox="0 0 50 100" fill="currentColor">
        <path d="M22,90 L28,90 L28,15 C28,11 22,11 22,15 Z" />
        <path d="M12,45 C12,58 24,58 24,58 L24,52 C24,52 16,52 16,45 L16,35 C16,32 12,32 12,35 Z" />
        <path d="M38,50 C38,62 26,62 26,62 L26,56 C26,56 34,56 34,50 L34,40 C34,37 38,37 38,40 Z" />
      </svg>

      {/* Blue Desert Cactus 2 (Right, distant) */}
      <svg className="absolute bottom-4 right-14 w-6 h-12 text-[#7ab4e6]/70" viewBox="0 0 50 100" fill="currentColor">
        <path d="M22,90 L28,90 L28,15 C28,11 22,11 22,15 Z" />
        <path d="M12,45 C12,58 24,58 24,58 L24,52 C24,52 16,52 16,45 L16,35 C16,32 12,32 12,35 Z" />
      </svg>

      {/* Flagpole with White Flag & Green Checkmark */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Flagpole */}
        <div className="w-1.5 h-36 bg-[#2d85cb] rounded-t-sm relative shadow-sm">
          {/* Finial Spear */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#2d85cb]" />

          {/* White Flag Attached */}
          <div className="absolute top-2 left-1.5 w-36 h-24 bg-white/95 rounded-r-2xl shadow-md border border-slate-100 flex items-center justify-center">
            {/* Green Circle Checkmark Badge */}
            <div className="w-14 h-14 rounded-full bg-[#34a853] flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Authentic ABA PayWay Payment Failed Hero Banner (Matching Screenshot 2)
 */
function FailedHeroBanner({ onClose }) {
  return (
    <div className="relative w-full h-44 overflow-hidden bg-gradient-to-b from-[#fff2e0] via-[#fff5e8] to-[#fffaf2] flex items-center justify-center select-none">
      {/* Cyan/Blue Close X Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full text-[#0284c7] hover:bg-black/5 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Soft Clouds */}
      <div className="absolute top-3 left-6 w-16 h-7 bg-white/70 rounded-full blur-[1px]" />
      <div className="absolute top-5 right-12 w-24 h-9 bg-white/80 rounded-full blur-[1px]" />

      {/* Warm Dunes Horizon */}
      <svg className="absolute bottom-0 w-full h-20 text-[#fde4c3]" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0,80 Q100,20 200,60 T400,35 L400,100 L0,100 Z" fill="currentColor" opacity="0.6" />
        <path d="M0,90 Q150,45 300,75 T400,50 L400,100 L0,100 Z" fill="#fed7aa" opacity="0.8" />
      </svg>

      {/* Amber Desert Cactus 1 (Left) */}
      <svg className="absolute bottom-4 left-9 w-9 h-16 text-[#e68a35]" viewBox="0 0 50 100" fill="currentColor">
        <path d="M22,90 L28,90 L28,15 C28,11 22,11 22,15 Z" />
        <path d="M12,45 C12,58 24,58 24,58 L24,52 C24,52 16,52 16,45 L16,35 C16,32 12,32 12,35 Z" />
        <path d="M38,50 C38,62 26,62 26,62 L26,56 C26,56 34,56 34,50 L34,40 C34,37 38,37 38,40 Z" />
      </svg>

      {/* Amber Desert Cactus 2 (Right, distant) */}
      <svg className="absolute bottom-4 right-14 w-6 h-12 text-[#f59e0b]/60" viewBox="0 0 50 100" fill="currentColor">
        <path d="M22,90 L28,90 L28,15 C28,11 22,11 22,15 Z" />
        <path d="M12,45 C12,58 24,58 24,58 L24,52 C24,52 16,52 16,45 L16,35 C16,32 12,32 12,35 Z" />
      </svg>

      {/* Flagpole with White Flag & Orange Warning Triangle */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Flagpole */}
        <div className="w-1.5 h-36 bg-[#e68a35] rounded-t-sm relative shadow-sm">
          {/* Finial Spear */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#e68a35]" />

          {/* White Flag Attached */}
          <div className="absolute top-2 left-1.5 w-36 h-24 bg-white/95 rounded-r-2xl shadow-md border border-amber-100 flex items-center justify-center">
            {/* Orange Warning Triangle Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#f59e0b] flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CutLuyPaymentModal({
  isOpen,
  onClose,
  paymentData, // { id, amount, currency, reference_id, qr_string, qr_svg_url, checkout_url, expires_at }
  merchantName = 'NIGHTMARE STORE',
  purpose = 'order',
  customerEmail = 'customer@nightmare.store',
  onSuccess,
  onRetry,
}) {
  const [status, setStatus] = useState('pending'); // 'pending' | 'scanned' | 'paid' | 'expired' | 'failed'
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [qrSvg, setQrSvg] = useState('');
  const [fulfillmentData, setFulfillmentData] = useState(null);
  const [hasNotified, setHasNotified] = useState(false);

  // Initialize and render QR SVG using uqr at level 'H'
  useEffect(() => {
    if (paymentData?.qr_string) {
      try {
        const svg = renderSVG(paymentData.qr_string, { ecc: 'H' });
        setQrSvg(svg);
      } catch (err) {
        console.warn('uqr render error, falling back to svg URL:', err.message);
      }
    }
    setStatus('pending');
    setTimeLeft(300);
    setHasNotified(false);
  }, [paymentData]);

  // Expiration countdown
  useEffect(() => {
    if (!isOpen || status === 'paid' || status === 'expired') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, status]);

  const [isCheckingNow, setIsCheckingNow] = useState(false);

  // Manual Check Payment Status
  const handleManualCheck = async () => {
    if (!paymentData?.id || isCheckingNow) return;
    try {
      setIsCheckingNow(true);
      const res = await api.cutluy.checkStatus(paymentData.id);
      if (res && res.success && res.status) {
        setStatus(res.status);
        if (res.status === 'paid') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          setFulfillmentData(res.fulfillment);
          if (onSuccess && !hasNotified) {
            setHasNotified(true);
            onSuccess(res.fulfillment || res.payment || paymentData);
          }
        }
      }
    } catch (err) {
      console.warn('Manual check error:', err.message);
    } finally {
      setTimeout(() => setIsCheckingNow(false), 600);
    }
  };

  // Live Automatic Status Polling: Reads payment status from /api/payments/cutluy/status/:id every 2s
  useEffect(() => {
    if (!isOpen || !paymentData?.id) return;
    const TERMINAL = new Set(['paid', 'expired', 'failed']);
    if (TERMINAL.has(status)) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.cutluy.checkStatus(paymentData.id);
        if (res && res.success && res.status) {
          const next = res.status;
          setStatus(next);

          if (next === 'paid') {
            confetti({
              particleCount: 110,
              spread: 75,
              origin: { y: 0.6 },
            });
            setFulfillmentData(res.fulfillment);
            if (onSuccess && !hasNotified) {
              setHasNotified(true);
              onSuccess(res.fulfillment || res.payment || paymentData);
            }
          }
        }
      } catch (err) {
        // Suppress benign polling errors
        if (!err?.message?.includes('429') && !err?.message?.includes('Too many')) {
          console.warn('CutLuy polling status check notice:', err.message);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, paymentData?.id, status, onSuccess, hasNotified]);

  if (!isOpen || !paymentData) return null;

  const isDone = status === 'paid';
  const isScanned = status === 'scanned';
  const isFailed = status === 'expired' || status === 'failed';
  const showQr = !isDone && !isFailed;

  const formattedMinutes = Math.floor(timeLeft / 60);
  const formattedSeconds = String(timeLeft % 60).padStart(2, '0');
  const displayEmail = customerEmail || paymentData.customer_email || 'yourname@email.com';
  const orderRef = paymentData.reference_id || paymentData.id || '211';

  // Handle Receipt Download
  const handleDownloadReceipt = () => {
    const amountStr = `$${Number(paymentData.amount).toFixed(2)} ${paymentData.currency || 'USD'}`;
    const dateStr = new Date().toLocaleString();

    const receiptContent = `=====================================================
          NIGHTMARE STORE - OFFICIAL RECEIPT
                 ABA' PAYWAY GATEWAY
=====================================================
Transaction ID : ${paymentData.id || 'N/A'}
Order ID / Ref : ${orderRef}
Date & Time    : ${dateStr}
Payment Method : ABA KHQR (CutLuy PayWay)
Status         : SUCCESS / APPROVED
-----------------------------------------------------
Customer Email : ${displayEmail}
Type           : ${purpose === 'topup' ? 'Wallet Balance Top-Up' : 'Digital Game Key Order'}
Total Amount   : ${amountStr}
-----------------------------------------------------
Merchant       : ${merchantName}
Support        : support@nightmare.store
Website        : ${typeof window !== 'undefined' ? window.location.origin : 'https://nightmare.store'}
=====================================================
      Thank you for purchasing at NightmareStore!
=====================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${orderRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Try Again
  const handleTryAgain = () => {
    setStatus('pending');
    setTimeLeft(300);
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm"
        >
          {/* Top ABA PAYWAY Brand Label (No dark background, matching Screenshot 1 & 2) */}
          <ABAPayWayBrandHeader />

          {/* Card Container */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl border border-white/20">
            {/* SCREEN 1: ABA PAYWAY SUCCESS (Matching Screenshot 1) */}
            {isDone ? (
              <div className="bg-white">
                <SuccessHeroBanner />

                <div className="px-6 pt-5 pb-7 text-center">
                  <h1 className="text-3xl font-black text-[#111827] tracking-tight">
                    Success
                  </h1>

                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    {purpose === 'topup'
                      ? 'Top up confirmation details sent to your email:'
                      : 'Order confirmation details sent to your email:'}
                  </p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 break-all">
                    {displayEmail}
                  </p>

                  <div className="space-y-3 mt-7">
                    {/* Outline Button: Download Receipt */}
                    <button
                      onClick={handleDownloadReceipt}
                      className="w-full py-3 rounded-xl border border-[#34a853] text-[#34a853] hover:bg-[#34a853]/5 font-bold text-sm transition-all"
                    >
                      Download Receipt
                    </button>

                    {/* Solid Green Button: Continue Shopping */}
                    <button
                      onClick={() => {
                        onClose();
                        if (onSuccess && !hasNotified) {
                          setHasNotified(true);
                          onSuccess(fulfillmentData || paymentData);
                        }
                      }}
                      className="w-full py-3.5 rounded-xl bg-[#34a853] hover:bg-[#2d9249] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            ) : isFailed ? (
              /* SCREEN 2: ABA PAYWAY PAYMENT FAILED (Matching Screenshot 2) */
              <div className="bg-white">
                <FailedHeroBanner onClose={onClose} />

                <div className="px-6 pt-5 pb-7 text-center">
                  <h1 className="text-2xl font-black text-[#111827] tracking-tight">
                    Payment Failed
                  </h1>

                  <p className="text-xs text-slate-500 mt-2.5 px-3 leading-relaxed">
                    The transaction was declined by issuer bank, or user cancelled the payment.
                  </p>

                  <p className="text-xs text-slate-400 font-mono mt-3.5">
                    [Error Code: 55] [Order ID: {orderRef}]
                  </p>

                  <div className="mt-7">
                    {/* Solid Blue Button: Try Again */}
                    <button
                      onClick={handleTryAgain}
                      className="w-full py-3.5 rounded-xl bg-[#1d63b8] hover:bg-[#1855a0] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* SCREEN 3: ACTIVE SCANNING KHQR CARD */
              <div className="bg-white">
                {/* Red Header with KHQR Wordmark & Countdown */}
                <div className="flex items-center justify-between bg-red-600 px-5 py-3.5 text-white">
                  <KHQRWordmark />
                  <div className="flex items-center gap-1.5 text-xs font-semibold bg-red-700/60 px-2.5 py-1 rounded-full border border-red-400/40">
                    <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>{formattedMinutes}:{formattedSeconds}</span>
                  </div>
                </div>

                {/* Merchant & Amount Section with Dashed Tear Line */}
                <div className="relative border-b border-dashed border-gray-300 px-6 py-4 pb-3 bg-white">
                  <div className="absolute -top-px right-0 h-0 w-0 border-t-[24px] border-l-[24px] border-t-red-600 border-l-transparent pointer-events-none" />

                  <div className="flex items-center gap-2">
                    <img
                      src="/aba-blue-icon.svg"
                      alt="ABA Bank"
                      className="w-6 h-6 rounded-md object-contain shadow-sm"
                    />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      {merchantName}
                    </h3>
                  </div>

                  <div className="flex items-baseline justify-between mt-1.5">
                    <div className="flex items-baseline gap-1.5">
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                        ${Number(paymentData.amount).toFixed(2)}
                      </h2>
                      <span className="text-xs font-bold text-slate-500">
                        {paymentData.currency || 'USD'}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">
                      {purpose === 'topup' ? 'Wallet Deposit' : 'Instant Order'}
                    </span>
                  </div>
                </div>

                {/* QR Code Container with Centered Cambodian Riel Medallion */}
                <div className="relative flex items-center justify-center bg-white p-4">
                  {isScanned ? (
                    <div className="py-12 px-4 text-center space-y-2">
                      <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto animate-bounce" />
                      <h3 className="text-base font-bold text-gray-900">QR Scanned!</h3>
                      <p className="text-xs text-slate-500">Please confirm payment in your banking app.</p>
                    </div>
                  ) : (
                    <div className="relative aspect-square w-full max-w-[270px] p-2 flex items-center justify-center">
                      {qrSvg ? (
                        <div
                          className="w-full h-full [&_svg]:w-full [&_svg]:h-full [&_svg]:rounded-lg"
                          dangerouslySetInnerHTML={{ __html: qrSvg }}
                        />
                      ) : paymentData.qr_svg_url ? (
                        <img
                          src={paymentData.qr_svg_url}
                          alt="KHQR Code"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                          <span className="text-xs">Generating KHQR...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Note */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                  <p className="text-xs font-bold text-slate-700">
                    Scan with any mobile banking app
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200/60 font-semibold text-slate-600">ABA Mobile</span>
                    <span>&bull;</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200/60 font-semibold text-slate-600">Bakong</span>
                    <span>&bull;</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200/60 font-semibold text-slate-600">Any KHQR</span>
                  </div>

                  {/* Manual Re-check Action */}
                  <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-2">
                    <button
                      type="button"
                      onClick={handleManualCheck}
                      disabled={isCheckingNow}
                      className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      title="Manually verify if ABA payment went through"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isCheckingNow ? 'animate-spin' : ''}`} />
                      <span>{isCheckingNow ? 'Checking...' : 'Check Status'}</span>
                    </button>
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
