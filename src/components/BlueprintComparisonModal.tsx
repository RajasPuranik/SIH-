import React from 'react';
import { X, CheckCircle2, ShieldCheck, TrendingUp, Building2, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BlueprintComparisonModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌾</span>
            <div>
              <h3 className="font-bold text-base">KisanTrack (KisanSetu) - Architecture Blueprint Compliance</h3>
              <p className="text-xs text-slate-400">Exact Feature Mapping to the Dual-Pillar Ecosystem</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 Mapping */}
            <div className="border border-emerald-300 rounded-xl p-4 bg-emerald-50/40 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">PILLAR 1: GOVT PROCUREMENT</h4>
                  <span className="text-[11px] text-emerald-700 font-medium">Target: Sell at MSP (Minimum Support Price)</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Blueprint Features Implemented:
                </span>
                <ul className="space-y-1.5 text-slate-700 font-medium">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Slot booking:</strong> State/District/Mandi picker with AI congestion-aware time slots.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Schedule alerts:</strong> Automated SMS notifications & reminder logs.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Token + QR code:</strong> Authentic digital gate pass with printable pass & barcode.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Status tracking:</strong> 6-stage sequential pipeline with moisture and weight verification.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Payment tracking:</strong> DBT status, PFMS reference, and direct bank disbursement.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Via app + call/SMS:</strong> Interactive 56161 SMS gateway & 1551 IVR voice simulator.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-900 bg-white p-2.5 rounded-lg">
                <strong>Market Dynamics:</strong> Fixed price (MSP), Guaranteed buyer (Govt), Sequential process.
              </div>
            </div>

            {/* Pillar 2 Mapping */}
            <div className="border border-indigo-300 rounded-xl p-4 bg-indigo-50/40 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-indigo-200">
                <TrendingUp className="w-5 h-5 text-indigo-700" />
                <div>
                  <h4 className="font-bold text-sm text-indigo-950">PILLAR 2: CROP STOCK EXCHANGE</h4>
                  <span className="text-[11px] text-indigo-700 font-medium">Target: Sell to Private Buyers</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Blueprint Features Implemented:
                </span>
                <ul className="space-y-1.5 text-slate-700 font-medium">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Live price ticker:</strong> Real-time streaming bar with 24h % and MSP spreads.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Buy/Sell order book:</strong> Real-time depth with corporate bids (ITC, Cargill, Adani).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Price charts (candles/line):</strong> Interactive charts with timeframe filters & MSP baseline.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>AI price predictions:</strong> 7-day AgroAI trajectory, weather impact & Hold/Sell advisory.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Bid/Ask matching:</strong> One-click trade execution with 100% Agri-Escrow security.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>District-wise rates:</strong> Mandi comparison table with live freight & net realization calculator.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-indigo-200 text-[11px] text-indigo-900 bg-white p-2.5 rounded-lg">
                <strong>Market Dynamics:</strong> Market-driven price, Multiple competing buyers, Real-time matching.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
