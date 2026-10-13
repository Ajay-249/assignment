import React from 'react';
import { PaymentMethodType } from '@/types/checkout';
import { Smartphone, CreditCard, Check, Zap } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelect: (method: PaymentMethodType) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Payment Method
        </label>
        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <Zap className="w-3 h-3 text-emerald-600" /> Instant Processing
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method selection">
        {/* UPI Option */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedMethod === 'upi'}
          disabled={disabled}
          onClick={() => onSelect('upi')}
          className={`relative flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
            selectedMethod === 'upi'
              ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-600/20'
              : 'border-slate-200/90 bg-white hover:border-slate-300 text-slate-700 hover:shadow-xs'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selectedMethod === 'upi'
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Smartphone className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block font-bold text-sm tracking-tight text-slate-900">
              UPI Apps
            </span>
            <span className="block text-xs text-slate-500 truncate mt-0.5">
              GPay, PhonePe, Paytm
            </span>
          </div>
          {selectedMethod === 'upi' && (
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </button>

        {/* Card Option */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedMethod === 'card'}
          disabled={disabled}
          onClick={() => onSelect('card')}
          className={`relative flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
            selectedMethod === 'card'
              ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-600/20'
              : 'border-slate-200/90 bg-white hover:border-slate-300 text-slate-700 hover:shadow-xs'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selectedMethod === 'card'
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block font-bold text-sm tracking-tight text-slate-900">
              Credit / Debit
            </span>
            <span className="block text-xs text-slate-500 truncate mt-0.5">
              Visa, Mastercard, RuPay
            </span>
          </div>
          {selectedMethod === 'card' && (
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
