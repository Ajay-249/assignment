'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Order,
  PaymentMethodType,
  PaymentStatus,
  PaymentResponse,
} from '@/types/checkout';
import { formatPaiseToINR } from '@/lib/currency';
import {
  validateUPI,
  validateLuhn,
  validateExpiry,
  validateCVV,
} from '@/lib/validators';
import {
  getOrCreateAttemptKey,
  renewAttemptKey,
  savePendingPaymentSession,
  getPendingPaymentSession,
  clearPendingPaymentSession,
  clearAttemptKey,
} from '@/lib/idempotency';
import { Header } from '@/components/Header';
import { OrderSummary } from '@/components/OrderSummary';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { UPIPaymentForm } from '@/components/UPIPaymentForm';
import { CardPaymentForm } from '@/components/CardPaymentForm';
import { OtpModal } from '@/components/OtpModal';
import { PaymentStatusView } from '@/components/PaymentStatusView';
import { DemoToolbar } from '@/components/DemoToolbar';
import { TransactionHistoryModal } from '@/components/TransactionHistoryModal';
import { ProductDetailsStep } from '@/components/ProductDetailsStep';
import { Lock, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function CheckoutContent() {
  const params = useParams();
  const orderId = (params?.orderId as string) || 'order_149900';

  // 2-step checkout: 'review' (Product Details) | 'payment' (Payment Methods)
  const [currentStep, setCurrentStep] = useState<'review' | 'payment'>('review');

  // Transaction history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Order state
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Payment form state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState<string | undefined>();

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
  });
  const [cardErrors, setCardErrors] = useState<{
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
  }>({});

  // Payment execution state machine
  const [status, setStatus] = useState<PaymentStatus>('IDLE');
  const [paymentId, setPaymentId] = useState<string | undefined>();
  const [failureReason, setFailureReason] = useState<string | undefined>();
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [pollingCount, setPollingCount] = useState(0);

  // OTP modal state (standard for 3D-Secure Card payments)
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Developer / Reviewer Simulator Tool
  const [forcedStatus, setForcedStatus] = useState<
    'SUCCESS' | 'FAILED' | 'PENDING' | undefined
  >();

  // Guard against race conditions / double-clicks in-flight
  const isSubmittingRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop polling helper
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Poll payment status until final (SUCCESS or FAILED)
  const startPolling = useCallback(
    (activePaymentId: string) => {
      stopPolling();
      setPollingCount(1);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          setPollingCount((prev) => prev + 1);
          const res = await fetch(`/api/payments/${activePaymentId}`);
          if (!res.ok) return;

          const data = await res.json();
          if (data.status === 'SUCCESS') {
            setStatus('SUCCESS');
            clearPendingPaymentSession(orderId);
            stopPolling();
          } else if (data.status === 'FAILED') {
            setStatus('FAILED');
            setFailureReason(data.reason || 'Payment was declined by issuing bank');
            clearPendingPaymentSession(orderId);
            stopPolling();
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 1500);
    },
    [orderId, stopPolling]
  );

  // Load Order summary from mock route handler and restore pending payment if refreshed
  useEffect(() => {
    async function fetchOrderAndSession() {
      setIsLoadingOrder(true);
      setOrderError(null);

      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error('Failed to load order summary');
        }
        const data = await res.json();
        setOrder(data);

        // Initialize attempt idempotency key
        const key = getOrCreateAttemptKey(orderId);
        setIdempotencyKey(key);

        // Automatic Server & Client Payment Reconciliation:
        // If this order already has an initiated payment (settled or in-flight), restore it immediately!
        if (data.latestPayment) {
          const lp = data.latestPayment;
          setPaymentId(lp.paymentId);
          setIdempotencyKey(lp.idempotencyKey);
          setCurrentStep('payment');

          if (lp.status === 'SUCCESS') {
            setStatus('SUCCESS');
            clearPendingPaymentSession(orderId);
          } else if (lp.status === 'PENDING') {
            setStatus('PENDING');
            savePendingPaymentSession(orderId, lp.paymentId, lp.idempotencyKey);
            startPolling(lp.paymentId);
          } else if (lp.status === 'FAILED') {
            setStatus('FAILED');
            setFailureReason(lp.reason || 'Previous payment authorization declined.');
          }
        } else {
          // Fallback to local persistence
          const savedSession = getPendingPaymentSession(orderId);
          if (savedSession) {
            setPaymentId(savedSession.paymentId);
            setStatus('PENDING');
            setCurrentStep('payment');
            startPolling(savedSession.paymentId);
          }
        }
      } catch (err: unknown) {
        setOrderError(err instanceof Error ? err.message : 'Error fetching order');
      } finally {
        setIsLoadingOrder(false);
      }
    }

    fetchOrderAndSession();

    return () => {
      stopPolling();
    };
  }, [orderId, startPolling, stopPolling]);

  // Handle Card field changes
  const handleCardChange = (
    field: 'cardNumber' | 'expiry' | 'cvv' | 'nameOnCard',
    value: string
  ) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate current form before submitting
  const validateForm = (): boolean => {
    if (selectedMethod === 'upi') {
      const result = validateUPI(upiId);
      if (!result.isValid) {
        setUpiError(result.error);
        return false;
      }
      setUpiError(undefined);
      return true;
    }

    if (selectedMethod === 'card') {
      const rawCard = cardData.cardNumber.replace(/\D/g, '');
      const isLuhnValid = rawCard.length >= 12 && validateLuhn(rawCard);
      const expiryResult = validateExpiry(cardData.expiry);
      const cvvResult = validateCVV(cardData.cvv);

      const newErrors: typeof cardErrors = {};
      if (!rawCard) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!isLuhnValid) {
        newErrors.cardNumber = 'Invalid card number (Luhn checksum failed)';
      }

      if (!expiryResult.isValid) {
        newErrors.expiry = expiryResult.error;
      }

      if (!cvvResult.isValid) {
        newErrors.cvv = cvvResult.error;
      }

      setCardErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    return false;
  };

  // Perform the actual network payment call
  const executePayment = async () => {
    if (isSubmittingRef.current || !order) return;

    // Lock submission immediately to prevent duplicate requests
    isSubmittingRef.current = true;
    setStatus('PROCESSING');
    setFailureReason(undefined);

    // Reuse the attempt-specific idempotency key for this attempt
    const currentKey = getOrCreateAttemptKey(orderId);
    setIdempotencyKey(currentKey);

    try {
      const payload = {
        orderId: order.id,
        method: selectedMethod,
        upiDetails: selectedMethod === 'upi' ? { upiId } : undefined,
        cardDetails:
          selectedMethod === 'card'
            ? {
                cardNumberLast4: cardData.cardNumber.replace(/\D/g, '').slice(-4),
                cardNetwork: 'visa',
                expiry: cardData.expiry,
              }
            : undefined,
        forceStatus: forcedStatus,
      };

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': currentKey,
        },
        body: JSON.stringify(payload),
      });

      const data: PaymentResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.reason || data.message || 'Payment processing failed');
      }

      setPaymentId(data.paymentId);

      if (data.status === 'SUCCESS') {
        setStatus('SUCCESS');
        clearPendingPaymentSession(orderId);
      } else if (data.status === 'FAILED') {
        setStatus('FAILED');
        setFailureReason(data.reason || 'Payment authorization declined');
        clearPendingPaymentSession(orderId);
      } else if (data.status === 'PENDING') {
        setStatus('PENDING');
        // Persist session so page refresh resumes status check
        savePendingPaymentSession(orderId, data.paymentId, currentKey);
        startPolling(data.paymentId);
      }
    } catch (err: unknown) {
      setStatus('FAILED');
      setFailureReason(
        err instanceof Error ? err.message : 'Network error occurred. Please check connection.'
      );
    } finally {
      isSubmittingRef.current = false;
      setShowOtpModal(false);
    }
  };

  // Initial Pay button click handler
  const handlePayClick = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent action if in flight, or already verifying pending
    if (isSubmittingRef.current || status === 'PROCESSING' || status === 'PENDING') {
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Card payments always trigger the 3D-Secure Bank OTP step (Mock OTP: 123456)
    if (selectedMethod === 'card') {
      setShowOtpModal(true);
      return;
    }

    executePayment();
  };

  // Handle Try Again after terminal failure
  const handleTryAgain = () => {
    stopPolling();
    // Renew idempotency key so the user can make a genuine new attempt
    const newKey = renewAttemptKey(orderId);
    setIdempotencyKey(newKey);
    clearPendingPaymentSession(orderId);
    setStatus('IDLE');
    setFailureReason(undefined);
  };

  // Reset state to test another payment on this order
  const handleResetOrderAttempt = async () => {
    stopPolling();
    clearPendingPaymentSession(orderId);
    const newKey = renewAttemptKey(orderId);
    setIdempotencyKey(newKey);
    setStatus('IDLE');
    setFailureReason(undefined);
    setPaymentId(undefined);
    setUpiId('');
    setUpiError(undefined);
    setCardData({ cardNumber: '', expiry: '', cvv: '', nameOnCard: '' });
    setCardErrors({});
    setCurrentStep('review');
    try {
      await fetch(`/api/orders/${orderId}?reset=true`);
    } catch (err) {
      console.error('Failed to reset order:', err);
    }
  };

  // Start checkout for an entirely new fresh order
  const handleNewOrder = () => {
    stopPolling();
    clearPendingPaymentSession(orderId);
    clearAttemptKey(orderId);
    const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    window.location.href = `/checkout/order_149900_${uniqueSuffix}`;
  };

  // Reset entire state
  const handleResetState = () => {
    handleResetOrderAttempt();
  };

  const isButtonDisabled =
    status === 'PROCESSING' ||
    status === 'PENDING' ||
    status === 'SUCCESS' ||
    isLoadingOrder;

  return (
    <div className="min-h-screen ambient-glow subtle-grid text-slate-900 pb-24 selection:bg-indigo-500 selection:text-white relative">
      <Header
        orderId={order?.id}
        onOpenHistory={() => setShowHistoryModal(true)}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {isLoadingOrder && (
          <div className="py-28 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm font-semibold tracking-wide">
              Connecting to secure checkout gateway...
            </p>
          </div>
        )}

        {orderError && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-md mx-auto my-12 shadow-sm">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-rose-900 font-bold text-lg">Failed to load order</h3>
            <p className="text-rose-700 text-sm mt-1">{orderError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {order && (
          <div className="space-y-8">
            {/* 2-Step Progress Stepper */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 z-0" />
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-300 z-0 ${
                    currentStep === 'payment' ? 'w-full' : 'w-0'
                  }`}
                />

                {/* Step 1 Button */}
                <button
                  type="button"
                  onClick={() => status === 'IDLE' && setCurrentStep('review')}
                  className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    currentStep === 'review'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50'
                      : 'bg-white text-indigo-700 border border-indigo-200 shadow-xs hover:bg-indigo-50'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
                    {currentStep === 'payment' ? '✓' : '1'}
                  </span>
                  <span>1. Products Detail</span>
                </button>

                {/* Step 2 Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep('payment')}
                  className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    currentStep === 'payment'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50'
                      : 'bg-white text-slate-500 border border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>2. Payment</span>
                </button>
              </div>
            </div>

            {/* STEP 1: PRODUCTS DETAIL VIEW */}
            {currentStep === 'review' && status === 'IDLE' ? (
              <ProductDetailsStep
                order={order}
                onProceedToPayment={() => setCurrentStep('payment')}
              />
            ) : (
              /* STEP 2: PAYMENT PAGE VIEW */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                {/* Left Column: Payment Form or Status View */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Back button to Step 1 */}
                  {status === 'IDLE' && (
                    <div className="flex items-center justify-between pb-1">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('review')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>← Back to Products Detail</span>
                      </button>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Step 2 of 2: Payment
                      </span>
                    </div>
                  )}

                  {/* If terminal or in-flight status, show status view */}
                  {status !== 'IDLE' ? (
                    <PaymentStatusView
                      status={status}
                      paymentId={paymentId}
                      order={order}
                      failureReason={failureReason}
                      pollingCount={pollingCount}
                      onTryAgain={handleTryAgain}
                      onNewOrder={handleNewOrder}
                      onResetOrderAttempt={handleResetOrderAttempt}
                    />
                  ) : (
                    /* Payment Input Form */
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] space-y-7">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Complete Your Payment
                          </h1>
                          <p className="text-xs text-slate-500 mt-0.5">
                            256-bit bank encrypted • Verified merchant gateway
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Session
                        </div>
                      </div>

                  {/* Payment Method Selector */}
                  <PaymentMethodSelector
                    selectedMethod={selectedMethod}
                    onSelect={setSelectedMethod}
                    disabled={isButtonDisabled}
                  />

                  {/* Payment Details Form */}
                  <form onSubmit={handlePayClick} className="space-y-6" noValidate>
                    {selectedMethod === 'upi' ? (
                      <UPIPaymentForm
                        upiId={upiId}
                        onChange={setUpiId}
                        error={upiError}
                        setError={setUpiError}
                        disabled={isButtonDisabled}
                      />
                    ) : (
                      <>
                        <CardPaymentForm
                          formData={cardData}
                          onChange={handleCardChange}
                          errors={cardErrors}
                          setErrors={setCardErrors}
                          disabled={isButtonDisabled}
                        />
                      </>
                    )}

                    {/* Pay Button - Double payment protected */}
                    <div className="pt-2">
                      <button
                        id="pay-button"
                        type="submit"
                        disabled={isButtonDisabled}
                        className={`relative overflow-hidden w-full py-4 px-6 rounded-2xl font-black text-base text-white transition-all duration-200 shadow-xl flex items-center justify-center gap-2 group ${
                          isButtonDisabled
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] shadow-indigo-500/25 cursor-pointer'
                        }`}
                      >
                        {!isButtonDisabled && (
                          <div className="absolute inset-0 w-1/2 h-full bg-white/15 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                        )}
                        <Lock className="w-4 h-4 stroke-[2.5]" />
                        <span>Authorize & Pay {formatPaiseToINR(order.totalPaise)}</span>
                      </button>

                      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3.5 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1">🔒 100% Secure Checkout</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">⚡ Instant Settlement</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">🛡️ Anti-Duplicate Guard</span>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 sticky top-24">
              <OrderSummary order={order} />

              <div className="mt-4 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/90 text-xs text-slate-600 space-y-2 shadow-xs">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Idempotency Anti-Duplicate Guard
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Every checkout attempt generates a unique UUID attached via the{' '}
                  <code className="text-indigo-600 font-mono text-[10.5px] bg-indigo-50 px-1 py-0.5 rounded">
                    Idempotency-Key
                  </code>{' '}
                  header to eliminate double charges.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </main>

      {/* Bonus Task: Card OTP Modal */}
      {order && (
        <OtpModal
          isOpen={showOtpModal}
          amountPaise={order.totalPaise}
          last4={cardData.cardNumber.replace(/\D/g, '').slice(-4)}
          onConfirm={() => executePayment()}
          onCancel={() => setShowOtpModal(false)}
          isSubmitting={status === 'PROCESSING'}
        />
      )}

      {/* Transaction History & Audit Log Modal */}
      <TransactionHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Assessment Evaluator / Reviewer Toolbar */}
      <DemoToolbar
        forcedStatus={forcedStatus}
        setForcedStatus={setForcedStatus}
        currentIdempotencyKey={idempotencyKey}
        onReset={handleResetState}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

