const fs = require('fs');

// ── 1. Rewrite phoneBotEngine.ts connectCall to add language selection phase ──
let modal = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// Replace the connectCall function to add a language-selection step
// We'll change the callState to include 'lang_select'
modal = modal.replace(
  "const [callState, setCallState] = useState<'incoming' | 'calling' | 'connected' | 'ended'>('incoming');",
  "const [callState, setCallState] = useState<'incoming' | 'calling' | 'lang_select' | 'connected' | 'ended'>('incoming');"
);
modal = modal.replace(
  "const callStateRef = useRef<'incoming' | 'calling' | 'connected' | 'ended'>('incoming');",
  "const callStateRef = useRef<'incoming' | 'calling' | 'lang_select' | 'connected' | 'ended'>('incoming');"
);

// Replace the connectCall – when user accepts call, go to language selection first
modal = modal.replace(
  `const connectCall = (targetLang?: SupportedBotLang) => {
    const lang = targetLang || botLang;
    setCallState('connected');
    playFeedbackTone('success');`,
  `const connectCall = (targetLang?: SupportedBotLang) => {
    const lang = targetLang || botLang;
    if (!targetLang) {
      // First time – show language selection
      setCallState('lang_select');
      callStateRef.current = 'lang_select';
      playFeedbackTone('success');

      const langGreeting = 'Welcome to KisanTrack. Press 1 for English. 2 ke liye Hindi mein dabayein. 3 sathi Marathi madhe dabaa.';
      setMessages([{
        sender: 'bot',
        text: '🌐 **Select Language / भाषा चुनें:**\\n\\n1️⃣ English\\n2️⃣ हिन्दी (Hindi)\\n3️⃣ मराठी (Marathi)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      speakText(langGreeting, 'en');
      return;
    }
    setCallState('connected');
    playFeedbackTone('success');`
);

// Add a handler for the language-selection keypad presses
// Replace the handleKeypadPress function
modal = modal.replace(
  `const handleKeypadPress = (digit: string) => {
    playFeedbackTone('ping');
    const labelMap: Record<string, string> = {`,
  `const handleKeypadPress = (digit: string) => {
    playFeedbackTone('ping');

    // Handle language selection phase
    if (callState === 'lang_select' || callStateRef.current === 'lang_select') {
      if (digit === '1') { setBotLang('en'); connectCall('en'); return; }
      if (digit === '2') { setBotLang('hi'); connectCall('hi'); return; }
      if (digit === '3') { setBotLang('mr'); connectCall('mr'); return; }
      // Ignore other digits during language selection
      return;
    }

    const labelMap: Record<string, string> = {`
);

// Also handle voice-based language selection in handleUserUtterance
modal = modal.replace(
  `const handleUserUtterance = (query: string, lang: SupportedBotLang = botLang) => {
    if (!query.trim()) return;`,
  `const handleUserUtterance = (query: string, lang: SupportedBotLang = botLang) => {
    if (!query.trim()) return;

    // Handle language selection phase via voice
    if (callState === 'lang_select' || callStateRef.current === 'lang_select') {
      const q = query.toLowerCase().trim();
      if (q.includes('1') || q.includes('english') || q.includes('one')) {
        setBotLang('en'); connectCall('en'); return;
      } else if (q.includes('2') || q.includes('hindi') || q.includes('two') || q.includes('हिन्दी') || q.includes('हिंदी')) {
        setBotLang('hi'); connectCall('hi'); return;
      } else if (q.includes('3') || q.includes('marathi') || q.includes('three') || q.includes('मराठी')) {
        setBotLang('mr'); connectCall('mr'); return;
      }
      // If unrecognized, repeat the prompt
      speakText('Please press 1, 2, or 3 to select your language.', 'en');
      return;
    }`
);

