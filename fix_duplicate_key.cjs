const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

txt = txt.replace(
  /'दहा': '10', 'वीस': '20', 'तीस': '30', 'चाळीस': '40', 'पन्नास': '50'/g,
  "'दहा': '10', 'वीस': '20', 'चाळीस': '40', 'पन्नास': '50'"
);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Fixed duplicate object key');
