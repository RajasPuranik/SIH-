const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

// 1. Update BotResponse interface
txt = txt.replace(
  'smsContent?: string;\n}',
  'smsContent?: string;\n  newBookingContext?: any;\n  generatedToken?: any;\n}'
);

// 2. Update processBotQuery signature
const sigRegex = /export const processBotQuery = \([\s\S]*?\): BotResponse => \{/;
const newSig = `export const processBotQuery = (
  rawQuery: string,
  crops: CropInfo[],
  bookings: SlotBooking[],
  userDistrict: string = 'Indore',
  language: SupportedBotLang = 'en',
  userRole: string = 'farmer',
  bookingContext: any = null
): BotResponse => {`;
txt = txt.replace(sigRegex, newSig);

// 3. Add Slot Booking State Machine at the top of processBotQuery (after findCrop)
const insertionPoint = "  // 0. LANGUAGE SWITCHING";
const stateMachineLogic = `
  // --- SLOT BOOKING STATE MACHINE ---
  if (bookingContext && bookingContext.step) {
    if (q.includes('cancel') || q.includes('रद्द') || q.includes('कॅन्सल')) {
      return {
        spokenText: language === 'hi' ? 'बुकिंग रद्द कर दी गई है।' : language === 'mr' ? 'बुकिंग रद्द केली आहे.' : 'Booking cancelled.',
        displayText: language === 'hi' ? '❌ बुकिंग रद्द' : language === 'mr' ? '❌ बुकिंग रद्द' : '❌ Booking Cancelled',
        newBookingContext: null,
      };
    }

    if (bookingContext.step === 'crop') {
      const crop = findCrop();
      return {
        spokenText: language === 'hi' ? \`\${crop.hindiName} के कितने क्विंटल?\` : language === 'mr' ? \`\${crop.name}चे किती क्विंटल?\` : \`How many quintals of \${crop.name}?\`,
        displayText: language === 'hi' ? \`⚖️ \${crop.hindiName} की मात्रा बताएं (क्विंटल में)\` : language === 'mr' ? \`⚖️ \${crop.name} किती क्विंटल?\` : \`⚖️ Quantity of \${crop.name} (in Qtl)?\`,
        newBookingContext: { ...bookingContext, step: 'quantity', crop: crop.name },
      };
    }

    if (bookingContext.step === 'quantity') {
      return {
        spokenText: language === 'hi' ? "वाहन का प्रकार क्या है? ट्रैक्टर या ट्रक?" : language === 'mr' ? "वाहनाचा प्रकार काय आहे? ट्रॅक्टर की ट्रक?" : "What is the vehicle type? Tractor or Truck?",
        displayText: language === 'hi' ? "🚜 वाहन का प्रकार बताएं" : language === 'mr' ? "🚜 वाहनाचा प्रकार सांगा" : "🚜 Vehicle type?",
        newBookingContext: { ...bookingContext, step: 'vehicle', quantity: rawQuery },
      };
    }

    if (bookingContext.step === 'vehicle') {
      return {
        spokenText: language === 'hi' ? "आप मंडी किस समय पहुंचेंगे?" : language === 'mr' ? "तुम्ही मंडीत किती वाजता पोहोचणार?" : "What time will you arrive at the mandi?",
        displayText: language === 'hi' ? "🕒 मंडी पहुँचने का समय?" : language === 'mr' ? "🕒 मंडीत पोहोचण्याची वेळ?" : "🕒 Estimated Arrival Time?",
        newBookingContext: { ...bookingContext, step: 'time', vehicle: rawQuery },
      };
    }

    if (bookingContext.step === 'time') {
      const tokenNumber = \`KT-\${Math.floor(1000 + Math.random() * 9000)}\`;
      return {
        spokenText: language === 'hi' ? "आपकी स्लॉट बुकिंग सफल रही। आपका गेट पास और टोकन जनरेट हो गया है।" : language === 'mr' ? "तुमचे स्लॉट बुकिंग यशस्वी झाले. तुमचा गेट पास आणि टोकन जनरेट झाला आहे." : "Your slot booking is successful. Your gate pass and token have been generated.",
        displayText: language === 'hi' ? "✅ बुकिंग सफल! यहाँ आपका टोकन है।" : language === 'mr' ? "✅ बुकिंग यशस्वी! येथे तुमचा टोकन आहे." : "✅ Booking Successful! Here is your token.",
        newBookingContext: null, // Clear context
        generatedToken: {
          crop: bookingContext.crop,
          quantity: bookingContext.quantity,
          vehicle: bookingContext.vehicle,
          time: rawQuery,
          tokenNumber: tokenNumber,
          date: new Date().toLocaleDateString()
        }
      };
    }
  }

  // Initiation of Booking
  if (!bookingContext && (q.includes('book') || q.includes('slot') || q.includes('booking') || q.includes('बुक') || q.includes('बुकिंग') || q.includes('टोकन बना'))) {
    return {
      spokenText: language === 'hi' ? "आप कौन सी फसल लाना चाहते हैं?" : language === 'mr' ? "तुम्ही कोणते पीक आणू इच्छिता?" : "Which crop do you want to bring?",
      displayText: language === 'hi' ? "🌾 आप कौन सी फसल लाना चाहते हैं?" : language === 'mr' ? "🌾 तुम्ही कोणते पीक आणणार?" : "🌾 Which crop do you want to bring?",
      newBookingContext: { step: 'crop' }
    };
  }

  // 0. LANGUAGE SWITCHING
`;

txt = txt.replace(insertionPoint, stateMachineLogic);
fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Added slot booking state machine to phoneBotEngine.ts');
