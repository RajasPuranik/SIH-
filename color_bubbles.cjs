const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const bubbleRegex = /className="absolute top-1\/2 left-1\/2 shrink-0 px-3 py-1\.5 bg-slate-800\/95 hover:bg-emerald-900\/80 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500\/50 transition-all pointer-events-auto shadow-\[0_0_15px_rgba\(16,185,129,0\.3\)\] hover:scale-110 hover:shadow-\[0_0_25px_rgba\(16,185,129,0\.5\)\] whitespace-nowrap"/;

const newBubble = `className={\`absolute top-1/2 left-1/2 shrink-0 px-3 py-1.5 bg-slate-800/95 text-xs font-bold rounded-full border transition-all pointer-events-auto hover:scale-110 whitespace-nowrap \${
                          [
                            'text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-900/80 hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]',
                            'text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-900/80 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]',
                            'text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-900/80 hover:shadow-[0_0_25px_rgba(245,158,11,0.6)]',
                            'text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-900/80 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]',
                            'text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-900/80 hover:shadow-[0_0_25px_rgba(244,63,94,0.6)]',
                            'text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-900/80 hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                          ][idx % 6]
                        }\`}`;

txt = txt.replace(bubbleRegex, newBubble);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Made floating orbit bubbles colorful');
