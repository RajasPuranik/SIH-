const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(/Track AI/g, '1551 Bot');
content = content.replace(/Track AI 📞 1800-180-1551/g, '1551 Bot 📞 1800-180-1551');

fs.writeFileSync('src/components/Navbar.tsx', content);
