const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

txt = txt.replace(
  /newBookingData: Omit<SlotBooking, 'id' \| 'tokenNumber' \| 'status' \| 'statusHistory'>\n\s*\): SlotBooking => \{/g,
  "newBookingData: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'> & { tokenNumber?: string }\n  ): SlotBooking => {"
);

// If it was on one line:
txt = txt.replace(
  /newBookingData: Omit<SlotBooking, 'id' \| 'tokenNumber' \| 'status' \| 'statusHistory'>\): SlotBooking => \{/g,
  "newBookingData: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'> & { tokenNumber?: string }): SlotBooking => {"
);

// Wait, let's just use string replace without regex to be safe:
const strToFind = "newBookingData: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'>";
const strToReplace = "newBookingData: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'> & { tokenNumber?: string }";
txt = txt.split(strToFind).join(strToReplace);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Fixed createBooking signature');
