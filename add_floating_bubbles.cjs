const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// Remove the old quick actions slider
const oldQuickActionsRegex = /\{\!showKeypad && lastMessage\?\.quickActions && \([\s\S]*?<\/div>\s*\)\}/;
txt = txt.replace(oldQuickActionsRegex, '');

// Insert the new floating bubbles inside the ORB AREA
const orbInsertionRegex = /\{\/\* Subtle inner animated ring for speaking \*\/\}/;

const newBubbles = `                  {/* Floating Quick Actions Bubbles */}
                  {!showKeypad && lastMessage?.quickActions && (
                    <div className="absolute inset-0 pointer-events-none z-40">
                      {lastMessage.quickActions.map((action, idx) => {
                        const total = lastMessage.quickActions!.length;
                        const angle = (-Math.PI / 2) + (idx * (2 * Math.PI) / total);
                        const radius = 135; 
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleUserUtterance(action.action)}
                            className="absolute top-1/2 left-1/2 shrink-0 px-3 py-1.5 bg-slate-800/95 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/50 transition-all pointer-events-auto shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] whitespace-nowrap"
                            style={{
                              transform: \`translate(calc(-50% + \${x}px), calc(-50% + \${y}px))\`
                            }}
                          >
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Subtle inner animated ring for speaking */}`;

txt = txt.replace(orbInsertionRegex, newBubbles);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Added floating bubbles for quick actions');
