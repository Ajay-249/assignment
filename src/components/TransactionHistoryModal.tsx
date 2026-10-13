import React, { useState, useEffect } from 'react';
import { PaymentRecord } from '@/types/checkout';
import { formatPaiseToINR } from '@/lib/currency';
import {
  History,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  CreditCard,
  Smartphone,
} from 'lucide-react';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionHistoryModal({
  isOpen,
  onClose,
}: TransactionHistoryModalProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 id="history-modal-title" className="font-bold text-slate-900 text-base">
                Payments History & Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                In-memory database records & idempotency registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchHistory}
              disabled={isLoading}
              className="text-xs text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:bg-slate-50 p-2 rounded-lg flex items-center gap-1 transition-colors"
              title="Refresh transaction history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-medium">No transactions recorded yet in this server session.</p>
              <p className="text-xs">Complete a checkout to see records populate here.</p>
            </div>
          ) : (
            payments.map((p) => {
              const isSuccess = p.status === 'SUCCESS';
              const isFailed = p.status === 'FAILED';
              const isPending = p.status === 'PENDING';

              return (
                <div
                  key={p.paymentId}
                  className="p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatPaiseToINR(p.amountPaise)}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          #{p.orderId}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px] block">
                        ID: {p.paymentId}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isSuccess && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" /> Pending Verification
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" /> Declined
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500 gap-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        {p.method === 'upi' ? (
                          <Smartphone className="w-3 h-3 text-indigo-500" />
                        ) : (
                          <CreditCard className="w-3 h-3 text-violet-500" />
                        )}
                        {p.method.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{new Date(p.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Full Idempotency Key Box */}
                  <div className="bg-slate-100/90 rounded-lg p-2 border border-slate-200 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Key className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="text-[10px] text-slate-500 shrink-0 font-medium">Idempotency Key:</span>
                      <span className="font-mono text-[10.5px] text-slate-800 break-all select-all font-medium">
                        {p.idempotencyKey}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(p.idempotencyKey);
                          setCopiedKey(p.idempotencyKey);
                          setTimeout(() => setCopiedKey(null), 1500);
                        }
                      }}
                      className="shrink-0 text-[10px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                    >
                      {copiedKey === p.idempotencyKey ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {p.reason && (
                    <p className="text-[11px] text-rose-600 bg-rose-50/80 p-1.5 rounded-md border border-rose-100">
                      Reason: {p.reason}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Records are retained in server memory and cross-referenced by <strong>Idempotency-Key</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
