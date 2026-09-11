const fs = require('fs');
let content = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

content = content.replace(/botSpeakingThreshold: [0-9.]+,\r?\n/g, '');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', content);
