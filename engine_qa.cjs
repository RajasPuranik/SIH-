const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

// Replace the step handling logic in phoneBotEngine.ts
const stateMachineLogicRegex = /\/\/ --- SLOT BOOKING STATE MACHINE ---[\s\S]*?\/\/ Initiation of Booking/;

const newStateMachineLogic = `// --- SLOT BOOKING STATE MACHINE ---
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
        spokenText: language === 'hi' ? \`\${crop.hindiName} के कितने क्विंटल? (जैसे 50 क्विंटल)\` : language === 'mr' ? \`\${crop.name}चे किती क्विंटल? (जसे 50 क्विंटल)\` : \`How many quintals of \${crop.name}?\`,
        displayText: language === 'hi' ? \`⚖️ \${crop.hindiName} की मात्रा बताएं (क्विंटल में)\` : language === 'mr' ? \`⚖️ \${crop.name} किती क्विंटल?\` : \`⚖️ Quantity of \${crop.name} (in Qtl)?\`,
        newBookingContext: { ...bookingContext, step: 'quantity', crop: crop.name },
        quickActions: [
          { label: '10 Qtl', action: '10' },
          { label: '25 Qtl', action: '25' },
          { label: '50 Qtl', action: '50' },
          { label: '100 Qtl', action: '100' },
        ]
      };
    }

    if (bookingContext.step === 'quantity') {
      return {
        spokenText: language === 'hi' ? "वाहन का प्रकार क्या है? ट्रैक्टर या ट्रक?" : language === 'mr' ? "वाहनाचा प्रकार काय आहे? ट्रॅक्टर की ट्रक?" : "What is the vehicle type? Tractor or Truck?",
        displayText: language === 'hi' ? "🚜 वाहन का प्रकार बताएं" : language === 'mr' ? "🚜 वाहनाचा प्रकार सांगा" : "🚜 Vehicle type?",
        newBookingContext: { ...bookingContext, step: 'vehicle', quantity: rawQuery },
        quickActions: [
          { label: '🚜 Tractor', action: 'Tractor' },
          { label: '🚚 Truck', action: 'Truck' },
          { label: '🛻 Pickup', action: 'Pickup' },
        ]
      };
    }

    if (bookingContext.step === 'vehicle') {
      return {
        spokenText: language === 'hi' ? "आप मंडी किस समय पहुंचेंगे? सुबह या दोपहर?" : language === 'mr' ? "तुम्ही मंडीत किती वाजता पोहोचणार? सकाळ की दुपार?" : "What time will you arrive at the mandi?",
        displayText: language === 'hi' ? "🕒 मंडी पहुँचने का समय?" : language === 'mr' ? "🕒 मंडीत पोहोचण्याची वेळ?" : "🕒 Estimated Arrival Time?",
        newBookingContext: { ...bookingContext, step: 'time', vehicle: rawQuery },
        quickActions: [
          { label: '🌅 Morning (10 AM)', action: 'Morning' },
          { label: '☀️ Afternoon (2 PM)', action: 'Afternoon' },
          { label: '🌇 Evening (5 PM)', action: 'Evening' },
        ]
      };
    }

    if (bookingContext.step === 'time') {
      return {
        spokenText: language === 'hi' ? "आपकी स्लॉट बुकिंग सफल रही। आपका गेट पास और टोकन जनरेट हो गया है।" : language === 'mr' ? "तुमचे स्लॉट बुकिंग यशस्वी झाले. तुमचा गेट पास आणि टोकन जनरेट झाला आहे." : "Your slot booking is successful. Your gate pass and token have been generated.",
        displayText: language === 'hi' ? "✅ बुकिंग सफल! यहाँ आपका टोकन है।" : language === 'mr' ? "✅ बुकिंग यशस्वी! येथे तुमचा टोकन आहे." : "✅ Booking Successful! Here is your token.",
        newBookingContext: null, // Clear context
        generatedToken: {
          crop: bookingContext.crop,
          quantity: bookingContext.quantity,
          vehicle: bookingContext.vehicle,
          time: rawQuery,
          date: new Date().toLocaleDateString()
        }
      };
    }
  }

  // Initiation of Booking`;

txt = txt.replace(stateMachineLogicRegex, newStateMachineLogic);

// Add quick actions to the initiation of booking
const initRegex = /\/\/ Initiation of Booking[\s\S]*?newBookingContext: \{ step: 'crop' \}\n\s*};\n\s*\}/;
const newInit = `// Initiation of Booking
  if (!bookingContext && (q.includes('book') || q.includes('slot') || q.includes('booking') || q.includes('बुक') || q.includes('बुकिंग') || q.includes('टोकन बना'))) {
    return {
      spokenText: language === 'hi' ? "आप कौन सी फसल लाना चाहते हैं?" : language === 'mr' ? "तुम्ही कोणते पीक आणू इच्छिता?" : "Which crop do you want to bring?",
      displayText: language === 'hi' ? "🌾 आप कौन सी फसल लाना चाहते हैं?" : language === 'mr' ? "🌾 तुम्ही कोणते पीक आणणार?" : "🌾 Which crop do you want to bring?",
      newBookingContext: { step: 'crop' },
      quickActions: [
        { label: '🌾 Wheat', action: 'wheat' },
        { label: '🌱 Soybean', action: 'soybean' },
        { label: '🧅 Onion', action: 'onion' },
        { label: '🌿 Mustard', action: 'mustard' },
      ]
    };
  }`;
txt = txt.replace(initRegex, newInit);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Updated phoneBotEngine.ts with Quick Actions for Slot Booking');
