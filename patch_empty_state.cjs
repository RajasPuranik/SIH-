const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

const regex = /\{activeSubTab === 'pass' && activeBooking && \([\s\S]*?\}\)/;

const replacement = `{activeSubTab === 'pass' && (
        activeBooking ? (
          <div className="space-y-4">
            <TokenPassCard booking={activeBooking} />
            <div className="text-center">
              <button
                onClick={() => setActiveSubTab('tracker')}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
              >
                Track Live Status for this Token →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-900">No Gate Pass Available</h3>
            <p className="text-sm text-slate-500 mt-1">You must book a Mandi slot first to generate a digital gate pass.</p>
            <button onClick={() => setActiveSubTab('book')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Book a Slot</button>
          </div>
        )
      )}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', content);
