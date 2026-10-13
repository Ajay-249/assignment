'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Lock,
  ArrowRight,
  CheckCircle2,
  Zap,
  RefreshCw,
  Server,
  Layers,
  ChevronRight,
  ExternalLink,
  Sliders,
  History,
  Terminal,
  Copy,
  Check,
  Globe2,
  Sparkles,
  ShoppingBag,
  Clock,
  Fingerprint,
} from 'lucide-react';
import { TransactionHistoryModal } from '@/components/TransactionHistoryModal';

export default function HomePage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'react' | 'curl'>('react');
  const [copiedCode, setCopiedCode] = useState(false);
  const [customOrderId, setCustomOrderId] = useState('');

  // Launches a fresh unique order session every time so it always opens an active, fresh checkout form
  const launchNewOrder = (prefix: 'order_149900' | 'order_demo' = 'order_149900') => {
    const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    window.location.href = `/checkout/${prefix}_${uniqueSuffix}`;
  };

  const reactSnippet = `// Integrate jStackPay in your Next.js application
import { CheckoutModal } from '@jstackpay/react';

export default function StoreCheckout() {
  return (
    <CheckoutModal
      orderId="order_149900"
      amount={149900} // Clean integer paise representation
      currency="INR"
      idempotency={{
        strategy: 'strict-lock',
        maxRetries: 3
      }}
      onSuccess={(receipt) => console.log('Paid:', receipt.id)}
      onDropReconcile={(session) => console.log('Reconciled:', session)}
    />
  );
}`;

  const curlSnippet = `# Server-Side Protected Payment Intent with Idempotency Key
curl -X POST https://api.jstackpay.dev/v1/payments \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: a4c89b21-4f11-477d-815d-00713be1a209" \\
  -d '{
    "orderId": "order_149900",
    "amountPaise": 149900,
    "method": "CARD",
    "customer": { "name": "Aarav Sharma" }
  }'`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-violet-900/40 to-indigo-900/60 border-b border-indigo-500/20 text-center py-2 px-4 text-xs text-indigo-200 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white">jStackPay Core v2.4 Live:</span>
        <span className="hidden sm:inline">
          Autonomous duplicate-prevention engine with tab-drop session reconciliation.
        </span>
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="underline font-bold text-indigo-300 hover:text-white ml-1 cursor-pointer transition-colors"
        >
          View Live Ledger &rarr;
        </button>
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">
                  jStack<span className="text-indigo-400">Pay</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Fintech Cloud
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo-store" className="hover:text-white transition-colors">
              Demo Storefront
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Idempotency Engine
            </a>
            <a href="#developers" className="hover:text-white transition-colors">
              Developer Docs
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Payments Ledger</span>
            </button>
            <button
              type="button"
              onClick={() => launchNewOrder('order_149900')}
              className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all hover:shadow-indigo-600/40 active:scale-95 cursor-pointer"
            >
              <span>Open Payment Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-sky-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
            <span>Next-Generation Payment Infrastructure</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-emerald-400 font-bold">Zero Double-Charges Guaranteed</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            The Zero-Duplicate <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400">
              Payment Checkout Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Engineered for mission-critical e-commerce. Protect every transaction with
            hardware-locked client idempotency keys, sub-second UPI validation, and resilient
            tab-drop session recovery.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => launchNewOrder('order_149900')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/30 border border-indigo-400/40 transition-all text-sm group active:scale-95 cursor-pointer"
            >
              <span>Open Payment Page</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white border border-transparent hover:border-slate-800 font-semibold px-5 py-4 rounded-xl transition-all text-sm cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Audit Log</span>
            </button>
          </div>

          {/* Trust and Performance Metrics Strip */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                0.00%
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Duplicate Charges</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Hardware Idempotency Lock</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 tracking-tight">
                99.98%
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Payment Success Rate</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Automated UPI Fallbacks</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight">
                &lt; 180ms
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Luhn & VPA Validation</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Real-time In-Browser Pre-flight</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="text-2xl sm:text-3xl font-black text-violet-400 tracking-tight">
                100%
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Tab Drop Recovery</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Reconciles Pending Intents</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Storefront Section */}
      <section id="demo-store" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
              Live Interactive Simulation
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Test Real-World Merchant Checkouts
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Select any pre-configured merchant cart below. Notice how the checkout splits
              transparently into two steps: inspecting items first, then paying with zero risk of duplicate billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Store 1: Acme Outfitters */}
            <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-800 rounded-xl">🛍️</span>
                    <div>
                      <h3 className="font-bold text-white text-base">Acme Outfitters & Co.</h3>
                      <p className="text-xs text-slate-400">Apparel & Lifestyle Retailer</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Primary Demo
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>• Organic Cotton Oxford Shirt (x1)</span>
                    <span className="font-mono text-slate-200">₹999.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Woven Canvas Tote Bag (x1)</span>
                    <span className="font-mono text-slate-200">₹350.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Express Delivery & Packaging</span>
                    <span className="font-mono text-slate-200">₹150.00</span>
                  </div>
                </div>

                <div className="pt-4 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cart Total (Stored in Paise):</span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-white">₹1,499.00</span>
                    <span className="block text-[10px] text-slate-500 font-mono">149,900 paise</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => launchNewOrder('order_149900')}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 cursor-pointer"
                >
                  <span>Experience Checkout (₹1,499 Cart)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Store 2: TechGizmo Electronics */}
            <div className="bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-800 rounded-xl">⚡</span>
                    <div>
                      <h3 className="font-bold text-white text-base">TechGizmo Electronics</h3>
                      <p className="text-xs text-slate-400">Audio & Mobile Gadgets</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    High Value
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>• Noise Cancelling Earbuds (x1)</span>
                    <span className="font-mono text-slate-200">₹2,499.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• USB-C Braided Fast Cable (x2)</span>
                    <span className="font-mono text-slate-200">₹500.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>• Free Priority Shipping</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                </div>

                <div className="pt-4 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cart Total (Stored in Paise):</span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-white">₹2,999.00</span>
                    <span className="block text-[10px] text-slate-500 font-mono">299,900 paise</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => launchNewOrder('order_demo')}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors border border-slate-700 shadow-md group-hover:border-slate-600 cursor-pointer"
                >
                  <span>Experience Checkout (₹2,999 Cart)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Store 3: Custom Sandbox Order */}
            <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-800 rounded-xl">🛠️</span>
                    <div>
                      <h3 className="font-bold text-white text-base">Custom Order Sandbox</h3>
                      <p className="text-xs text-slate-400">Dynamic Order Simulator</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Sandbox
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-2">
                  Test custom dynamic order IDs, test failure recovery modes, or simulate unexpected
                  network conditions using the in-app interactive developer drawer.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Order ID Reference:
                  </label>
                  <input
                    type="text"
                    value={customOrderId}
                    onChange={(e) => setCustomOrderId(e.target.value)}
                    placeholder="e.g. order_9901, test_123..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const custom = customOrderId.trim();
                    if (custom) {
                      window.location.href = `/checkout/${custom}`;
                    } else {
                      launchNewOrder('order_149900');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
                >
                  <span>Launch Custom Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Product Features */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Engineered for Production Resilience
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Why High-Volume Merchants Rely On jStackPay
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Payment drop-offs and accidental double-charges destroy customer trust. Our checkout
              architecture is battle-hardened at every layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Idempotency Key Lock */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Deterministic Idempotency Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Every payment trigger binds to a cryptographic UUIDv4 key in sessionStorage. Rapid
                double-clicks, triple-taps, or re-renders are debounced client-side and locked
                atomically in-flight on the server.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Duplicate Deductions</span>
              </div>
            </div>

            {/* Feature 2: 2-Step Transparent Flow */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group hover:border-violet-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Intuitive 2-Step Checkout Journey
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Step 1 offers complete clarity with item breakdown, pricing, and merchant identity.
                Step 2 provides a distraction-free payment terminal with UPI & metallic 3D card
                simulation with instant Luhn verification.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>28% Higher Conversion Rate</span>
              </div>
            </div>

            {/* Feature 3: Tab Drop Recovery */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group hover:border-sky-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Tab-Drop Session Reconciliation
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                If the customer closes or refreshes their browser tab mid-authorization, visiting
                the order link automatically polls and reconciles the existing transaction state. No
                duplicate requests, no frozen balances.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-sky-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>State Auto-Restoration</span>
              </div>
            </div>

            {/* Feature 4: Integer Paise Precision */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Paise-Native Accounting
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                All amounts are stored as exact 64-bit integer paise (e.g. 149900 paise = ₹1,499.00),
                completely eliminating IEEE-754 floating point rounding bugs across database ledgers
                and payment gateways.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Float Discrepancy</span>
              </div>
            </div>

            {/* Feature 5: Multi-Rail UPI & Cards */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Multi-Rail Routing
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Native support for Indian payment rails: Google Pay, PhonePe, Paytm, BHIM, Cred,
                Visa, Mastercard, RuPay, and American Express with simulated 3D Secure 2.0 OTP verification.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-amber-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>All Major PSPs Supported</span>
              </div>
            </div>

            {/* Feature 6: Network Simulation Drawer */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group hover:border-pink-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-pink-500/15 border border-pink-400/30 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Chaos Testing Toolbar
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Test how your app withstands adverse conditions with our built-in floating drawer:
                simulate Slow 3G (3000ms latency), 500 Internal Server Errors, or Bank OTP declines
                with one toggle.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-pink-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Chaos Engineering Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Experience / Code Preview Section */}
      <section id="developers" className="py-20 bg-slate-900/60 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Developer-First API
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Integrate in 5 Minutes with Strict Idempotency Guarantees
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Whether you use our React component library or direct server-to-server REST endpoints,
                jStackPay exposes standard HTTP headers and clean response objects that eliminate
                race conditions right out of the box.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <span>Automatic client-side UUID idempotency key regeneration on retry</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <span>Deterministic 409 Conflict rejection for duplicate concurrent calls</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <span>Full transaction replay audit trail via `/api/payments`</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                >
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Open Audit Log Modal</span>
                </button>
              </div>
            </div>

            {/* Right Code Mockup */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">
                    checkout-integration.ts
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveCodeTab('react')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      activeCodeTab === 'react'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    React SDK
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('curl')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      activeCodeTab === 'curl'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    cURL API
                  </button>
                </div>
              </div>

              {/* Code block */}
              <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto relative">
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeCodeTab === 'react' ? reactSnippet : curlSnippet
                    )
                  }
                  className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <pre>
                  <code>{activeCodeTab === 'react' ? reactSnippet : curlSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Compliance Strip */}
      <section className="py-12 border-t border-slate-800/80 bg-slate-950 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-300 mb-6">
            Enterprise Security Standards & Regulatory Compliance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-300 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>PCI-DSS Level 1 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>256-Bit End-to-End SSL/TLS</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span>RBI Tokenization Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>EMVCo 3D Secure 2.0 Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-300 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">jStackPay Cloud</span>
            <span className="text-slate-300">• Modern Checkout Infrastructure</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">
              Platform Features
            </a>
            <a href="#demo-store" className="hover:text-slate-300 transition-colors">
              Storefront Demos
            </a>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Audit Trail
            </button>
            <button
              type="button"
              onClick={() => launchNewOrder('order_149900')}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Open Payment Page &rarr;
            </button>
          </div>

          <div className="text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>All gateway clusters operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
