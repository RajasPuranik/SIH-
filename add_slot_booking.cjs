const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// 1. Add QRCodeCanvas import
if (!txt.includes('QRCodeCanvas')) {
  txt = txt.replace(
    "import { useApp } from '../../context/AppContext';",
    "import { useApp } from '../../context/AppContext';\nimport { QRCodeCanvas } from 'qrcode.react';"
  );
}

// 2. Update messages state type to include generatedToken
const msgStateRegex = /const \[messages, setMessages\] = useState<\s*\{\s*sender: 'bot' \| 'farmer';\s*text: string;\s*time: string;\s*quickActions\?: \{ label: string; action: string \}\[\]\s*\}\[\]\s*>\(\[\]\);/;
const newMsgState = `const [messages, setMessages] = useState<
    { sender: 'bot' | 'farmer'; text: string; time: string; quickActions?: { label: string; action: string }[]; generatedToken?: any }[]
  >([]);
  const bookingContextRef = useRef<any>(null);`;
txt = txt.replace(msgStateRegex, newMsgState);

// 3. Update handleUserUtterance to pass bookingContextRef.current
const processQueryRegex = /const botRes: BotResponse = processBotQuery\(\s*query,\s*crops,\s*bookings,\s*currentUser\?.district \|\| 'Indore',\s*lang\s*\);/;
const newProcessQuery = `const botRes: BotResponse = processBotQuery(
      query,
      crops,
      bookings,
      currentUser?.district || 'Indore',
      lang,
      'farmer',
      bookingContextRef.current
    );

    if (botRes.newBookingContext !== undefined) {
      bookingContextRef.current = botRes.newBookingContext;
    }`;
txt = txt.replace(processQueryRegex, newProcessQuery);

// 4. Update the message object insertion to include generatedToken
const setMsgRegex = /text: botRes\.displayText,\s*time: new Date\(\)\.toLocaleTimeString\(\[\], \{ hour: '2-digit', minute: '2-digit' \}\),\s*quickActions: botRes\.quickActions,\s*\},/;
const newSetMsg = `text: botRes.displayText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: botRes.quickActions,
        generatedToken: botRes.generatedToken,
      },`;
txt = txt.replace(setMsgRegex, newSetMsg);

// 5. Update UI rendering to show generatedToken
const orbRenderRegex = /\{\/\* ORB AREA \*\/\}\s*<div className="relative w-48 h-48 mb-12 flex items-center justify-center">/;
const newOrbRender = `{/* QR CODE TOKEN AREA */}
                {lastMessage?.generatedToken ? (
                  <div className="mb-6 p-4 bg-white rounded-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] w-64 text-center animate-scale-in z-20">
                    <h3 className="text-emerald-700 font-bold mb-2">Gate Pass / टोकन</h3>
                    <div className="flex justify-center mb-3">
                      <QRCodeCanvas value={lastMessage.generatedToken.tokenNumber} size={120} />
                    </div>
                    <div className="text-left text-sm text-slate-700 space-y-1">
                      <p><strong>Token:</strong> {lastMessage.generatedToken.tokenNumber}</p>
                      <p><strong>Crop:</strong> {lastMessage.generatedToken.crop}</p>
                      <p><strong>Qtl:</strong> {lastMessage.generatedToken.quantity}</p>
                      <p><strong>Vehicle:</strong> {lastMessage.generatedToken.vehicle}</p>
                      <p><strong>Time:</strong> {lastMessage.generatedToken.time}</p>
                    </div>
                  </div>
                ) : (
                  /* NORMAL ORB AREA */
                  <div className="relative w-48 h-48 mb-12 flex items-center justify-center">`;
txt = txt.replace(orbRenderRegex, newOrbRender);

// Also need to close the ternary for the ORB area!
// The orb area div ends before {/* TRANSCRIPT AREA */}
const transcriptAreaRegex = /\{\/\* TRANSCRIPT AREA \*\/\}/;
const newTranscriptArea = `)}
              {/* TRANSCRIPT AREA */}`;
txt = txt.replace(transcriptAreaRegex, newTranscriptArea);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Modified PhoneBotModal.tsx for slot booking logic!');
