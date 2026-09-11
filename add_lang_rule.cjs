const fs = require('fs');
let engine = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const queryStart = engine.indexOf('// 1. GREETING');
const newRule = `// 0. LANGUAGE SWITCHING
  if (q.includes('switch to english') || q === '1') {
    return {
      spokenText: 'Language switched to English. How can I help you?',
      displayText: '🗣️ **Language: English**\\nHow can I help you today?',
    };
  }
  if (q.includes('switch to hindi') || q === '2') {
    return {
      spokenText: 'भाषा हिंदी में बदल दी गई है। मैं आपकी क्या मदद कर सकता हूँ?',
      displayText: '🗣️ **भाषा: हिन्दी**\\nमैं आपकी क्या मदद कर सकता हूँ?',
    };
  }
  if (q.includes('switch to marathi') || q === '3') {
    return {
      spokenText: 'भाषा मराठीत बदलली आहे. मी तुमची कशी मदत करू शकतो?',
      displayText: '🗣️ **भाषा: मराठी**\\nमी तुमची कशी मदत करू शकतो?',
    };
  }

  `;

engine = engine.substring(0, queryStart) + newRule + engine.substring(queryStart);

fs.writeFileSync('src/services/phoneBotEngine.ts', engine, 'utf8');
console.log('Added language switch rule!');
