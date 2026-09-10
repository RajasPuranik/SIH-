import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Scale, 
  FileCheck, 
  Banknote, 
  Truck, 
  ShieldCheck,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SlotStatus } from '../../types';

export const LiveStatusTracker: React.FC = () => {
  const { bookings, activeBookingId, setActiveBookingId, updateBookingStatus, userRole } = useApp();
  
  const currentBooking = bookings.find(b => b.id === activeBookingId) || bookings[0];
  const [searchQuery, setSearchQuery] = useState(currentBooking?.tokenNumber || '');

  const stages: {
    key: SlotStatus;
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      key: 'BOOKED',
      title: 'Slot Confirmed',
      description: 'Digital token generated with allocated arrival time window.',
      icon: Clock
    },
    {
      key: 'IN_TRANSIT',
      title: 'In Transit / Dispatched',
      description: 'Vehicle en route to designated APMC Mandi yard.',
      icon: Truck
    },
    {
      key: 'ARRIVED_AT_GATE',
      title: 'Mandi Gate Check-in',
      description: 'QR Code scanned at Gate 3. Queue position assigned.',
      icon: QrCode
    },
    {
      key: 'QUALITY_VERIFIED',
      title: 'Moisture & Quality Assay',
      description: 'Lab test certified Grade-A within FAQ moisture limit.',
      icon: ShieldCheck
    },
    {
      key: 'WEIGHED',
      title: 'Electronic Weighbridge',
      description: 'Gross and tare weights captured with digital calibration.',
      icon: Scale
    },
    {
      key: 'MSP_BILLED',
      title: 'J-Form Bill Issued',
      description: 'Official MSP purchase voucher generated.',
      icon: FileCheck
    },
    {
      key: 'PAYMENT_COMPLETED',
      title: 'Direct DBT Bank Transfer',
      description: 'Funds credited directly to Aadhaar linked bank account.',
      icon: Banknote
    }
  ];

  const getStageIndex = (status: SlotStatus) => {
    return stages.findIndex(s => s.key === status);
  };

  const currentIndex = getStageIndex(currentBooking.status);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim().toLowerCase();
    const found = bookings.find(
      b => b.tokenNumber.toLowerCase() === cleanQuery || 
           b.farmerPhone.includes(cleanQuery) || 
           b.vehicleNumber.toLowerCase() === cleanQuery
    );
    if (found) {
      setActiveBookingId(found.id);
    } else {
      alert(`No active booking found matching "${searchQuery}". Please check the token number and try again.`);
    }
  };

  const handleAdvanceStep = () => {
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1].key;
      updateBookingStatus(
        currentBooking.id, 
        nextStage, 
        `Officer verified at stage: ${stages[currentIndex + 1].title}`, 
        'APMC Inspector S. Sharma'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Token Switcher Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Token No. (e.g. KT-MP-2026-9041), Phone, or Vehicle No..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Track Status</span>
          </button>
        </form>

        
      </div>

      {/* Main Status Pipeline Display */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Live MSP Consignment Tracking
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Live Mandi Feed
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Token: <span className="font-mono text-emerald-700">{currentBooking.tokenNumber}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentBooking.farmerName} • {currentBooking.cropName} ({currentBooking.estimatedQuantityQuintals} Qtl) • {currentBooking.mandiName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            
          </div>
        </div>

        {/* Visual Sequential Progress Bar */}
        <div className="py-8">
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
              />
            </div>

            {/* Stages Stepper */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 relative z-10">
              {stages.map((stage, idx) => {
                const isPassed = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const isFuture = idx > currentIndex;

                const StageIcon = stage.icon;

                return (
                  <div key={stage.key} className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 shadow-xs ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                          : isCurrent
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-200 animate-pulse-subtle'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StageIcon className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 md:justify-center">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-800' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                          {stage.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 md:max-w-[130px]">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Stage Logs & Verification Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
          {/* Quality Check Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Lab Assay & Quality Results
              </span>
              {currentBooking.qualityCheck ? (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Certified FAQ
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400">
                  Pending Assay
                </span>
              )}
            </div>

            {currentBooking.qualityCheck ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Moisture Content:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {currentBooking.qualityCheck.moisturePercent}% (Limit: &lt;12%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Foreign Matter:</span>
                  <span className="font-bold text-slate-700 font-mono">
                    {currentBooking.qualityCheck.foreignMatterPercent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grain Grade Allotted:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 rounded">
                    {currentBooking.qualityCheck.grainGrade}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 italic mt-2 pt-2 border-t border-slate-200">
                  "{currentBooking.qualityCheck.inspectorRemarks}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-4 text-center py-4">
                Moisture assay will be logged when vehicle arrives at Gate 3.
              </p>
            )}
          </div>

          {/* Weighbridge Slip */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-600" />
                Electronic Weighbridge Log
              </span>
              {currentBooking.weighbridge ? (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  Calibrated
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400">
                  Pending Weighing
                </span>
              )}
            </div>

            {currentBooking.weighbridge ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Loaded Weight:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentBooking.weighbridge.grossWeightKg.toLocaleString()} Kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tare (Empty Vehicle):</span>
                  <span className="font-mono font-bold text-slate-600">
                    {currentBooking.weighbridge.tareWeightKg.toLocaleString()} Kg
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="font-bold text-slate-800">Net Produce Weight:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {currentBooking.weighbridge.netWeightQuintals} Quintals
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-4 text-center py-4">
                Weighbridge capture takes place immediately after moisture check.
              </p>
            )}
          </div>

          {/* Milestone Audit Trail */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block pb-2 border-b border-slate-200">
              Mandi Action Log & Timestamps
            </span>
            <div className="mt-3 space-y-2.5 max-h-44 overflow-y-auto pr-1">
              {currentBooking.statusHistory.map((item, i) => (
                <div key={i} className="text-xs border-l-2 border-emerald-500 pl-2.5 py-0.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800">{item.stage.replace(/_/g, ' ')}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{item.remarks}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
