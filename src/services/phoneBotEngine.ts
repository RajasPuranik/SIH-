import { CropInfo, SlotBooking } from '../types';

export interface BotResponse {
  spokenText: string;
  displayText: string;
  quickActions?: { label: string; action: string }[];
  smsContent?: string;
  newBookingContext?: any;
  generatedToken?: any;
}

export type SupportedBotLang = 'en' | 'hi' | 'mr';

export const BOT_LANGUAGES: { code: SupportedBotLang; label: string; nativeName: string; voice: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English (IN)', voice: 'en-IN-NeerjaExpressiveNeural', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', voice: 'hi-IN-SwaraNeural', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', voice: 'mr-IN-AarohiNeural', flag: '🚩' },
];

export const getInitialGreeting = (lang: SupportedBotLang, farmerName: string = 'किसान भाई', isOutbound: boolean = false, tokenNum?: string): { spokenText: string; displayText: string } => {
  if (isOutbound) {
    const token = tokenNum || 'KT-MP-2026-9041';
    switch (lang) {
      case 'mr':
        return {
          spokenText: `नमस्कार ${farmerName}! हा एपीएमसी कृषी उत्पन्न बाजार समितीकडून ऑटोमेटेड कॉल आहे. तुमचा टोकन ${token} सत्यापित झाला आहे. आपण मंडीमध्ये येऊ शकता.`,
          displayText: `🔔 **स्वयंचलित कॉल (मराठी):** टोकन ${token} गेट 3 वर मंजूर झाला आहे.`
        };
      case 'en':
        return {
          spokenText: `Hello ${farmerName}! This is an automated voice alert from APMC Mandi. Your token ${token} has been verified for Gate 3 entry. You can arrive at your scheduled time.`,
          displayText: `🔔 **Automated Voice Alert:** Token ${token} is approved for Gate 3 entry.`
        };
      default: // hi
        return {
          spokenText: `नमस्कार ${farmerName} जी! यह एपीएमसी मंडी कार्यालय से ऑटोमेटेड अपडेट है। आपका टोकन ${token} सत्यापित हो चुका है। आप अपनी उपज लेकर आ सकते हैं।`,
          displayText: `🔔 **लाइव वॉइस अलर्ट:** टोकन ${token} गेट 3 पर सत्यापित हो चुका है।`
        };
    }
  }

  // Inbound Greetings
  switch (lang) {
    case 'mr':
      return {
        spokenText: `नमस्कार ${farmerName}! किसानट्रॅक 24x7 व्हॉइस हेल्पलाईनवर आपले स्वागत आहे. आपण बाजारभाव, टोकन स्थिती किंवा स्लॉट बुकिंगबद्दल विचारू शकता.`,
        displayText: `🙏 **नमस्कार शेतकरी बंधूंनो!** मी किसानट्रॅक फोन बॉट आहे.\n• "गव्हाचा आजचा भाव काय आहे?"\n• "माझ्या टोकनची स्थिती काय आहे?"\n• "मंडीमध्ये किती गर्दी आहे?"`
      };
    case 'en':
      return {
        spokenText: `Hello ${farmerName}! Welcome to KisanTrack 24x7 Voice Helpline. I am your AI phone assistant. You can ask me about live MSP rates, token status, or slot bookings.`,
        displayText: `🙏 **Hello Farmer!** I am your KisanTrack Phone Bot.\n• "What is today's wheat price?"\n• "What is my token status?"\n• "How crowded is the mandi today?"`
      };
    default: // hi
      return {
        spokenText: `नमस्कार ${farmerName} जी! किसानट्रैक 24x7 वॉइस हेल्पलाइन में आपका स्वागत है। मैं आपका डिजिटल फोन सहायक हूँ। आप मंडी भाव, टोकन स्थिति, या स्लॉट बुकिंग के बारे में पूछ सकते हैं।`,
        displayText: `🙏 **नमस्ते किसान भाई!** मैं किसानट्रैक फोन बॉट हूँ। आप मुझसे पूछ सकते हैं:\n• "गेहूँ का आज का भाव क्या है?"\n• "मेरे टोकन की स्थिति क्या है?"\n• "इंदौर मंडी में कितनी भीड़ है?"`
      };
  }
};

