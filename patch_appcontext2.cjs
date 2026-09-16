const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Fix syncWithBackend to prevent unnecessary state resets
code = code.replace(
  '            setBookings(dbBookings);\n          } else {',
  '            if (JSON.stringify(dbBookings) !== JSON.stringify(bookingsRef.current)) {\n              setBookings(dbBookings);\n            }\n          } else {'
);

// 2. Add corrected scanWaitInterval back in
const insertTarget = '  const createBooking = (';
const newInterval = `  useEffect(() => {
    // This effect acts as the "loop for looking" on the farmer side
    // It polls the separate scan-wait server to check if the current active booking's QR was scanned
    const scanWaitInterval = setInterval(async () => {
      if (!currentUser || currentUser.role !== 'farmer') return;
      const cleanPhone = (p) => (p || '').replace(/\\D/g, '').slice(-10);
      const myBookings = bookingsRef.current.filter(b => cleanPhone(b.farmerPhone) === cleanPhone(currentUser.phone) && b.status !== 'PAYMENT_COMPLETED');
      
      for (const b of myBookings) {
        try {
          const res = await fetch(\`/api/scan-wait?token=\${b.tokenNumber}\`);
          if (res.ok) {
            const data = await res.json();
            if (data.scanned) {
              let nextStatus = 'IN_TRANSIT';
              let remarks = 'Token verified. Proceeding to Transit.';
              let officer = 'APMC Dispatch Officer';
              
              if (b.status === 'BOOKED') {
                nextStatus = 'IN_TRANSIT';
                remarks = 'Token verified. Proceeding to Mandi Gate.';
                officer = 'APMC Dispatch Officer';
              } else if (b.status === 'IN_TRANSIT') {
                nextStatus = 'ARRIVED_AT_GATE';
                remarks = 'Arrived at Gate 3.';
                officer = 'APMC Entry Officer';
              } else if (b.status === 'ARRIVED_AT_GATE') {
                nextStatus = 'QUALITY_VERIFIED';
                remarks = 'Moisture 11.5%, Grade-A verified';
                officer = 'APMC Quality Assay';
              } else if (b.status === 'QUALITY_VERIFIED') {
                nextStatus = 'WEIGHED';
                remarks = 'Gross 9200kg, Tare 2700kg. Net: 65 Qtl';
                officer = 'Weighbridge Operator';
              } else if (b.status === 'WEIGHED') {
                nextStatus = 'PAYMENT_COMPLETED';
                remarks = 'PFMS DBT Payment Cleared';
                officer = 'Treasury Officer';
              }

              const randomNum = Math.floor(1000 + Math.random() * 9000);
              const newToken = \`KT-\${(b.state || 'MP').slice(0, 2).toUpperCase()}-2026-\${randomNum}\`;
              
              const updatedHistory = [
                ...b.statusHistory,
                {
                  stage: nextStatus,
                  timestamp: new Date().toLocaleDateString('en-GB', {
                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                  }),
                  remarks,
                  officerName: officer,
                },
              ];
              
              const updatedBk = { ...b, status: nextStatus, tokenNumber: newToken, statusHistory: updatedHistory };
              
              if (nextStatus === 'QUALITY_VERIFIED' && !updatedBk.qualityCheck) {
                updatedBk.qualityCheck = {
                  moisturePercent: 11.4,
                  foreignMatterPercent: 0.6,
                  grainGrade: 'Grade-A',
                  inspectorRemarks: 'Passed moisture assay & purity guidelines.',
                };
              }
              if (nextStatus === 'WEIGHED' && !updatedBk.weighbridge) {
                const netKg = updatedBk.estimatedQuantityQuintals * 100;
                updatedBk.weighbridge = {
                  grossWeightKg: netKg + 2800,
                  tareWeightKg: 2800,
                  netWeightKg: netKg,
                  netWeightQuintals: updatedBk.estimatedQuantityQuintals,
                };
              }
              if (nextStatus === 'PAYMENT_COMPLETED' && updatedBk.paymentDetails) {
                updatedBk.paymentDetails.dbtStatus = 'SUCCESS';
                updatedBk.paymentDetails.disbursedAt = new Date().toLocaleDateString('en-GB', {
                  hour: '2-digit', minute: '2-digit',
                });
              }
              
              setBookings(prev => prev.map(bk => bk.id === b.id ? updatedBk : bk));
              fetch('/api/bookings', { method: 'POST', body: JSON.stringify(updatedBk) }).catch(e => console.warn(e));

              addNotification({
                type: 'SYSTEM',
                title: 'QR Scanned successfully',
                message: \`Your token has been scanned. Status updated to \${nextStatus.replace(/_/g, ' ')}. New token generated for next stage.\`
              });
              playFeedbackTone('success');
            }
          }
        } catch (e) {
        }
      }
    }, 2000);

    return () => clearInterval(scanWaitInterval);
  }, [currentUser]);

  const createBooking = (`;

if (!code.includes(insertTarget)) {
    console.error('Could not find insertTarget');
    process.exit(1);
}

code = code.replace(insertTarget, newInterval);
fs.writeFileSync('src/context/AppContext.tsx', code);
console.log('Successfully updated AppContext.tsx');
