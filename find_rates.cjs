const fs = require('fs');
const txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');
const lines = txt.split('\n');
const idx = lines.findIndex(l => l.includes("q.includes('भाव')"));
console.log(lines.slice(idx - 10, idx + 10).join('\n'));
