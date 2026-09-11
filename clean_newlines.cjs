const fs = require('fs');
let content = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

content = content.replace("</div>\\n            )}\\n            {/* IVR Keypad Area */}", 
  `</div>
            )}
            
            {/* IVR Keypad Area */}`);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', content);
