import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { TickerBar } from './components/TickerBar';
import { GovtProcurementView } from './components/PillarGovt/GovtProcurementView';
import { CropStockExchangeView } from './components/PillarMarket/CropStockExchangeView';
import { MandiCongestionHeatmap } from './components/MandiCongestionHeatmap';
import { MandiGateOfficerModal } from './components/PillarGovt/MandiGateOfficerModal';
import { AudioAssistantModal } from './components/AudioAssistantModal';
import { BlueprintComparisonModal } from './components/BlueprintComparisonModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfileModal } from './components/Profile/UserProfileModal';
import { PhoneBotModal } from './components/PhoneBot/PhoneBotModal';
import { ShipperDashboard } from './components/PillarLogistics/ShipperDashboard';
import { Footer } from './components/Footer';
import { PhoneCall } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { FarmerDashboard } from './dashboards/FarmerDashboard';
import { OfficerDashboard } from './dashboards/OfficerDashboard';
import { BuyerDashboard } from './dashboards/BuyerDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';


const Dashboard: React.FC = () => {
  const {
    userRole,
    openPhoneBot,
    setIsOfficerScannerOpen,
    isIVRDialpadOpen,
    setIsIVRDialpadOpen
  } = useApp();
  const { t } = useLanguage();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scanParam = params.get('scan');
    if (scanParam && userRole === 'mandi_officer') {
      setIsOfficerScannerOpen(true);
      // Clean up URL without reload
      // let modal read it
    }
  }, [userRole, setIsOfficerScannerOpen]);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col selection:bg-teal-600 selection:text-white font-sans">
      <Navbar onBlueprintClick={() => setIsBlueprintModalOpen(true)} />
      <TickerBar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {/* Role-specific dashboard shell — same underlying views/data per role,
            each with its own themed container (see src/dashboards/). */}
        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'mandi_officer' && <OfficerDashboard />}
        {userRole === 'corporate_buyer' && <BuyerDashboard />}
        {userRole === 'farmer' && <FarmerDashboard />}
      </main>

      <Footer />

      {/* Floating Minimalist Helpline Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => openPhoneBot('inbound')}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-full shadow-lg border border-emerald-700 transition cursor-pointer"
          title="Toll-Free 1800-180-1551 Track AI"
        >
          <PhoneCall className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span className="text-xs font-bold">Track AI</span>
        </button>
      </div>

      {/* Modals */}
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
