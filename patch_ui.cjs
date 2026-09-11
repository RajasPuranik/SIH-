const fs = require('fs');

let content = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const searchChatArea = `{/* Chat Area */}
            <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">`;

const replaceChatArea = `{/* Chat Area */}
            {botMode === 'ai' && (
              <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">`;

content = content.replace(searchChatArea, replaceChatArea);

const searchBottomControls = `            {/* Bottom Controls Panel */}`;

const replaceBottomControls = `            </div>
            )}
            
            {/* IVR Keypad Area */}
            {botMode === 'ivr' && (
              <div className="flex-1 flex flex-col bg-slate-50 items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                  <PhoneCall className="w-96 h-96" />
                </div>
                
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-[4px] border-white z-10">
                  <Bot className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 z-10 text-center uppercase tracking-wider mb-2">Automated Menu</h3>
                <p className="text-emerald-600 font-medium z-10 text-center animate-pulse mb-8">
                  {isBotSpeaking ? "Speaking..." : "Awaiting Input..."}
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-[260px] mx-auto z-10">
                  {['1','2','3','4','5','6','7','8','9','*','0','#'].map(d => (
                    <button key={d} onClick={() => handleKeypadPress(d)} className="h-16 w-16 bg-white rounded-full shadow-sm font-bold text-2xl text-slate-700 hover:bg-slate-100 transition-all active:scale-90 border border-slate-200 flex items-center justify-center cursor-pointer">
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Controls Panel */}`;

content = content.replace(searchBottomControls, replaceBottomControls);

// Update mic button to be disabled in IVR mode
const searchToggleMic = `<button
                        onClick={toggleMic}
                        className={\`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all \${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 cursor-pointer'}\`}
                      >`;

const replaceToggleMic = `<button
                        onClick={botMode === 'ivr' ? undefined : toggleMic}
                        className={\`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all \${isListening ? 'bg-rose-500 text-white animate-pulse' : (botMode === 'ivr' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 cursor-pointer')}\`}
                      >`;

content = content.replace(searchToggleMic, replaceToggleMic);


fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', content);
console.log('UI Patched!');
