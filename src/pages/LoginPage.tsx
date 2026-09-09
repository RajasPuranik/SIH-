import React, { useState } from 'react';
import { Leaf, ArrowRight, Sparkles, Eye, EyeOff, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile } from '../types';

const ROLES = [
  {
    role: 'farmer' as UserRole,
    icon: '👨‍🌾',
    title: 'Kissan / Farmer',
    hindiTitle: 'किसान',
    desc: 'Book mandi slots, track MSP status, get DBT payments',
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    role: 'mandi_officer' as UserRole,
    icon: '👩‍💼',
    title: 'APMC Officer',
    hindiTitle: 'मंडी अधिकारी',
    desc: 'Scan QR tokens, quality assay, manage weighbridge',
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    btn: 'bg-blue-600 hover:bg-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    role: 'corporate_buyer' as UserRole,
    icon: '🏢',
    title: 'Corporate Buyer',
    hindiTitle: 'व्यापारी',
    desc: 'Place bids, trade on exchange, AI price forecasts',
    border: 'border-indigo-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
  },
];

export const LoginPage: React.FC = () => {
  const { loginUser, registerUser, openPhoneBot } = useApp();
  const [mode, setMode] = useState<'select' | 'login' | 'register'>('select');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState('9826041239');
  const [otp, setOtp] = useState('1234');
  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const roleInfo = ROLES.find((r) => r.role === selectedRole)!;

  const handleQuickLogin = (role: UserRole) => loginUser(role);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(selectedRole, '+91 ' + phone);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regPhone) return;
    const baseProfile = {
      name,
      phone: '+91 ' + regPhone,
      email: regPhone + '@kisantrack.in',
      role: selectedRole,
      avatar: selectedRole === 'farmer' ? '👨‍🌾' : selectedRole === 'mandi_officer' ? '👩‍💼' : '🏢',
      state: 'Madhya Pradesh',
      district: 'Indore',
      primaryMandi: 'Indore APMC Mandi (Chhavani)',
    } as Omit<UserProfile, 'id' | 'createdAt'>;
    registerUser(baseProfile);
  };

  /* ─────────── LOGIN SCREEN ─────────── */
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <button
            onClick={() => setMode('select')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className={`p-5 border-b border-slate-100 ${roleInfo.bg}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{roleInfo.icon}</span>
                <div>
                  <h2 className={`font-bold text-base ${roleInfo.text}`}>{roleInfo.title}</h2>
                  <p className="text-xs text-slate-500">{roleInfo.hindiTitle} • KisanTrack Login</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleLogin} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-sm text-slate-500 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-3 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-600">OTP (4-digit)</label>
                  <span className="text-[11px] text-emerald-600 font-semibold">Demo OTP: 1234</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type={showOtp ? 'text' : 'password'}
                    maxLength={4}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 px-3 py-3 text-center text-lg font-bold tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="px-3 text-slate-400 hover:text-slate-700 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className={`w-full py-3.5 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition ${roleInfo.btn}`}
              >
                Login to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer py-1"
              >
                New user? Create account →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────── REGISTER SCREEN ─────────── */
  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <button
            onClick={() => setMode('select')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className={`p-5 border-b border-slate-100 ${roleInfo.bg}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{roleInfo.icon}</span>
                <div>
                  <h2 className={`font-bold text-base ${roleInfo.text}`}>New {roleInfo.title}</h2>
                  <p className="text-xs text-slate-500">Create your KisanTrack account</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleRegister} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role)}
                      className={`p-2 rounded-xl border-2 text-center transition cursor-pointer ${
                        selectedRole === r.role ? `${r.border} ${r.bg}` : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xl">{r.icon}</div>
                      <div className={`text-[10px] font-bold mt-1 ${selectedRole === r.role ? r.text : 'text-slate-600'}`}>
                        {r.title.split('/')[0].trim()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rameshwar Patidar"
                  className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Mobile Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-sm text-slate-500 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-3 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className={`w-full py-3.5 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition ${roleInfo.btn}`}
              >
                Create Account <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer py-1"
              >
                Already have an account? Login →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────── ROLE SELECTION (default) ─────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-10 pb-6 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-4">
          <Leaf className="w-3.5 h-3.5" />
          KisanTrack • SIH 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">किसान सेतु</h1>
        <p className="text-emerald-300 text-sm mt-2 max-w-xs mx-auto">
          Zero-wait mandi entry, guaranteed MSP payments &amp; live crop exchange
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="w-full max-w-md space-y-4">
          {/* Quick demo */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Quick Demo Login</span>
              <span className="text-[10px] text-slate-400 ml-auto">Pre-seeded profiles</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleQuickLogin(r.role)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-center transition cursor-pointer border border-white/10 hover:border-white/20"
                >
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <div className="text-[11px] font-bold text-white">{r.title.split('/')[0].trim()}</div>
                  <div className="text-[10px] text-slate-400">{r.hindiTitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Toll-Free Phone Bot Card */}
          <div className="bg-gradient-to-r from-emerald-950/90 to-teal-950/90 rounded-2xl p-3.5 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0 border border-emerald-500/30 animate-pulse">
                📞
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm">किसान फोन बॉट (Voice AI)</div>
                <div className="text-[10px] text-emerald-300">Toll-Free: 1800-180-1551 • बिना इंटरनेट कॉल करें</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openPhoneBot('inbound')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>कॉल करें</span>
            </button>
          </div>

          {/* Role login buttons */}
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 text-center font-medium">
              Or choose your role to login / register
            </p>
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  setSelectedRole(r.role);
                  setMode('login');
                }}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition cursor-pointer text-left"
              >
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{r.title}</div>
                  <div className="text-xs text-slate-400 truncate">{r.desc}</div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${r.badge}`}>
                  {r.hindiTitle}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-500">
              Solving: Farmers face long waiting times, lack of info &amp; status uncertainty
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
