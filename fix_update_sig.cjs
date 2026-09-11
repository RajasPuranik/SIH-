const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const findSig = "const updateBookingStatus = (\n    id: string,\n    newStatus: SlotStatus,\n    remarks: string = '',\n    officerName?: string\n  ) => {";
const replaceSig = "const updateBookingStatus = (\n    id: string,\n    newStatus: SlotStatus,\n    remarks: string = '',\n    officerName?: string,\n    skipBroadcast: boolean = false\n  ) => {";

if (txt.includes(findSig)) {
  txt = txt.replace(findSig, replaceSig);
} else {
  // Try fallback
  txt = txt.replace(
    /const updateBookingStatus = \([\s\S]*?officerName\?: string[\s\S]*?\) => \{/,
    replaceSig
  );
}

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Fixed updateBookingStatus sig');
