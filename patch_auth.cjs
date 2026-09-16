const fs = require('fs');
let txt = fs.readFileSync('src/components/Auth/AuthModal.tsx', 'utf8');

// 1. Full Legal Name text only
txt = txt.replace(
  /onChange=\{\(e\) => setRegName\(e\.target\.value\)\}/g,
  "onChange={(e) => setRegName(e.target.value.replace(/[^a-zA-Z\\s]/g, ''))}"
);

// 2. Simplify Aadhaar validation to just 12 digits so they can actually demo it
const verhoeffRegex = /const d = \[\s*\[0, 1.*?if \(c !== 0\) \{\s*setError\('Aadhaar number is invalid \(fails checksum verification\)\. Please enter a real legal Aadhaar\.'\);\s*return;\s*\}/s;
txt = txt.replace(verhoeffRegex, "");

fs.writeFileSync('src/components/Auth/AuthModal.tsx', txt, 'utf8');
console.log('Patched AuthModal');
