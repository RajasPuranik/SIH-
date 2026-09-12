const fs = require('fs');
let lines = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8').split('\n');

// 1. Update useApp imports at line 19
// original: const { getActiveBooking, setIsOfficerScannerOpen, userRole } = useApp();
for (let i = 0; i < 30; i++) {
  if (lines[i] && lines[i].includes('const { getActiveBooking, setIsOfficerScannerOpen, userRole } = useApp();')) {
    lines[i] = "  const { getActiveBooking, setActiveBookingId, setIsOfficerScannerOpen, userRole, bookings, currentUser } = useApp();";
    break;
  }
}

// 2. Update activeBooking definition at line 28
// original: const activeBooking = getActiveBooking();
// we insert myBookings logic here.
for (let i = 0; i < 40; i++) {
  if (lines[i] && lines[i].includes('const activeBooking = getActiveBooking();')) {
    lines[i] = `  const activeBooking = getActiveBooking();
  const cleanPhone = (p?: string) => (p || '').replace(/\\D/g, '').slice(-10);
  const myBookings = isOfficer ? bookings : bookings.filter(b => cleanPhone(b.farmerPhone) === cleanPhone(currentUser?.phone));`;
    break;
  }
}

// 3. Replace lines from {activeSubTab === 'pass' && ( ... down to its closing tag
let passStart = -1;
let passEnd = -1;
for (let i = 100; i < lines.length; i++) {
  if (lines[i] && lines[i].includes("{activeSubTab === 'pass' && (")) {
    passStart = i;
  }
  if (passStart !== -1 && lines[i] && lines[i].includes("{activeSubTab === 'payment' &&")) {
    passEnd = i - 1;
    break;
  }
}

if (passStart !== -1 && passEnd !== -1) {
  const replacement = `      {activeSubTab === 'pass' && (
        myBookings.length > 0 ? (
          <div className="space-y-8">
            {myBookings.map((booking, idx) => (
              <div key={booking.id || idx} className="space-y-4">
                <TokenPassCard booking={booking} />
                <div className="text-center pb-4 border-b border-slate-100 last:border-0">
                  <button
                    onClick={() => { setActiveBookingId(booking.id); setActiveSubTab('tracker'); }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
                  >
                    Track Live Status for this Token &rarr;
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
      )}
`;
  lines.splice(passStart, passEnd - passStart + 1, replacement);
}

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', lines.join('\n'), 'utf8');
console.log('Fixed GovtProcurementView cleanly');
