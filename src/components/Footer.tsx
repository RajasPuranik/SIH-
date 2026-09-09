import React from 'react';
import { PhoneCall, ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { setIsIVRModalOpen } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="text-lg font-bold text-white tracking-tight">
                {t('appName')}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              KisanSetu Dual-Pillar Agricultural Platform designed for the Smart India Hackathon (SIH 2026). Bridging Government MSP Procurement with the Private Crop Stock Exchange.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Wait Times • 100% Price Transparency</span>
            </div>
          </div>

          {/* Col 2: Pillar 1 Highlights */}
          <div className="space-y-2">
            <span className="font-bold text-white uppercase tracking-wider text-xs block mb-2">
              🏛️ Pillar 1: Govt Procurement
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Advance APMC Slot Booking</li>
              <li>• Digital QR Gate Entry Pass</li>
              <li>• Real-Time 6-Stage Progress Tracking</li>
              <li>• Direct Benefit Transfer (DBT) via PFMS</li>
              <li>• Offline IVR Voice & SMS Gateway</li>
            </ul>
          </div>

          {/* Col 3: Pillar 2 Highlights */}
          <div className="space-y-2">
            <span className="font-bold text-white uppercase tracking-wider text-xs block mb-2">
              📈 Pillar 2: Crop Stock Exchange
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Live Market-Driven Ticker</li>
              <li>• Institutional Bids & Order Depth</li>
              <li>• 7-Day AgroAI Price Forecast</li>
              <li>• Guaranteed Agri-Escrow Settlement</li>
              <li>• District Mandi Freight Calculator</li>
            </ul>
          </div>

          {/* Col 4: Emergency & Helplines */}
          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider text-xs block mb-2">
              Toll-Free Farmer Support
            </span>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <PhoneCall className="w-4 h-4" />
                <span>1551 / 1800-180-1551</span>
              </div>
              <p className="text-[11px] text-slate-400">
                24/7 National Kisan Call Center support in 22 regional languages.
              </p>
              <button
                onClick={() => setIsIVRModalOpen(true)}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer"
              >
                Launch IVR / SMS Simulator
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 KisanTrack (KisanSetu) • Built for Smart India Hackathon • Alleviating Farmer Waiting Times & Status Uncertainty
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Aligned with e-NAM & PM-KISAN Ecosystem</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
