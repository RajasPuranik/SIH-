const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

// Using a very robust replacement by rewriting the whole activeSubTab === 'scanner' block
const regex = /\{activeSubTab === 'scanner' && \([\s\S]*?\}\)/;
const replacement = `{activeSubTab === 'scanner' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4">
          <div className="text-4xl">📷</div>
          <h3 className="font-bold text-slate-900 text-base">QR Gate Pass Scanner</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Scan farmer QR tokens at the gate entry, run quality assay, or manually enter a token number to advance pipeline status.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
            <button
              onClick={() => setIsOfficerScannerOpen(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition h-[42px]"
            >
              <ScanLine className="w-4 h-4" />
              Open Gate Scanner
            </button>
            <span className="text-slate-400 font-bold mx-2 hidden sm:inline-block">OR</span>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white h-[42px]">
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
            </div>
          </div>
        </div>
      )}`;

// wait, this regex might match up to the end of the file if there's another `})`! 
// Let's use a very specific replace
txt = txt.replace(/\{\s*\/\* Officer scanner panel \*\/\s*\}([\s\S]*?)(?=\{\s*activeSubTab === 'tracker')/, `{/* Officer scanner panel */}
      ${replacement}

      `);

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log('Fixed scanner UI strictly');
