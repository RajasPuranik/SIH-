const fs = require('fs');
let content = fs.readFileSync('src/components/Auth/AuthModal.tsx', 'utf8');

const regex = /\{\/\* Quick 1-Click Demo Login Chips \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(regex, '');

content = content.replace("setError('Invalid OTP. Use 1234 for demo.');", "setError('Invalid OTP. For now, use 1234.');");
content = content.replace("Demo OTP: 1234", "OTP: 1234");
content = content.replace(/const handleQuickDemoLogin = [\s\S]*?\};\s*/, '');

fs.writeFileSync('src/components/Auth/AuthModal.tsx', content);
