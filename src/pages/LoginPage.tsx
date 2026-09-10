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
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    btn: 'bg-slate-900 hover:bg-slate-800',
  },
];



  /* ─── Shared outer wrapper ─── */
  const PageShell: React.FC<{ children: React.ReactNode; narrow?: boolean }> = ({ children, narrow }) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className={`w-full ${narrow ? 'max-w-sm' : 'max-w-lg'}`}>
        {/* Brand strip */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-2xl">🌾</span>
          <div>
            <div className="text-base font-bold text-slate-900 tracking-tight leading-none">KisanTrack</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">SIH 2026 • किसान सेतु</div>
          </div>
        </div>
        {children}
        <p className="text-center text-[11px] text-slate-400 mt-5">
          Ministry of Agriculture & Farmers Welfare • APMC Direct Procurement
        </p>
      </div>
    </div>
  );

  
export const LoginPage: React.FC = () => {
  const { loginUser, loginWithPhone, registerUser, isPhoneRegistered, openPhoneBot } = useApp();
  const [mode, setMode] = useState<'select' | 'login' | 'register'>('select');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState('9826041239');
  const [otp, setOtp] = useState('1234');
  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
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
    const res = loginWithPhone('+91 ' + phone); if (!res.success) { setError(res.message); } else { setSuccess('Login successful'); }
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
  };/* ─────────── LOGIN SCREEN ─────────── */
  if (mode === 'login') {
    return (
      <PageShell narrow>
        <button
          onClick={() => { setMode('select'); setError(''); }}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium mb-4 transition cursor-pointer"
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
              className={`w-full py-2.5 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition ${roleInfo.btn}`}
            >
              Login to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer py-1"
            >
              New user? Create account →
            </button>
          </form>
        </div>
      </PageShell>
    );
  }

  /* ─────────── REGISTER SCREEN ─────────── */
  if (mode === 'register') {
    return (
      <PageShell narrow>
        <button
          onClick={() => { setMode('select'); setError(''); setSuccess(''); }}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium mb-4 transition cursor-pointer"
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
          <form onSubmit={handleRegister} className="p-5 space-y-4">
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

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setSelectedRole(r.role)}
                    className={`px-3 py-2.5 rounded-lg border text-left transition cursor-pointer ${
                      selectedRole === r.role
                        ? `border-slate-900 bg-slate-900 text-white`
                        : 'border-slate-200 hover:border-slate-400 text-slate-700'
                    }`}
                  >
                    <span className="text-base mr-1.5">{r.icon}</span>
                    <span className="text-xs font-semibold">{r.title.split('/')[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => { setRegPhone(e.target.value); setError(''); }}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-r-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition ${roleInfo.btn}`}
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer py-1"
            >
              Already have an account? Login →
            </button>
          </form>
        </div>
      </PageShell>
    );
  }

  /* ─────────── ROLE SELECTION (default) ─────────── */
  return (
    <PageShell>
      <div className="space-y-4">
        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">or login / register by role</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Role list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() => { setSelectedRole(r.role); setMode('login'); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 transition cursor-pointer text-left border-l-4 ${r.accent}`}
            >
              <span className="text-xl shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900">{r.title}</div>
                <div className="text-xs text-slate-500 truncate">{r.desc}</div>
              </div>
              <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full shrink-0 ${r.badge}`}>
                {r.hindiTitle}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          ))}
        </div>

        {/* Voice Bot Banner */}
        <div className="bg-slate-900 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-lg shrink-0">
              📞
            </div>
            <div>
              <div className="text-sm font-bold text-white">किसान फोन बॉट</div>
              <div className="text-[11px] text-slate-400">Toll-Free: 1800-180-1551 • No internet needed</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openPhoneBot('inbound')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" /> कॉल
          </button>
        </div>
      </div>
    </PageShell>
  );
};
