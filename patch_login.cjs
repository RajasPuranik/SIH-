const fs = require('fs');
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

// Remove Quick Demo Strip (from the bottom)
const quickDemoRegex = /\{\/\* Quick Demo Strip \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
content = content.replace(quickDemoRegex, '');

// Update texts
content = content.replace("setError('Invalid OTP. Use 1234 for demo.');", "setError('Invalid OTP.');");
content = content.replace("Demo: 1234", "OTP: 1234");

// Remove handleQuickDemoLogin function definition
const quickDemoFuncRegex = /const handleQuickDemoLogin = [\s\S]*?\};\s*/;
content = content.replace(quickDemoFuncRegex, '');

fs.writeFileSync('src/pages/LoginPage.tsx', content);
