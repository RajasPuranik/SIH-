const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /const getActiveBooking = \(\) => \{[\s\S]*?return myBookings\.find\(b => b\.id === activeBookingId\) \|\| myBookings\[0\];\n    \};/;

const replace = `const getActiveBooking = () => {
      if (!currentUser) return undefined;
      if (currentUser.role === 'mandi_officer' || currentUser.role === 'admin') {
        return bookings.find((b) => b.id === activeBookingId) || bookings[0];
      }
      const cleanPhone = (p?: string) => (p || '').replace(/\\D/g, '').slice(-10);
      const myBookings = bookings.filter(b => cleanPhone(b.farmerPhone) === cleanPhone(currentUser.phone));
      
      console.log('getActiveBooking DEBUG:', { 
        currentUserPhone: currentUser.phone, 
        cleanedUserPhone: cleanPhone(currentUser.phone),
        myBookingsCount: myBookings.length,
        activeBookingId,
        allBookingsCount: bookings.length
      });

      if (myBookings.length === 0) return undefined;
      return myBookings.find(b => b.id === activeBookingId) || myBookings[0];
    };`;

content = content.replace(regex, replace);
fs.writeFileSync('src/context/AppContext.tsx', content);
