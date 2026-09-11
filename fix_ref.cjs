const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// 1. Add botLangRef
const regexState = /const \[botLang, setBotLang\] = useState<SupportedBotLang>\('hi'\);/;
txt = txt.replace(regexState, `const [botLang, setBotLang] = useState<SupportedBotLang>('hi');\n  const botLangRef = useRef<SupportedBotLang>('hi');`);

// 2. Update botLangRef in handleLanguageChange
const regexHandleLang = /setBotLang\(newLang\);/;
txt = txt.replace(regexHandleLang, `setBotLang(newLang);\n    botLangRef.current = newLang;`);

// 3. Update botLangRef in handleKeypadPress
txt = txt.replace(/setBotLang\('en'\);/g, `setBotLang('en'); botLangRef.current = 'en';`);
txt = txt.replace(/setBotLang\('hi'\);/g, `setBotLang('hi'); botLangRef.current = 'hi';`);
txt = txt.replace(/setBotLang\('mr'\);/g, `setBotLang('mr'); botLangRef.current = 'mr';`);

// 4. Update botLangRef in onClick handlers for initial lang_select
txt = txt.replace(/onClick=\{\(\) => \{ setBotLang\('en'\); connectCall\('en'\); \}\}/g, `onClick={() => { setBotLang('en'); botLangRef.current = 'en'; connectCall('en'); }}`);
txt = txt.replace(/onClick=\{\(\) => \{ setBotLang\('hi'\); connectCall\('hi'\); \}\}/g, `onClick={() => { setBotLang('hi'); botLangRef.current = 'hi'; connectCall('hi'); }}`);
txt = txt.replace(/onClick=\{\(\) => \{ setBotLang\('mr'\); connectCall\('mr'\); \}\}/g, `onClick={() => { setBotLang('mr'); botLangRef.current = 'mr'; connectCall('mr'); }}`);

// 5. Fix finishAndTranscribe to always use botLangRef.current
const regexFAT = /handleUserUtterance\(text, lang\);/g;
txt = txt.replace(regexFAT, `handleUserUtterance(text, botLangRef.current);`);

const regexFAT2 = /handleUserUtterance\(text, botLang\);/g;
txt = txt.replace(regexFAT2, `handleUserUtterance(text, botLangRef.current);`);

// 6. Also use botLangRef.current for transcribeWavWithApi
const regexAPI = /const res = await transcribeWavWithApi\(wavBlob, lang\);/g;
txt = txt.replace(regexAPI, `const res = await transcribeWavWithApi(wavBlob, botLangRef.current);`);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed stale closure definitively by using botLangRef!');
