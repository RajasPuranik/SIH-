import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, PhoneCall, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile } from '../types';

const ROLES = [
  {
    role: 'farmer' as UserRole,
    icon: '👨‍🌾',
    title: 'Kissan / Farmer',
    hindiTitle: 'किसान',
    desc: 'Book mandi slots, track MSP status, get DBT payments',
    accent: 'border-l-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    role: 'mandi_officer' as UserRole,
    icon: '👩‍💼',
    title: 'APMC Officer',
    hindiTitle: 'मंडी अधिकारी',
    desc: 'Scan QR tokens, quality assay, manage weighbridge',
    accent: 'border-l-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    btn: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    role: 'corporate_buyer' as UserRole,
    icon: '🏢',
    title: 'Corporate Buyer',
    hindiTitle: 'व्यापारी',
    desc: 'Place bids, trade on exchange, AI price forecasts',
    accent: 'border-l-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
  },
  {
    role: 'admin' as UserRole,
    icon: '🛡️',
    title: 'System Admin',
    hindiTitle: 'प्रशासक',
    desc: 'Oversight, user registry, MSP controls & data export',
    accent: 'border-l-slate-700',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',    btn: 'bg-slate-900 hover:bg-slate-800',
  },
  {
    role: 'shipper' as UserRole,
    icon: '🚚',
    title: 'Transporter / Delivery',
    hindiTitle: 'ट्रांसपोर्टर',
    desc: 'Accept logistics jobs, track routes, manage shipments',
    accent: 'border-l-orange-500',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    btn: 'bg-orange-600 hover:bg-orange-500',
  }
];



