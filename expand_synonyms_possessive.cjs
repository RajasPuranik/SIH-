const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const regex = /const CROP_SYNONYMS: \{ id: string; terms: string\[\] \}\[\] = \[[\s\S]*?\];/;
const replacement = `const CROP_SYNONYMS: { id: string; terms: string[] }[] = [
  { id: 'wheat', terms: ['wheat', 'गेहूं', 'गेहूँ', 'कनक', 'गहू', 'गव्हाचा', 'गव्हाची', 'gahu', 'gavhacha'] },
  { id: 'soybean', terms: ['soybean', 'soya', 'सोयाबीन', 'सोया', 'सोयाबीनचा', 'soyabean', 'soyabeancha'] },
  { id: 'mustard', terms: ['mustard', 'sarson', 'सरसों', 'राई', 'मोहरी', 'मोहरीचा', 'mohari', 'rai', 'moharicha'] },
  { id: 'onion', terms: ['onion', 'प्याज', 'प्याज़', 'कांदा', 'कांद्याचा', 'kanda', 'kandyacha'] },
  { id: 'cotton', terms: ['cotton', 'cottan', 'court on', 'cot on', 'कपास', 'रुई', 'कापूस', 'कापुस', 'कपाशी', 'कॉटन', 'kapus', 'kaapus', 'kapashi', 'कापसाचा', 'कापसाची', 'kapasacha'] },
  { id: 'chana', terms: ['gram', 'graham', 'chana', 'channa', 'चना', 'चने', 'चणा', 'हरभरा', 'हरबरा', 'chanay', 'ग्राम', 'harbhara', 'harbara', 'हरभऱ्याचा', 'हरभर्याचा', 'चण्याचा', 'harbharyacha', 'chanyacha'] },
  { id: 'maize', terms: ['maize', 'corn', 'मक्का', 'मका', 'भुट्टा', 'maka', 'मक्याचा', 'makyacha'] },
  { id: 'paddy', terms: ['paddy', 'patty', 'dhan', 'dhaan', 'धान', 'भात', 'भाताचा', 'rice', 'chawal', 'padi', 'पैडी', 'तांदूळ', 'तांदुळ', 'tandul', 'bhat', 'bhaat', 'धानाचा', 'तांदळाचा', 'dhanacha', 'tandalacha'] },
];`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Expanded crop synonyms for Marathi with possessives');
