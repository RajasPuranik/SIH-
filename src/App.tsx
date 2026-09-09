import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { TickerBar } from './components/TickerBar';
import { GovtProcurementView } from './components/PillarGovt/GovtProcurementView';
import { CropStockExchangeView } from './components/PillarMarket/CropStockExchangeView';
import { MandiCongestionHeatmap } from './components/MandiCongestionHeatmap';
import { IVRSMSSimulatorModal } from './components/PillarGovt/IVRSMSSimulatorModal';
import { MandiGateOfficerModal } from './components/PillarGovt/MandiGateOfficerModal';
import { AudioAssistantModal } from './components/AudioAssistantModal';
import { BlueprintComparisonModal } from './components/BlueprintComparisonModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfileModal } from './components/Profile/UserProfileModal';
import { PhoneBotModal } from './components/PhoneBot/PhoneBotModal';
import { Footer } from './components/Footer';
import { Building2, TrendingUp, Clock, Sparkles, PhoneCall } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

const Dashboard: React.FC = () => {
  const {
    activePillar,
    setActivePillar,
    userRole,
    currentUser,
    isLoggedIn,
    openPhoneBot,
  } = useApp();
  const { t } = useLanguage();
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  // Officer sees only the govt pillar (their scan/assay tools)
  const showPillarSwitcher = userRole !== 'mandi_officer';
  // Buyer defaults to exchange but can switch
  const pillarLabel = activePillar === 'govt' ? 'Government MSP Track' : 'Private Crop Exchange';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar onBlueprintClick={() => setIsBlueprintModalOpen(true)} />
      <TickerBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 space-y-5">
        {/* Role-aware welcome banner */}
        <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          userRole === 'farmer' ? 'bg-emerald-50 border-emerald-200' :
          userRole === 'mandi_officer' ? 'bg-blue-50 border-blue-200' :
          'bg-indigo-50 border-indigo-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div>
              <div className="font-bold text-slate-900 text-sm">{currentUser.name.split('(')[0].trim()}</div>
              <div className="text-xs text-slate-500">
                {userRole === 'farmer' && `${currentUser.district}, ${currentUser.state} • ${currentUser.primaryCrop ?? 'Multi-Crop Farmer'}`}
                {userRole === 'mandi_officer' && `${currentUser.designation ?? 'APMC Officer'} • ${currentUser.assignedGate ?? 'Gate Officer'}`}
                {userRole === 'corporate_buyer' && `${currentUser.companyName ?? 'Corporate Buyer'} • GSTIN Verified`}
              </div>
            </div>
          </div>
          {userRole === 'mandi_officer' && (
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold bg-blue-100 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block" />
              Gate 3 • On Duty
            </div>
          )}
          {userRole === 'corporate_buyer' && (
            <div className="text-xs text-indigo-700 font-bold bg-indigo-100 px-3 py-1.5 rounded-xl">
              Escrow: ₹{(((currentUser as { escrowBalance?: number }).escrowBalance ?? 0) / 100000).toFixed(1)}L Available
            </div>
          )}
        </div>

        {/* Pillar Switcher — hidden for officer */}
        {showPillarSwitcher && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActivePillar('govt')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                activePillar === 'govt'
                  ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${activePillar === 'govt' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Pillar 1</div>
                  <div className="font-bold text-xs text-slate-900">{t('pillar1Title')}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" /> Zero-wait • MSP Guaranteed
              </div>
            </button>

            <button
              onClick={() => setActivePillar('exchange')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                activePillar === 'exchange'
                  ? 'bg-indigo-50 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${activePillar === 'exchange' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-700">Pillar 2</div>
                  <div className="font-bold text-xs text-slate-900">{t('pillar2Title')}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Live Prices • AI Forecast
              </div>
            </button>
          </div>
        )}

        {/* Officer: direct to govt view, no switcher */}
        {userRole === 'mandi_officer' && (
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <Building2 className="w-3.5 h-3.5" /> APMC Officer Mode — Gate Scanner & Assay Tools Active
          </div>
        )}

        {/* Active Pillar View */}
        {activePillar === 'govt' || userRole === 'mandi_officer' ? (
          <GovtProcurementView />
        ) : (
          <CropStockExchangeView />
        )}

        {/* Mandi heatmap — visible to farmer & officer */}
        {userRole !== 'corporate_buyer' && <MandiCongestionHeatmap />}
      </main>

      <Footer />

      {/* Floating 1-Tap Phone Bot Call Button */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => openPhoneBot('inbound')}
          className="flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/30 border border-emerald-400/40 transition-all transform hover:scale-105 cursor-pointer animate-pulse"
          title="Dial 1800-180-1551 Kisan Phone Bot"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <PhoneCall className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="block text-[9px] sm:text-[10px] text-emerald-200 uppercase font-extrabold tracking-wider leading-none">
              Toll-Free 1551
            </span>
            <span className="block text-xs sm:text-sm font-bold text-white mt-1 leading-none">
              📞 फोन बॉट (Call Bot)
            </span>
          </div>
        </button>
      </div>

      {/* Modals */}
      <IVRSMSSimulatorModal />
      <MandiGateOfficerModal />
      <AudioAssistantModal />
      <AuthModal />
      <UserProfileModal />
      <BlueprintComparisonModal isOpen={isBlueprintModalOpen} onClose={() => setIsBlueprintModalOpen(false)} />
    </div>
  );
};

const AppRoot: React.FC = () => {
  const { isLoggedIn } = useApp();
  return (
    <>
      {isLoggedIn ? <Dashboard /> : <LoginPage />}
      <PhoneBotModal />
    </>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppRoot />
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
