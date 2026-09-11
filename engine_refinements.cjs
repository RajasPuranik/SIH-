const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const regexStateMachine = /\/\/ --- SLOT BOOKING STATE MACHINE ---[\s\S]*?\/\/ Initiation of Booking/;

const newStateMachine = `// --- SLOT BOOKING STATE MACHINE ---
  if (bookingContext && bookingContext.step) {
    if (q.includes('cancel') || q.includes('रद्द') || q.includes('कॅन्सल')) {
      return {
        spokenText: language === 'hi' ? 'बुकिंग रद्द कर दी गई है।' : language === 'mr' ? 'बुकिंग रद्द केली आहे.' : 'Booking cancelled.',
        displayText: language === 'hi' ? '❌ बुकिंग रद्द' : language === 'mr' ? '❌ बुकिंग रद्द' : '❌ Booking Cancelled',
        newBookingContext: null,
      };
    }

    if (bookingContext.step === 'crop') {
      const matchKeywords = (text: string, keywords: string[]) => keywords.some(k => text.includes(k));
      const crop = findCrop();
      
      // Strict crop verification for booking
      const isCropMentioned = matchKeywords(q, crop.terms || [crop.id, crop.name.toLowerCase(), crop.hindiName.toLowerCase()]);
      
      if (!isCropMentioned) {
        return {
          spokenText: language === 'hi' ? "कृपया फसल का नाम स्पष्ट बताएं।" : language === 'mr' ? "कृपया पिकाचे नाव स्पष्ट सांगा." : "Please clearly state the crop name.",
          displayText: language === 'hi' ? "❓ कृपया फसल का नाम बताएं" : language === 'mr' ? "❓ कृपया पिकाचे नाव सांगा" : "❓ Please state the crop name",
          newBookingContext: bookingContext,
          quickActions: [
            { label: '🌾 Wheat', action: 'wheat' },
            { label: '🌱 Soybean', action: 'soybean' },
            { label: '🧅 Onion', action: 'onion' },
          ]
        };
      }

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
      const numMatch = q.match(/\\d+/);
      const qty = numMatch ? numMatch[0] : '50'; // Default to 50 if they just say text
      return {
        spokenText: language === 'hi' ? "वाहन का प्रकार क्या है? ट्रैक्टर या ट्रक?" : language === 'mr' ? "वाहनाचा प्रकार काय आहे? ट्रॅक्टर की ट्रक?" : "What is the vehicle type? Tractor or Truck?",
        displayText: language === 'hi' ? "🚜 वाहन का प्रकार बताएं" : language === 'mr' ? "🚜 वाहनाचा प्रकार सांगा" : "🚜 Vehicle type?",
        newBookingContext: { ...bookingContext, step: 'vehicle', quantity: qty },
        quickActions: [
          { label: '🚜 Tractor', action: 'Tractor' },
          { label: '🚚 Truck', action: 'Truck' },
          { label: '🛻 Pickup', action: 'Pickup' },
        ]
      };
    }

    if (bookingContext.step === 'vehicle') {
      let vehicleType = 'Tractor Trolley';
      if (q.includes('truck') || q.includes('ट्रक')) vehicleType = 'Truck';
      else if (q.includes('pickup') || q.includes('पिकअप')) vehicleType = 'Pickup / Mini Truck';
      else if (q.includes('bullock') || q.includes('बैल')) vehicleType = 'Bullock Cart';

      return {
        spokenText: language === 'hi' ? "वाहन का रजिस्ट्रेशन नंबर बताएं? (जैसे MP-09-AB-1234)" : language === 'mr' ? "वाहनाचा नोंदणी क्रमांक सांगा?" : "Please provide the Vehicle Registration Number (e.g. MP-09-AB-1234).",
        displayText: language === 'hi' ? "🔢 वाहन का नंबर (VRN) दर्ज करें" : language === 'mr' ? "🔢 वाहनाचा नंबर (VRN) प्रविष्ट करा" : "🔢 Enter Vehicle Registration Number",
        newBookingContext: { ...bookingContext, step: 'vehicleNumber', vehicle: vehicleType },
        quickActions: [
          { label: 'MP-09-XX-0000', action: 'MP-09-XX-0000' },
          { label: 'MH-14-AB-1234', action: 'MH-14-AB-1234' },
        ]
      };
    }

    if (bookingContext.step === 'vehicleNumber') {
      let vrn = rawQuery.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      if (vrn.length < 4) vrn = 'MP-09-XX-0000'; // Fallback if they speak vaguely
      
      return {
        spokenText: language === 'hi' ? "आप मंडी किस समय पहुंचेंगे? (जैसे सुबह 10 बजे या दोपहर 1 बजे)" : language === 'mr' ? "तुम्ही मंडीत किती वाजता पोहोचणार? (सकाळी 10 किंवा दुपारी 1)" : "What time will you arrive at the mandi? (e.g. 10 AM or 1 PM)",
        displayText: language === 'hi' ? "🕒 मंडी पहुँचने का समय?" : language === 'mr' ? "🕒 मंडीत पोहोचण्याची वेळ?" : "🕒 Estimated Arrival Time?",
        newBookingContext: { ...bookingContext, step: 'time', vehicleNumber: vrn },
        quickActions: [
          { label: '08:30 AM - 10:00 AM', action: '08:30 AM - 10:00 AM' },
          { label: '10:15 AM - 11:45 AM', action: '10:15 AM - 11:45 AM' },
          { label: '12:00 PM - 01:30 PM', action: '12:00 PM - 01:30 PM' },
          { label: '02:30 PM - 04:00 PM', action: '02:30 PM - 04:00 PM' },
        ]
      };
    }

    if (bookingContext.step === 'time') {
      let mappedTime = '10:15 AM - 11:45 AM';
      if (q.includes('8') || q.includes('9') || q.includes('8:30') || q.includes('08:30') || q.includes('early') || q.includes('जल्दी')) {
        mappedTime = '08:30 AM - 10:00 AM';
      } else if (q.includes('10') || q.includes('11') || q.includes('10:15')) {
        mappedTime = '10:15 AM - 11:45 AM';
      } else if (q.includes('12') || q.includes('1') || q.includes('1:') || q.includes('12:00') || q.includes('afternoon') || q.includes('दोपहर') || q.includes('दुपार')) {
        mappedTime = '12:00 PM - 01:30 PM';
      } else if (q.includes('2') || q.includes('3') || q.includes('4') || q.includes('2:30') || q.includes('evening') || q.includes('शाम') || q.includes('संध्याकाळ')) {
        mappedTime = '02:30 PM - 04:00 PM';
      }

      return {
        spokenText: language === 'hi' ? "आपकी स्लॉट बुकिंग सफल रही। आपका गेट पास और टोकन जनरेट हो गया है।" : language === 'mr' ? "तुमचे स्लॉट बुकिंग यशस्वी झाले. तुमचा गेट पास आणि टोकन जनरेट झाला आहे." : "Your slot booking is successful. Your gate pass and token have been generated.",
        displayText: language === 'hi' ? "✅ बुकिंग सफल! यहाँ आपका टोकन है।" : language === 'mr' ? "✅ बुकिंग यशस्वी! येथे तुमचा टोकन आहे." : "✅ Booking Successful! Here is your token.",
        newBookingContext: null, // Clear context
        generatedToken: {
          crop: bookingContext.crop,
          quantity: bookingContext.quantity,
          vehicle: bookingContext.vehicle,
          vehicleNumber: bookingContext.vehicleNumber,
          time: mappedTime,
          date: new Date().toLocaleDateString()
        }
      };
    }
  }

  // Initiation of Booking`;

txt = txt.replace(regexStateMachine, newStateMachine);
fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Fixed state machine in phoneBotEngine');
