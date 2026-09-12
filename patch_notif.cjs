const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /window\.dispatchEvent\(new CustomEvent\('token-updated', \{ detail: newB \}\)\);/;
const replacement = `let stageName = newB.status.replace(/_/g, ' ');
                  if (newB.status === 'ARRIVED_AT_GATE') stageName = 'Arrived at Gate';
                  if (newB.status === 'QUALITY_VERIFIED') stageName = 'Quality Verified';
                  if (newB.status === 'WEIGHED') stageName = 'Weighed';
                  if (newB.status === 'PAYMENT_COMPLETED') stageName = 'Payment Completed';
                  
                  addNotification({
                    type: 'SMS',
                    title: \`Token \${newB.tokenNumber} Updated\`,
                    message: \`Your token has successfully advanced to the '\${stageName}' stage.\`
                  });
                  playFeedbackTone('success');`;

txt = txt.replace(regex, replacement);
fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Fixed notification logic');
