const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const updateRegex = /playFeedbackTone\('success'\);\s*\};/;
const newUpdate = `playFeedbackTone('success');

    // Notify the farmer
    const booking = bookings.find(b => b.id === id || b.tokenNumber === id);
    if (booking) {
      let stageName = newStatus.replace(/_/g, ' ');
      if (newStatus === 'ARRIVED_AT_GATE') stageName = 'Arrived at Gate';
      if (newStatus === 'QUALITY_VERIFIED') stageName = 'Quality Verified';
      if (newStatus === 'WEIGHED') stageName = 'Weighed';
      if (newStatus === 'PAYMENT_COMPLETED') stageName = 'Payment Completed';

      addNotification({
        type: 'success',
        title: \`Token \${booking.tokenNumber} Updated\`,
        message: \`Your token has successfully advanced to the '\${stageName}' stage. \${remarks}\`
      });
    }
  };`;

txt = txt.replace(updateRegex, newUpdate);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Added farmer notification on token scan');
