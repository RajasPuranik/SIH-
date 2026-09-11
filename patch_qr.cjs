const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/TokenPassCard.tsx', 'utf8');

content = content.replace("import { QRCodeSVG } from 'qrcode.react';", "import { QRCodeCanvas } from 'qrcode.react';");
content = content.replace("<QRCodeSVG", "<QRCodeCanvas");

fs.writeFileSync('src/components/PillarGovt/TokenPassCard.tsx', content);
