const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  'const cleanPhone = (p) =>',
  'const cleanPhone = (p?: string) =>'
);

code = code.replace(
  'const updatedBk = { ...b, status: nextStatus, tokenNumber: newToken, statusHistory: updatedHistory };',
  'const updatedBk: SlotBooking = { ...b, status: nextStatus as SlotStatus, tokenNumber: newToken, statusHistory: updatedHistory };'
);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log('Successfully fixed typescript errors in AppContext.tsx');
