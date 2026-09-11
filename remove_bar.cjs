const fs = require('fs');
let modal = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regex = /\{\/\*[\s\S]*?MULTILINGUAL LANGUAGE BAR[\s\S]*?STATE: INCOMING CALL/g;
modal = modal.replace(regex, '{/* STATE: INCOMING CALL');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', modal, 'utf8');
console.log('Removed top language bar!');
