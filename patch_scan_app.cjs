const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const Dashboard: React\.FC = \(\) => \{[\s\S]*?const \{ t \} = useLanguage\(\);/;
const replacement = `const Dashboard: React.FC = () => {
  const {
    userRole,
    currentUser,
    openPhoneBot,
    setIsOfficerScannerOpen
  } = useApp();
  const { t } = useLanguage();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scanParam = params.get('scan');
    if (scanParam && userRole === 'mandi_officer') {
      setIsOfficerScannerOpen(true);
      // Clean up URL without reload
      window.history.replaceState({}, '', '/');
    }
  }, [userRole, setIsOfficerScannerOpen]);`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
