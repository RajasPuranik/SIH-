import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  QrCode,
  Activity,
  Banknote,
  ShieldCheck,
  PhoneCall,
  ScanLine,
} from 'lucide-react';
import { SlotBookingForm } from './SlotBookingForm';
import { TokenPassCard } from './TokenPassCard';
import { LiveStatusTracker } from './LiveStatusTracker';
import { PaymentDBTTracker } from './PaymentDBTTracker';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const GovtProcurementView: React.FC = () => {
  const { getActiveBooking, setIsIVRModalOpen, setIsOfficerScannerOpen, userRole } = useApp();
  const { t } = useLanguage();

  const isOfficer = userRole === 'mandi_officer';
  const defaultTab = isOfficer ? 'scanner' : 'tracker';

  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'book' | 'pass' | 'payment' | 'scanner'>(defaultTab);

  const activeBooking = getActiveBooking();

  const tabs = isOfficer
    ? [
        { id: 'scanner' as const, label: 'Gate Scanner', icon: <ScanLine className="w-4 h-4 text-blue-600" /> },
        { id: 'tracker' as const, label: t('trackStatus'), icon: <Activity className="w-4 h-4 text-emerald-600" /> },
        { id: 'pass' as const, label: t('myTokens'), icon: <QrCode className="w-4 h-4 text-emerald-600" /> },
      ]
    : [
        { id: 'tracker' as const, label: t('trackStatus'), icon: <Activity className="w-4 h-4 text-emerald-600" /> },
        { id: 'book' as const, label: t('bookSlot'), icon: <Calendar className="w-4 h-4 text-emerald-600" /> },
        { id: 'pass' as const, label: t('myTokens'), icon: <QrCode className="w-4 h-4 text-emerald-600" /> },
        { id: 'payment' as const, label: t('paymentStatus'), icon: <Banknote className="w-4 h-4 text-emerald-600" /> },
      ];

  return (
    <div className="space-y-5">
      {/* Header — compact for mobile */}
      <div className={`rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden ${isOfficer ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900' : 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950'}`}>
        <div className="absolute right-3 bottom-1 opacity-10 pointer-events-none text-8xl">
          {isOfficer ? '🏛️' : '🌾'}
        </div>
        <div className="relative z-10">
          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-2 ${isOfficer ? 'bg-blue-500/30 text-blue-200 border-blue-400/30' : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30'}`}>
            <Building2 className="w-3 h-3" />
            {isOfficer ? 'APMC Officer Dashboard' : 'Pillar 1: Government MSP Procurement'}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {isOfficer ? 'Gate Management & Quality Control' : 'Zero-Wait Mandi Entry & Guaranteed MSP'}
          </h1>
          <p className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${isOfficer ? 'text-blue-100' : 'text-emerald-100'}`}>
            {isOfficer
              ? 'Scan QR gate passes, run quality assay checks, record weighbridge data and advance farmer token status through the pipeline.'
              : 'Book your digital arrival slot, get a QR Gate Pass, track all milestones, and receive DBT bank credits without agents.'}
          </p>

          {/* Quick stats bar */}
          <div className={`mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t ${isOfficer ? 'border-blue-700/60' : 'border-emerald-700/60'}`}>
            {isOfficer ? (
              <>
                <div>
                  <span className="text-[11px] text-blue-300 font-medium block">Today's Tokens</span>
                  <span className="text-base font-bold text-white">24 Pending</span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-300 font-medium block">Quality Verified</span>
                  <span className="text-base font-bold text-emerald-300">18 Today</span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-300 font-medium block">Avg Assay Time</span>
                  <span className="text-base font-bold text-white">12 Mins</span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-300 font-medium block">Gate Status</span>
                  <span className="text-base font-bold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Open
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[11px] text-emerald-300 font-medium block">Buyer Guarantee</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Govt (FCI/NAFED)
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 font-medium block">Price Structure</span>
                  <span className="text-sm font-bold text-amber-300">Fixed MSP</span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 font-medium block">Avg Gate Delay</span>
                  <span className="text-sm font-bold text-emerald-300">&lt;18 Mins (Slots)</span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 font-medium block">Payment</span>
                  <span className="text-sm font-bold text-white">24h DBT to Bank</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner overflow-x-auto max-w-full gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsIVRModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">IVR &amp; SMS</span>
          <span className="sm:hidden">IVR</span>
        </button>
      </div>

      {/* Officer scanner panel */}
      {activeSubTab === 'scanner' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center space-y-4">
          <div className="text-4xl">📷</div>
          <h3 className="font-bold text-blue-900 text-base">QR Gate Pass Scanner</h3>
          <p className="text-sm text-blue-700">
            Scan farmer QR tokens at the gate entry, run quality assay, or manually enter a token number to advance pipeline status.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setIsOfficerScannerOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
            >
              <ScanLine className="w-4 h-4" />
              Open Gate Scanner
            </button>
            <button
              onClick={() => setActiveSubTab('tracker')}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition border border-slate-300"
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

      {activeSubTab === 'pass' && activeBooking && (
        <div className="space-y-4">
          <TokenPassCard booking={activeBooking} />
          <div className="text-center">
            <button
              onClick={() => setActiveSubTab('tracker')}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
            >
              Track Live Status for this Token →
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'payment' && <PaymentDBTTracker />}
    </div>
  );
};
