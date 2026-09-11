const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regexIncoming = /<button[\s\S]*?onClick=\{\(\) => setCallState\('calling'\)\}[\s\S]*?<\/button>/;
txt = txt.replace(regexIncoming, `<button 
                onClick={() => setCallState('lang_select')}
                className="mt-12 w-20 h-20 bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_40px_rgba(5,150,105,0.4)] animate-bounce"
              >
                <Phone className="w-8 h-8" />
              </button>`);

const langSelectUi = `
          {callState === 'lang_select' && (
            <div className="flex flex-col items-center w-full animate-fade-in px-4">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <Globe className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-light text-white mb-2">Select Language</h3>
              <p className="text-slate-400 mb-8">भाषा चुनें / भाषा निवडा</p>
              
              <div className="w-full space-y-4 max-w-[280px]">
                <button 
                  onClick={() => { setBotLang('en'); connectCall('en'); }} 
                  className="w-full py-4 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer group"
                >
                  <span className="text-xl">🇬🇧</span>
                  <span className="text-white font-medium text-lg tracking-wide group-hover:text-white">English</span>
                </button>
                <button 
                  onClick={() => { setBotLang('hi'); connectCall('hi'); }} 
                  className="w-full py-4 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer group"
                >
                  <span className="text-xl">🇮🇳</span>
                  <span className="text-white font-medium text-lg tracking-wide group-hover:text-white">हिन्दी</span>
                </button>
                <button 
                  onClick={() => { setBotLang('mr'); connectCall('mr'); }} 
                  className="w-full py-4 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer group"
                >
                  <span className="text-xl">🚩</span>
                  <span className="text-white font-medium text-lg tracking-wide group-hover:text-white">मराठी</span>
                </button>
              </div>
            </div>
          )}
`;

const regexCalling = /\{callState === 'calling' && \([\s\S]*?<\/div>\s*\)\s*\}/;
txt = txt.replace(regexCalling, langSelectUi);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Added Language Selection UI!');
