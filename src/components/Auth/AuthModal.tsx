import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Phone, 
  Lock, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  KeyRound,
  FileText,
  MapPin,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole, UserProfile } from '../../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode, 
    setAuthModalMode,
    loginUser,
    registerUser,
    playFeedbackTone
  } = useApp();
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('9826041239');
  const [loginPassword, setLoginPassword] = useState('kisan@123');
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('1234');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regState, setRegState] = useState('Madhya Pradesh');
  const [regDistrict, setRegDistrict] = useState('Indore');
  const [regMandi, setRegMandi] = useState('Indore APMC Mandi (Chhavani)');

  // Role-specific fields
  // Farmer
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [khasraNo, setKhasraNo] = useState('');
  const [landAcres, setLandAcres] = useState('12.5');
  const [bankName, setBankName] = useState('State Bank of India');
  const [bankIfsc, setBankIfsc] = useState('SBIN0001245');

  // Officer
  const [empId, setEmpId] = useState('');
  const [designation, setDesignation] = useState('Quality Assay & Gate Inspector');
  const [gateDuty, setGateDuty] = useState('Gate No. 3');

  // Buyer
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [buyerType, setBuyerType] = useState<'Corporate' | 'Flour Mill' | 'Oil Expeller' | 'Exporter'>('Flour Mill');

  if (!isAuthModalOpen) return null;

  const rolesList: {
    role: UserRole;
    title: string;
    hindiTitle: string;
    badge: string;
    icon: string;
    color: string;
    selectedRing: string;
  }[] = [
    {
      role: 'farmer',
      title: 'Kissan / Farmer',
      hindiTitle: 'किसान',
      badge: 'MSP & Private Market',
      icon: '👨‍🌾',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      selectedRing: 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-500'
    },
    {
      role: 'mandi_officer',
      title: 'APMC Officer',
      hindiTitle: 'मंडी अधिकारी',
      badge: 'Gate Scanner & Assay',
      icon: '👩‍💼',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      selectedRing: 'border-blue-600 bg-blue-50 ring-1 ring-blue-500'
    },
    {
      role: 'corporate_buyer',
      title: 'Corporate Buyer',
      hindiTitle: 'व्यापारी / खरीदार',
      badge: 'Bids & Escrow Trade',
      icon: '🏢',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      selectedRing: 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500'
    },
    {
      role: 'admin',
      title: 'System Admin',
      hindiTitle: 'प्रशासक',
      badge: 'Data & System Control',
      icon: '🛡️',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      selectedRing: 'border-slate-800 bg-slate-100 ring-1 ring-slate-800'
    }
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (authMethod === 'otp' && enteredOtp !== '1234') {
      setError('Invalid OTP. For now, use 1234.');
      return;
    }
    const { success, message } = useApp().loginWithPhone(`+91 ${loginIdentifier}`);
    if (!success) setError(message);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!regName || !regPhone) {
      setError('Please fill in required fields');
      return;
    }

    const newProfile: Omit<UserProfile, 'id' | 'createdAt'> = {
      name: regName,
      phone: `+91 ${regPhone}`,
      email: regEmail || `${regPhone}@kisantrack.in`,
      role: selectedRole,
      avatar: selectedRole === 'farmer' ? '👨‍🌾' : selectedRole === 'mandi_officer' ? '👩‍💼' : selectedRole === 'corporate_buyer' ? '🏢' : '🛡️',
      state: regState,
      district: regDistrict,
      primaryMandi: regMandi,
      // Farmer specifics
      ...(selectedRole === 'farmer' ? {
        aadhaarMasked: `XXXX-XXXX-${aadhaarLast4 || '4412'}`,
        khasraNumber: khasraNo || `MP-${regDistrict.slice(0, 3).toUpperCase()}-2026/89`,
        landSizeAcres: parseFloat(landAcres) || 10,
        bankName,
        accountMasked: '•••• •••• 9921',
        ifscCode: bankIfsc,
        dbtVerified: true
      } : {}),
      // Officer specifics
      ...(selectedRole === 'mandi_officer' ? {
        employeeId: empId || `APMC-${regDistrict.slice(0, 3).toUpperCase()}-904`,
        designation,
        department: 'APMC Market Committee Board',
        assignedGate: gateDuty,
        assignedRamp: 'Ramp 4A'
      } : {}),
      // Buyer specifics
      ...(selectedRole === 'corporate_buyer' ? {
        companyName: companyName || regName + ' Agro Traders',
        gstin: gstin || '23AAACI9912Q1Z8',
        tradeLicenseNo: licenseNo || 'LIC-APMC-2026-88',
        buyerType,
        escrowBalance: 1500000
      } : {})
    };

    const { success, message } = registerUser(newProfile);
    if (!success) {
      setError(message);
    } else {
      setSuccess(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 tracking-tight">
                  {authModalMode === 'login' ? 'KisanTrack Login' : 'Create Account'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  SIH 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Unified Authentication for Farmers, APMC, and Buyers
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"

          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
          <button
            onClick={() => setAuthModalMode('login')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              authModalMode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t('login')}</span>
          </button>
          <button
            onClick={() => setAuthModalMode('register')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              authModalMode === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t('register')}</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Step 1: Role Selection Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Select Your Role (आपकी भूमिका चुनें):
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {rolesList.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer relative text-left ${
                      isSelected ? r.selectedRing : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{r.icon}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="font-bold text-slate-900 block text-xs">
                        {r.title}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-medium">
                        {r.hindiTitle}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600 mt-1 inline-block">
                        {r.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>



          {/* Form: LOGIN MODE */}
          {authModalMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-xs">
                  Login as {rolesList.find(r => r.role === selectedRole)?.title}
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('otp')}
                    className={`font-semibold cursor-pointer ${authMethod === 'otp' ? 'text-emerald-700 underline' : 'text-slate-400'}`}
                  >
                    Mobile OTP
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    className={`font-semibold cursor-pointer ${authMethod === 'password' ? 'text-emerald-700 underline' : 'text-slate-400'}`}
                  >
                    Password
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {selectedRole === 'farmer' ? 'Farmer Registered Mobile Number' : selectedRole === 'mandi_officer' ? 'Officer Mobile / Employee ID' : 'Buyer Corporate Mobile / GSTIN'}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-500 font-medium">
                    +91
                  </span>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              {authMethod === 'otp' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-semibold">Enter 4-Digit SMS OTP</label>
                    <span className="text-[10px] text-emerald-600 font-semibold">OTP: 1234</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3 py-2 text-center text-sm font-bold tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Security Password / PIN</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition"
              >
                <span>Login to {selectedRole === 'farmer' ? 'Kissan' : selectedRole === 'mandi_officer' ? 'Officer' : 'Buyer'} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Form: REGISTER MODE */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
              <div className="border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-xs">
                  New {rolesList.find(r => r.role === selectedRole)?.title} Registration
                </span>
              </div>

              {/* Common Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rameshwar Patidar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mobile Number (SMS Alerts) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">State</label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">District</label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Indore">Indore</option>
                    <option value="Ujjain">Ujjain</option>
                    <option value="Ludhiana">Ludhiana</option>
                    <option value="Karnal">Karnal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Primary Mandi</label>
                  <select
                    value={regMandi}
                    onChange={(e) => setRegMandi(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Indore APMC Mandi (Chhavani)">Indore APMC Mandi</option>
                    <option value="Khanna Grain Mandi">Khanna Grain Mandi</option>
                    <option value="Ujjain Krishi Upaj Mandi">Ujjain Krishi Upaj Mandi</option>
                  </select>
                </div>
              </div>

              {/* Role Specific Registration Fields */}
              {selectedRole === 'farmer' && (
                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                  <span className="font-bold text-emerald-900 block text-[11px]">
                    🌾 Kissan Land & DBT Verification Details:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Aadhaar (Last 4 Digits)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={aadhaarLast4}
                        onChange={(e) => setAadhaarLast4(e.target.value)}
                        placeholder="8921"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Land Size (Acres)</label>
                      <input
                        type="number"
                        value={landAcres}
                        onChange={(e) => setLandAcres(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Khasra / Land Record No.</label>
                      <input
                        type="text"
                        value={khasraNo}
                        onChange={(e) => setKhasraNo(e.target.value)}
                        placeholder="MP-IND-8921/21"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'mandi_officer' && (
                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
                  <span className="font-bold text-blue-900 block text-[11px]">
                    🏛️ APMC Mandi Official Authorization:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Officer Employee ID</label>
                      <input
                        type="text"
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                        placeholder="APMC-MP-IND-042"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Designation</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Gate Assignment</label>
                      <input
                        type="text"
                        value={gateDuty}
                        onChange={(e) => setGateDuty(e.target.value)}
                        placeholder="Gate No. 3"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'corporate_buyer' && (
                <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-3">
                  <span className="font-bold text-indigo-900 block text-[11px]">
                    🏢 Corporate Buyer & Trade Licensing:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Company / Mill Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Aashirvaad Roller Flour Mill"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="23AAACI1245P1Z3"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Mandi Trade License No.</label>
                      <input
                        type="text"
                        value={licenseNo}
                        onChange={(e) => setLicenseNo(e.target.value)}
                        placeholder="LIC-APMC-9941"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
              >
                <span>Register & Create {rolesList.find(r => r.role === selectedRole)?.title} Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
