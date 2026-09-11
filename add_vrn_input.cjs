const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// Add vrnInput state
txt = txt.replace(
  "const [currentSpeechTranscript, setCurrentSpeechTranscript] = useState('');",
  "const [currentSpeechTranscript, setCurrentSpeechTranscript] = useState('');\n  const [vrnInput, setVrnInput] = useState('');"
);

// Add input form before quickActions
const quickActionsRegex = /\{!showKeypad && lastMessage\?\.quickActions && \(/;
const newQuickActions = `{bookingContextRef.current?.step === 'vehicleNumber' && (
              <div className="px-4 pb-2 pt-2 w-full max-w-xs mx-auto animate-fade-in-up z-30 relative">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (vrnInput.trim()) {
                      handleUserUtterance(vrnInput.trim());
                      setVrnInput('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={vrnInput}
                    onChange={(e) => setVrnInput(e.target.value.toUpperCase())}
                    placeholder="Type VRN..."
                    className="flex-1 bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-2 text-emerald-300 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 uppercase tracking-widest placeholder:text-slate-500 placeholder:font-normal"
                  />
                  <button type="submit" disabled={!vrnInput.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white p-2 rounded-xl transition shadow-lg">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {!showKeypad && lastMessage?.quickActions && (`;

txt = txt.replace(quickActionsRegex, newQuickActions);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Added VRN text input box to PhoneBotModal');
