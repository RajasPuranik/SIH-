const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const regexIsCropMentioned = /const isCropMentioned = matchKeywords\(q, crop\.terms \|\| \[crop\.id, crop\.name\.toLowerCase\(\), crop\.hindiName\.toLowerCase\(\)\]\);/;
const newIsCropMentioned = `const cropSynonym = CROP_SYNONYMS.find(s => s.id === crop.id);
      const isCropMentioned = matchKeywords(q, cropSynonym ? cropSynonym.terms.map(t => t.toLowerCase()) : [crop.id, crop.name.toLowerCase(), crop.hindiName.toLowerCase()]);`;

txt = txt.replace(regexIsCropMentioned, newIsCropMentioned);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Fixed crop terms resolution');
