import re

with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# Remove the incorrectly placed Aadhaar block
bad_block = r"""            \{selectedRole === 'farmer' && \(
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Aadhaar Number \*</label>
                <input
                  type="text"
                  maxLength=\{12\}
                  required
                  value=\{aadhaar\}
                  onChange=\{\(e\) => \{ setAadhaar\(e\.target\.value\.replace\(/\\D/g, ''\)\); setError\(''\); \}\}
                  placeholder="12-digit Aadhaar"
                  className="w-full px-3 py-2\.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            \)\}"""

txt = re.sub(bad_block, '', txt, flags=re.MULTILINE)

# The register form's submit button starts with:
# <button
#   type="submit"
#   className={`w-full py-2.5 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition ${roleInfo.btn}`}
# >
#   Create Account

# So we can insert the aadhaar block right before the Create Account button!

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
            )}
"""

submit_btn_regex = r'(<button\s*type="submit"\s*className=\{`w-full py-2\.5 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition \$\{roleInfo\.btn\}`\}\s*>\s*Create Account)'

txt = re.sub(submit_btn_regex, aadhaar_block + r'\1', txt)

with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Moved Aadhaar block to the Register form!")
