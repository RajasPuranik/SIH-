const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /setActiveBookingId\(newId\);/;
const replacement = `setActiveBookingId(newId);
    fetch('/api/bookings', { method: 'POST', body: JSON.stringify(newBooking) }).catch(e => console.warn(e));`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Added POST to createBooking');
