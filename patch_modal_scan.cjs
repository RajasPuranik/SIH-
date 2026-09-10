const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'utf8');

const regex = /const \[selectedToken, setSelectedToken\] = useState\(bookings\[0\]\?\.tokenNumber \|\| ''\);/;

const replacement = `const [selectedToken, setSelectedToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('scan') || bookings[0]?.tokenNumber || '';
  });`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', content);
