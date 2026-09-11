const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'utf8');

// 1. Add bookingsRef
const importRegex = /import React, \{ useState, useEffect \} from 'react';/;
txt = txt.replace(importRegex, "import React, { useState, useEffect, useRef } from 'react';");

const setupRegex = /const \[scanResult, setScanResult\] = useState<string \| null>\(null\);\n\s*const \[errorMsg, setErrorMsg\] = useState\(''\);/;
const setupNew = `const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const bookingsRef = useRef(bookings);
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);`;
txt = txt.replace(setupRegex, setupNew);

// 2. Trim finalToken
const trimRegex = /if \(scanParam\) finalToken = scanParam;\n\s*\} catch \(e\) \{\n\s*\/\/ Not a URL, use raw text\n\s*\}\n\s*handleTokenScanned\(finalToken\);/;
const newTrim = `if (scanParam) finalToken = scanParam;
          } catch (e) {
            // Not a URL, use raw text
          }
          handleTokenScanned(finalToken.trim());`;
txt = txt.replace(trimRegex, newTrim);

// 3. Fix handleTokenScanned to use bookingsRef
const scanRegex = /const handleTokenScanned = \(tokenText: string\) => \{\n\s*const booking = bookings\.find\(b => b\.tokenNumber === tokenText \|\| b\.id === tokenText\);/;
const newScan = `const handleTokenScanned = (tokenText: string) => {
    const booking = bookingsRef.current.find(b => b.tokenNumber === tokenText || b.id === tokenText);`;
txt = txt.replace(scanRegex, newScan);

fs.writeFileSync('src/components/PillarGovt/MandiGateOfficerModal.tsx', txt, 'utf8');
console.log('Fixed MandiGateOfficerModal scanner bug');
