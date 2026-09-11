const fs = require('fs');

let content = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// 1. Add states
content = content.replace(
  /const \[callDuration, setCallDuration\] = useState\(0\);/,
  `const [callDuration, setCallDuration] = useState(0);
  const [botMode, setBotMode] = useState<'ivr' | 'ai'>('ivr');
  const [ivrNode, setIvrNode] = useState('main');
  const [showKeypad, setShowKeypad] = useState(true);`
);

// 2. Rewrite startIvr
content = content.replace(
  /const startIvr = \(\) => \{[\s\S]*?\};/,
  `const startIvr = () => {
    setCallState('connected');
    setBotMode('ivr');
    setIvrNode('main');
    setShowKeypad(true);
    playFeedbackTone('success');
    speakText("Welcome to Kisan Track. Press 1 to book a Mandi slot. Press 2 to check your token status. Press 9 to speak to our AI voice assistant.");
  };

  const handleKeypadPress = (digit: string) => {
    playFeedbackTone('ping');
    interruptBot();
    
    if (botMode === 'ai') return;
    
    if (ivrNode === 'main') {
      if (digit === '1') {
        setIvrNode('book_crop');
        speakText("Slot booking. Press 1 to sell Wheat. Press 2 to sell Soybean. Press 0 for main menu.");
      } else if (digit === '2') {
        setIvrNode('status');
        speakText("Your active token is currently arriving at Gate 3. Wait time is 15 minutes. Press 0 to return to main menu.");
      } else if (digit === '9') {
        setBotMode('ai');
        setShowKeypad(false);
        speakText("Connecting to Kisan Track AI Voice Assistant. Please ask your question.");
      } else {
        speakText("Invalid input. Press 1 to book a slot. Press 2 for status. Press 9 for AI.");
      }
    } else if (ivrNode === 'book_crop') {
      if (digit === '1' || digit === '2') {
        setIvrNode('book_qty');
        speakText("Press 1 for 50 Quintals. Press 2 for 100 Quintals.");
      } else if (digit === '0') {
        startIvr();
      } else {
        speakText("Invalid input. Press 1 for Wheat, 2 for Soybean, or 0 for main menu.");
      }
    } else if (ivrNode === 'book_qty') {
      if (digit === '1' || digit === '2') {
        setIvrNode('confirm');
        speakText("Mandi slot booked successfully. You will receive an SMS shortly. Press 0 for main menu.");
      } else if (digit === '0') {
        startIvr();
      } else {
        speakText("Press 1 for 50 Quintals, 2 for 100 Quintals, or 0 to go back.");
      }
    } else if (ivrNode === 'status' || ivrNode === 'confirm') {
      if (digit === '0') {
        startIvr();
      }
    }
  };`
);

// 3. Remove the old IVR State block from render, because startIvr now jumps directly to connected
content = content.replace(
  /\{\/\* IVR STATE \*\/\}\s*\{callState === 'ivr' && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}/,
  `{/* Old IVR state removed */}`
);

// 4. Inject Keypad inside connected state UI. We find the message list end.
content = content.replace(
  /<div className="flex-1 overflow-y-auto p-4 space-y-4" ref=\{chatScrollRef\}>/,
  `{botMode === 'ai' && <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>}`
);

content = content.replace(
  /<\/div>\s*\{\/\* Listening Indicator \*\/\}/,
  `</div>}
            
            {botMode === 'ivr' && (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 relative p-8">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <PhoneCall className="w-96 h-96" />
                </div>
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white z-10">
                  <Bot className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 z-10 text-center">Interactive Voice Response</h3>
                <p className="text-emerald-600 font-medium z-10 text-center mt-2 animate-pulse">
                  {isBotSpeaking ? "Speaking..." : "Awaiting Input..."}
                </p>
              </div>
            )}

            {/* Listening Indicator */}`
);

// 5. Inject Keypad UI
content = content.replace(
  /\{\/\* Bottom Actions \*\/\}/,
  `{showKeypad && botMode === 'ivr' && (
              <div className="bg-slate-100 p-6 border-t border-slate-200">
                <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                  {['1','2','3','4','5','6','7','8','9','*','0','#'].map(d => (
                    <button key={d} onClick={() => handleKeypadPress(d)} className="h-16 bg-white rounded-full shadow-sm font-bold text-2xl text-slate-700 hover:bg-slate-50 transition active:scale-95 border border-slate-300 flex items-center justify-center">
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bottom Actions */}`
);

// 6. We should hide the microphone button when in IVR mode, or repurpose it? No, just keep bottom actions but disable mic if in IVR
content = content.replace(
  /<div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500\/30">/,
  `<div className={\`w-16 h-16 \${botMode === 'ivr' ? 'bg-slate-300' : 'bg-emerald-500'} rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30\`}>`
);
content = content.replace(
  /<button[\s\S]*?className="w-14 h-14 bg-emerald-600[\s\S]*?<\/button>/,
  `<button
                        onClick={botMode === 'ivr' ? undefined : toggleMic}
                        disabled={botMode === 'ivr'}
                        className={\`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all \${isListening ? 'bg-rose-500 text-white animate-pulse' : (botMode === 'ivr' ? 'bg-slate-400 text-slate-100 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 cursor-pointer')}\`}
                      >
                        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>`
);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', content);
console.log('Patched!');
