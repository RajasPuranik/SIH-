const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

// 1. Add state and handler
const stateInsertion = `  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'book' | 'pass' | 'payment' | 'scanner' | 'map'>(defaultTab);

  const [manualToken, setManualToken] = useState('');
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
    if (val.length > 10) val = val.slice(0, 10) + '-' + val.slice(10);
    if (val.length > 15) val = val.slice(0, 15);
    setManualToken(val);
  };`;
txt = txt.replace(/  const \[activeSubTab.*?\] = useState.*?;\r?\n/, stateInsertion + '\n');

// 2. Update the input
const oldInput = `<input 
                type="text" 
                id="manual-token-input"
                placeholder="Enter Token No." 
                className="px-4 py-2 outline-none text-sm w-40 font-mono uppercase bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) {
                      window.history.replaceState({}, '', '/?scan=' + val);
                      setIsOfficerScannerOpen(true);
                    }
                  }
                }}
              />`;
const newInput = `<input 
                type="text" 
                id="manual-token-input"
                value={manualToken}
                onChange={handleTokenChange}
                placeholder="KT-MP-2026-XXXX" 
                className="px-4 py-2 outline-none text-sm w-44 font-mono uppercase bg-transparent placeholder-slate-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualToken) {
                    window.history.replaceState({}, '', '/?scan=' + manualToken);
                    setIsOfficerScannerOpen(true);
                  }
                }}
              />`;
txt = txt.replace(oldInput, newInput);

// 3. Update the button
const oldButton = `<button
                onClick={() => {
                  const val = (document.getElementById('manual-token-input') as HTMLInputElement).value;
                  if (val) {
                    window.history.replaceState({}, '', '/?scan=' + val);
                    setIsOfficerScannerOpen(true);
                  }
                }}`;
const newButton = `<button
                onClick={() => {
                  if (manualToken) {
                    window.history.replaceState({}, '', '/?scan=' + manualToken);
                    setIsOfficerScannerOpen(true);
                  }
                }}`;
txt = txt.replace(oldButton, newButton);

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log('Patched input masking');
