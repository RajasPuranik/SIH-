const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace(
  "mandiName: 'Indore Central Mandi',",
  "mandiName: 'Indore Central Mandi',\n        tokenNumber: botRes.generatedToken.tokenNumber,"
);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Passed tokenNumber to createBooking');
