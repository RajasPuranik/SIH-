const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regex = /accumulatedTranscriptRef\.current = '';\n\s*\}, 600\);/;
const replacement = `accumulatedTranscriptRef.current = '';\n      bookingContextRef.current = null;\n    }, 600);`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed bookingContextRef clearing');
