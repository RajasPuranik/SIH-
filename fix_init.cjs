const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regex = /if \(isPhoneBotOpen\) \{/;
const replacement = `if (isPhoneBotOpen) {
      bookingContextRef.current = null;`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed initialization logic');