const CROP_SYNONYMS: { id: string; terms: string[] }[] = [
  { id: 'wheat', terms: ['wheat', 'गेहूं', 'गेहूँ', 'कनक', 'गहू', 'गव्हाचा'] },
  { id: 'soybean', terms: ['soybean', 'soya', 'सोयाबीन', 'सोया', 'सोयाबीनचा'] },
  { id: 'mustard', terms: ['mustard', 'sarson', 'सरसों', 'राई', 'मोहरी'] },
  { id: 'onion', terms: ['onion', 'प्याज', 'प्याज़', 'कांदा', 'कांद्याचा'] },
  { id: 'cotton', terms: ['cotton', 'कपास', 'रुई', 'कापूस', 'कपाशी'] },
  { id: 'gram', terms: ['gram', 'chana', 'चना', 'चने', 'हरभरा'] },
  { id: 'maize', terms: ['maize', 'corn', 'मक्का', 'मका', 'भुट्टा'] },
];

export const processBotQuery = (
  rawQuery: string,
  crops: CropInfo[],
  bookings: SlotBooking[],
  userDistrict: string = 'Indore',
  language: SupportedBotLang = 'en',
  userRole: string = 'farmer',
  bookingContext: any = null
): BotResponse => {
  const q = rawQuery.toLowerCase().trim();

  // Helper to find crop
  const findCrop = () => {
    for (const syn of CROP_SYNONYMS) {
      if (syn.terms.some((t) => q.includes(t.toLowerCase()))) {
        const found = crops.find((c) => c.id === syn.id || c.name.toLowerCase().includes(syn.id));
        if (found) return found;
      }
    }
    return (
      crops.find((c) => q.includes(c.id) || q.includes(c.name.toLowerCase()) || q.includes(c.hindiName.toLowerCase())) ||
      crops.find((c) => c.id === 'wheat') ||
      crops[0]
    );
  };


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
        spokenText: language === 'hi' ? `${crop.hindiName} के कितने क्विंटल?` : language === 'mr' ? `${crop.name}चे किती क्विंटल?` : `How many quintals of ${crop.name}?`,
        displayText: language === 'hi' ? `⚖️ ${crop.hindiName} की मात्रा बताएं (क्विंटल में)` : language === 'mr' ? `⚖️ ${crop.name} किती क्विंटल?` : `⚖️ Quantity of ${crop.name} (in Qtl)?`,
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
      const tokenNumber = `KT-${Math.floor(1000 + Math.random() * 9000)}`;
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

  if (q.includes('switch to english') || q === '1') {
    return {
      spokenText: 'Language switched to English. How can I help you?',
      displayText: '🗣️ **Language: English**\nHow can I help you today?',
    };
  }
  if (q.includes('switch to hindi') || q === '2') {
    return {
      spokenText: 'भाषा हिंदी में बदल दी गई है। मैं आपकी क्या मदद कर सकता हूँ?',
      displayText: '🗣️ **भाषा: हिन्दी**\nमैं आपकी क्या मदद कर सकता हूँ?',
    };
  }
  if (q.includes('switch to marathi') || q === '3') {
    return {
      spokenText: 'भाषा मराठीत बदलली आहे. मी तुमची कशी मदत करू शकतो?',
      displayText: '🗣️ **भाषा: मराठी**\nमी तुमची कशी मदत करू शकतो?',
    };
  }

  // 1. GREETING
  if (
    q.includes('hello') ||
    q.includes('हेलो') ||
    q.includes('हैलो') ||
    q.includes('नमस्ते') ||
    q.includes('नमस्कार') ||
    q.includes('ram ram') ||
    q.includes('hi') ||
    q.includes('kisan bot') ||
    q.includes('ट्रैक एआई') ||
    q.includes('track ai')
  ) {
    const greeting = getInitialGreeting(language);
    return {
      spokenText: greeting.spokenText,
      displayText: greeting.displayText,
      quickActions: [
        { label: '🌾 भाव / Rates', action: 'भाव' },
        { label: '📋 टोकन / Token', action: 'टोकन स्थिति' },
        { label: '🏛️ भीड़ / Queue', action: 'मंडी भीड़' },
      ],
    };
  }

  // 2. WEATHER / FORECAST
  if (
    q.includes('weather') ||
    q.includes('rain') ||
    q.includes('मौसम') ||
    q.includes('बारिश') ||
    q.includes('पानी') ||
    q.includes('तापमान') ||
    q.includes('हवामान') ||
    q.includes('पाऊस')
  ) {
    switch (language) {
      case 'mr':
        return {
          spokenText: `आज इंदूर परिसरात हवामान निरभ्र राहील, कमाल तापमान 31 अंश आणि पावसाची शक्यता फक्त 10 टक्के आहे. शेतमालाच्या वाहतुकीसाठी हवामान अनुकूल आहे.`,
          displayText: `🌤️ **हवामान अंदाज (मराठी):**\n• हवामान: निरभ्र ऊन\n• तापमान: 31°C | आर्द्रता: 45%\n• पाऊस शक्यता: 10% (अनुकूल स्थिती)`,
        };
      case 'en':
        return {
          spokenText: `Today's weather in Indore is clear and sunny with a high of 31 degrees Celsius and only a 10 percent chance of rain. Ideal conditions for transporting produce to the mandi.`,
          displayText: `🌤️ **Weather Forecast (Indore):**\n• Condition: Clear & Sunny\n• Temperature: 31°C | Humidity: 45%\n• Rain Probability: 10% (Safe for unloading)`,
        };
      default:
        return {
          spokenText: `आज इंदौर क्षेत्र में मौसम साफ और धूप वाला रहेगा, तापमान 31 डिग्री रहेगा और बारिश की संभावना केवल 10 प्रतिशत है। फसल मंडी लाने के लिए मौसम अनुकूल है।`,
          displayText: `🌤️ **मौसम पूर्वानुमान (इंदौर):**\n• **मौसम:** साफ धूप (Sunny)\n• **तापमान:** 31°C | **नमी:** 45%\n• **बारिश की संभावना:** 10% (परिवहन हेतु सुरक्षित)`,
        };
    }
  }

  // 3. SLOT BOOKING
  if (
    q.includes('book') ||
    q.includes('slot') ||
    q.includes('स्लॉट') ||
    q.includes('बुकिंग') ||
    q.includes('नया टोकन') ||
    q === '4'
  ) {
    switch (language) {
      case 'mr':
        return {
          spokenText: `नवीन स्लॉट बुक करण्यासाठी, कृपया डॅशबोर्डवरील 'स्लॉट बुकिंग' पर्यायावर जा. आज संध्याकाळी 4 वाजताचे स्लॉट उपलब्ध आहेत.`,
          displayText: `📦 **स्लॉट बुकिंग (मराठी):**\n• आजचे उपलब्ध स्लॉट: संध्याकाळी 4:00 ते 6:00\n• गेट: गेट नंबर 3\n• आपण ॲपमधून त्वरित बुक करू शकता.`,
        };
      case 'en':
        return {
          spokenText: `To book a new unloading slot, visit the Slot Booking tab on the dashboard. Free slots are open today from 4:00 PM to 6:00 PM at Gate 3.`,
          displayText: `📦 **Slot Booking:**\n• Available Today: 4:00 PM - 6:00 PM\n• Ramp: Gate 3\n• Tap "Book Slot" on the home dashboard to confirm.`,
        };
      default:
        return {
          spokenText: `नया स्लॉट बुक करने के लिए, कृपया होम स्क्रीन पर 'स्लॉट बुकिंग' पर जाएँ। आज शाम 4 से 6 बजे तक के स्लॉट गेट 3 पर उपलब्ध हैं।`,
          displayText: `📦 **स्लॉट बुकिंग (हिन्दी):**\n• **उपलब्ध समय:** आज शाम 4:00 - 6:00\n• **गेट:** गेट नंबर 3\n• ऐप के मुख्य पेज से सीधे स्लॉट आरक्षित करें।`,
        };
    }
  }

  // 4. TOKEN STATUS
  if (
    q.includes('token') ||
    q.includes('टोकन') ||
    q.includes('status') ||
    q.includes('स्थिति') ||
    q.includes('स्थिती') ||
    q.includes('gate') ||
    q.includes('गेट') ||
    q === '1'
  ) {
    const activeBooking = bookings[0];
    if (activeBooking) {
      const stage = activeBooking.status.replace(/_/g, ' ');

      if (language === 'mr') {
        return {
          spokenText: `शेतकरी बंधू, तुमचा टोकन नंबर ${activeBooking.tokenNumber} आहे. तुमची सद्यस्थिती ${stage} आहे. गेट नंबर 3 वर अंदाजे प्रतीक्षा वेळ 12 मिनिटे आहे.`,
          displayText: `📋 **टोकन तपशील (मराठी):**\n• टोकन: ${activeBooking.tokenNumber}\n• स्थिती: ${stage}\n• मंडी: ${activeBooking.mandiName}\n• गेट प्रतीक्षा: ~12 मिनिटे`,
        };
      } else if (language === 'en') {
        return {
          spokenText: `Farmer friend, your token number is ${activeBooking.tokenNumber}. Your current status is ${stage}. Estimated gate waiting time is 12 minutes at ${activeBooking.mandiName}.`,
          displayText: `📋 **Token Status (English):**\n• Token: ${activeBooking.tokenNumber}\n• Status: ${stage}\n• Mandi: ${activeBooking.mandiName}\n• Gate Wait: ~12 mins`,
        };
      } else {
        return {
          spokenText: `किसान भाई, आपका टोकन नंबर ${activeBooking.tokenNumber} है। आपकी वर्तमान स्थिति ${stage} है। इंदौर मंडी गेट नंबर 3 पर औसत प्रतीक्षा समय 12 मिनट है।`,
          displayText: `📋 **टोकन विवरण (हिन्दी):**\n• **टोकन:** ${activeBooking.tokenNumber}\n• **स्थिति:** ${stage}\n• **मंडी:** ${activeBooking.mandiName}\n• **गेट प्रतीक्षा:** ~12 मिनट`,
        };
      }
    }
  }

  // 5. CROP RATES / MSP
  if (
    q.includes('rate') ||
    q.includes('bhav') ||
    q.includes('भाव') ||
    q.includes('दर') ||
    q.includes('किंमत') ||
    q.includes('msp') ||
    q.includes('price') ||
    q.includes('दाम') ||
    q.includes('रेट') ||
    q === '2'
  ) {
    const crop = findCrop();
    const diff = crop.currentPrivatePrice - crop.mspRate;
    const isHigher = diff > 0;

    if (language === 'mr') {
      return {
        spokenText: `आज ${crop.name}चा हमीभाव ₹${crop.mspRate} प्रति क्विंटल आहे आणि खाजगी बाजारात भाव ₹${crop.currentPrivatePrice} चालू आहे.`,
        displayText: `🌾 **${crop.name} आजचा भाव (मराठी):**\n• शासकीय हमीभाव (MSP): ₹${crop.mspRate}/क्विंटल\n• खाजगी बाजार भाव: ₹${crop.currentPrivatePrice}/क्विंटल\n• नफा: ${isHigher ? '+' : ''}₹${diff}`,
      };
    } else if (language === 'en') {
      return {
        spokenText: `Today, the official government MSP for ${crop.name} is ₹${crop.mspRate} per quintal. The private market rate is ₹${crop.currentPrivatePrice}, which is ₹${Math.abs(diff)} ${isHigher ? 'higher' : 'lower'}.`,
        displayText: `🌾 **${crop.name} Rates (English):**\n• Official MSP: ₹${crop.mspRate}/Qtl\n• Private Market Price: ₹${crop.currentPrivatePrice}/Qtl\n• Spread: ${isHigher ? '+' : '-'}₹${Math.abs(diff)}`,
      };
    } else {
      return {
        spokenText: `आज ${crop.hindiName} का सरकारी समर्थन मूल्य ₹${crop.mspRate} प्रति क्विंटल है। और प्राइवेट मंडी में भाव ₹${crop.currentPrivatePrice} चल रहा है, जो कि समर्थन मूल्य से ₹${Math.abs(diff)} ${isHigher ? 'अधिक' : 'कम'} है।`,
        displayText: `🌾 **${crop.hindiName} आज का भाव:**\n• **सरकारी MSP:** ₹${crop.mspRate}/क्विंटल\n• **प्राइवेट बाजार भाव:** ₹${crop.currentPrivatePrice}/क्विंटल\n• **अंतर:** ${isHigher ? '+' : '-'}₹${Math.abs(diff)} (${isHigher ? 'प्राइवेट में अधिक लाभ' : 'सरकारी में बेचें'})`,
      };
    }
  }

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
          displayText: '🔍 **Officer Scanner:**\n• Tap "Gate Scanner" on dashboard\n• Point camera at farmer QR code\n• Status auto-advances: ARRIVED → QUALITY → WEIGHED',
        };
      case 'mr':
        return {
          spokenText: 'गेट स्कॅनर वापरण्यासाठी डॅशबोर्डवरील गेट स्कॅनर बटण दाबा. शेतकऱ्याचा QR कोड कॅमेऱ्यासमोर धरा.',
          displayText: '🔍 **अधिकारी स्कॅनर:**\n• "गेट स्कॅनर" दाबा\n• शेतकऱ्याचा QR कोड स्कॅन करा\n• स्थिती स्वयंचलित अपडेट होईल',
        };
      default:
        return {
          spokenText: 'गेट स्कैनर का उपयोग करने के लिए डैशबोर्ड पर गेट स्कैनर बटन दबाएं। किसान का QR कोड कैमरे के सामने रखें।',
          displayText: '🔍 **अधिकारी स्कैनर:**\n• "गेट स्कैनर" दबाएं\n• किसान का QR कोड स्कैन करें\n• स्थिति ऑटो अपडेट होगी',
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
          displayText: '📈 **Buyer Trading:**\n• Go to Crop Stock Exchange tab\n• Place a BUY order with your price\n• System auto-matches with sellers\n• AI price prediction available',
        };
      default:
        return {
          spokenText: 'आप क्रॉप स्टॉक एक्सचेंज पर खरीद ऑर्डर दे सकते हैं। अपनी कीमत और मात्रा सेट करें, सिस्टम आपको विक्रेताओं से मिलाएगा।',
          displayText: '📈 **खरीदार व्यापार:**\n• क्रॉप स्टॉक एक्सचेंज टैब पर जाएं\n• अपनी कीमत पर BUY ऑर्डर दें\n• AI मूल्य भविष्यवाणी उपलब्ध',
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
          displayText: '🚚 **Transporter Jobs:**\n• View available jobs on dashboard\n• See pickup & dropoff on map\n• Accept or reject based on price\n• Live GPS tracking once accepted',
        };
      default:
        return {
          spokenText: 'अपने ट्रांसपोर्टर डैशबोर्ड पर उपलब्ध डिलीवरी जॉब देखें। पिकअप, ड्रॉपऑफ, दूरी और कीमत देखकर एक्सेप्ट करें।',
          displayText: '🚚 **ट्रांसपोर्टर जॉब्स:**\n• डैशबोर्ड पर उपलब्ध जॉब देखें\n• मैप पर पिकअप और ड्रॉपऑफ देखें\n• कीमत के आधार पर Accept/Reject\n• GPS ट्रैकिंग शुरू होगी',
        };
    }
  }

  // 6. MANDI CONGESTION / QUEUE
  if (
    q.includes('mandi') ||
    q.includes('मंडी') ||
    q.includes('भीड़') ||
    q.includes('गर्दी') ||
    q.includes('queue') ||
    q.includes('wait') ||
    q === '3'
  ) {
    switch (language) {
      case 'mr':
        return {
          spokenText: `इंदूर कृषी उत्पन्न बाजार समितीत सामान्य गर्दी आहे. गेट नंबर 3 वर सरासरी प्रतीक्षा वेळ 18 मिनिटे आहे आणि 4 रॅम्प पूर्णपणे कार्यरत आहेत.`,
          displayText: `🏛️ **इंदूर एपीएमसी मंडी थेट स्थिती (मराठी):**\n• गर्दी पातळी: सामान्य\n• गेट प्रतीक्षा वेळ: ~18 मिनिटे\n• कार्यरत रॅम्प: 4 चालू`
        };
      case 'en':
        return {
          spokenText: `Indore APMC Mandi has moderate traffic today. Average wait time at Gate 3 is approximately 18 minutes with 4 active unloading ramps.`,
          displayText: `🏛️ **Indore APMC Live Status:**\n• Crowd Level: Moderate\n• Gate Wait Time: ~18 mins\n• Active Ramps: 4 open`
        };
      default:
        return {
          spokenText: `इंदौर कृषि उपज मंडी में वर्तमान में सामान्य भीड़ है। गेट नंबर 3 पर औसत प्रतीक्षा समय केवल 18 मिनट है और 4 रैंप सक्रिय रूप से चालू हैं।`,
          displayText: `🏛️ **इंदौर मंडी लाइव स्थिति (हिन्दी):**\n• **भीड़ का स्तर:** सामान्य\n• **गेट प्रतीक्षा:** ~18 मिनट\n• **सक्रिय रैंप:** 4 चालू`
        };
    }
  }

  // 8. DEFAULT FALLBACK
  switch (language) {
    case 'mr':
      return {
        spokenText: `आपण मला गहू, सोयाबीन किंवा कांद्याचा भाव विचारू शकता, टोकन स्थिती तपासू शकता किंवा मंडीतील गर्दीबद्दल विचारू शकता.`,
        displayText: `🤖 **आपण विचारू शकता (मराठी):**\n• "गव्हाचा किंवा कांद्याचा आजचा भाव"\n• "माझ्या टोकनची स्थिती काय आहे?"\n• "मंडीत किती गर्दी आहे?"\n• "आजचे हवामान कसे राहील?"`,
        quickActions: [
          { label: '🌾 आजचा भाव', action: 'भाव' },
          { label: '📋 टोकन स्थिती', action: 'टोकन स्थिती' },
          { label: '🏛️ मंडी गर्दी', action: 'गर्दी' },
        ],
      };
    case 'en':
      return {
        spokenText: `You can ask me about wheat, mustard, or soybean rates, check your token queue status, or inquire about mandi waiting times.`,
        displayText: `🤖 **You can ask me:**\n• "Today's wheat or mustard MSP rate"\n• "Check my token status"\n• "Mandi queue waiting time"\n• "Today's weather forecast"`,
        quickActions: [
          { label: '🌾 Rates', action: 'rates' },
          { label: '📋 Token Status', action: 'token status' },
          { label: '🏛️ Mandi Queue', action: 'queue' },
        ],
      };
    default:
      return {
        spokenText: `आप मुझसे गेहूँ, सरसों, या सोयाबीन का भाव पूछ सकते हैं, अपने टोकन की स्थिति जान सकते हैं, या मंडी में भीड़ के बारे में पूछ सकते हैं।`,
        displayText: `🤖 **आप मुझसे पूछ सकते हैं:**\n• "गेहूँ / सरसों / सोयाबीन का भाव"\n• "मेरे टोकन की स्थिति"\n• "मंडी में कितनी लाइन है"\n• "आज का मौसम कैसा रहेगा"`,
        quickActions: [
          { label: '🌾 भाव / Rates', action: 'भाव' },
          { label: '📋 टोकन / Token', action: 'टोकन स्थिति' },
          { label: '🏛️ मंडी भीड़ / Queue', action: 'मंडी भीड़' },
        ],
      };
  }
};
