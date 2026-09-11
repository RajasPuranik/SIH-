const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const regexVRN = /let vrn = rawQuery\.toUpperCase\(\)\.replace\(\/\[\^A-Z0-9-\]\/g, ''\);\s*if \(vrn\.length < 4\) vrn = 'MP-09-XX-0000'; \/\/ Fallback if they speak vaguely/;

const newVRN = `let vrn = rawQuery.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      const pureAlphaNum = vrn.replace(/-/g, '');
      const vrnMatch = pureAlphaNum.match(/^([A-Z]{2})([0-9]{1,2})([A-Z]{1,3})([0-9]{1,4})$/);
      if (vrnMatch) {
        vrn = \`\${vrnMatch[1]}-\${vrnMatch[2]}-\${vrnMatch[3]}-\${vrnMatch[4]}\`;
      } else if (vrn.length < 4) {
        vrn = 'MP-09-XX-0000'; // Fallback
      }`;

txt = txt.replace(regexVRN, newVRN);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Added VRN formatting to engine');
