import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  TrendingUp, 
  Edit3, 
  Save, 
  LogOut, 
  CreditCard,
  FileCheck,
  Scale,
  Lock,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const UserProfileModal: React.FC = () => {
  const { 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    currentUser, 
    updateUserProfile,
    logoutUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    bookings,
    orderBook
  } = useApp();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email || '');
  const [district, setDistrict] = useState(currentUser.district);
  const [landAcres, setLandAcres] = useState(String(currentUser.landSizeAcres || 18.5));

  if (!isProfileModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      email,
      district,
      landSizeAcres: parseFloat(landAcres) || currentUser.landSizeAcres
    });
    setIsEditing(false);
  };

  const getRoleBadge = () => {
    if (currentUser.role === 'farmer') {
      return {
        label: 'Verified Kissan (किसान)',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        gradient: 'from-emerald-800 via-teal-900 to-slate-900'
      };
    }
    if (currentUser.role === 'mandi_officer') {
      return {
        label: 'Authorized APMC Officer (मंडी अधिकारी)',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        gradient: 'from-blue-900 via-slate-900 to-blue-950'
      };
    }
    return {
      label: 'Verified Corporate Buyer (व्यापारी)',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      gradient: 'from-indigo-900 via-slate-900 to-indigo-950'
    };
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Top Header Card */}
        <div className={`bg-gradient-to-r ${roleInfo.gradient} text-white p-6 relative shrink-0`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-4xl border border-white/20 shadow-md">
                {currentUser.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg sm:text-xl text-white">
                    {currentUser.name}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleInfo.badgeColor}`}>
                    {roleInfo.label}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    ID: {currentUser.id}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="text-white/70 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Stakeholder Credentials & Records
            </span>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              )}

              <button
                onClick={logoutUser}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Form / Details View */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Legal Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Registered Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {currentUser.role === 'farmer' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Cultivated Land (Acres)</label>
                  <input
                    type="number"
                    value={landAcres}
                    onChange={(e) => setLandAcres(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              )}
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 block text-xs border-b border-slate-200 pb-1.5">
                  Contact & Location
                </span>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{currentUser.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.email || 'No email registered'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.district}, {currentUser.state}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mandi: {currentUser.primaryMandi}</span>
                </div>
              </div>

              {/* Role Specific Record Card */}
              {currentUser.role === 'farmer' && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                    <span className="font-bold text-emerald-950 text-xs">
                      Land & DBT Bank Linkage
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded text-[9px] font-bold">
                      Aadhaar Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aadhaar (Masked):</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.aadhaarMasked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khasra / Land Record:</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.khasraNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cultivated Land:</span>
                    <span className="font-bold text-slate-800">{currentUser.landSizeAcres} Acres</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-200 pt-1.5">
                    <span className="text-slate-500">DBT Bank Account:</span>
                    <span className="font-mono font-bold text-emerald-800">{currentUser.bankName}</span>
                  </div>
                </div>
              )}

              {currentUser.role === 'mandi_officer' && (
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-1.5">
                    <span className="font-bold text-blue-950 text-xs">
                      APMC Official Deployment
                    </span>
                    <span className="px-1.5 py-0.2 bg-blue-200 text-blue-900 rounded text-[9px] font-bold">
                      Duty Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Designation:</span>
                    <span className="font-bold text-slate-800">{currentUser.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Gate:</span>
                    <span className="font-mono font-bold text-blue-800">{currentUser.assignedGate}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1.5">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-700">{currentUser.department}</span>
                  </div>
                </div>
              )}

              {currentUser.role === 'corporate_buyer' && (
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5">
                    <span className="font-bold text-indigo-950 text-xs">
                      Trade Licensing & Escrow
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                      Escrow Funded
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Company:</span>
                    <span className="font-bold text-slate-800">{currentUser.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GSTIN:</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.gstin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trade License:</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.tradeLicenseNo}</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200 pt-1.5">
                    <span className="text-slate-500">Escrow Reserve Balance:</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      ₹{currentUser.escrowBalance?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Metrics Card */}
          <div className="p-4 bg-slate-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-slate-500 text-[11px] block">Active Tokens / Bookings in System</span>
              <span className="text-lg font-bold font-mono text-slate-900">{bookings.length} Consignments</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Exchange Orders Live</span>
              <span className="text-lg font-bold font-mono text-indigo-700">{orderBook.length} Active Bids/Asks</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Member Since</span>
              <span className="text-xs font-semibold text-slate-800">{currentUser.createdAt}</span>
            </div>
          </div>

          {/* Switch Account button */}
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                setIsProfileModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Switch Stakeholder Persona / Login to Another Account →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
