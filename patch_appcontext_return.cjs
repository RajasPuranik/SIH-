const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
  "isIVRModalOpen,\n        setIsIVRModalOpen,\n        isTokenModalOpen,",
  "isIVRModalOpen,\n        setIsIVRModalOpen,\n        isIVRDialpadOpen,\n        setIsIVRDialpadOpen,\n        isTokenModalOpen,"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
