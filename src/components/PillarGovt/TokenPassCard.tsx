import React from 'react';
import { 
  QrCode, 
  Printer, 
  Share2, 
  Download, 
  Calendar, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  ShieldCheck,
  Phone
} from 'lucide-react';
import { SlotBooking } from '../../types';

interface TokenPassCardProps {
  booking: SlotBooking;
  onPrint?: () => void;
}

export const TokenPassCard: React.FC<TokenPassCardProps> = ({ booking }) => {
  const handlePrint = () => {
    window.print();
  };

  const grossValue = (booking.paymentDetails?.totalGrossAmount || (booking.estimatedQuantityQuintals * 2425)).toLocaleString('en-IN');

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-500/30 overflow-hidden relative max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-800 shadow-md">
              <span className="text-3xl">🌾</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide uppercase">
                  APMC Mandi Priority Gate Pass
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/40 text-emerald-100 rounded-full text-[10px] font-bold tracking-wider">
                  MSP RMS 2025-26
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Department of Agriculture & Farmers Welfare • Govt of India
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block">
              Digital Token No.
            </span>
            <span className="text-sm sm:text-base font-mono font-bold bg-white/20 px-2.5 py-1 rounded-md text-amber-300 tracking-wider">
              {booking.tokenNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Main Pass Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Authentic SVG QR Code Representation */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="w-36 h-36 bg-white p-2 rounded-lg border-2 border-slate-300 shadow-xs flex flex-col items-center justify-center relative">
              <QrCode className="w-32 h-32 text-slate-800" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white p-1 rounded-md shadow-xs border border-slate-200">
                  <span className="text-xs">🇮🇳</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2 font-semibold">
              SCAN AT GATE NO. 3
            </span>
            <span className="text-[9px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Zero-Wait Queue Validated
            </span>
          </div>

          {/* Key Particulars */}
          <div className="sm:col-span-2 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Beneficiary Farmer</span>
                <span className="font-bold text-slate-800 text-sm">{booking.farmerName}</span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  Aadhaar: {booking.aadhaarMasked}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Crop & Variety</span>
                <span className="font-bold text-emerald-700 text-sm">{booking.cropName}</span>
                <span className="text-[11px] text-slate-600 block">
                  Quantity: <strong className="text-slate-800 font-mono">{booking.estimatedQuantityQuintals} Qtl</strong>
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Allocated Mandi Yard
                </span>
                <span className="font-semibold text-slate-800">{booking.mandiName}</span>
                <span className="text-[10px] text-slate-500 block">
                  {booking.district}, {booking.state}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Scheduled Date & Slot
                </span>
                <span className="font-bold text-slate-800">{booking.bookingDate}</span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {booking.scheduledTimeSlot}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-400" /> Transport Vehicle
                </span>
                <span className="font-semibold text-slate-800">{booking.vehicleType}</span>
                <span className="text-[11px] text-slate-600 font-mono font-bold block">
                  {booking.vehicleNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Guaranteed MSP Payout</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">
                  ₹{grossValue}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Direct Bank Transfer (DBT)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Callout Strip */}
        <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900">Current Status: {booking.status.replace(/_/g, ' ')}</span>
              <p className="text-emerald-700 text-[11px]">
                Arrival window confirmed. Show this QR pass at Gate No. 3 security scanner.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-1 bg-emerald-600 text-white rounded-md">
            RAMP 4A
          </span>
        </div>

        {/* Action Controls */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mandi Control Room: 0731-2521940</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={() => alert(`Token pass details sent to ${booking.farmerPhone} via SMS & WhatsApp.`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send to WhatsApp / SMS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
