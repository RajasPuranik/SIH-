import re

with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

aadhaar_block = """            {selectedRole === 'farmer' && (
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
            )}"""

match = re.search(r'(placeholder="10-digit mobile"[\s\S]*?</div>\s*</div>)', txt)
if match:
    txt = txt[:match.end()] + '\n' + aadhaar_block + txt[match.end():]
    with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Aadhaar block added via slice!")
else:
    print("Could not find match.")