// Add a lang_select UI panel right after the 'calling' state panel
const langSelectUI = `
        {/* ────────── STATE: LANGUAGE SELECTION ────────── */}
        {callState === 'lang_select' && (
          <div className="flex-1 flex flex-col items-center justify-between p-6 text-center">
            <div className="pt-8 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-4xl">
                🌐
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Select Language</h3>
                <p className="text-xs text-emerald-400 font-medium mt-1">भाषा चुनें / भाषा निवडा</p>
              </div>
            </div>

            <div className="w-full space-y-3 max-w-xs">
              <button onClick={() => { setBotLang('en'); connectCall('en'); }} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-lg">
                <span className="text-2xl">1️⃣</span> English
              </button>
              <button onClick={() => { setBotLang('hi'); connectCall('hi'); }} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-lg">
                <span className="text-2xl">2️⃣</span> हिन्दी (Hindi)
              </button>
              <button onClick={() => { setBotLang('mr'); connectCall('mr'); }} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-lg">
                <span className="text-2xl">3️⃣</span> मराठी (Marathi)
              </button>
            </div>

            <button onClick={endCall} className="mt-4 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition cursor-pointer">
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}
`;

// Insert the language selection UI after the calling state panel
modal = modal.replace(
  `        {/* ────────── STATE: CONNECTED CALL ────────── */}`,
  langSelectUI + `\n        {/* ────────── STATE: CONNECTED CALL ────────── */}`
);

// Also update the inbound call flow – when user clicks "Accept Call" in incoming state, 
// it currently calls connectCall() which now goes to lang_select. 
// The outbound auto-connect already uses connectCall() so it will also get lang_select first.

// For the "calling" state (inbound user-initiated), also go to lang_select:
modal = modal.replace(
  `} else {
        setCallState('calling');
        setTimeout(() => {
          connectCall();
        }, 1600);
      }`,
  `} else {
        setCallState('calling');
        setTimeout(() => {
          connectCall();
        }, 1600);
      }`
);

// ── 2. Make bot interruptible more naturally ──
// The bot already has barge-in support. Let's improve it by making 
// the interruption smoother – when user speaks during bot speech,
// immediately process their words instead of ignoring them.
// This is already handled by the onVoiceInterrupt callback.
// Let's make it also work via text input during bot speaking.

// ── 3. Rename references from "किसान फोन बॉट" to "Track AI" in the modal ──
modal = modal.replace(/किसान फोन बॉट/g, 'Track AI');
modal = modal.replace(/किसान वॉइस बॉट/g, 'Track AI');
modal = modal.replace(/कृषि उत्पन्न बाजार समितीकडून/g, 'APMC मार्केट कमिटी कडून');

// Change the header from "किसान फोन बॉट" to "Track AI"
modal = modal.replace(
  '<span className="font-bold text-xs text-white">किसान फोन बॉट</span>',
  '<span className="font-bold text-xs text-white">Track AI</span>'
);

// Update the calling state heading
modal = modal.replace(
  '<h3 className="text-lg font-bold text-white">किसान वॉइस बॉट</h3>',
  '<h3 className="text-lg font-bold text-white">Track AI</h3>'
);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', modal);
console.log('PhoneBotModal.tsx patched!');

// ── 4. Update phoneBotEngine.ts to be role-aware ──
let engine = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

// Add userRole parameter to processBotQuery
engine = engine.replace(
  `export const processBotQuery = (
  rawQuery: string,
  crops: CropInfo[],
  bookings: SlotBooking[],
  userDistrict: string = 'Indore',
  language: SupportedBotLang = 'hi'
): BotResponse => {`,
  `export const processBotQuery = (
  rawQuery: string,
  crops: CropInfo[],
  bookings: SlotBooking[],
  userDistrict: string = 'Indore',
  language: SupportedBotLang = 'hi',
  userRole: string = 'farmer'
): BotResponse => {`
);

