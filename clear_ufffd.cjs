const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// replace all U+FFFD with '-'
txt = txt.replace(/\uFFFD/g, '-');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Cleared all U+FFFD');
