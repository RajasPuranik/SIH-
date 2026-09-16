with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# First we need to find and remove the bad block in the login form.
bad_block = """            {selectedRole === 'farmer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Aadhaar Number *</label>
                <input
                  type="text"
                  maxLength={12}
                  required
                  value={aadhaar}
                  onChange={(e) => { setAadhaar(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="12-digit Aadhaar"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            )}
"""

txt = txt.replace(bad_block, "")

# Now add it before the Create Account button
submit_btn = """            <button
              type="submit"
              className={`w-full py-2.5 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition ${roleInfo.btn}`}
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </button>"""

txt = txt.replace(submit_btn, bad_block + submit_btn)

with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Fixed using str.replace!")
