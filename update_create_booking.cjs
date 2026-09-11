const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldType = /createBooking: \(newBooking: Omit<SlotBooking, 'id' \| 'tokenNumber' \| 'status' \| 'statusHistory'>\) => SlotBooking;/;
const newType = "createBooking: (newBooking: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'> & { tokenNumber?: string }) => SlotBooking;";
txt = txt.replace(oldType, newType);

const oldImpl = /const createBooking = \(\n\s*newBookingData: Omit<SlotBooking, 'id' \| 'tokenNumber' \| 'status' \| 'statusHistory'>\n\s*\): SlotBooking => \{/;
const newImpl = `const createBooking = (
    newBookingData: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'> & { tokenNumber?: string }
  ): SlotBooking => {`;
txt = txt.replace(oldImpl, newImpl);

const oldTokenGen = /const tokenNumber = 'KT-' \+ newBookingData\.state\.slice\(0, 2\)\.toUpperCase\(\) \+ '-2026-' \+ randomNum;/;
const newTokenGen = `const tokenNumber = newBookingData.tokenNumber || 'KT-' + newBookingData.state.slice(0, 2).toUpperCase() + '-2026-' + randomNum;`;
txt = txt.replace(oldTokenGen, newTokenGen);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Updated createBooking signature');
