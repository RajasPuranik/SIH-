import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Scan, 
  CheckCircle2, 
  Scale, 
  Banknote, 
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MandiGateOfficerModal: React.FC = () => {
  const { 
    isOfficerScannerOpen, 
    setIsOfficerScannerOpen, 
    bookings, 
    updateBookingStatus, 
    playFeedbackTone 
  } = useApp();

  const [selectedToken, setSelectedToken] = useState(bookings[0]?.tokenNumber || '');
  const [moisture, setMoisture] = useState('11.5');
  const [grade, setGrade] = useState<'Grade-A' | 'Grade-B'>('Grade-A');
  const [grossWeight, setGrossWeight] = useState('9200');
  const [tareWeight, setTareWeight] = useState('2700');

  if (!isOfficerScannerOpen) return null;

  const currentBooking = bookings.find(b => b.tokenNumber === selectedToken) || bookings[0];

  const handleApproveQuality = () => {
    updateBookingStatus(
      currentBooking.id,
      'QUALITY_VERIFIED',
      `Moisture verified: ${moisture}%, Grade: ${grade}. FAQ Passed.`,
      'Dr. Sunita Chouhan (Quality Assay Officer)'
    );
    playFeedbackTone('success');
  };

  const handleRecordWeight = () => {
    const gross = parseFloat(grossWeight) || 0;
    const tare = parseFloat(tareWeight) || 0;
    const netKg = gross - tare;
    const netQtl = netKg / 100;

    updateBookingStatus(
      currentBooking.id,
      'WEIGHED',
      `Weighbridge calibrated: Gross ${gross}kg, Tare ${tare}kg. Net: ${netQtl} Quintals.`,
      'Mandi Weighbridge Operator #02'
    );
    playFeedbackTone('success');
  };

  const handleAuthorizeDBT = () => {
    updateBookingStatus(
      currentBooking.id,
      'PAYMENT_COMPLETED',
      'PFMS Payment clearance approved. Funds credited to Aadhaar linked account.',
      'APMC Treasury Officer'
    );
    playFeedbackTone('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">APMC Officer Mandi Portal</h3>
              <p className="text-[11px] text-blue-200">Gate Scanner, Quality Assay & Weighbridge Desk</p>
            </div>
          </div>
          <button
            onClick={() => setIsOfficerScannerOpen(false)}
            className="text-blue-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Token Selection */}
          <div>
            <label className="block text-slate-600 font-bold mb-1">
              Select or Scan Farmer Gate Pass Token:
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
            >
              {bookings.map(b => (
                <option key={b.id} value={b.tokenNumber}>
                  {b.tokenNumber} — {b.farmerName} ({b.cropName}) — Current: [{b.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Quick Officer Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Action 1: Gate Checkin */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block">1. Gate Check-In</span>
                <span className="text-[11px] text-slate-500">Verify QR pass & number plate</span>
              </div>
              <button
                onClick={() => updateBookingStatus(currentBooking.id, 'ARRIVED_AT_GATE', 'Checked in at Gate 3')}
                className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Scan at Gate
              </button>
            </div>

            {/* Action 2: Quality Assay */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block">2. Moisture Assay</span>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Moisture%:</span>
                  <input
                    type="text"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="w-12 p-0.5 border rounded text-center font-bold"
                  />
                </div>
              </div>
              <button
                onClick={handleApproveQuality}
                className="mt-3 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Certify Grade-A
              </button>
            </div>

            {/* Action 3: Weighbridge & DBT */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block">3. Weighbridge & Pay</span>
                <span className="text-[11px] text-slate-500">Capture gross & release DBT</span>
              </div>
              <button
                onClick={handleRecordWeight}
                className="mt-2 w-full py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Log Weight
              </button>
              <button
                onClick={handleAuthorizeDBT}
                className="mt-1 w-full py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
              >
                Release DBT
              </button>
            </div>
          </div>

          {/* Current Booking Status Snapshot */}
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-blue-900">Current Token Pipeline State:</span>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded font-mono font-bold">
                {currentBooking.status}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-1">
              Actions taken here update the farmer's live dashboard, SMS dispatch, and DBT payment logs instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
