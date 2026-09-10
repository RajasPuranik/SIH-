import React from 'react';
import { PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { openPhoneBot } = useApp();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          {/* Brand + copyright */}
          <div className="flex items-center gap-2">
            <span className="text-base">🌾</span>
            <span className="text-slate-300 font-semibold">KisanTrack</span>
            <span>•</span>
            <span>SIH 2026 · Ministry of Agriculture</span>
          </div>

          {/* Helpline */}
          <button
            onClick={() => openPhoneBot('inbound')}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition cursor-pointer font-semibold"
          >
            <PhoneCall className="w-3 h-3" />
            1800-180-1551 · 24×7 Kisan Helpline
          </button>

          {/* Legal links */}
          <div className="flex items-center gap-3 text-slate-600">
            <span>© 2026 KisanTrack</span>
            <span>·</span>
            <a href="#" className="hover:text-slate-300 transition">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-300 transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
