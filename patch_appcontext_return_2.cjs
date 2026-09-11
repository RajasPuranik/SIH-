const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /isIVRModalOpen,[\s\n]+setIsIVRModalOpen,[\s\n]+isTokenModalOpen,/;
const replacement = "isIVRModalOpen,\n        setIsIVRModalOpen,\n        isIVRDialpadOpen,\n        setIsIVRDialpadOpen,\n        isTokenModalOpen,";

content = content.replace(regex, replacement);

fs.writeFileSync('src/context/AppContext.tsx', content);
