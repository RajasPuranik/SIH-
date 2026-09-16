const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'utf8');

const regex = /\/\/ Handle URL parameter on mount[\s\S]*?\}, \[\]\);/;
const replacement = `// Handle URL parameter when opened
  useEffect(() => {
    if (isOfficerScannerOpen) {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('scan');
      if (token) {
        // Need a small timeout to ensure state is ready if handleTokenScanned relies on current state
        setTimeout(() => {
          handleTokenScanned(token);
          window.history.replaceState({}, '', '/');
        }, 50);
      }
    }
  }, [isOfficerScannerOpen]);`;

txt = txt.replace(regex, replacement);
fs.writeFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', txt, 'utf8');
console.log('Patched modal');
