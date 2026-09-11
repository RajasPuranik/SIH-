const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regexTokenDetails = /<p><strong>Token:<\/strong> \{lastMessage\.generatedToken\.tokenNumber\}<\/p>/;
const newTokenDetails = `<p><strong>Name:</strong> {currentUser?.name || 'Farmer'}</p>\n                      <p><strong>Token:</strong> {lastMessage.generatedToken.tokenNumber}</p>`;

txt = txt.replace(regexTokenDetails, newTokenDetails);
fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Added Name to the generated token');
