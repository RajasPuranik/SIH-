import React from 'react';
import { 
  Clock, 
  MapPin, 
  Truck, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Scale
} from 'lucide-react';

export const MandiCongestionHeatmap: React.FC = () => {
  const mandis = [
    {
      name: 'Indore APMC (Chhavani Yard)',
      district: 'Indore',
      state: 'Madhya Pradesh',
      waitTime: 18,
      queueTractors: 12,
      status: 'Low Wait',
      statusColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
      openWeighbridges: '4 of 4 Open',
      bestTime: '10:00 AM - 12:30 PM'
    },
    {
      name: 'Khanna Grain Mandi',
      district: 'Ludhiana',
      state: 'Punjab',
      waitTime: 24,
      queueTractors: 19,
      status: 'Moderate',
      statusColor: 'text-blue-700 bg-blue-100 border-blue-300',
      openWeighbridges: '6 of 6 Open',
      bestTime: '08:30 AM - 11:00 AM'
    },
    {
      name: 'Ujjain Krishi Upaj Mandi',
      district: 'Ujjain',
      state: 'Madhya Pradesh',
      waitTime: 38,
      queueTractors: 31,
      status: 'Moderate',
      statusColor: 'text-amber-700 bg-amber-100 border-amber-300',
      openWeighbridges: '3 of 4 Open',
      bestTime: '02:00 PM - 04:30 PM'
    },
    {
      name: 'Dhar APMC Yard',
      district: 'Dhar',
      state: 'Madhya Pradesh',
      waitTime: 65,
      queueTractors: 48,
      status: 'Heavy Congestion',
      statusColor: 'text-rose-700 bg-rose-100 border-rose-300',
      openWeighbridges: '2 of 3 Open',
      bestTime: 'After 04:00 PM'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Mandi Congestion & Gate Queue Index
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Real-Time Gate Wait Times & Weighbridge Capacity
          </h3>
        </div>

        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
          📡 Updated via Gate RFID Scanners
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mandis.map((m) => (
          <div
            key={m.name}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-200 text-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{m.name}</span>
                <span className="text-[11px] text-slate-500">{m.district}, {m.state}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.statusColor}`}>
                {m.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-900">
                {m.waitTime}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                min avg wait
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-200/80 pt-2.5">
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <Truck className="w-3 h-3 text-slate-400" /> Queue in Yard:
                </span>
                <span className="font-bold font-mono text-slate-800">{m.queueTractors} Vehicles</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <Scale className="w-3 h-3 text-slate-400" /> Weighbridges:
                </span>
                <span className="font-semibold text-emerald-700">{m.openWeighbridges}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Optimal Slot:</span>
                <span className="font-semibold text-slate-800">{m.bestTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
