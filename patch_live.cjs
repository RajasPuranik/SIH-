const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/LiveStatusTracker.tsx', 'utf8');

// Quick Demo Tokens
const demoRegex = /\{\/\* Quick Demo Tokens \*\/\}[\s\S]*?<\/div>/;
content = content.replace(demoRegex, '');

// Simulate Next Stage Button
const simulateBtnRegex = /\{\/\* Advance Status Button for Testing\/Demo \*\/\}[\s\S]*?<\/button>/;
content = content.replace(simulateBtnRegex, '');

// The handleAdvanceStep function
const handleAdvRegex = /const handleAdvanceStep = \(\) => \{[\s\S]*?updateBookingStatus\(currentBooking\.id, nextStatus\);\s*\}\s*\};\s*/;
content = content.replace(handleAdvRegex, '');

// Remove the text: "Try selecting one of the demo tokens below."
content = content.replace('Try selecting one of the demo tokens below.', 'Please check the token number and try again.');

fs.writeFileSync('src/components/PillarGovt/LiveStatusTracker.tsx', content);
