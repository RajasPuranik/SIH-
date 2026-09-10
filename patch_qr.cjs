const fs = require('fs');

let content = fs.readFileSync('src/components/PillarGovt/TokenPassCard.tsx', 'utf8');

// Add import
if (!content.includes("import { QRCodeSVG }")) {
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { QRCodeSVG } from 'qrcode.react';");
}

// Replace <QrCode> with <QRCodeSVG>
content = content.replace('<QrCode className="w-32 h-32 text-slate-800" />', '<QRCodeSVG value={booking.tokenNumber} size={128} />');

fs.writeFileSync('src/components/PillarGovt/TokenPassCard.tsx', content);
