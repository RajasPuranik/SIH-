import re

with open('src/components/PillarGovt/GovtProcurementView.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

new_input_block = """<input 
                type="text" 
                id="manual-token-input"
                value={manualToken}
                onChange={handleTokenChange}
                placeholder="KT-MP-2026-XXXX" 
                className="px-4 py-2 outline-none text-sm w-44 font-mono uppercase bg-transparent placeholder-slate-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualToken) {
                    window.history.replaceState({}, '', '/?scan=' + manualToken);
                    setIsOfficerScannerOpen(true);
                  }
                }}
              />
              <button
                onClick={() => {
                  if (manualToken) {
                    window.history.replaceState({}, '', '/?scan=' + manualToken);
                    setIsOfficerScannerOpen(true);
                  }
                }}
                className="px-4 py-2 h-full bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm cursor-pointer transition border-l border-slate-300"
              >
                Verify
              </button>"""

txt = re.sub(
    r'<input\s+type="text"\s+id="manual-token-input"[\s\S]*?>\s*Verify\s*</button>',
    new_input_block,
    txt
)

with open('src/components/PillarGovt/GovtProcurementView.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Patched input block ONLY.")
