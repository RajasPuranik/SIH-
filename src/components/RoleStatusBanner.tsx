import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLE_THEME } from '../dashboards/roleTheme';

// Extracted, unchanged in behavior, from the original inline banner in
// App.tsx's Dashboard component — same fields, same fallbacks, same context.
export const RoleStatusBanner: React.FC = () => {
  const { userRole, currentUser } = useApp();
  const theme = ROLE_THEME[userRole];

  return (
    <div className="rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-2xl shrink-0">
          {currentUser.avatar}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
              {currentUser.name.split('(')[0].trim()}
            </h2>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${theme.badgeClass}`}>
              {userRole === 'admin' ? 'Administrator' : userRole === 'farmer' ? 'Kissan' : userRole === 'mandi_officer' ? 'Mandi Officer' : 'Corporate Buyer'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {userRole === 'farmer' && `${currentUser.district}, ${currentUser.state} • ${currentUser.primaryCrop ?? 'Multi-Crop'}`}
            {userRole === 'mandi_officer' && `${currentUser.designation ?? 'Quality & Gate Officer'} • ${currentUser.assignedGate ?? 'Gate No. 3'}`}
            {userRole === 'corporate_buyer' && `${currentUser.companyName ?? 'Buyer Entity'} • GSTIN: ${currentUser.gstin ?? 'Verified'}`}
            {userRole === 'admin' && `${currentUser.department ?? 'Ministry of Agriculture'} • Central Oversight`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {userRole === 'farmer' && (
          <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            DBT Direct Payment Active
          </div>
        )}
        {userRole === 'mandi_officer' && (
          <div className="text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Gate Scanner Duty: Active
          </div>
        )}
        {userRole === 'corporate_buyer' && (
          <div className="text-xs text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
            Agri-Escrow: ₹{(((currentUser as { escrowBalance?: number }).escrowBalance ?? 0) / 100000).toFixed(1)}L
          </div>
        )}
        {userRole === 'admin' && (
          <div className="text-xs text-slate-700 font-bold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Super Admin Privileges
          </div>
        )}
      </div>
    </div>
  );
};