// Add role-specific responses before the fallback
// Find the end of the last intent block and add officer/buyer/shipper intents
const officerBlock = `
  // ROLE-SPECIFIC: OFFICER functions
  if (userRole === 'mandi_officer' && (
    q.includes('scan') || q.includes('verify') || q.includes('gate') || 
    q.includes('quality') || q.includes('स्कैन') || q.includes('सत्यापन') || 
    q.includes('गेट') || q === '9'
  )) {
    switch (language) {
      case 'en':
        return {
          spokenText: 'To scan a farmer gate pass, tap the Gate Scanner button on your dashboard. Point your camera at the farmer QR code. The system will auto-advance the status from Arrived to Quality Check to Weighed.',
          displayText: '🔍 **Officer Scanner:**\\n• Tap "Gate Scanner" on dashboard\\n• Point camera at farmer QR code\\n• Status auto-advances: ARRIVED → QUALITY → WEIGHED',
        };
      case 'mr':
        return {
          spokenText: 'गेट स्कॅनर वापरण्यासाठी डॅशबोर्डवरील गेट स्कॅनर बटण दाबा. शेतकऱ्याचा QR कोड कॅमेऱ्यासमोर धरा.',
          displayText: '🔍 **अधिकारी स्कॅनर:**\\n• "गेट स्कॅनर" दाबा\\n• शेतकऱ्याचा QR कोड स्कॅन करा\\n• स्थिती स्वयंचलित अपडेट होईल',
        };
      default:
        return {
          spokenText: 'गेट स्कैनर का उपयोग करने के लिए डैशबोर्ड पर गेट स्कैनर बटन दबाएं। किसान का QR कोड कैमरे के सामने रखें।',
          displayText: '🔍 **अधिकारी स्कैनर:**\\n• "गेट स्कैनर" दबाएं\\n• किसान का QR कोड स्कैन करें\\n• स्थिति ऑटो अपडेट होगी',
        };
    }
  }

  // ROLE-SPECIFIC: BUYER functions  
  if (userRole === 'corporate_buyer' && (
    q.includes('bid') || q.includes('trade') || q.includes('exchange') || 
    q.includes('order') || q.includes('buy') || q.includes('बोली') || 
    q.includes('व्यापार') || q.includes('खरीद')
  )) {
    switch (language) {
      case 'en':
        return {
          spokenText: 'You can place buy orders on the Crop Stock Exchange. Set your price per quintal, quantity, and the system will match you with sellers at your desired rate.',
          displayText: '📈 **Buyer Trading:**\\n• Go to Crop Stock Exchange tab\\n• Place a BUY order with your price\\n• System auto-matches with sellers\\n• AI price prediction available',
        };
      default:
        return {
          spokenText: 'आप क्रॉप स्टॉक एक्सचेंज पर खरीद ऑर्डर दे सकते हैं। अपनी कीमत और मात्रा सेट करें, सिस्टम आपको विक्रेताओं से मिलाएगा।',
          displayText: '📈 **खरीदार व्यापार:**\\n• क्रॉप स्टॉक एक्सचेंज टैब पर जाएं\\n• अपनी कीमत पर BUY ऑर्डर दें\\n• AI मूल्य भविष्यवाणी उपलब्ध',
        };
    }
  }

  // ROLE-SPECIFIC: SHIPPER functions
  if (userRole === 'shipper' && (
    q.includes('delivery') || q.includes('accept') || q.includes('route') || 
    q.includes('shipment') || q.includes('job') || q.includes('डिलीवरी') || 
    q.includes('शिपमेंट') || q.includes('रूट')
  )) {
    switch (language) {
      case 'en':
        return {
          spokenText: 'Check your Transporter Dashboard for available delivery jobs. You can see the pickup location, drop-off point, distance, and the offered price. Click Accept to start the delivery.',
          displayText: '🚚 **Transporter Jobs:**\\n• View available jobs on dashboard\\n• See pickup & dropoff on map\\n• Accept or reject based on price\\n• Live GPS tracking once accepted',
        };
      default:
        return {
          spokenText: 'अपने ट्रांसपोर्टर डैशबोर्ड पर उपलब्ध डिलीवरी जॉब देखें। पिकअप, ड्रॉपऑफ, दूरी और कीमत देखकर एक्सेप्ट करें।',
          displayText: '🚚 **ट्रांसपोर्टर जॉब्स:**\\n• डैशबोर्ड पर उपलब्ध जॉब देखें\\n• मैप पर पिकअप और ड्रॉपऑफ देखें\\n• कीमत के आधार पर Accept/Reject\\n• GPS ट्रैकिंग शुरू होगी',
        };
    }
  }
`;

// Insert role-specific blocks before the fallback
engine = engine.replace(
  "  // 6. MANDI CONGESTION / QUEUE",
  officerBlock + "\n  // 6. MANDI CONGESTION / QUEUE"
);

fs.writeFileSync('src/services/phoneBotEngine.ts', engine);
console.log('phoneBotEngine.ts patched!');
