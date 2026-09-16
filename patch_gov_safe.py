import re

with open('src/components/PillarGovt/GovtProcurementView.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. Add state and handler
state_insertion = """  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'book' | 'pass' | 'payment' | 'scanner' | 'map'>(defaultTab);

  const [manualToken, setManualToken] = useState('');
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
    if (val.length > 10) val = val.slice(0, 10) + '-' + val.slice(10);
    if (val.length > 15) val = val.slice(0, 15);
    setManualToken(val);
  };"""

txt = re.sub(r"  const \[activeSubTab.*?\] = useState.*?;\r?\n", state_insertion + '\n', txt)

# 2. Replace input block
old_input_block = """<input 
                type="text" 
                id="manual-token-input"
                placeholder="Enter Token No." 
                className="px-4 py-2 outline-none text-sm w-40 font-mono uppercase bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) {
                      window.history.replaceState({}, '', '/?scan=' + val);
                      setIsOfficerScannerOpen(true);
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const val = (document.getElementById('manual-token-input') as HTMLInputElement).value;
                  if (val) {
                    window.history.replaceState({}, '', '/?scan=' + val);
                    setIsOfficerScannerOpen(true);
                  }
                }}
                className="px-4 py-2 h-full bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm cursor-pointer transition border-l border-slate-300"
              >
                Verify
              </button>"""

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

# Using robust whitespace-agnostic replacement
# Just replace everything between <input type="text" id="manual-token-input" and the end of the button
import re
txt = re.sub(
    r'<input\s+type="text"\s+id="manual-token-input"[\s\S]*?>\s*Verify\s*</button>',
    new_input_block,
    txt
)

with open('src/components/PillarGovt/GovtProcurementView.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Patched!")
