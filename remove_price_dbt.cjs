const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/TokenPassCard.tsx', 'utf8');

const regex = /<div>\s*<span className="font-bold text-emerald-700 text-sm font-mono">\s*₹\{grossValue\}\s*<\/span>\s*<span className="text-\[10px\] text-slate-500 block">\s*Direct Bank Transfer \(DBT\)\s*<\/span>\s*<\/div>/;
txt = txt.replace(regex, "");

fs.writeFileSync('src/components/PillarGovt/TokenPassCard.tsx', txt, 'utf8');
console.log('Removed price and DBT text');
