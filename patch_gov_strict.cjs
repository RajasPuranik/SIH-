const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

const regex = /const tabs = isOfficer[\s\S]*?\];\r?\n\r?\n  return \(/;
const replacement = `const tabs = isOfficer
    ? [
        { id: 'scanner' as const, label: 'Gate Scanner', icon: <ScanLine className="w-3.5 h-3.5" /> },
      ]
    : [
        { id: 'tracker' as const, label: t('trackStatus'), icon: <Activity className="w-3.5 h-3.5" /> },
        { id: 'book' as const, label: t('bookSlot'), icon: <Calendar className="w-3.5 h-3.5" /> },
        { id: 'pass' as const, label: t('myTokens'), icon: <QrCode className="w-3.5 h-3.5" /> },
        { id: 'payment' as const, label: t('paymentStatus'), icon: <Banknote className="w-3.5 h-3.5" /> },
        { id: 'map' as const, label: 'Live Map', icon: <MapPin className="w-3.5 h-3.5" /> },
      ];

  return (`;

txt = txt.replace(regex, replacement);
fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log('Fixed syntax strictly');
