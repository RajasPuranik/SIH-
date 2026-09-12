const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

// Add bookings and currentUser to useApp destructuring
const useAppRegex = /const \{ getActiveBooking, setIsOfficerScannerOpen, userRole \} = useApp\(\);/;
const useAppReplacement = `const { getActiveBooking, setIsOfficerScannerOpen, userRole, bookings, currentUser } = useApp();`;
txt = txt.replace(useAppRegex, useAppReplacement);

// Add myBookings logic
const activeBookingRegex = /const activeBooking = getActiveBooking\(\);\n\s*console\.log\('GovtProcurementView render: activeBooking is', activeBooking\);/;
const activeBookingReplacement = `const activeBooking = getActiveBooking();
  
  const cleanPhone = (p?: string) => (p || '').replace(/\\D/g, '').slice(-10);
  const myBookings = isOfficer ? bookings : bookings.filter(b => cleanPhone(b.farmerPhone) === cleanPhone(currentUser?.phone));`;
txt = txt.replace(activeBookingRegex, activeBookingReplacement);

// Replace the rendering block for 'pass'
const passRenderRegex = /\{activeSubTab === 'pass' && \([\s\S]*?\)\s*\)\}/;
const passRenderReplacement = `{activeSubTab === 'pass' && (
        myBookings.length > 0 ? (
          <div className="space-y-8">
            {myBookings.map((booking, idx) => (
              <div key={booking.id || idx} className="space-y-4">
                <TokenPassCard booking={booking} />
                <div className="text-center pb-4 border-b border-slate-100 last:border-0">
                  <button
                    onClick={() => setActiveSubTab('tracker')}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
                  >
                    Track Live Status for Tokens &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-900">No Gate Pass Available</h3>
            <p className="text-sm text-slate-500 mt-1">You must book a Mandi slot first to generate a digital gate pass.</p>
            <button onClick={() => setActiveSubTab('book')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold cursor-pointer transition">Book a Slot</button>
          </div>
        )
      )}`;
txt = txt.replace(passRenderRegex, passRenderReplacement);

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log('Modified GovtProcurementView to show all tokens');
