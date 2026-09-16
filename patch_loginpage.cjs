const fs = require('fs');
let txt = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

// 1. Add Aadhaar state
txt = txt.replace(
  "const [regPhone, setRegPhone] = useState('');",
  "const [regPhone, setRegPhone] = useState('');\n  const [aadhaar, setAadhaar] = useState('');"
);

// 2. Add Aadhaar validation in handleRegister
const handleRegStart = `  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !regPhone.trim()) return;`;

const newHandleRegStart = `  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !regPhone.trim()) return;
    
    if (selectedRole === 'farmer' && aadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }`;

txt = txt.replace(handleRegStart, newHandleRegStart);

// 3. Add aadhaarMasked to baseProfile for farmer
const baseProfileStr = `      state: 'Madhya Pradesh',
      district: 'Indore',
      primaryMandi: 'Indore APMC Mandi (Chhavani)',
    } as Omit<UserProfile, 'id' | 'createdAt'>;`;

const newBaseProfileStr = `      state: 'Madhya Pradesh',
      district: 'Indore',
      primaryMandi: 'Indore APMC Mandi (Chhavani)',
      ...(selectedRole === 'farmer' ? {
        aadhaarMasked: aadhaar ? \`XXXX-XXXX-\${aadhaar.slice(-4)}\` : 'XXXX-XXXX-4412',
        khasraNumber: 'MP-IND-8921/2021',
        landSizeAcres: 12.5,
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001245',
        dbtVerified: true
      } : {})
    } as Omit<UserProfile, 'id' | 'createdAt'>;`;

txt = txt.replace(baseProfileStr, newBaseProfileStr);

// 4. Update Name input to only allow text
txt = txt.replace(
  `onChange={(e) => setName(e.target.value)}`,
  `onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\\s]/g, ''))}`
);

// 5. Update Phone input to only allow numbers (already does \D/g in AuthModal, but in LoginPage it doesn't!)
txt = txt.replace(
  `onChange={(e) => { setRegPhone(e.target.value); setError(''); }}`,
  `onChange={(e) => { setRegPhone(e.target.value.replace(/\\D/g, '')); setError(''); }}`
);

// 6. Render Aadhaar input if selectedRole === 'farmer'
const regPhoneBlock = `            <div>
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
                  onChange={(e) => { setRegPhone(e.target.value.replace(/\\D/g, '')); setError(''); }}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-r-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>`;

const aadhaarBlock = `
            {selectedRole === 'farmer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Aadhaar Number *</label>
                <input
                  type="text"
                  maxLength={12}
                  required
                  value={aadhaar}
                  onChange={(e) => { setAadhaar(e.target.value.replace(/\\D/g, '')); setError(''); }}
                  placeholder="12-digit Aadhaar"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            )}`;

txt = txt.replace(regPhoneBlock, regPhoneBlock + aadhaarBlock);

fs.writeFileSync('src/pages/LoginPage.tsx', txt, 'utf8');
console.log('Patched LoginPage');
