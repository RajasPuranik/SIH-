const fs = require('fs');
let engine = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

// The function signature has extra indentation. Let's find what's actually there:
engine = engine.replace(
  "language: SupportedBotLang = 'hi'\n  ): BotResponse => {",
  "language: SupportedBotLang = 'hi',\n    userRole: string = 'farmer'\n  ): BotResponse => {"
);

fs.writeFileSync('src/services/phoneBotEngine.ts', engine);
console.log('Fixed userRole parameter!');
