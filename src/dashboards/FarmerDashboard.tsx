import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { RoleStatusBanner } from '../components/RoleStatusBanner';
import { GovtProcurementView } from '../components/PillarGovt/GovtProcurementView';
import { MandiCongestionHeatmap } from '../components/MandiCongestionHeatmap';
import { CreditCard, MapPin, Wheat, TrendingUp } from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { currentUser, userRole, bookings } = useApp();
  const { t } = useLanguage();

  const activeBooking = bookings[0];

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-5 sm:space-y-6">
      {/* Role Status Banner */}
      <RoleStatusBanner currentUser={currentUser} userRole={userRole} />

      {/* Quick Stats — touch-friendly cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wheat className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Token</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">
            {activeBooking?.tokenNumber || 'No Booking'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {activeBooking?.status?.replace(/_/g, ' ') || 'Book a slot to begin'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mandi</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {currentUser.primaryMandi?.split('(')[0].trim() || 'Indore APMC'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {currentUser.district}, {currentUser.state}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">DBT Status</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-emerald-700">
            ✓ Bank Linked
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            PFMS Direct Transfer Active
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Land</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900">
            {currentUser.landSizeAcres || 18.5} Acres
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Khasra Verified ✓
          </p>
        </div>
      </div>

      {/* Main Content — Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        <div className="xl:col-span-2">
          <GovtProcurementView />
        </div>
        <div className="xl:col-span-1">
          <MandiCongestionHeatmap />
        </div>
      </div>
    </main>
  );
};
