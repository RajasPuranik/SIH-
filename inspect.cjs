const fs = require('fs');
const lines = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8').split('\n');

lines.forEach((l, i) => {
  if (l.includes("callState === 'connected'")) console.log('connected:', i);
  if (l.includes("flex-1 overflow-y-auto")) console.log('messages list:', i);
  if (l.includes("Listening Indicator")) console.log('listening indicator:', i);
  if (l.includes("Bottom Actions")) console.log('bottom actions:', i);
  if (l.includes("toggleMic")) console.log('toggleMic btn:', i);
});
