const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// 1. Update the condition for floating bubbles
const bubblesRegex = /\{!showKeypad && lastMessage\?\.quickActions && \(/;
txt = txt.replace(bubblesRegex, '{!showKeypad && lastMessage?.quickActions && lastMessage.quickActions.length > 3 && (');

// 2. Add the classic slider for <= 3 items
const sliderRegex = /\{\/\* DTMF Keypad Drawer \*\/\}/;
const newSlider = `{!showKeypad && lastMessage?.quickActions && lastMessage.quickActions.length <= 3 && (
              <div className="flex gap-2 overflow-x-auto p-4 no-scrollbar w-full max-w-sm mx-auto justify-center">
                {lastMessage.quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUserUtterance(action.action)}
                    className="shrink-0 px-4 py-2.5 bg-slate-800/80 hover:bg-emerald-900/40 text-emerald-100 text-sm font-medium rounded-2xl border border-slate-700/50 transition whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* DTMF Keypad Drawer */}`;
txt = txt.replace(sliderRegex, newSlider);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Restored standard bottom slider for 3 or fewer quick actions');
