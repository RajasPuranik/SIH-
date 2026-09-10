const fs = require('fs');
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

content = content.replace("loginUser(selectedRole, '+91 ' + phone);", "const res = loginWithPhone('+91 ' + phone); if (!res.success) { setError(res.message); } else { setSuccess('Login successful'); }");
content = content.replace("setError('Invalid OTP. Use 1234 for demo.');", "setError('Invalid OTP. For now, use 1234.');");
content = content.replace("Demo: 1234", "OTP: 1234");
content = content.replace("const handleQuickLogin = (role: UserRole) => loginUser(role);", "");

const demoStripRegex = /\{\/\* Quick Demo Strip \*\/\}[\s\S]*?\{\/\* Divider \*\/\}/;
content = content.replace(demoStripRegex, '{/* Divider */}');

fs.writeFileSync('src/pages/LoginPage.tsx', content);
