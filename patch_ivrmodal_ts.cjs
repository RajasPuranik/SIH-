const fs = require('fs');
let content = fs.readFileSync('src/components/IVRModal.tsx', 'utf8');

content = content.replace("Keypad as KeypadIcon, ", "");
content = content.replace("b.farmerId === currentUser?.id", "b.id === currentUser?.id");

fs.writeFileSync('src/components/IVRModal.tsx', content);
