const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(
  "import { AudioAssistantModal } from './components/AudioAssistantModal';",
  "import { AudioAssistantModal } from './components/AudioAssistantModal';\nimport { IVRModal } from './components/IVRModal';"
);

// Add useApp extraction
content = content.replace(
  "isAudioAssistantOpen,\n    userRole,",
  "isAudioAssistantOpen,\n    isIVRDialpadOpen,\n    setIsIVRDialpadOpen,\n    userRole,"
);

// Add component
content = content.replace(
  "<AudioAssistantModal />",
  "<AudioAssistantModal />\n      <IVRModal isOpen={isIVRDialpadOpen} onClose={() => setIsIVRDialpadOpen(false)} />"
);

fs.writeFileSync('src/App.tsx', content);
