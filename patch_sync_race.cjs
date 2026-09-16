const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /dbBookings\.forEach\(\(newB: any\) => \{[\s\S]*?setBookings\(dbBookings\);/;
const replacement = `dbBookings.forEach((newB: any) => {
              const oldB = bookingsRef.current.find((b: any) => b.id === newB.id);
              if (oldB && oldB.status !== newB.status) {
                const cleanPhone = (p?: string) => (p || '').replace(/\\D/g, '').slice(-10);
                const isOwner = currentUserObj && currentUserObj.role === 'farmer' && cleanPhone(currentUserObj.phone) === cleanPhone(newB.farmerPhone);
                if (isOwner) {
                  let stageName = newB.status.replace(/_/g, ' ');
                  if (newB.status === 'ARRIVED_AT_GATE') stageName = 'Arrived at Gate';
                  if (newB.status === 'QUALITY_VERIFIED') stageName = 'Quality Verified';
                  if (newB.status === 'WEIGHED') stageName = 'Weighed';
                  if (newB.status === 'PAYMENT_COMPLETED') stageName = 'Payment Completed';
                  
                  addNotification({
                    type: 'SMS',
                    title: \`Token \${newB.tokenNumber} Updated\`,
                    message: \`Your token has successfully advanced to the '\${stageName}' stage.\`
                  });
                  playFeedbackTone('success');
                }
              }
            });
            
            setBookings(prev => {
              const newArray = [...prev];
              let changed = false;
              dbBookings.forEach((dbB: any) => {
                const idx = newArray.findIndex(b => b.id === dbB.id);
                if (idx >= 0) {
                  // Only accept DB booking if it is strictly newer or same (prevents local optimistic updates from being overwritten by stale DB reads)
                  if ((dbB.statusHistory?.length || 0) >= (newArray[idx].statusHistory?.length || 0)) {
                    // Check if actually different to prevent unnecessary renders
                    if (JSON.stringify(newArray[idx]) !== JSON.stringify(dbB)) {
                      newArray[idx] = dbB;
                      changed = true;
                    }
                  }
                } else {
                  newArray.push(dbB);
                  changed = true;
                }
              });
              return changed ? newArray : prev;
            });`;

txt = txt.replace(regex, replacement);
fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Patched sync logic');
