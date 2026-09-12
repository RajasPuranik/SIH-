const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

// I need to import setActiveBookingId if it's not imported
const useAppRegex = /const \{ getActiveBooking, setIsOfficerScannerOpen, userRole, bookings, currentUser \} = useApp\(\);/;
const useAppReplacement = `const { getActiveBooking, setActiveBookingId, setIsOfficerScannerOpen, userRole, bookings, currentUser } = useApp();`;
txt = txt.replace(useAppRegex, useAppReplacement);

// Modify the button onClick to set activeBookingId
const trackButtonRegex = /onClick=\{\(\) => setActiveSubTab\('tracker'\)\}/g;
const trackButtonReplacement = `onClick={() => { setActiveBookingId(booking.id); setActiveSubTab('tracker'); }}`;
txt = txt.replace(trackButtonRegex, trackButtonReplacement);

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log('Fixed Track Live Status button to select specific token');
