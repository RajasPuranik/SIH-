const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace(/ŸŒ भाव/g, '🌾 भाव')
         .replace(/Ÿ“‹ Ÿ‹•न/g, '📋 टोकन')
         .replace(/Ÿ‹•न स्थिति/g, 'टोकन स्थिति')
         .replace(/Ÿ›️/g, '🏛️')
         .replace(/📞/g, '📞')
         .replace(/•िसान भाˆ/g, 'किसान भाई')
         .replace(/•‰ल समाप्त \(Call Ended\)/g, 'Call Ended')
         .replace(/•‰ल •ाŸ‡‚ \(End Call\)/g, 'End Call')
         .replace(/•‰ल •ाŸ‡‚/g, 'End Call')
         .replace(/म्य‚Ÿ/g, 'Mute')
         .replace(/मा‡• šाल‚/g, 'Unmute')
         .replace(/स्प€•र/g, 'Speaker')
         .replace(/शा‚त/g, 'Quiet')
         .replace(/म‚ड€ …धि•ार€ स‡ बात/g, 'मंडी अधिकारी से बात')
         .replace(/नया स्ल‰Ÿ बु• •र‡‚/g, 'नया स्लॉट बुक करें')
         .replace(/म‚ड€ भ€ड़ व प्रत€•्षा/g, 'मंडी भीड़ व प्रतीक्षा')
         .replace(/सर•ार€ MSP भाव/g, 'सरकारी MSP भाव')
         .replace(/Ÿ‹•न स्थिति/g, 'टोकन स्थिति')
         .replace(/Ÿ“/g, '📶');

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed corrupted text!');
