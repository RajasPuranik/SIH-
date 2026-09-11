const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

txt = txt.replace(/type: 'success',/g, "type: 'SYSTEM',");

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Fixed notification type');
