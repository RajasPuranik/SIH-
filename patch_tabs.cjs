const fs = require('fs');

let content = fs.readFileSync('src/components/PillarGovt/GovtProcurementView.tsx', 'utf8');

const regex = /<div className="flex border-b border-slate-200 overflow-x-auto flex-1">[\s\S]*?<\/div>/;

const newTabsBlock = `<div className="flex items-center gap-2 overflow-x-auto flex-1 pb-1">
          {tabs.map((tab) => {
            const activeColors = {
              tracker: 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm',
              book: 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm',
              pass: 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm',
              payment: 'bg-purple-100 text-purple-800 border-purple-300 shadow-sm',
              scanner: 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm',
              map: 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm'
            };
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={\`flex items-center gap-2 px-4 py-2 text-[11px] sm:text-xs font-extrabold rounded-xl transition cursor-pointer whitespace-nowrap border \${
                  isActive
                    ? (activeColors as any)[tab.id]
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 bg-white shadow-xs'
                }\`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>`;

content = content.replace(regex, newTabsBlock);
fs.writeFileSync('src/components/PillarGovt/GovtProcurementView.tsx', content);
