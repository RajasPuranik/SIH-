const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'utf-8');

const t1 =       if (!booking) {
        setErrorMsg('Invalid QR Code: Token not found in database.');
        playFeedbackTone('alert');
        setTimeout(() => {
          setErrorMsg('');
          isProcessingScanRef.current = false;
        }, 3000);
        return;
      };

const r1 =       if (!booking) {
        setErrorMsg('Invalid QR Code: Token not found in database.');
        playFeedbackTone('alert');
        setTimeout(() => {
          setErrorMsg('');
          isProcessingScanRef.current = false;
        }, 3000);
        return;
      }

      if (booking.status === 'REJECTED' || booking.status === 'PAYMENT_COMPLETED') {
        setErrorMsg('Invalid Scan: Token is already ' + booking.status.replace(/_/g, ' ') + '.');
        playFeedbackTone('alert');
        setTimeout(() => {
          setErrorMsg('');
          isProcessingScanRef.current = false;
        }, 3000);
        return;
      };

if (content.includes(t1)) {
    content = content.replace(t1, r1);
} else if (content.includes(t1.replace(/\r\n/g, '\n'))) {
    content = content.replace(t1.replace(/\r\n/g, '\n'), r1);
}

const t2 =                         const chars = 'BCDFGHJKLMNPQRSTVWXYZ0123456789';
                        const randomSuffix = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                        const newToken = \KT-\-2026-\\;
                        
                        updateBookingStatus(
                          currentBooking.id, 
                          nextStatus, 
                          remarks, 
                          officer, 
                          false, 
                          { tokenNumber: newToken }
                        );;

const r2 =                         updateBookingStatus(
                          currentBooking.id, 
                          nextStatus, 
                          remarks, 
                          officer, 
                          false
                        );;

if (content.includes(t2)) {
    content = content.replace(t2, r2);
} else if (content.includes(t2.replace(/\r\n/g, '\n'))) {
    content = content.replace(t2.replace(/\r\n/g, '\n'), r2);
}

fs.writeFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', content);
console.log('Modified MandiGateOfficerModal.tsx');
