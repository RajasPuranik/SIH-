const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
  "const [isIVRModalOpen, setIsIVRModalOpen] = useState(false);",
  "const [isIVRModalOpen, setIsIVRModalOpen] = useState(false);\n  const [isIVRDialpadOpen, setIsIVRDialpadOpen] = useState(false);"
);

content = content.replace(
  "setIsIVRModalOpen,\n          isTokenModalOpen,",
  "setIsIVRModalOpen,\n          isIVRDialpadOpen,\n          setIsIVRDialpadOpen,\n          isTokenModalOpen,"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
