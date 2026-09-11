const fs = require('fs');
const txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');
const lines = txt.split('\n');
const idx = lines.findIndex(l => l.includes("if (bookingContext.step === 'quantity')"));
console.log(lines.slice(idx, idx + 40).join('\n'));
