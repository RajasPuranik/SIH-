const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /const getActiveBooking = \(\) => bookings\.find\(\(b\) => b\.id === activeBookingId\) \|\| bookings\[0\];/;
const replacement = `const getActiveBooking = () => {
    if (!currentUser) return undefined;
    if (currentUser.role === 'mandi_officer' || currentUser.role === 'admin') {
      return bookings.find((b) => b.id === activeBookingId) || bookings[0];
    }
    const myBookings = bookings.filter(b => b.farmerPhone === currentUser.phone);
    if (myBookings.length === 0) return undefined;
    return myBookings.find(b => b.id === activeBookingId) || myBookings[0];
  };`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/context/AppContext.tsx', content);
