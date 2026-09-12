const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

// Fix CROP_SYNONYMS
const synonymsRegex = /const CROP_SYNONYMS: \{ id: string; terms: string\[\] \}\[\] = \[[\s\S]*?\];/;
const newSynonyms = `const CROP_SYNONYMS: { id: string; terms: string[] }[] = [
  { id: 'wheat', terms: ['wheat', 'गेहूं', 'गेहूँ', 'कनक', 'गहू', 'गव्हाचा'] },
  { id: 'soybean', terms: ['soybean', 'soya', 'सोयाबीन', 'सोया', 'सोयाबीनचा'] },
  { id: 'mustard', terms: ['mustard', 'sarson', 'सरसों', 'राई', 'मोहरी'] },
  { id: 'onion', terms: ['onion', 'प्याज', 'प्याज़', 'कांदा', 'कांद्याचा'] },
  { id: 'cotton', terms: ['cotton', 'cottan', 'court on', 'cot on', 'कपास', 'रुई', 'कापूस', 'कपाशी', 'कॉटन'] },
  { id: 'chana', terms: ['gram', 'graham', 'chana', 'channa', 'चना', 'चने', 'हरभरा', 'chanay', 'ग्राम'] },
  { id: 'maize', terms: ['maize', 'corn', 'मक्का', 'मका', 'भुट्टा'] },
  { id: 'paddy', terms: ['paddy', 'patty', 'dhan', 'dhaan', 'धान', 'भात', 'rice', 'chawal', 'padi', 'पैडी', 'तांदूळ', 'tandul'] },
];`;
txt = txt.replace(synonymsRegex, newSynonyms);

// Fix Marathi skipping
// Wait! Let's examine if 'book' translates to something that triggers another state.
// "मला स्लॉट बुक करायचा आहे" -> "mala slot book karaycha aahe" OR "mala slot book karaicha ahe"
// What if `q.includes('book')` triggers `newBookingContext: { step: 'crop' }`. That is CORRECT!
// What if it skips crop and quantity?
// How could it skip?
// If the user says "मला स्लॉट बुक करायचा आहे, 50 क्विंटल गहू"
// The bot processes this ONE time. It matches `!bookingContext && q.includes('book')`, and returns `{ step: 'crop' }`.
// Next, the user says "गहू". The bot sets `{ step: 'quantity', crop: 'Wheat' }`.
// The user says "50". The bot sets `{ step: 'vehicle', quantity: 50 }`.
// So how could it jump to vehicle directly and use default crop and weight?
// Default crop is Wheat. Default quantity is 50.
// Is there a place where it sets default crop and quantity?
// Let's search for "step: 'vehicle'" in phoneBotEngine.ts
// It ONLY exists in `bookingContext.step === 'quantity'`!
// What if the UI somehow passes `{ step: 'quantity' }` directly?
// Let's check `PhoneBotModal.tsx`.

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Fixed CROP_SYNONYMS');
