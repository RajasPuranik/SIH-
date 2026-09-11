const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// Remove the dangling `)}`
txt = txt.replace(/\n\s*\)\}\n\s*\{\/\* TRANSCRIPT AREA \*\/\}/, '\n              {/* TRANSCRIPT AREA */}');

// Let's accurately replace the orb area.
const orbRegex = /\{\/\* THE ORB \*\/\}\n\s*<div className="relative flex items-center justify-center w-48 h-48 mb-12">/;
const newOrb = `{/* THE ORB */}
              {lastMessage?.generatedToken ? (
                  <div className="mb-6 p-4 bg-white rounded-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] w-64 text-center animate-scale-in z-20">
                    <h3 className="text-emerald-700 font-bold mb-2">Gate Pass / टोकन</h3>
                    <div className="flex justify-center mb-3">
                      <QRCodeCanvas value={lastMessage.generatedToken.tokenNumber} size={120} />
                    </div>
                    <div className="text-left text-sm text-slate-700 space-y-1">
                      <p><strong>Token:</strong> {lastMessage.generatedToken.tokenNumber}</p>
                      <p><strong>Crop:</strong> {lastMessage.generatedToken.crop}</p>
                      <p><strong>Qtl:</strong> {lastMessage.generatedToken.quantity}</p>
                      <p><strong>Vehicle:</strong> {lastMessage.generatedToken.vehicle}</p>
                      <p><strong>Time:</strong> {lastMessage.generatedToken.time}</p>
                    </div>
                  </div>
              ) : (
                <div className="relative flex items-center justify-center w-48 h-48 mb-12">`;

txt = txt.replace(orbRegex, newOrb);

// Re-add the closing `)}` just before `{/* TRANSCRIPT AREA */}`
txt = txt.replace(/\n\s*\{\/\* TRANSCRIPT AREA \*\/\}/, '\n              )}\n              {/* TRANSCRIPT AREA */}');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed PhoneBotModal rendering logic');
