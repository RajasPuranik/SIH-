import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { TickerBar } from './components/TickerBar';
import { MandiGateOfficerModal } from './components/PillarGovt/MandiGateOfficerModal';
import { AudioAssistantModal } from './components/AudioAssistantModal';
import { BlueprintComparisonModal } from './components/BlueprintComparisonModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfileModal } from './components/Profile/UserProfileModal';
import { PhoneBotModal } from './components/PhoneBot/PhoneBotModal';
import { Footer } from './components/Footer';
import { Mic } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

/* ─── Role-specific dashboard shells ─── */
import { FarmerDashboard } from './dashboards/FarmerDashboard';
import { OfficerDashboard } from './dashboards/OfficerDashboard';
import { BuyerDashboard } from './dashboards/BuyerDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';


const Dashboard: React.FC = () => {
  const {
    userRole,
    openPhoneBot,
    setIsAudioAssistantOpen,
  } = useApp();

  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col selection:bg-teal-600 selection:text-white font-sans">
      <Navbar onBlueprintClick={() => setIsBlueprintModalOpen(true)} />
      <TickerBar />

      {/* Role-Specific Dashboard */}
      {userRole === 'admin' && <AdminDashboard />}
      {userRole === 'mandi_officer' && <OfficerDashboard />}
      {userRole === 'corporate_buyer' && <BuyerDashboard />}
      {userRole === 'farmer' && <FarmerDashboard />}

      <Footer />

      {/* Floating Voice Assistant FAB */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsAudioAssistantOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full shadow-lg shadow-emerald-600/30 transition cursor-pointer group"
          title="किसान वाणी — Voice Assistant"
        >
          <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
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
