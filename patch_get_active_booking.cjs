const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /const myBookings = bookings\.filter\(b => b\.farmerPhone === currentUser\.phone\);/;
const replace = `const cleanPhone = (p: string) => p.replace(/\\D/g, '').slice(-10);
    const myBookings = bookings.filter(b => cleanPhone(b.farmerPhone) === cleanPhone(currentUser.phone));`;

content = content.replace(regex, replace);
fs.writeFileSync('src/context/AppContext.tsx', content);
