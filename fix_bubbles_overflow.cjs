const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// Remove from Core Sphere
const bubbleRegex = /\s*\{\/\* Floating Quick Actions Bubbles \*\/\}[\s\S]*?\{\/\* Subtle inner animated ring for speaking \*\/\}/;
txt = txt.replace(bubbleRegex, '{/* Subtle inner animated ring for speaking */}');

// Add before Core Sphere closes... Wait! Add to outer container
const outerInsertionRegex = /\{\/\* Core Sphere \*\/\}/;
const newBubblesOuter = `                  {/* Floating Quick Actions Bubbles */}
                  {!showKeypad && lastMessage?.quickActions && (
                    <div className="absolute inset-0 pointer-events-none z-50">
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

                  {/* Core Sphere */}`;

txt = txt.replace(outerInsertionRegex, newBubblesOuter);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Moved bubbles outside overflow-hidden sphere');
