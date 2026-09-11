const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// 1. Rewrite handleLanguageChange
const regexHandleLang = /const handleLanguageChange = \([\s\S]*?speakText\(greeting\.spokenText, newLang\);\s*\}\s*\};/;
const newHandleLang = `const handleLanguageChange = (newLang: SupportedBotLang) => {
    setBotLang(newLang);
    playFeedbackTone('ping');
    if (callState === 'connected') {
      if (newLang === 'en') handleUserUtterance('switch to english', 'en');
      else if (newLang === 'hi') handleUserUtterance('switch to hindi', 'hi');
      else if (newLang === 'mr') handleUserUtterance('switch to marathi', 'mr');
    }
  };`;
txt = txt.replace(regexHandleLang, newHandleLang);

// 2. Add Dropdown UI
const regexTopBar = /\{callState === 'connected' && \([\s\S]*?<div className="px-3 py-1 bg-slate-900\/80 rounded-full text-xs font-medium text-slate-400 border border-slate-800">[\s\S]*?\{formatTimer\(callDuration\)\}[\s\S]*?<\/div>[\s\S]*?\)\}/;
const newTopBar = `{callState === 'connected' && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="relative group">
                <select 
                  value={botLang}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedBotLang)}
                  className="appearance-none bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-emerald-400 pl-3 pr-6 py-1.5 rounded-full border border-slate-700 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/50 shadow-lg"
                >
                  <option value="en">🇬🇧 ENG</option>
                  <option value="hi">🇮🇳 HIN</option>
                  <option value="mr">🚩 MAR</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 group-hover:text-emerald-300">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <div className="px-3 py-1 bg-slate-900/80 rounded-full text-xs font-medium text-slate-500 border border-slate-800/50">
                {formatTimer(callDuration)}
              </div>
            </div>
          )}`;
txt = txt.replace(regexTopBar, newTopBar);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Added Language Dropdown and updated logic!');
