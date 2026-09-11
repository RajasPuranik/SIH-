const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

txt = txt.replace(
  "createBooking: (newBooking: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'> & { tokenNumber?: string }) => SlotBooking;",
  "createBooking: (newBooking: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'> & { tokenNumber?: string }, skipBroadcast?: boolean) => SlotBooking;"
);

txt = txt.replace(
  "updateBookingStatus: (id: string, newStatus: SlotStatus, remarks?: string, officerName?: string) => void;",
  "updateBookingStatus: (id: string, newStatus: SlotStatus, remarks?: string, officerName?: string, skipBroadcast?: boolean) => void;"
);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Fixed AppContextType signatures');
