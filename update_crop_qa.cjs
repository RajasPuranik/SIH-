const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const cropQuickActions = `[
            { label: '🌾 Wheat', action: 'wheat' },
            { label: '🌿 Mustard', action: 'mustard' },
            { label: '🌱 Soybean', action: 'soybean' },
            { label: '🌰 Gram', action: 'gram' },
            { label: '☁️ Cotton', action: 'cotton' },
            { label: '🌾 Paddy', action: 'paddy' },
          ]`;

// Update in `!isCropMentioned` block
txt = txt.replace(
  /quickActions:\s*\[\s*\{\s*label:\s*'🌾 Wheat',[\s\S]*?\]/g,
  `quickActions: ${cropQuickActions}`
);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Updated crop quick actions');
