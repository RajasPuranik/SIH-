const fs = require('fs');
const txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');
const lines = txt.split('\n');
const idx = lines.findIndex(l => l.includes("bookingContext.step === 'time'"));
console.log(lines.slice(idx, idx + 20).join('\n'));
