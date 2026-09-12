const fs = require('fs');
let lines = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8').split('\\n');
lines[138] = "              onClick={() => setActiveSubTab('tracker')}";
fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', lines.join('\\n'), 'utf8');
console.log('Fixed line 138');
