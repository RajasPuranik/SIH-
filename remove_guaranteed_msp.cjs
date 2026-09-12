const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/TokenPassCard.tsx', 'utf8');

txt = txt.replace(
  /<span className="text-slate-400 block text-\[11px\]">Guaranteed MSP Payout<\/span>/,
  ""
);

fs.writeFileSync('src/components/PillarGovt/TokenPassCard.tsx', txt, 'utf8');
console.log('Removed Guaranteed MSP Payout span');
