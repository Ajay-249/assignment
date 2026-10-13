import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, CreditCard, History } from 'lucide-react';

interface HeaderProps {
  orderId?: string;
  onOpenHistory?: () => void;
}

export function Header({ orderId, onOpenHistory }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-30 shadow-lg shadow-black/15 text-white transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand identity - Clickable link to Homepage */}
        <Link
          href="/"
          className="flex items-center gap-3 group hover:opacity-95 transition-all cursor-pointer"
          title="Return to jStackPay Homepage"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 border border-indigo-400/30 group-hover:scale-105 group-hover:shadow-indigo-500/50 transition-all">
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                jStack<span className="text-indigo-400 group-hover:text-indigo-300">Pay</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30 backdrop-blur-xs">
                Fintech Cloud
              </span>
            </div>
            {orderId && (
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                Ref: <span className="font-semibold text-slate-200">#{orderId}</span>
              </p>
            )}
          </div>
        </Link>

        {/* Right action badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-3.5 py-1.5 rounded-xl border border-indigo-400/40 font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/25 active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-white" />
              <span>Payments History</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-Bit SSL
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-xs">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            PCI-DSS Level 1
          </div>
        </div>
      </div>
    </header>
  );
}
