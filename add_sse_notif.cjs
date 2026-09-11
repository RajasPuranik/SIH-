const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const sseBlock = /if \(payload\.newStatus === 'PAYMENT_COMPLETED'[\s\S]*?return updatedBooking;\n\s*\}\)\);\n\s*\}/;

const newSseBlock = `if (payload.newStatus === 'PAYMENT_COMPLETED' && updatedBooking.paymentDetails) {
                  updatedBooking.paymentDetails.dbtStatus = 'SUCCESS';
                  updatedBooking.paymentDetails.disbursedAt = new Date().toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit' });
                }
                return updatedBooking;
             }));

             // Trigger Notification on receiving end
             setNotifications(nPrev => [{
               id: 'notif-' + Date.now(),
               timestamp: 'Just now',
               read: false,
               type: 'SYSTEM',
               title: \`Token \${payload.id} Updated\`,
               message: \`Your token advanced to '\${payload.newStatus.replace(/_/g, ' ')}' stage. \${payload.remarks || ''}\`
             }, ...nPrev]);
          }`;

txt = txt.replace(sseBlock, newSseBlock);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Added SSE notifications');
