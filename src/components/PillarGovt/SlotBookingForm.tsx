import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Truck, 
  Scale, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const SlotBookingForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { crops, createBooking, playFeedbackTone } = useApp();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    farmerName: 'Rameshwar Patidar',
    farmerPhone: '9826041239',
    aadhaarNumber: '5819', // last 4 digits
    state: 'Madhya Pradesh',
    district: 'Indore',
    mandiName: 'Indore APMC Mandi (Chhavani)',
    cropId: 'wheat',
    quantity: '75',
    vehicleType: 'Tractor Trolley' as const,
    vehicleNumber: 'MP-09-AB-4821',
    bookingDate: '2026-09-12',
    timeSlot: '08:30 AM - 10:00 AM (Wait Time: ~12 Mins)'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCrop = crops.find(c => c.id === formData.cropId) || crops[0];
  const quantityNum = parseFloat(formData.quantity) || 0;
  const grossEstimatedMSP = quantityNum * selectedCrop.mspRate;

  const timeSlots = [
    { slot: '08:30 AM - 10:00 AM', status: 'Optimal', waitTime: '10 - 15 Mins', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
    { slot: '10:15 AM - 11:45 AM', status: 'Moderate', waitTime: '20 - 30 Mins', color: 'text-blue-700 bg-blue-50 border-blue-300' },
    { slot: '12:00 PM - 01:30 PM', status: 'Peak Rush', waitTime: '45 - 60 Mins', color: 'text-amber-700 bg-amber-50 border-amber-300' },
    { slot: '02:30 PM - 04:00 PM', status: 'Optimal', waitTime: '15 - 20 Mins', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      createBooking({
        farmerName: formData.farmerName,
        farmerPhone: `+91 ${formData.farmerPhone}`,
        aadhaarMasked: `XXXX-XXXX-${formData.aadhaarNumber}`,
        state: formData.state,
        district: formData.district,
        mandiName: formData.mandiName,
        cropId: formData.cropId,
        cropName: selectedCrop.name,
        estimatedQuantityQuintals: quantityNum,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        bookingDate: formData.bookingDate,
        scheduledTimeSlot: formData.timeSlot.split(' (')[0]
      });

      setIsSubmitting(false);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti optional
      }

      onSuccess();
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                Pillar 1: Govt Procurement
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-100 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Zero Wait Queue Management
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              Book APMC Mandi Procurement Slot
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Reserve your gate entry slot in advance. Guaranteed MSP pricing with zero queue congestion.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-right shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-emerald-100 block">
              Current Official MSP
            </span>
            <span className="text-xl font-bold font-mono text-amber-300">
              ₹{selectedCrop.mspRate.toLocaleString('en-IN')}/Qtl
            </span>
            <span className="text-[10px] text-emerald-200 block">
              Govt Mandated Rate ({selectedCrop.minSupportPriceYear})
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Farmer & Location Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
            Farmer & Mandi Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Farmer Full Name
              </label>
              <input
                type="text"
                required
                value={formData.farmerName}
                onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mobile Number (for SMS & Alerts)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-xs text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.farmerPhone}
                  onChange={(e) => setFormData({ ...formData, farmerPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Aadhaar Last 4 Digits (DBT Linked)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                State
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                District
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="Indore">Indore</option>
                <option value="Ujjain">Ujjain</option>
                <option value="Dewas">Dewas</option>
                <option value="Dhar">Dhar</option>
                <option value="Ludhiana">Ludhiana</option>
                <option value="Karnal">Karnal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Designated APMC Mandi Yard
              </label>
              <select
                value={formData.mandiName}
                onChange={(e) => setFormData({ ...formData, mandiName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="Indore APMC Mandi (Chhavani)">Indore APMC Mandi (Chhavani)</option>
                <option value="Ujjain Krishi Upaj Mandi">Ujjain Krishi Upaj Mandi</option>
                <option value="Khanna Grain Mandi">Khanna Grain Mandi</option>
                <option value="Dewas Main Mandi Yard">Dewas Main Mandi Yard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Crop & Volume Specifications */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">2</span>
            Crop Harvest & Transport Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Select Crop Commodity
              </label>
              <select
                value={formData.cropId}
                onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white font-medium"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (MSP: ₹{c.mspRate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Quantity in Quintals (1 Quintal = 100 Kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold pr-16"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">
                  Quintals
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="Tractor Trolley">Tractor Trolley</option>
                <option value="Pickup / Mini Truck">Pickup / Mini Truck</option>
                <option value="Truck">Heavy Commercial Truck</option>
                <option value="Bullock Cart">Bullock Cart / Animal Cart</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Vehicle Registration Number (or Cart ID)
              </label>
              <input
                type="text"
                required
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="e.g. MP-09-AB-4821"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden uppercase font-mono"
              />
            </div>

            {/* Quality Standard Note */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Govt FAQ Standard: </span>
                {selectedCrop.faqStandards}
                <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">
                  Max allowable moisture: {selectedCrop.moistureStandardMax}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Smart Slot Picker with Congestion Indicator */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">3</span>
              Select Arrival Slot & Queue Optimization
            </h3>
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> AI Traffic Load Balancing Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {timeSlots.map((ts, idx) => {
              const isSelected = formData.timeSlot.includes(ts.slot);
              return (
                <div
                  key={idx}
                  onClick={() => setFormData({ ...formData, timeSlot: `${ts.slot} (Wait Time: ~${ts.waitTime})` })}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition relative ${
                    isSelected 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {ts.slot}
                    </span>
                  </div>
                  <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${ts.color}`}>
                    Queue: {ts.waitTime}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guaranteed Payout Calculation Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              ₹
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Guaranteed Gross MSP Payment
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-800">
                ₹{grossEstimatedMSP.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-600">
                Calculation: {quantityNum} Qtl × ₹{selectedCrop.mspRate}/Qtl (Zero Mandi Tax deduction on MSP)
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isSubmitting ? (
              <span>Generating Digital Pass...</span>
            ) : (
              <>
                <span>Confirm Slot & Get QR Token</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
