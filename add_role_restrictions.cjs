const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const restrictStr = `if (userRole !== 'farmer') {
      return {
        spokenText: language === 'hi' ? "क्षमा करें, केवल किसान ही स्लॉट बुक और ट्रैक कर सकते हैं।" : language === 'mr' ? "क्षमस्व, केवळ शेतकरी स्लॉट बुक आणि ट्रॅक करू शकतात." : "Sorry, only farmers can book and track slots via TrackAI.",
        displayText: language === 'hi' ? "🚫 केवल किसानों को अनुमति है" : language === 'mr' ? "🚫 केवळ शेतकऱ्यांना परवानगी आहे" : "🚫 Only farmers allowed",
      };
    }`;

// 1. Restriction for Booking
const bookRegex = /if \(\!bookingContext && \(q\.includes\('book'\) \|\| q\.includes\('slot'\) \|\| q\.includes\('booking'\) \|\| q\.includes\('बुक'\) \|\| q\.includes\('बुकिंग'\) \|\| q\.includes\('टोकन बना'\)\)\) \{/;
txt = txt.replace(bookRegex, `if (!bookingContext && (q.includes('book') || q.includes('slot') || q.includes('booking') || q.includes('बुक') || q.includes('बुकिंग') || q.includes('टोकन बना'))) {\n    ${restrictStr}`);

// 2. Restriction for Tracking
const tokenRegex = /if \(\s*q\.includes\('token'\) \|\|[\s\S]*?q === '1'\s*\) \{/;
txt = txt.replace(tokenRegex, (match) => `${match}\n    ${restrictStr}`);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Added role restrictions for TrackAI');
