import React, { useState } from 'react';
import {
  Calendar,
  QrCode,
  Activity,
  Banknote,
  ShieldCheck,
  PhoneCall,
  ScanLine,
  MapPin,
} from 'lucide-react';
import { SlotBookingForm } from './SlotBookingForm';
import { TokenPassCard } from './TokenPassCard';
import { LiveStatusTracker } from './LiveStatusTracker';
import { PaymentDBTTracker } from './PaymentDBTTracker';
import { GeoTrackingMap } from '../Map/GeoTrackingMap';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const GovtProcurementView: React.FC = () => {
  const { getActiveBooking, setActiveBookingId, setIsOfficerScannerOpen, userRole, bookings, currentUser } = useApp();
  const { t } = useLanguage();

  const isOfficer = userRole === 'mandi_officer';
  const defaultTab = isOfficer ? 'scanner' : 'tracker';

  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'book' | 'pass' | 'payment' | 'scanner' | 'map'>(defaultTab);

  const activeBooking = getActiveBooking();
  const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '').slice(-10);
  const myBookings = isOfficer ? bookings : bookings.filter(b => cleanPhone(b.farmerPhone) === cleanPhone(currentUser?.phone));
    console.log('GovtProcurementView render: activeBooking is', activeBooking);

  const tabs = isOfficer
    ? [
        { id: 'scanner' as const, label: 'Gate Scanner', icon: <ScanLine className="w-3.5 h-3.5" /> },
        { id: 'tracker' as const, label: t('trackStatus'), icon: <Activity className="w-3.5 h-3.5" /> },
        { id: 'pass' as const, label: t('myTokens'), icon: <QrCode className="w-3.5 h-3.5" /> },
      ]
    : [
        { id: 'tracker' as const, label: t('trackStatus'), icon: <Activity className="w-3.5 h-3.5" /> },
        { id: 'book' as const, label: t('bookSlot'), icon: <Calendar className="w-3.5 h-3.5" /> },
        { id: 'pass' as const, label: t('myTokens'), icon: <QrCode className="w-3.5 h-3.5" /> },
        { id: 'payment' as const, label: t('paymentStatus'), icon: <Banknote className="w-3.5 h-3.5" /> },
        { id: 'map' as const, label: 'Live Map', icon: <MapPin className="w-3.5 h-3.5" /> },
      ];

  return (
    <div className="space-y-5">
      {/* Header — flat white card with left accent */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm border-l-4 px-5 py-4 ${isOfficer ? 'border-l-blue-500' : 'border-l-emerald-500'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isOfficer ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                {isOfficer ? 'APMC Officer' : 'Pillar 1 · Govt Procurement'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {isOfficer ? 'Gate Management & Quality Control' : 'Zero-Wait Mandi Entry & Guaranteed MSP'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              {isOfficer
                ? 'Scan QR passes, run quality assay, record weighbridge data.'
                : 'Book a digital slot, get a QR Gate Pass, track milestones, receive DBT payment.'}
            </p>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs shrink-0 border-l border-slate-100 pl-5 hidden sm:grid">
            {isOfficer ? (
              <>
                <div><div className="text-slate-400">Today's Tokens</div><div className="font-bold text-slate-900">24 Pending</div></div>
                <div><div className="text-slate-400">Verified</div><div className="font-bold text-emerald-600">18 Today</div></div>
                <div><div className="text-slate-400">Avg Assay</div><div className="font-bold text-slate-900">12 Mins</div></div>
                <div><div className="text-slate-400">Gate</div><div className="font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Open</div></div>
              </>
            ) : (
              <>
                <div><div className="text-slate-400">Buyer</div><div className="font-bold text-slate-900">FCI / NAFED</div></div>
                <div><div className="text-slate-400">Price</div><div className="font-bold text-emerald-600">Fixed MSP</div></div>
                <div><div className="text-slate-400">Avg Delay</div><div className="font-bold text-slate-900">&lt;18 Mins</div></div>
                <div><div className="text-slate-400">Payment</div><div className="font-bold text-slate-900">24h DBT</div></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub-nav — underline tab style */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto flex-1 pb-1">
          {tabs.map((tab) => {
            const activeColors = {
              tracker: 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm',
              book: 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm',
              pass: 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm',
              payment: 'bg-purple-100 text-purple-800 border-purple-300 shadow-sm',
              scanner: 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm',
              map: 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm'
            };
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-[11px] sm:text-xs font-extrabold rounded-xl transition cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? (activeColors as any)[tab.id]
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 bg-white shadow-xs'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
      </div>

      {/* Officer scanner panel */}
      {activeSubTab === 'scanner' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4">
          <div className="text-4xl">📷</div>
          <h3 className="font-bold text-slate-900 text-base">QR Gate Pass Scanner</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Scan farmer QR tokens at the gate entry, run quality assay, or manually enter a token number to advance pipeline status.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setIsOfficerScannerOpen(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <ScanLine className="w-4 h-4" />
              Open Gate Scanner
            </button>
            <button
              onClick={() => setActiveSubTab('tracker')}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition border border-slate-300"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              View All Token Statuses
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'tracker' && <LiveStatusTracker />}

      {activeSubTab === 'book' && (
        <SlotBookingForm onSuccess={() => setActiveSubTab('pass')} />
      )}

      {activeSubTab === 'pass' && (
        myBookings.length > 0 ? (
          <div className="space-y-8">
            {myBookings.map((booking, idx) => (
              <div key={booking.id || idx} className="space-y-4">
                <TokenPassCard booking={booking} />
                <div className="text-center pb-4 border-b border-slate-100 last:border-0">
                  <button
                    onClick={() => { setActiveBookingId(booking.id); setActiveSubTab('tracker'); }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
                  >
                    Track Live Status for this Token &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-900">No Gate Pass Available</h3>
            <p className="text-sm text-slate-500 mt-1">You must book a Mandi slot first to generate a digital gate pass.</p>
            <button onClick={() => setActiveSubTab('book')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold cursor-pointer transition">Book a Slot</button>
          </div>
        )
      )}

      {activeSubTab === 'payment' && <PaymentDBTTracker />}

      {activeSubTab === 'map' && <GeoTrackingMap />}
    </div>
  );
};
