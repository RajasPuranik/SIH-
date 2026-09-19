import React from 'react';
import { useApp } from '../context/AppContext';
import { RoleStatusBanner } from '../components/RoleStatusBanner';
import { GovtProcurementView } from '../components/PillarGovt/GovtProcurementView';
import { ScanLine, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { currentUser, userRole, setIsOfficerScannerOpen, bookings } = useApp();

  const todayTokens = bookings.length;
  const verifiedTokens = bookings.filter(b => 
    b.status !== 'BOOKED' && b.status !== 'IN_TRANSIT'
  ).length;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scanParam = params.get('scan');
    if (scanParam) {
      setIsOfficerScannerOpen(true);
    }
  }, [setIsOfficerScannerOpen]);

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-5 sm:space-y-6">
      {/* Role Status Banner */}
      <RoleStatusBanner currentUser={currentUser} userRole={userRole} />

      {/* Scanner Shortcut — Prominent */}
      <button
        onClick={() => setIsOfficerScannerOpen(true)}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-2xl text-base shadow-md shadow-blue-600/20 transition cursor-pointer"
      >
        <ScanLine className="w-6 h-6" />
        <span>Open Gate Scanner</span>
      </button>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm text-center">
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{todayTokens}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Tokens Today</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm text-center">
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{verifiedTokens}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Verified</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">12</p>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Avg Assay (Min)</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-lg sm:text-xl font-bold text-emerald-700">Open</p>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Gate Status</p>
        </div>
      </div>

      {/* Main Content */}
      <GovtProcurementView />
    </main>
  );
};
