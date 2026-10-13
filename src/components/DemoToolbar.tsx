import React, { useState } from 'react';
import { Settings, Zap, Key, RefreshCw } from 'lucide-react';

interface DemoToolbarProps {
  forcedStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | undefined;
  setForcedStatus: (status: 'SUCCESS' | 'FAILED' | 'PENDING' | undefined) => void;
  currentIdempotencyKey: string;
  onReset: () => void;
}

export function DemoToolbar({
  forcedStatus,
  setForcedStatus,
  currentIdempotencyKey,
  onReset,
}: DemoToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-auto flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-xl hover:bg-slate-800 transition-all border border-slate-700"
        title="Toggle Reviewer Tools"
      >
        <Settings className={`w-3.5 h-3.5 ${isOpen ? 'rotate-90' : ''} transition-transform`} />
        <span>Reviewer Controls</span>
        {forcedStatus && (
          <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
            {forcedStatus}
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {isOpen && (
        <div className="mt-2 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700 text-xs space-y-3 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold flex items-center gap-1.5 text-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Assessment Simulator
            </span>
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Reset state
            </button>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 text-[11px] font-medium">
              Mock Payment Outcome:
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { label: 'Random', val: undefined },
                  { label: 'Pending', val: 'PENDING' },
                  { label: 'Success', val: 'SUCCESS' },
                  { label: 'Failed', val: 'FAILED' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setForcedStatus(opt.val)}
                  className={`py-1 px-1.5 rounded-lg text-center font-medium transition-all ${
                    forcedStatus === opt.val
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Select <strong>Pending</strong> to easily test the ~5s transition and tab refresh recovery!
            </p>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <span className="text-slate-400 text-[10px] flex items-center gap-1 mb-1">
              <Key className="w-3 h-3 text-indigo-400" /> Active Idempotency Key:
            </span>
            <div className="bg-slate-950 p-1.5 rounded font-mono text-[10px] text-indigo-300 truncate select-all border border-slate-800">
              {currentIdempotencyKey}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
