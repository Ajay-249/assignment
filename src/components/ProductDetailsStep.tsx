import React from 'react';
import { Order } from '@/types/checkout';
import { formatPaiseToINR } from '@/lib/currency';
import {
  ShoppingBag,
  Store,
  ShieldCheck,
  ArrowRight,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProductDetailsStepProps {
  order: Order;
  onProceedToPayment: () => void;
}

export function ProductDetailsStep({
  order,
  onProceedToPayment,
}: ProductDetailsStepProps) {
  const totalItemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Merchant Spotlight Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {order.merchantLogo || <Store className="w-6 h-6 text-indigo-300" />}
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                Verified Seller
              </span>
              <h2 className="font-extrabold text-white text-lg tracking-tight">
                {order.merchantName}
              </h2>
            </div>
          </div>

          <div className="relative flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authorized Merchant
            </span>
          </div>
        </div>

        {/* Order Reference and Date */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200/70 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span>Order Reference:</span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              #{order.id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Ready for checkout</span>
          </div>
        </div>

        {/* Items Detailed List */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              Products in this Order ({totalItemCount})
            </h3>
            <span className="text-xs text-slate-400 font-medium">Standard Delivery</span>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, index) => (
              <div
                key={item.id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200/70 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    0{index + 1}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Quantity: <span className="font-semibold text-slate-700">{item.quantity}</span> unit{item.quantity > 1 ? 's' : ''} • Single item: {formatPaiseToINR(item.pricePaise)}
                    </p>
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto">
                  <span className="font-black text-slate-900 text-base tracking-tight">
                    {formatPaiseToINR(item.pricePaise * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown Card */}
          <div className="pt-6 border-t border-slate-200/80 space-y-3">
            <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/70 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-900 font-bold text-sm">{formatPaiseToINR(order.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  Express Delivery & Handling
                </span>
                <span className="text-slate-900 font-semibold">
                  {order.deliveryPaise > 0 ? formatPaiseToINR(order.deliveryPaise) : 'Free'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Applicable GST / Taxes</span>
                <span className="text-slate-900 font-semibold">
                  {order.taxPaise > 0 ? formatPaiseToINR(order.taxPaise) : 'Included in price'}
                </span>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-slate-900">
                <div>
                  <span className="font-extrabold text-sm uppercase tracking-wider block">
                    Total Payable Amount
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">
                    {formatPaiseToINR(order.totalPaise)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Genuine Items</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5 text-xs text-slate-600">
              <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Easy 7-Day Returns</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0" />
              <span>Buyer Protection Guard</span>
            </div>
          </div>

          {/* Big Call-to-action button */}
          <div className="pt-4">
            <button
              id="proceed-to-payment-button"
              type="button"
              onClick={onProceedToPayment}
              className="relative overflow-hidden w-full py-4 px-6 rounded-2xl font-black text-base text-white transition-all duration-200 shadow-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] shadow-indigo-500/25 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/15 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              <span>Proceed to Payment ({formatPaiseToINR(order.totalPaise)})</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
              🔒 You will select UPI or Card on the next payment page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
