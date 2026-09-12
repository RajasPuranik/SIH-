const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const regex = /if \(vrnMatch\) \{\s*vrn = `\$\{vrnMatch\[1\]\}-\$\{vrnMatch\[2\]\}-\$\{vrnMatch\[3\]\}-\$\{vrnMatch\[4\]\}`;/;
const replacement = `if (vrnMatch) {
        const stateCode = vrnMatch[1];
        let cityCode = vrnMatch[2].padStart(2, '0');
        const series = vrnMatch[3];
        let digits = vrnMatch[4].padStart(4, '0');
        vrn = \`\${stateCode}-\${cityCode}-\${series}-\${digits}\`;`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Fixed VRN formatting');
