const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /return updatedBooking;\n\s*\}\)\n\s*\);/;
const replacement = `fetch('/api/bookings', { method: 'POST', body: JSON.stringify(updatedBooking) }).catch(e => console.warn(e));
        return updatedBooking;
      })
    );`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Added POST to updateBookingStatus');
