const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

// 1. Remove "for example..."
txt = txt.replace(
  /'यह एक अमान्य वाहन नंबर है। कृपया सही नंबर बताएं, जैसे एम पी 0 9 ए बी 1 2 3 4'/g,
  "'यह एक अमान्य वाहन नंबर है। कृपया सही नंबर बताएं।'"
);
txt = txt.replace(
  /'That is an invalid vehicle number\. Please state a valid VRN, for example MP 09 AB 1234\.'/g,
  "'That is an invalid vehicle number. Please state a valid vehicle registration number.'"
);

// 2. Update CROP_SYNONYMS
const oldSynonyms = /const CROP_SYNONYMS: \{ id: string; terms: string\[\] \}\[\] = \[[\s\S]*?\];/;
const newSynonyms = `const CROP_SYNONYMS: { id: string; terms: string[] }[] = [
  { id: 'wheat', terms: ['wheat', 'गेहूं', 'गेहूँ', 'कनक', 'गहू', 'गव्हाचा'] },
  { id: 'soybean', terms: ['soybean', 'soya', 'सोयाबीन', 'सोया', 'सोयाबीनचा'] },
  { id: 'mustard', terms: ['mustard', 'sarson', 'सरसों', 'राई', 'मोहरी'] },
  { id: 'onion', terms: ['onion', 'प्याज', 'प्याज़', 'कांदा', 'कांद्याचा'] },
  { id: 'cotton', terms: ['cotton', 'cottan', 'court on', 'cot on', 'कपास', 'रुई', 'कापूस', 'कपाशी'] },
  { id: 'gram', terms: ['gram', 'graham', 'chana', 'channa', 'चना', 'चने', 'हरभरा', 'chanay'] },
  { id: 'maize', terms: ['maize', 'corn', 'मक्का', 'मका', 'भुट्टा'] },
  { id: 'paddy', terms: ['paddy', 'patty', 'dhan', 'dhaan', 'धान', 'भात', 'rice', 'chawal'] },
];`;

txt = txt.replace(oldSynonyms, newSynonyms);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Fixed voice text and added crop synonyms');
