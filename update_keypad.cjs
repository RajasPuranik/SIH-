const fs = require('fs');
let modal = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

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
console.log('Updated keypad logic!');
