const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/TokenPassCard.tsx', 'utf8');

const regex = /\`\$\{window\.location\.origin\}\/\?scan=\$\{booking\.tokenNumber\}\`/;
const replacement = '`https://kisantrack.vercel.app/?scan=${booking.tokenNumber}`';

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/PillarGovt/TokenPassCard.tsx', content);
