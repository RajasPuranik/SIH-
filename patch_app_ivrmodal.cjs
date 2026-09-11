const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/import \{ IVRModal \} from '\.\/components\/IVRModal';\r?\n/, '');
content = content.replace(/\{isIVRDialpadOpen && <IVRModal.*?\/>\}\r?\n/, '');

fs.writeFileSync('src/App.tsx', content);
