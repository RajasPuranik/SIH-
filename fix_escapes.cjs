const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// Replace literal \` with `
txt = txt.split('\\`').join('`');
// Replace literal \$ with $
txt = txt.split('\\$').join('$');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
