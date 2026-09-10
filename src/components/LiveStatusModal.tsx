import React from 'react';
import { X, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LiveStatusModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userRole, getActiveBooking, bookings } = useApp();
  const activeBooking = getActiveBooking();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Live Status ({userRole === 'farmer' ? 'Farmer' : userRole === 'mandi_officer' ? 'Officer' : 'Buyer'})
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {userRole === 'farmer' ? (
            activeBooking ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Current Token</div>
                  <div className="text-xl font-bold font-mono text-emerald-900">{activeBooking.tokenNumber}</div>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Status</span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">{activeBooking.status}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Estimated Wait Time: 15 mins</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No active booking found.</p>
            )
          ) : userRole === 'mandi_officer' ? (
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Gate 3 Status</div>
                <div className="font-bold text-blue-900">Traffic: Moderate</div>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-600">Pending Tokens</span>
                <span className="font-bold text-slate-800">{bookings.filter(b => b.status === 'BOOKED').length}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-600">Cleared Today</span>
                <span className="font-bold text-slate-800">{bookings.filter(b => b.status === 'PAYMENT_COMPLETED').length}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">Market Activity</div>
                <div className="font-bold text-indigo-900">High Volume Trading</div>
              </div>
              <p className="text-slate-600 text-center py-2">Live trading engine is active.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
