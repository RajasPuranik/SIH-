import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { RoleStatusBanner } from '../components/RoleStatusBanner';
import { CropStockExchangeView } from '../components/PillarMarket/CropStockExchangeView';
import { TrendingUp, Wallet, FileText, BarChart2 } from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { currentUser, userRole, crops, selectedCropId } = useApp();
  const { t } = useLanguage();

  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-5 sm:space-y-6">
      {/* Role Status Banner */}
      <RoleStatusBanner currentUser={currentUser} userRole={userRole} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-indigo-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escrow</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-indigo-700">
            ₹{(((currentUser as any).escrowBalance ?? 0) / 100000).toFixed(1)}L
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Locked in Agri-Escrow</p>
        </div>

        <div className="bg-white rounded-2xl border border-indigo-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">GSTIN</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 font-mono truncate">
            {(currentUser as any).gstin ?? '23AAACI9912Q1Z8'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">✓ Verified</p>
        </div>

        <div className="bg-white rounded-2xl border border-indigo-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Market</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900">
            ₹{currentCrop?.currentPrivatePrice?.toLocaleString('en-IN') || '—'}/Qtl
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {currentCrop?.name || 'Select Crop'} Private Rate
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-indigo-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BarChart2 className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">License</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 font-mono truncate">
            {(currentUser as any).tradeLicenseNo ?? 'LIC-APMC-2026'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {(currentUser as any).buyerType || 'Flour Mill'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <CropStockExchangeView />
    </main>
  );
};
