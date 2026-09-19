import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface RoleStatusBannerProps {
  currentUser: {
    avatar: string;
    name: string;
    district?: string;
    state?: string;
    primaryCrop?: string;
    designation?: string;
    assignedGate?: string;
    companyName?: string;
    gstin?: string;
    department?: string;
    escrowBalance?: number;
    [key: string]: any;
  };
  userRole: UserRole;
}

export const RoleStatusBanner: React.FC<RoleStatusBannerProps> = ({ currentUser, userRole }) => {
  const roleConfig = {
    farmer: {
      badge: 'Kissan',
      badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      statusPill: (
        <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          DBT Direct Payment Active
        </div>
      ),
      contextLine: `${currentUser.district || 'District'}, ${currentUser.state || 'State'} • ${currentUser.primaryCrop ?? 'Multi-Crop'}`,
    },
    mandi_officer: {
      badge: 'Mandi Officer',
      badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200',
      statusPill: (
        <div className="text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Gate Scanner Duty: Active
        </div>
      ),
      contextLine: `${currentUser.designation ?? 'Quality & Gate Officer'} • ${currentUser.assignedGate ?? 'Gate No. 3'}`,
    },
    corporate_buyer: {
      badge: 'Corporate Buyer',
      badgeStyle: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      statusPill: (
        <div className="text-xs text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
          Agri-Escrow: ₹{(((currentUser as { escrowBalance?: number }).escrowBalance ?? 0) / 100000).toFixed(1)}L
        </div>
      ),
      contextLine: `${currentUser.companyName ?? 'Buyer Entity'} • GSTIN: ${currentUser.gstin ?? 'Verified'}`,
    },
    admin: {
      badge: 'Administrator',
      badgeStyle: 'bg-slate-900 text-white border-slate-900',
      statusPill: (
        <div className="text-xs text-slate-700 font-bold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Super Admin Privileges
        </div>
      ),
      contextLine: `${currentUser.department ?? 'Ministry of Agriculture'} • Central Oversight`,
    },
  };

  const config = roleConfig[userRole as keyof typeof roleConfig] || roleConfig.farmer;

  return (
    <div className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
          {currentUser.avatar?.startsWith('data:image') ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            currentUser.avatar
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
              {currentUser.name?.split('(')[0].trim()}
            </h2>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${config.badgeStyle}`}>
              {config.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {config.contextLine}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {config.statusPill}
      </div>
    </div>
  );
};
