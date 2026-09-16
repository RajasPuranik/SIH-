const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

const regex = /<input[\s\S]*?id="manual-token-input"[\s\S]*?\/>/;
const newInput = `<input 
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
              />`;

txt = txt.replace(regex, newInput);

const buttonRegex = /<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?document\.getElementById\('manual-token-input'\)[\s\S]*?<\/button>/;
const newButton = `<button
                onClick={() => {
                  if (manualToken) {
                    window.history.replaceState({}, '', '/?scan=' + manualToken);
                    setIsOfficerScannerOpen(true);
                  }
                }}
                className="px-4 py-2 h-full bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm cursor-pointer transition border-l border-slate-300"
              >
                Verify
              </button>`;

txt = txt.replace(buttonRegex, newButton);

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log("Patched input properly.");
