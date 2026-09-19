import React from 'react';
import { useApp } from '../context/AppContext';
import { RoleStatusBanner } from '../components/RoleStatusBanner';
import { AdminView } from '../components/Admin/AdminView';
import { Server, Users, Database, ShieldCheck } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser, userRole, bookings } = useApp();

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-5 sm:space-y-6">
      {/* Role Status Banner */}
      <RoleStatusBanner currentUser={currentUser} userRole={userRole} />

      {/* Admin Control Panel Header */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">National Administration Console</h3>
            <p className="text-xs text-slate-400">Full system oversight • Data exports • MSP controls</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{bookings.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Tokens</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">5</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Stakeholders</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <Server className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">99.9%</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Uptime</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">4</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Mandis Live</p>
          </div>
        </div>
      </div>

      {/* Main Admin View */}
      <AdminView />
    </main>
  );
};
