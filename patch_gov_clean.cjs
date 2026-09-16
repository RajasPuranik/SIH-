const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

// 1. Fix the tabs array
txt = txt.replace(
  /const tabs = isOfficer[\s\S]*?\]\s*:\s*\[/,
  \`const tabs = isOfficer
    ? [
        { id: 'scanner' as const, label: 'Gate Scanner', icon: <ScanLine className="w-3.5 h-3.5" /> },
      ]
    : [\`
);

// 2. Replace the button
const btnToReplace = \`<button
              onClick={() => setActiveSubTab('tracker')}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition border border-slate-300"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              View All Token Statuses
            </button>\`;

const newInputs = \`<div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white h-[42px] mt-3 sm:mt-0">
              <input 
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
              </button>
            </div>\`;

txt = txt.replace(btnToReplace, newInputs);

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log("Success");
