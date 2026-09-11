const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

const regex = /const activeBooking = getActiveBooking\(\);/;
const replace = `const activeBooking = getActiveBooking();
    console.log('GovtProcurementView render: activeBooking is', activeBooking);`;

content = content.replace(regex, replace);
fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', content);
