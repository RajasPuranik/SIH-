const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("window.history.replaceState({}, '', '/');", "// let modal read it");

fs.writeFileSync('src/App.tsx', content);

let modalContent = fs.readFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'utf8');
const search = `if (token) {
      handleTokenScanned(token);
    }`;
const replace = `if (token) {
      handleTokenScanned(token);
      window.history.replaceState({}, '', '/');
    }`;
modalContent = modalContent.replace(search, replace);
fs.writeFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', modalContent);
