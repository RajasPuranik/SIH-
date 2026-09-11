const fs = require('fs');
let txt = fs.readFileSync('src/data/mockData.ts', 'utf8');

const regex = /export const INITIAL_BOOKINGS: SlotBooking\[\] = \[[\s\S]*?\];\n\nexport const INITIAL_ORDER_BOOK/;

txt = txt.replace(regex, "export const INITIAL_BOOKINGS: SlotBooking[] = [];\n\nexport const INITIAL_ORDER_BOOK");

fs.writeFileSync('src/data/mockData.ts', txt, 'utf8');
console.log('Cleared initial fake bookings');
