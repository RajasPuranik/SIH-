const fs = require('fs');

let content = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

// Remove setIsIVRModalOpen
content = content.replace(', setIsIVRModalOpen', '');

// Remove the button
const buttonRegex = /<button\s*onClick=\{\(\) => setIsIVRModalOpen\(true\)\}[\s\S]*?<\/button>/;
content = content.replace(buttonRegex, '');

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', content);
