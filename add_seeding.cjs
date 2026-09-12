const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /if \(dbBookings && dbBookings\.length > 0\) \{\n\s*setBookings\(dbBookings\);\n\s*\}/;
const replacement = `if (dbBookings && dbBookings.length > 0) {
            setBookings(dbBookings);
          } else {
            // DB is empty! Push our local persistent state to seed the database so other devices can see our current tokens
            bookings.forEach(b => {
              fetch('/api/bookings', { method: 'POST', body: JSON.stringify(b) }).catch(() => {});
            });
          }`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Added initial DB seeding');
