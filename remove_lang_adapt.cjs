const fs = require('fs');
let modal = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regex = /const detected = \(\(res as any\)\.lang as SupportedBotLang\) \|\| detectLanguageFromText\(text\);\s*const activeLang: SupportedBotLang = detected \|\| lang \|\| botLang;\s*if \(activeLang !== botLang\) \{\s*setBotLang\(activeLang\);\s*\}\s*handleUserUtterance\(text, activeLang\);/;

modal = modal.replace(regex, `// Multi-language adaptability removed by user request
        // Force use of the currently selected botLang
        handleUserUtterance(text, botLang);`);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', modal, 'utf8');
console.log('Removed language adaptability from audio handling.');