export const LoginPage: React.FC = () => {
  const { loginUser, loginWithPhone, registerUser, isPhoneRegistered, openPhoneBot } = useApp();
  const [mode, setMode] = useState<'select' | 'login' | 'register'>('select');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState('9826041239');
  const [otp, setOtp] = useState('1234');
  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roleInfo = ROLES.find((r) => r.role === selectedRole)!;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp !== '1234') {
      setError('Invalid OTP. For now, use 1234.');
      return;
    }
    const res = loginWithPhone('+91 ' + phone); 
    if (!res.success) { 
      setError(res.message); 
    } else { 
      setSuccess('Login successful'); 
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !regPhone.trim()) return;

    const baseProfile = {
      name: name.trim(),
      phone: '+91 ' + regPhone,
      email: regPhone + '@kisantrack.in',
      role: selectedRole,
      avatar: selectedRole === 'farmer' ? '👨‍🌾' : selectedRole === 'mandi_officer' ? '👩‍💼' : selectedRole === 'corporate_buyer' ? '🏢' : '🛡️',
      state: 'Madhya Pradesh',
      district: 'Indore',
      primaryMandi: 'Indore APMC Mandi (Chhavani)',
    } as Omit<UserProfile, 'id' | 'createdAt'>;

    const result = registerUser(baseProfile);
    if (!result.success) {
      setError(result.message);
    } else {
      setSuccess(result.message);
    }
  };

  const renderContent = () => {
    if (mode === 'login') {
      return (
        <div className="space-y-6">
          <button
            onClick={() => { setMode('select'); setError(''); }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium transition cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Roles
          </button>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`px-5 py-4 border-b border-slate-100 flex items-center gap-3 border-l-4 ${roleInfo.accent}`}>
              <span className="text-2xl">{roleInfo.icon}</span>
              <div>
                <div className="font-bold text-sm text-slate-900">{roleInfo.title} Login</div>
                <div className="text-xs text-slate-500">{roleInfo.hindiTitle} • KisanTrack Portal</div>
              </div>
            </div>
            <form onSubmit={handleLogin} className="p-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg text-sm text-slate-500 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-r-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">OTP</label>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">OTP: 1234</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type={showOtp ? 'text' : 'password'}
                    maxLength={4}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-center text-base font-bold tracking-widest border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="px-3 text-slate-400 hover:text-slate-700 border border-slate-300 rounded-lg cursor-pointer"
                  >
                    {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className={`w-full py-2.5 mt-2 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition ${roleInfo.btn}`}
              >
                Login to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (mode === 'register') {
      return (
        <div className="space-y-6">
          <button
            onClick={() => { setMode('select'); setError(''); setSuccess(''); }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium transition cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Roles
          </button>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`px-5 py-4 border-b border-slate-100 flex items-center gap-3 border-l-4 ${roleInfo.accent}`}>
              <span className="text-2xl">{roleInfo.icon}</span>
              <div>
                <div className="font-bold text-sm text-slate-900">Create Account — {roleInfo.title}</div>
                <div className="text-xs text-slate-500">Your data will be saved locally for this device</div>
              </div>
            </div>
            <form onSubmit={handleRegister} className="p-5 space-y-5">
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {success}
                </div>
              )}

              {/* Enhanced Role selector for registration */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Select Role</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLES.map((r) => {
                    const isSelected = selectedRole === r.role;
                    const baseAccent = r.accent.replace('border-l-', 'text-');
                    const bgAccent = r.accent.replace('border-l-', 'bg-').replace('500', '50').replace('700', '50');
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setSelectedRole(r.role)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? `border-slate-900 bg-slate-900 text-white shadow-md`
                            : `border-slate-200 hover:border-slate-400 text-slate-700 hover:${bgAccent}`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{r.icon}</span>
                          <span className="text-sm font-semibold">{r.title}</span>
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {r.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); setName(e.target.value); }}
                  placeholder="e.g. Rameshwar Patidar"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mobile Number *</label>
                  {regPhone.length === 10 && (
                    isPhoneRegistered(regPhone)
                      ? <span className="text-[11px] text-red-500 font-semibold">Already registered</span>
                      : <span className="text-[11px] text-emerald-600 font-semibold">Available ✓</span>
                  )}
                </div>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg text-sm text-slate-500 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={regPhone}
                    onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); setRegPhone(e.target.value); setError(''); }}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-r-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {selectedRole === 'farmer' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Aadhaar Number *</label>
                  <input
                    type="text"
                    maxLength={12}
                    required
                    value={aadhaar}
                    onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); setAadhaar(e.target.value); setError(''); }}
                    placeholder="12-digit Aadhaar"
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              )}
              
              <button
                type="submit"
                className={`w-full py-2.5 mt-2 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition ${roleInfo.btn}`}
              >
                Create Account <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      );
    }

    // Role selection mode (select)
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome to KisanTrack</h2>
          <p className="text-sm text-slate-500 mt-1">Select your role to continue</p>
        </div>

        <div className="space-y-3">
          {ROLES.map((r) => {
            const hoverBgClass = r.accent.replace('border-l-', 'hover:bg-').replace('500', '50').replace('700', '50');
            return (
              <button
                key={r.role}
                onClick={() => { setSelectedRole(r.role); setMode('login'); }}
                className={`w-full flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-slate-200 shadow-sm transition cursor-pointer text-left border-l-4 ${r.accent} ${hoverBgClass}`}
              >
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900">{r.title}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{r.desc}</div>
                </div>
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full shrink-0 ${r.badge}`}>
                  {r.hindiTitle}
                </span>
                <ArrowRight className="w-5 h-5 text-slate-300 shrink-0 ml-2" />
              </button>
            );
          })}
        </div>

        {/* Voice Bot Banner */}
        <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">किसान फोन बॉट</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Toll-Free: 1800-180-1551 • No internet needed</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openPhoneBot('inbound')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shrink-0 flex items-center gap-2"
          >
            कॉल
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Panel / Mobile Header */}
      <div className="w-full md:w-[40%] bg-gradient-to-b from-slate-900 to-emerald-900 p-8 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left relative shrink-0 min-h-[250px] md:min-h-screen">
        <div className="flex flex-col justify-center w-full max-w-md mx-auto z-10">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4 md:mb-6">
            <span className="text-5xl md:text-6xl">🌾</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">KisanTrack</h1>
          </div>
          <p className="text-emerald-200 text-sm md:text-lg font-medium max-w-sm mx-auto md:mx-0">
            Zero Wait Time, Guaranteed MSP & Fair Trade Ecosystem
          </p>
        </div>
        <div className="hidden md:block absolute bottom-8 left-12 right-12 text-xs text-slate-400 font-medium">
          SIH 2026 · Ministry of Agriculture & Farmers Welfare
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[60%] flex flex-col justify-center p-6 md:p-12 min-h-[calc(100vh-250px)] md:min-h-screen">
        <div className="w-full max-w-lg mx-auto">
          {/* Tabs for login/register mode */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl mb-8">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Form / Role Selection Content */}
          {renderContent()}
          
          {/* Mobile Footer */}
          <div className="md:hidden mt-8 text-center text-[10px] text-slate-400 font-medium">
            SIH 2026 · Ministry of Agriculture & Farmers Welfare
          </div>
        </div>
      </div>
    </div>
  );
};
