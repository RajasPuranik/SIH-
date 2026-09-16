const fs = require('fs');
let txt = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

// 1. Remove tracker and pass from isOfficer tabs
const tabsRegex = /const tabs = isOfficer[\s\S]*?\]/;
const newTabs = `const tabs = isOfficer
    ? [
        { id: 'scanner' as const, label: 'Gate Scanner', icon: <ScanLine className="w-3.5 h-3.5" /> },
      ]
    : [
        { id: 'tracker' as const, label: t('trackStatus'), icon: <Activity className="w-3.5 h-3.5" /> },
        { id: 'book' as const, label: t('bookSlot'), icon: <Calendar className="w-3.5 h-3.5" /> },
        { id: 'pass' as const, label: t('myTokens'), icon: <QrCode className="w-3.5 h-3.5" /> },
        { id: 'payment' as const, label: t('paymentStatus'), icon: <Banknote className="w-3.5 h-3.5" /> },
        { id: 'map' as const, label: 'Live Map', icon: <MapPin className="w-3.5 h-3.5" /> },
      ];`;
txt = txt.replace(tabsRegex, newTabs);

// 2. Replace View All Token Statuses with Enter Token input
const buttonsRegex = /<button[\s\S]*?onClick=\{\(\) => setActiveSubTab\('tracker'\)\}[\s\S]*?<\/button>/;
const newButtons = `<div className="flex items-center gap-2 border border-slate-300 rounded-lg overflow-hidden bg-white">
              <input 
                type="text" 
                id="manual-token-input"
                placeholder="Enter Token Number" 
                className="px-4 py-2.5 outline-none text-sm w-48 font-mono uppercase"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) {
                      window.history.replaceState({}, '', '/?scan=' + val);
                      setIsOfficerScannerOpen(true);
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const val = (document.getElementById('manual-token-input') as HTMLInputElement).value;
                  if (val) {
                    window.history.replaceState({}, '', '/?scan=' + val);
                    setIsOfficerScannerOpen(true);
                  }
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm cursor-pointer transition"
              >
                Enter Token
              </button>
            </div>`;
txt = txt.replace(buttonsRegex, newButtons);

fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', txt, 'utf8');
console.log('Patched GovtProcurementView.tsx');
