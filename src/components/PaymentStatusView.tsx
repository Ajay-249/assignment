import React from 'react';
import { PaymentStatus, Order } from '@/types/checkout';
import { formatPaiseToINR } from '@/lib/currency';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface PaymentStatusViewProps {
  status: PaymentStatus;
  paymentId?: string;
  order: Order;
  failureReason?: string;
  pollingCount?: number;
  onTryAgain: () => void;
  onNewOrder: () => void;
  onResetOrderAttempt: () => void;
}

export function PaymentStatusView({
  status,
  paymentId,
  order,
  failureReason,
  pollingCount = 0,
  onTryAgain,
  onNewOrder,
  onResetOrderAttempt,
}: PaymentStatusViewProps) {
  if (status === 'IDLE') return null;

  // Processing state before initial API response
  if (status === 'PROCESSING') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs space-y-5 animate-in fade-in">
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <Loader2 className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Initiating Payment...
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Securing payment token, validating idempotency, and contacting payment gateway.
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 max-w-xs mx-auto border border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Payment attempt protected against duplicates
        </div>
      </div>
    );
  }

  // PENDING state - continuously polling
  if (status === 'PENDING') {
    return (
      <div className="bg-white rounded-2xl border border-amber-200/80 p-8 text-center shadow-xs space-y-6 animate-in fade-in">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-amber-600">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Status: In-Flight Verification
          </span>
          <h3 className="text-xl font-bold text-slate-900">
            We are confirming your payment
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your transaction has reached the banking network. We are actively polling the settlement gateway until final confirmation.
          </p>
        </div>

        {/* Polling heartbeat indicator */}
        <div className="bg-slate-50 rounded-xl p-4 max-w-md mx-auto border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>Payment ID: {paymentId || 'Checking...'}</span>
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Polling check #{pollingCount}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full w-2/3 animate-pulse" />
          </div>
          <p className="text-[11px] text-amber-700 font-medium text-left">
            ⚠️ Please do not close this window or refresh. Payment will finalize in a few seconds.
          </p>
        </div>

        {/* Explicitly DO NOT offer to pay again meanwhile */}
        <div className="text-xs text-slate-400 italic">
          (New payment attempts are disabled while verification is in progress)
        </div>
      </div>
    );
  }

  // SUCCESS state
  if (status === 'SUCCESS') {
    return (
      <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center shadow-lg shadow-emerald-500/5 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Confirmed
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
            Payment of {formatPaiseToINR(order.totalPaise)} Successful!
          </h3>
          <p className="text-sm text-slate-600">
            Your payment to <strong className="text-slate-800">{order.merchantName}</strong> was processed successfully.
          </p>
        </div>

        {/* Receipt breakdown */}
        <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/70 text-left space-y-2.5 max-w-md mx-auto text-xs">
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-mono font-semibold text-slate-800">{paymentId}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Order Reference</span>
            <span className="font-mono font-semibold text-slate-800">#{order.id}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Amount Charged</span>
            <span className="font-bold text-slate-900 text-sm">
              {formatPaiseToINR(order.totalPaise)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Timestamp</span>
            <span className="text-slate-700">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <button
            type="button"
            onClick={onNewOrder}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            Pay New Order (New Order ID) <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onResetOrderAttempt}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Re-test this Order
          </button>
        </div>
      </div>
    );
  }

  // FAILED state
  if (status === 'FAILED') {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-lg shadow-rose-500/5 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-rose-50 border-4 border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <XCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Transaction Declined
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
            Payment Failed
          </h3>
          <p className="text-sm text-slate-600">
            We could not complete your payment for {formatPaiseToINR(order.totalPaise)}.
          </p>
        </div>

        {/* Reason banner */}
        <div className="bg-rose-50 rounded-xl p-4 border border-rose-200 text-left max-w-md mx-auto flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-900 uppercase">Reason for failure</h4>
            <p className="text-sm text-rose-800 font-medium mt-0.5">
              {failureReason || 'Bank gateway rejected the authorization request.'}
            </p>
          </div>
        </div>

        {/* Actions: "Try again" */}
        <div className="pt-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={onTryAgain}
            className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <p className="text-xs text-slate-400 mt-2">
            Clicking &quot;Try Again&quot; initializes a fresh payment attempt with a new idempotency key.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
