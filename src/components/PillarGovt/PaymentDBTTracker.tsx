import React from 'react';
import { 
  Banknote, 
  CheckCircle2, 
  Clock, 
  Download, 
  Building, 
  FileText, 
  ShieldCheck, 
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PaymentDBTTracker: React.FC = () => {
  const { bookings, activeBookingId, setActiveBookingId } = useApp();
  const currentBooking = bookings.find(b => b.id === activeBookingId) || bookings[0];
  const payment = currentBooking.paymentDetails;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                Direct Benefit Transfer (DBT)
              </span>
              <span className="text-xs text-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                PFMS Aadhaar Payment Bridge Integrated
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              Govt MSP Procurement Payment Settlement
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
              100% direct bank credit to farmer's account. Zero middleman commission, zero delayed checks.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-right">
            <span className="text-xs text-emerald-200 uppercase font-semibold block">
              Net Payable MSP Settlement
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
              ₹{payment?.netPayableAmount.toLocaleString('en-IN') || '0'}
            </span>
            <span className="text-[11px] text-emerald-300 block">
              Status: {payment?.dbtStatus === 'SUCCESS' ? 'Disbursed to Bank' : 'In Processing Pipeline'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              MSP Procurement J-Form Billing Breakdown
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Beneficiary Farmer Name:</span>
                <span className="font-bold text-slate-800">{currentBooking.farmerName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Allocated Token & Mandi:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {currentBooking.tokenNumber} ({currentBooking.mandiName})
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Crop Procured:</span>
                <span className="font-semibold text-emerald-700">{currentBooking.cropName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Procurement Quantity:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {currentBooking.estimatedQuantityQuintals} Quintals
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">MSP Mandated Rate:</span>
                <span className="font-bold text-slate-800 font-mono">
                  ₹{payment?.mspRatePerQuintal}/Quintal
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Mandi Cess / Middleman Deduction:</span>
                <span className="font-bold text-emerald-700">₹0.00 (Exempted under DBT)</span>
              </div>
              <div className="py-3 flex justify-between text-sm bg-slate-50 px-3 rounded-lg mt-2">
                <span className="font-bold text-slate-900">Total Net Amount Credited:</span>
                <span className="font-bold font-mono text-emerald-700 text-base">
                  ₹{payment?.netPayableAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official J-Form Receipt valid for agricultural loan clearances.
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download J-Form (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Bank & PFMS Verification Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Aadhaar Seeded Bank Account
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Name:</span>
                <span className="font-bold text-slate-800">{payment?.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono font-bold text-slate-700">{payment?.accountMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IFSC Code:</span>
                <span className="font-mono font-bold text-slate-700">{payment?.ifscCode}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">PFMS Ref No:</span>
                <span className="font-mono font-bold text-emerald-700">{payment?.pfmsReferenceId}</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900">Direct Benefit Transfer Active</span>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  Payment will be released directly within 24-48 hours of weighbridge confirmation without any intermediaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
