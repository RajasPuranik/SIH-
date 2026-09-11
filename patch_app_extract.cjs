const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "openPhoneBot,\n    setIsOfficerScannerOpen",
  "openPhoneBot,\n    setIsOfficerScannerOpen,\n    isIVRDialpadOpen,\n    setIsIVRDialpadOpen"
);

// I might have replaced something wrong earlier. Let me fix the IVRModal component line.
content = content.replace(
  "<IVRModal isOpen={isIVRDialpadOpen} onClose={() => setIsIVRDialpadOpen(false)} />",
  "{isIVRDialpadOpen && <IVRModal isOpen={isIVRDialpadOpen} onClose={() => setIsIVRDialpadOpen(false)} />}"
);

fs.writeFileSync('src/App.tsx', content);
