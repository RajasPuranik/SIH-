const fs = require('fs');

let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
content = content.replace("loginUser(selectedRole, '+91 ' + phone);", "const res = loginWithPhone('+91 ' + phone); if (!res.success) { setError(res.message); } else { setSuccess('Login successful'); }");
fs.writeFileSync('src/pages/LoginPage.tsx', content);

let ctx = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const loginUserRegex = /const loginUser = \([\s\S]*?\}\s*\}\);\s*\};\s*const loginWithPhone/;
ctx = ctx.replace(loginUserRegex, 'const loginWithPhone');
// Also remove DEMO_PROFILES entirely.
// Actually, I won't remove DEMO_PROFILES yet because it might be used as a fallback. Let me check `effectiveUser = currentUser ?? DEMO_PROFILES.farmer;`
