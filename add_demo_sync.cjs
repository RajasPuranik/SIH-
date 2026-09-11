const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'utf8');

// Add createBooking
txt = txt.replace(
  "updateBookingStatus, \n    playFeedbackTone \n  } = useApp();",
  "updateBookingStatus, \n    playFeedbackTone,\n    createBooking \n  } = useApp();"
);

// Modify handleTokenScanned
const oldScan = /let booking = bookingsRef\.current\.find\(b => b\.tokenNumber === tokenText \|\| b\.id === tokenText\);\n\s*if \(\!booking\) \{\n\s*setErrorMsg\('Invalid QR Code: Token not found in database\.'\);\n\s*playFeedbackTone\('alert'\);\n\s*setTimeout\(\(\) => setErrorMsg\(''\), 3000\);\n\s*return;\n\s*\}/;

const newScan = `let booking = bookingsRef.current.find(b => b.tokenNumber === tokenText || b.id === tokenText);
    
    if (!booking) {
      if (tokenText.startsWith('KT-')) {
        booking = createBooking({
          tokenNumber: tokenText,
          farmerName: 'Demo Farmer (Cross-Device)',
          farmerPhone: '+91 99999 99999',
          aadhaarMasked: 'XXXX-XXXX-0000',
          state: 'Madhya Pradesh',
          district: 'Indore',
          mandiName: 'Indore APMC Mandi',
          cropId: 'wheat',
          cropName: 'Wheat (गेहूँ)',
          estimatedQuantityQuintals: 50,
          vehicleType: 'Tractor Trolley',
          vehicleNumber: 'MP-09-XX-0000',
          bookingDate: new Date().toISOString().split('T')[0],
          scheduledTimeSlot: '10:00 AM - 11:30 AM',
        });
      } else {
        setErrorMsg('Invalid QR Code: Token not found in database.');
        playFeedbackTone('alert');
        setTimeout(() => setErrorMsg(''), 3000);
        return;
      }
    }`;

// Wait, the regex failed because `const booking = ...` was used, not `let booking = ...`.
txt = txt.replace(
  /const booking = bookingsRef\.current\.find\(b => b\.tokenNumber === tokenText \|\| b\.id === tokenText\);\n\s*if \(\!booking\) \{\n\s*setErrorMsg\('Invalid QR Code: Token not found in database\.'\);\n\s*playFeedbackTone\('alert'\);\n\s*setTimeout\(\(\) => setErrorMsg\(''\), 3000\);\n\s*return;\n\s*\}/,
  newScan
);

fs.writeFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', txt, 'utf8');
console.log('Added cross-device demo sync magic');
