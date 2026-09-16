const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  'stage: nextStatus,',
  'stage: nextStatus as SlotStatus,'
);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log('Successfully fixed typescript errors in AppContext.tsx');
