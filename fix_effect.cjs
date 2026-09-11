const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regex = /setCallState\('calling'\);\s*setTimeout\(\(\) => \{\s*connectCall\(\);\s*\}, 1600\);/g;
txt = txt.replace(regex, "setCallState('lang_select');");

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Successfully updated to lang_select');
