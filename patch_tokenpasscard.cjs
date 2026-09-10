const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/TokenPassCard.tsx', 'utf8');

const regex = /<QRCodeSVG value=\{\\\/\?scan=\\\} size=\{128\} \/>/;
const replacement = "<QRCodeSVG value={`${window.location.origin}/?scan=${booking.tokenNumber}`} size={128} />";

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/PillarGovt/TokenPassCard.tsx', content);
