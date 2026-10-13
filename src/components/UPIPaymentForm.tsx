import React, { useState } from 'react';
import { validateUPI } from '@/lib/validators';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface UPIPaymentFormProps {
  upiId: string;
  onChange: (value: string) => void;
  error?: string;
  setError: (error?: string) => void;
  disabled?: boolean;
}

const POPULAR_APPS = [
  { name: 'GPay', handle: '@okhdfcbank', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'PhonePe', handle: '@ybl', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Paytm', handle: '@paytm', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { name: 'BHIM Axis', handle: '@okaxis', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export function UPIPaymentForm({
  upiId,
  onChange,
  error,
  setError,
  disabled = false,
}: UPIPaymentFormProps) {
  const [touched, setTouched] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    onChange(val);

    if (touched) {
      const result = validateUPI(val);
      setError(result.isValid ? undefined : result.error);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const result = validateUPI(upiId);
    setError(result.isValid ? undefined : result.error);
  };

  const appendHandle = (handle: string) => {
    if (disabled) return;
    const base = upiId.includes('@') ? upiId.split('@')[0] : upiId;
    const newId = `${base || 'ananya.sharma'}${handle}`;
    onChange(newId);
    setTouched(true);
    const result = validateUPI(newId);
    setError(result.isValid ? undefined : result.error);
  };

  const isValid = touched && !error && upiId.length > 0;

  return (
    <div className="space-y-5">
      {/* Manual UPI ID Input */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="upi-id-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Virtual Payment Address (VPA) / UPI ID
            </label>
            <span className="text-[11px] text-slate-400 font-mono">format: name@bank</span>
          </div>

          <div className="relative">
            <input
              id="upi-id-input"
              name="upiId"
              type="text"
              inputMode="email"
              autoComplete="off"
              spellCheck={false}
              value={upiId}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder="e.g. ananya.sharma@okhdfcbank"
              aria-invalid={!!error}
              aria-describedby={error ? 'upi-error' : undefined}
              className={`w-full px-4 py-3.5 rounded-xl border text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white placeholder-slate-400 font-mono text-sm transition-all outline-none ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                  : isValid
                  ? 'border-emerald-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-emerald-50/10'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
              } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
            />

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {isValid && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {error && <AlertCircle className="w-5 h-5 text-rose-500" />}
            </div>
          </div>

          {error && (
            <p
              id="upi-error"
              role="alert"
              className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Quick Bank App Handle Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Popular Bank Providers:
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange('ananya.sharma@okhdfcbank');
                setTouched(true);
                setError(undefined);
              }}
              className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/80 font-semibold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" /> Auto-fill Demo UPI
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POPULAR_APPS.map((app) => (
              <button
                key={app.name}
                type="button"
                disabled={disabled}
                onClick={() => appendHandle(app.handle)}
                className={`py-2 px-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 ${app.color}`}
              >
                <span className="block font-bold text-xs">{app.name}</span>
                <span className="block text-[10px] font-mono opacity-80 truncate">{app.handle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trust reassurance */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          A collect request will be sent to your UPI handle. Approve in your banking app.
        </span>
      </div>
    </div>
  );
}
