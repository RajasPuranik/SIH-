const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace(
  'const radius = 135;',
  'const radius = 100;'
);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Reduced orbit bubbles distance');
