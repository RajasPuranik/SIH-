import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  Globe,
  Volume2,
  Bell,
  ShieldCheck,
  PhoneCall,
  Menu,
  X,
  LogOut,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LiveStatusModal } from './LiveStatusModal';
import { Activity } from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
  onBlueprintClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBlueprintClick }) => {
  const {
    activePillar,
    setActivePillar,
    userRole,
    currentUser,
    isLoggedIn,
    setIsProfileModalOpen,
    logoutUser,
    notifications,
    markNotificationAsRead,
    setIsAudioAssistantOpen,
    setIsOfficerScannerOpen,
    openPhoneBot,
    setIsIVRDialpadOpen,
  } = useApp();

  const { language, setLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveStatusOpen, setLiveStatusOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'hi', label: 'HI', flag: '🇮🇳' },
    { code: 'pa', label: 'PA', flag: '🌾' },
    { code: 'mr', label: 'MR', flag: '🚩' },
  ];

  const portalLabel =
    userRole === 'farmer'
      ? { icon: <Building2 className="w-3.5 h-3.5 text-emerald-600" />, label: 'Kissan MSP Portal' }
      : userRole === 'mandi_officer'
      ? { icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />, label: 'APMC Gate Operations' }
      : userRole === 'corporate_buyer'
      ? { icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />, label: 'Commodity Exchange' }
      : { icon: <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />, label: 'National Administration' };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-13">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <span className="text-base">🌾</span>
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                {t('appName')}
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 hidden sm:block">
                Agricultural Procurement Platform
              </div>
            </div>
          </div>

          {/* Center — Portal label */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            {portalLabel.icon}
            <span>{portalLabel.label}</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Officer scanner */}
            {userRole === 'mandi_officer' && (
              <button
                onClick={() => setIsOfficerScannerOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Scan Gate</span>
              </button>
            )}

            {/* Live Status */}
            {isLoggedIn && (
              <button
                onClick={() => setLiveStatusOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Status</span>
              </button>
            )}

            {/* Phone Bot */}
            <button
              onClick={() => openPhoneBot('inbound')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition cursor-pointer"
              title="Track AI — 1800-180-1551"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Track AI</span>
            </button>


            {/* IVR Dialpad */}
            <button
              onClick={() => setIsIVRDialpadOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-semibold transition cursor-pointer"
              title="Interactive Voice Response"
            >
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Offline IVR</span>
            </button>

            {/* Audio assistant */}
            <button
              onClick={() => setIsAudioAssistantOpen(true)}
              className="p-2 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition cursor-pointer"
              title="Kisan Vaani Audio Assistant"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Language selector */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 gap-1">
              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer w-8 sm:w-auto"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-1 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-800 text-xs">Notifications ({notifications.length})</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                    )}
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`px-4 py-3 text-xs cursor-pointer hover:bg-slate-50 transition ${notif.read ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <span className="font-semibold text-slate-900 truncate">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Blueprint */}
            {onBlueprintClick && (
              <button
                onClick={onBlueprintClick}
                className="hidden sm:flex p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Blueprint Comparison"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}

            {/* Profile & logout */}
            {isLoggedIn && (
              <div className="flex items-center gap-0.5 ml-1 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  {currentUser.avatar.startsWith('data:image') ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-6 h-6 rounded-md object-cover" />
                  ) : (
                    <span className="text-base leading-none">{currentUser.avatar}</span>
                  )}
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-[11px] font-bold text-slate-900 truncate max-w-[72px]">
                      {currentUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wide">
                      {userRole === 'farmer' ? 'Kissan' : userRole === 'mandi_officer' ? 'Officer' : userRole === 'corporate_buyer' ? 'Buyer' : 'Admin'}
                    </div>
                  </div>
                </button>
                <button
                  onClick={logoutUser}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer ml-1"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Platform</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setActivePillar('govt'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition cursor-pointer ${
                activePillar === 'govt' ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              MSP Track
            </button>
            <button
              onClick={() => { setActivePillar('exchange'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition cursor-pointer ${
                activePillar === 'exchange' ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Exchange
            </button>
          </div>
        </div>
      )}
      {liveStatusOpen && <LiveStatusModal onClose={() => setLiveStatusOpen(false)} />}
    </header>
  );
};
