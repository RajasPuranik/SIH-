const fs = require('fs');
let modal = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const lines = modal.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* STATE: INCOMING CALL */}')) {
    lines[i] = '      {/* STATE: INCOMING CALL */}';
  }
}
modal = lines.join('\n');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', modal, 'utf8');
console.log('Fixed comment syntax properly');
