const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace(
  "addNotification('Invalid VRN Format. Example: MP-09-AB-1234', 'error');",
  "addNotification({ type: 'SYSTEM', title: 'Invalid Format', message: 'Please enter a valid VRN (e.g., MP-09-AB-1234)' });"
);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed addNotification call');
