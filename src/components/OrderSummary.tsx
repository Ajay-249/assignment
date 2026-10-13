import React, { useState } from 'react';
import { Order } from '@/types/checkout';
import { formatPaiseToINR } from '@/lib/currency';
import { ShoppingBag, Store, ShieldCheck, ChevronDown, ChevronUp, Tag } from 'lucide-react';

interface OrderSummaryProps {
  order: Order;
}

export function OrderSummary({ order }: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] overflow-hidden transition-all">
      {/* Merchant Header */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              {order.merchantLogo || <Store className="w-5 h-5 text-indigo-300" />}
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                Merchant Gateway
              </span>
              <h2 className="font-bold text-white text-base tracking-tight">
                {order.merchantName}
              </h2>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
          </span>
        </div>
      </div>

      {/* Main Total Amount Box */}
      <div className="p-6 border-b border-slate-100 flex items-baseline justify-between bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/30">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Payable Amount
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Inclusive of all taxes & delivery fees
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {formatPaiseToINR(order.totalPaise)}
          </span>
        </div>
      </div>

      {/* Items Breakdown Accordion */}
      <div className="p-5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
          aria-expanded={isExpanded}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
            Order Line Items ({order.items.reduce((acc, item) => acc + item.quantity, 0)})
          </span>
          <span className="flex items-center text-xs text-indigo-600 font-bold capitalize gap-1">
            {isExpanded ? 'Hide items' : 'View breakdown'}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {/* Item List */}
        <div className={`mt-3.5 space-y-2.5 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100/80 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200/80">
                  {item.quantity}×
                </span>
                <span className="text-slate-800 font-medium text-sm">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900 text-sm">
                {formatPaiseToINR(item.pricePaise * item.quantity)}
              </span>
            </div>
          ))}

          {/* Subtotals & Fees */}
          <div className="pt-3 mt-2 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="text-slate-800 font-medium">{formatPaiseToINR(order.subtotalPaise)}</span>
            </div>
            {order.deliveryPaise > 0 && (
              <div className="flex justify-between">
                <span>Shipping & Packaging</span>
                <span className="text-slate-800 font-medium">{formatPaiseToINR(order.deliveryPaise)}</span>
              </div>
            )}
            {order.taxPaise > 0 && (
              <div className="flex justify-between">
                <span>Estimated GST</span>
                <span className="text-slate-800 font-medium">{formatPaiseToINR(order.taxPaise)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
