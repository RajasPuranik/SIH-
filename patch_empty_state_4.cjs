const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

// We find {activeSubTab === 'pass' && activeBooking && (
// And we want to replace up to the NEXT )}
const searchRegex = /\{activeSubTab === 'pass' && activeBooking && \([\s\S]*?Track Live Status for this Token [\s\S]*?\}\)/;

const replace = `{activeSubTab === 'pass' && (
        activeBooking ? (
          <div className="space-y-4">
            <TokenPassCard booking={activeBooking} />
            <div className="text-center">
              <button
                onClick={() => setActiveSubTab('tracker')}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
              >
                Track Live Status for this Token &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-900">No Gate Pass Available</h3>
            <p className="text-sm text-slate-500 mt-1">You must book a Mandi slot first to generate a digital gate pass.</p>
            <button onClick={() => setActiveSubTab('book')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold cursor-pointer transition">Book a Slot</button>
          </div>
        )
      )}`;

content = content.replace(searchRegex, replace);
fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', content);
