const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

const regex = /<button\n\s*onClick=\{\(\) => \{ setActiveBookingId\(booking\.id\); setActiveSubTab\('tracker'\); \}\}\n\s*className="px-6 py-2\.5 bg-white hover:bg-slate-50 text-slate-700/g;
const replacement = `<button
              onClick={() => setActiveSubTab('tracker')}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log('Fixed syntax error on line 138');
