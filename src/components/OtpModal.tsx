import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Sparkles, X } from 'lucide-react';
import { formatPaiseToINR } from '@/lib/currency';

interface OtpModalProps {
  isOpen: boolean;
  amountPaise: number;
  last4: string;
  onConfirm: (otp: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function OtpModal({
  isOpen,
  amountPaise,
  last4,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    if (!isOpen) return;
    setOtp('');
    setError(null);
    setSecondsLeft(120);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      setError('Invalid OTP. Use mock code 123456.');
      return;
    }
    setError(null);
    onConfirm(otp);
  };

  const handleAutofill = () => {
    setOtp('123456');
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Bank Verified Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="otp-title" className="text-sm font-semibold tracking-wide">
                Bank 3D-Secure 2.0
              </h3>
              <p className="text-[11px] text-slate-300">
                Card ending in •••• {last4 || '0366'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close OTP Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-sm text-slate-600">
              Authorizing payment of{' '}
              <span className="font-bold text-slate-900">
                {formatPaiseToINR(amountPaise)}
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Enter the 6-digit OTP sent to your registered mobile number
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                disabled={isSubmitting}
                placeholder="1 2 3 4 5 6"
                autoFocus
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 px-4 border-2 rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 flex items-center justify-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                Expires in:{' '}
                <strong className="text-slate-700 font-mono">
                  {Math.floor(secondsLeft / 60)}:
                  {(secondsLeft % 60).toString().padStart(2, '0')}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto-fill (123456)
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                'Submit OTP'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
