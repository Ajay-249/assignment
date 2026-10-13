import React, { useState } from 'react';
import {
  validateLuhn,
  detectCardNetwork,
  formatCardNumber,
  validateExpiry,
  formatExpiry,
  validateCVV,
} from '@/lib/validators';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Wifi,
} from 'lucide-react';

interface CardFormState {
  cardNumber: string;
  expiry: string;
  cvv: string;
  nameOnCard: string;
}

interface CardErrors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

interface CardPaymentFormProps {
  formData: CardFormState;
  onChange: (field: keyof CardFormState, value: string) => void;
  errors: CardErrors;
  setErrors: React.Dispatch<React.SetStateAction<CardErrors>>;
  disabled?: boolean;
}

export function CardPaymentForm({
  formData,
  onChange,
  errors,
  setErrors,
  disabled = false,
}: CardPaymentFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isCvvFocused, setIsCvvFocused] = useState(false);
  const network = detectCardNetwork(formData.cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    onChange('cardNumber', formatted);

    if (touched.cardNumber) {
      const rawDigits = formatted.replace(/\D/g, '');
      if (rawDigits.length >= 12) {
        const isValid = validateLuhn(rawDigits);
        setErrors((prev) => ({
          ...prev,
          cardNumber: isValid ? undefined : 'Invalid card number (Luhn checksum failed)',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          cardNumber: rawDigits.length > 0 ? 'Card number is too short' : 'Card number is required',
        }));
      }
    }
  };

  const handleCardNumberBlur = () => {
    setTouched((prev) => ({ ...prev, cardNumber: true }));
    const rawDigits = formData.cardNumber.replace(/\D/g, '');
    if (!rawDigits) {
      setErrors((prev) => ({ ...prev, cardNumber: 'Card number is required' }));
    } else if (rawDigits.length < 12) {
      setErrors((prev) => ({ ...prev, cardNumber: 'Card number is too short' }));
    } else {
      const isValid = validateLuhn(rawDigits);
      setErrors((prev) => ({
        ...prev,
        cardNumber: isValid ? undefined : 'Invalid card number (Luhn checksum failed)',
      }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    onChange('expiry', formatted);

    if (touched.expiry) {
      const res = validateExpiry(formatted);
      setErrors((prev) => ({ ...prev, expiry: res.isValid ? undefined : res.error }));
    }
  };

  const handleExpiryBlur = () => {
    setTouched((prev) => ({ ...prev, expiry: true }));
    const res = validateExpiry(formData.expiry);
    setErrors((prev) => ({ ...prev, expiry: res.isValid ? undefined : res.error }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, network === 'amex' ? 4 : 3);
    onChange('cvv', digits);

    if (touched.cvv) {
      const res = validateCVV(digits, network === 'amex');
      setErrors((prev) => ({ ...prev, cvv: res.isValid ? undefined : res.error }));
    }
  };

  const handleCvvBlur = () => {
    setIsCvvFocused(false);
    setTouched((prev) => ({ ...prev, cvv: true }));
    const res = validateCVV(formData.cvv, network === 'amex');
    setErrors((prev) => ({ ...prev, cvv: res.isValid ? undefined : res.error }));
  };

  const autoFillDemoCard = () => {
    if (disabled) return;
    onChange('cardNumber', '4532 0151 1283 0366');
    onChange('expiry', '12/28');
    onChange('cvv', '888');
    onChange('nameOnCard', 'ANANYA SHARMA');
    setTouched({ cardNumber: true, expiry: true, cvv: true });
    setErrors({});
  };

  const isCardNumberValid =
    touched.cardNumber &&
    !errors.cardNumber &&
    formData.cardNumber.replace(/\D/g, '').length >= 12 &&
    validateLuhn(formData.cardNumber.replace(/\D/g, ''));

  // Masked visual preview
  const displayCardNumber = () => {
    if (!formData.cardNumber) return '•••• •••• •••• ••••';
    const clean = formData.cardNumber.padEnd(19, '•');
    return clean;
  };

  return (
    <div className="space-y-6">
      {/* Interactive Visual Credit Card Component */}
      <div className="relative mx-auto max-w-sm sm:max-w-md w-full">
        {/* Glow ambient background behind the card */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/25 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />

        <div className="relative rounded-2xl p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-white/15 overflow-hidden transition-all duration-300 transform hover:scale-[1.01]">
          {/* Hologram sheen gloss reflection */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Top row: EMV Chip, Contactless icon & Network Brand */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              {/* Metallic EMV Chip */}
              <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-300/60 shadow-inner flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 border border-black/15 rounded-xs" />
                <div className="w-full h-[1px] bg-amber-700/30" />
                <div className="h-full w-[1px] bg-amber-700/30 absolute" />
              </div>
              <Wifi className="w-5 h-5 text-slate-400 rotate-90 stroke-[1.8]" />
            </div>

            {/* Dynamic Network Logo */}
            <div className="text-right">
              {network === 'visa' && (
                <span className="font-black italic text-xl tracking-wider text-white drop-shadow-sm">
                  VISA
                </span>
              )}
              {network === 'mastercard' && (
                <div className="flex items-center -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-rose-500/90 shadow-xs" />
                  <div className="w-6 h-6 rounded-full bg-amber-400/90 shadow-xs" />
                </div>
              )}
              {network === 'rupay' && (
                <span className="font-extrabold text-sm tracking-wider uppercase text-emerald-400 border border-emerald-400/40 px-2 py-0.5 rounded-md bg-emerald-950/40">
                  RuPay
                </span>
              )}
              {network === 'amex' && (
                <span className="font-bold text-xs tracking-widest text-sky-300 border border-sky-400/50 px-2 py-0.5 rounded bg-sky-950/40 uppercase">
                  AMEX
                </span>
              )}
              {network === 'unknown' && (
                <span className="text-[11px] font-mono text-slate-400 bg-white/10 px-2 py-1 rounded-md tracking-wider">
                  DEBIT / CREDIT
                </span>
              )}
            </div>
          </div>

          {/* Card Number Line */}
          <div className="mb-6">
            <div className="text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-1">
              Card Number
            </div>
            <div className="font-mono text-lg sm:text-xl tracking-[0.18em] font-semibold text-slate-100 drop-shadow-md select-all">
              {displayCardNumber()}
            </div>
          </div>

          {/* Bottom row: Cardholder Name, Expiry & CVV preview */}
          <div className="flex items-end justify-between pt-1 border-t border-white/10">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                Cardholder
              </div>
              <div className="font-medium text-xs sm:text-sm text-slate-100 uppercase tracking-wide truncate max-w-[170px]">
                {formData.nameOnCard || 'ANANYA SHARMA'}
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                  Expires
                </div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-slate-100">
                  {formData.expiry || 'MM/YY'}
                </div>
              </div>

              {isCvvFocused && (
                <div className="bg-amber-400/20 border border-amber-300/40 px-2 py-0.5 rounded text-right animate-pulse">
                  <div className="text-[8px] uppercase tracking-widest text-amber-200 font-mono">CVV</div>
                  <div className="font-mono text-xs font-bold text-amber-300">
                    {formData.cvv ? '•••' : '---'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Demo Autofill Bar */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          End-to-end tokenized card gateway
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={autoFillDemoCard}
          className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 px-3 py-1.5 rounded-lg border border-indigo-200/80 font-semibold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Auto-fill Valid Test Card
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Card Number Field */}
        <div>
          <label
            htmlFor="card-number-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Card Number
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <CreditCard className="w-5 h-5" />
            </div>
            <input
              id="card-number-input"
              name="cardNumber"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              disabled={disabled}
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              onBlur={handleCardNumberBlur}
              placeholder="4532  ••••  ••••  0366"
              aria-invalid={!!errors.cardNumber}
              aria-describedby={errors.cardNumber ? 'card-number-error' : undefined}
              className={`w-full pl-11 pr-11 py-3.5 rounded-xl border font-mono text-sm tracking-wider text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white placeholder-slate-400 transition-all outline-none ${
                errors.cardNumber
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                  : isCardNumberValid
                  ? 'border-emerald-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-emerald-50/10'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
              } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {isCardNumberValid && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {errors.cardNumber && <AlertCircle className="w-5 h-5 text-rose-500" />}
            </div>
          </div>
          {errors.cardNumber && (
            <p
              id="card-number-error"
              role="alert"
              className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.cardNumber}
            </p>
          )}
        </div>

        {/* Expiry & CVV Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Expiry MM/YY */}
          <div>
            <label
              htmlFor="expiry-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Expiry Date
            </label>
            <input
              id="expiry-input"
              name="expiry"
              type="text"
              inputMode="numeric"
              maxLength={5}
              autoComplete="cc-exp"
              disabled={disabled}
              value={formData.expiry}
              onChange={handleExpiryChange}
              onBlur={handleExpiryBlur}
              placeholder="MM / YY"
              aria-invalid={!!errors.expiry}
              aria-describedby={errors.expiry ? 'expiry-error' : undefined}
              className={`w-full px-4 py-3.5 rounded-xl border font-mono text-sm text-center text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white placeholder-slate-400 transition-all outline-none ${
                errors.expiry
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                  : touched.expiry && !errors.expiry && formData.expiry
                  ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/10'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
              } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
            />
            {errors.expiry && (
              <p
                id="expiry-error"
                role="alert"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.expiry}
              </p>
            )}
          </div>

          {/* CVV */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="cvv-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Security Code
              </label>
              <span
                title="3-digit CVV on back of card"
                className="text-[11px] text-slate-400 flex items-center gap-0.5 cursor-help"
              >
                <HelpCircle className="w-3 h-3" />
              </span>
            </div>
            <div className="relative">
              <input
                id="cvv-input"
                name="cvv"
                type="password"
                inputMode="numeric"
                maxLength={network === 'amex' ? 4 : 3}
                autoComplete="cc-csc"
                disabled={disabled}
                value={formData.cvv}
                onChange={handleCvvChange}
                onFocus={() => setIsCvvFocused(true)}
                onBlur={handleCvvBlur}
                placeholder="•••"
                aria-invalid={!!errors.cvv}
                aria-describedby={errors.cvv ? 'cvv-error' : undefined}
                className={`w-full px-4 py-3.5 rounded-xl border font-mono text-sm text-center tracking-widest text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white placeholder-slate-400 transition-all outline-none ${
                  errors.cvv
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                    : touched.cvv && !errors.cvv && formData.cvv
                    ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/10'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
            {errors.cvv && (
              <p
                id="cvv-error"
                role="alert"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.cvv}
              </p>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label
            htmlFor="name-on-card-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Name on Card <span className="text-[11px] text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            id="name-on-card-input"
            name="nameOnCard"
            type="text"
            autoComplete="cc-name"
            disabled={disabled}
            value={formData.nameOnCard}
            onChange={(e) => onChange('nameOnCard', e.target.value.toUpperCase())}
            placeholder="e.g. ANANYA SHARMA"
            className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium tracking-wide text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white placeholder-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none uppercase ${
              disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
}
