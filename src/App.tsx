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
import { AdminView } from './components/Admin/AdminView';
import { Footer } from './components/Footer';
import { Building2, TrendingUp, PhoneCall, ShieldCheck } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';


const Dashboard: React.FC = () => {
  const {
    userRole,
    currentUser,
    openPhoneBot,
  } = useApp();
  const { t } = useLanguage();
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col selection:bg-teal-600 selection:text-white font-sans">
      <Navbar onBlueprintClick={() => setIsBlueprintModalOpen(true)} />
      <TickerBar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {/* Minimalist Role Status Banner */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-2xl shrink-0">
              {currentUser.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                  {currentUser.name.split('(')[0].trim()}
                </h2>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                  userRole === 'admin'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : userRole === 'farmer'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : userRole === 'mandi_officer'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                }`}>
                  {userRole === 'admin' ? 'Administrator' : userRole === 'farmer' ? 'Kissan' : userRole === 'mandi_officer' ? 'Mandi Officer' : 'Corporate Buyer'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {userRole === 'farmer' && `${currentUser.district}, ${currentUser.state} • ${currentUser.primaryCrop ?? 'Multi-Crop'}`}
                {userRole === 'mandi_officer' && `${currentUser.designation ?? 'Quality & Gate Officer'} • ${currentUser.assignedGate ?? 'Gate No. 3'}`}
                {userRole === 'corporate_buyer' && `${currentUser.companyName ?? 'Buyer Entity'} • GSTIN: ${currentUser.gstin ?? 'Verified'}`}
                {userRole === 'admin' && `${currentUser.department ?? 'Ministry of Agriculture'} • Central Oversight`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'farmer' && (
              <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                DBT Direct Payment Active
              </div>
            )}
            {userRole === 'mandi_officer' && (
              <div className="text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Gate Scanner Duty: Active
              </div>
            )}
            {userRole === 'corporate_buyer' && (
              <div className="text-xs text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                Agri-Escrow: ₹{(((currentUser as { escrowBalance?: number }).escrowBalance ?? 0) / 100000).toFixed(1)}L
              </div>
            )}
            {userRole === 'admin' && (
              <div className="text-xs text-slate-700 font-bold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Super Admin Privileges
              </div>
            )}
          </div>
        </div>

        {/* STRICT ROLE-SPECIFIC VIEWS — Zero Extra Clutter */}
        {userRole === 'admin' && <AdminView />}

        {userRole === 'mandi_officer' && <GovtProcurementView />}

        {userRole === 'corporate_buyer' && <CropStockExchangeView />}

        {userRole === 'farmer' && (
          <>
            <GovtProcurementView />
            <MandiCongestionHeatmap />
          </>
        )}
      </main>

      <Footer />

      {/* Floating Minimalist Helpline Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => openPhoneBot('inbound')}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-full shadow-lg border border-emerald-700 transition cursor-pointer"
          title="Toll-Free 1800-180-1551 Kisan Voice Bot"
        >
          <PhoneCall className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span className="text-xs font-bold">1551 Voice Bot</span>
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
