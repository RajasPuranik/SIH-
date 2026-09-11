const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace('currentUser,\n    playFeedbackTone,', 'currentUser,\n    createBooking,\n    playFeedbackTone,');
if (txt.indexOf('createBooking') === txt.lastIndexOf('createBooking')) {
    // If not inserted, let's just find `currentUser,` inside `useApp()` destructuring
    const useAppStart = txt.indexOf('useApp()');
    const startObj = txt.lastIndexOf('{', useAppStart);
    const useAppCode = txt.substring(startObj, useAppStart);
    if (!useAppCode.includes('createBooking')) {
        txt = txt.replace(useAppCode, useAppCode.replace('currentUser,', 'currentUser,\n    createBooking,'));
    }
}

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
