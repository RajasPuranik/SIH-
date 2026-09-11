const fs = require('fs');

let modal = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// 1. Remove the Language Bar safely
const startStr = '{/*';
const endStr = 'STATE: INCOMING CALL';

const langBarIndex = modal.indexOf('MULTILINGUAL LANGUAGE BAR');
if (langBarIndex !== -1) {
  const startCommentIndex = modal.lastIndexOf(startStr, langBarIndex);
  const endCommentIndex = modal.indexOf(endStr, langBarIndex);
  
  if (startCommentIndex !== -1 && endCommentIndex !== -1) {
    const nextStartCommentIndex = modal.lastIndexOf(startStr, endCommentIndex);
    // Delete from startCommentIndex to nextStartCommentIndex
    modal = modal.substring(0, startCommentIndex) + modal.substring(nextStartCommentIndex);
  }
}

// 2. Fix the corrupted quick questions
const quickQuestionsRegex = /\{\[\s*\{\s*label:\s*'.*?',\s*q:\s*'.*?'\s*\}(?:,\s*\{\s*label:\s*'.*?',\s*q:\s*'.*?'\s*\})*\s*\]\.map/g;
modal = modal.replace(quickQuestionsRegex, `{[
                    { label: '🌾 आज का भाव', q: 'आज का मंडी भाव क्या है' },
                    { label: '📋 मेरा टोकन', q: 'मेरा टोकन नंबर और स्थिति बताएं' },
                    { label: '🏛️ मंडी भीड़', q: 'मंडी में अभी भीड़ और कतार कितनी है' },
                    { label: '🌤️ मौसम', q: 'आज का मौसम कैसा रहेगा' },
                    { label: '📦 नया टोकन', q: 'नया स्लॉट बुक करना है' },
                  ].map`);

// 3. Fix the corrupted label map
const labelMapRegex = /const labelMap: Record<string, string> = {[\s\S]*?};/g;
modal = modal.replace(labelMapRegex, `const labelMap: Record<string, string> = {
      '1': 'टोकन स्थिति (1)',
      '2': 'सरकारी MSP भाव (2)',
      '3': 'मंडी भीड़ व प्रतीक्षा (3)',
      '4': 'नया स्लॉट बुक करें (4)',
      '9': 'मंडी अधिकारी से बात (9)',
    };`);

// 4. Fix other corrupted strings
modal = modal.replace(/Ÿ“¶/g, '📶');
modal = modal.replace(/Ÿ””/g, '🔔');
modal = modal.replace(/ŸŒ¾/g, '🌾');
modal = modal.replace(/Ÿ›️/g, '🏛️');
modal = modal.replace(/Ÿ“ž/g, '📞');
modal = modal.replace(/ŸŽ™️/g, '🎙️');

modal = modal.replace(/•िसान फ‹न ब‰Ÿ/g, 'Kisan Phone Bot');
modal = modal.replace(/•िसान व‰इस ब‰Ÿ/g, 'Kisan Voice Bot');
modal = modal.replace(/•‰ल मिलाई जा रह€ हˆ \(Connecting\.\.\.\)/g, 'Connecting...');
modal = modal.replace(/ब‹ल रहा हˆ/g, 'Speaking');
modal = modal.replace(/स‚न रह‡ हˆ‚/g, 'Listening');
modal = modal.replace(/तˆयार/g, 'Ready');
modal = modal.replace(/त्वरित प्रश्न \(Quick Questions\):/g, 'Quick Questions:');
modal = modal.replace(/मूयूट/g, 'Mute');
modal = modal.replace(/माई• चाल‚/g, 'Unmute');
modal = modal.replace(/स्प€•र/g, 'Speaker');
modal = modal.replace(/शा‚त/g, 'Quiet');
modal = modal.replace(/•‰ल •ाट‡‚/g, 'End Call');
modal = modal.replace(/•‰ल समाप्त \(Call Ended\)/g, 'Call Ended');
modal = modal.replace(/ब‹ल‡‚ या लिख‡‚ \(Speak or type\)\.\.\./g, 'Speak or type...');
modal = modal.replace(/ब‹लि , हम स‚न रह‡ हˆ‚\.\.\./g, 'Speak, we are listening...');
modal = modal.replace(/†प•€ †वाज़ † रह€ हˆ\.\.\./g, 'We hear you...');
modal = modal.replace(/†प•€ बात समझ रह‡ हˆ‚\.\.\. \(Processing voice\.\.\.\)/g, 'Processing voice...');

// Remove auto language detect
const regexLang = /const detected = \(\(res as any\)\.lang as SupportedBotLang\) \|\| detectLanguageFromText\(text\);\s*const activeLang: SupportedBotLang = detected \|\| lang \|\| botLang;\s*if \(activeLang !== botLang\) \{\s*setBotLang\(activeLang\);\s*\}\s*handleUserUtterance\(text, activeLang\);/;
modal = modal.replace(regexLang, `// Multi-language adaptability removed by user request
        // Force use of the currently selected botLang
        handleUserUtterance(text, botLang);`);

// Update IVR text
modal = modal.replace(
  'IVR: 1=Token | 2=MSP | 3=Queue | 4=Book | 9=Officer',
  'Language: 1=English | 2=Hindi | 3=Marathi'
);

// Update handleKeypadPress
const keypadRegex = /const handleKeypadPress = \(digit: string\) => \{[\s\S]*?handleUserUtterance\(query\);\s*\};/;
modal = modal.replace(keypadRegex, `const handleKeypadPress = (digit: string) => {
    playFeedbackTone('ping');
    if (digit === '1') {
      setBotLang('en');
      handleUserUtterance('switch to english');
    } else if (digit === '2') {
      setBotLang('hi');
      handleUserUtterance('switch to hindi');
    } else if (digit === '3') {
      setBotLang('mr');
      handleUserUtterance('switch to marathi');
    } else {
      handleUserUtterance(digit);
    }
  };`);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', modal, 'utf8');
console.log('Successfully cleaned modal!');
