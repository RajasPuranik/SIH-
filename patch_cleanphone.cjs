const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
  /const cleanPhone = \(p: string\) => p\.replace\(\/\\D\/g, ''\)\.slice\(-10\);/,
  "const cleanPhone = (p?: string) => (p || '').replace(/\\D/g, '').slice(-10);"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
