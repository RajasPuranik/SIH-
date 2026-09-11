const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace(/lastMessage\?\.text\.length/g, '(lastMessage?.text?.length || 0)');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
