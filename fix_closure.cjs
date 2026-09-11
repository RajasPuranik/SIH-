const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// Inside finishAndTranscribe, replace handleUserUtterance(text, botLang) with handleUserUtterance(text, lang)
txt = txt.replace('handleUserUtterance(text, botLang);', 'handleUserUtterance(text, lang);');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed stale closure bug in finishAndTranscribe!');
