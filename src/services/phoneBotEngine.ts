import { CropInfo, SlotBooking } from '../types';

export interface BotResponse {
  spokenText: string;
  displayText: string;
  quickActions?: { label: string; action: string }[];
  smsContent?: string;
}

export type SupportedBotLang = 'hi' | 'mr' | 'ta' | 'te' | 'en';

export const BOT_LANGUAGES: { code: SupportedBotLang; label: string; nativeName: string; voice: string; flag: string }[] = [
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', voice: 'hi-IN-SwaraNeural', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', voice: 'mr-IN-AarohiNeural', flag: '🚩' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', voice: 'ta-IN-PallaviNeural', flag: '🌴' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', voice: 'te-IN-ShrutiNeural', flag: '🏛️' },
  { code: 'en', label: 'English', nativeName: 'English (IN)', voice: 'en-IN-NeerjaExpressiveNeural', flag: '🇬🇧' },
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
      case 'ta':
        return {
          spokenText: `வணக்கம் ${farmerName}! இது உழவர் சந்தை அலுவலகத்திலிருந்து தானியங்கி அழைப்பு. உங்கள் டோக்கன் எண் ${token} சரிபார்க்கப்பட்டது. நீங்கள் சந்தைக்கு வரலாம்.`,
          displayText: `🔔 **தானியங்கி குரல் அழைப்பு (தமிழ்):** டோக்கன் ${token} கேட் 3-ல் அங்கீகரிக்கப்பட்டது.`
        };
      case 'te':
        return {
          spokenText: `నమస్కారం ${farmerName}! ఇది మార్కెట్ కమిటీ నుండి ఆటోమేటెడ్ వాయిస్ కాల్. మీ టోకెన్ ${token} ధృవీకరించబడింది. మీరు పంట తీసుకురావచ్చు.`,
          displayText: `🔔 **ఆటోమేటెడ్ కాల్ (తెలుగు):** టోకెన్ ${token} గేట్ 3 వద్ద ఆమోదించబడింది.`
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
    case 'ta':
      return {
        spokenText: `வணக்கம் ${farmerName}! கிசான் ட்ராக் 24 மணி நேர வாய்ஸ் உதவி மையத்திற்கு வரவேற்கிறோம். சந்தை விலை, டோக்கன் நிலை அல்லது ஸ்லாட் முன்பதிவு பற்றி கேட்கலாம்.`,
        displayText: `🙏 **வணக்கம் விவசாய நண்பரே!** நான் கிசான் ட்ராக் போன் பாட்.\n• "கோதுமையின் இன்றைய விலை என்ன?"\n• "எனது டோக்கன் நிலை என்ன?"\n• "சந்தையில் எவ்வளவு கூட்டம் இருக்கிறது?"`
      };
    case 'te':
      return {
        spokenText: `నమస్కారం ${farmerName}! కిసాన్‌ట్రాక్ 24 గంటల వాయిస్ హెల్ప్‌లైన్‌కు స్వాగతం. మీరు నేటి మార్కెట్ ధరలు, టోకెన్ స్థితి లేదా స్లాట్ బుకింగ్ గురించి అడగవచ్చు.`,
        displayText: `🙏 **నమస్కారం రైతు సోదరులారా!** నేను కిసాన్‌ట్రాక్ ఫోన్ బాట్‌ని.\n• "గోధుమ నేటి ధర ఎంత?"\n• "నా టోకెన్ స్థితి ఏమిటి?"\n• "మార్కెట్‌లో రద్దీ ఎలా ఉంది?"`
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

export const processBotQuery = (
  rawQuery: string,
  crops: CropInfo[],
  bookings: SlotBooking[],
  userDistrict: string = 'Indore',
  language: SupportedBotLang = 'hi'
): BotResponse => {
  const q = rawQuery.toLowerCase().trim();

  // Helper to find crop
  const findCrop = () => {
    return (
      crops.find((c) => q.includes(c.id) || q.includes(c.name.toLowerCase()) || q.includes(c.hindiName.toLowerCase())) ||
      crops.find((c) => c.id === 'wheat') ||
      crops[0]
    );
  };

  // 1. GREETING
  if (
    q.includes('hello') ||
    q.includes('हेलो') ||
    q.includes('हैलो') ||
    q.includes('हेल्लो') ||
    q.includes('namaste') ||
    q.includes('नमस्ते') ||
    q.includes('नमस्कार') ||
    q.includes('प्रणाम') ||
    q.includes('வணக்கம்') ||
    q.includes('నమస్కారం') ||
    q.includes('ram ram') ||
    q.includes('राम राम') ||
    q.includes('hi') ||
    q.includes('हाय') ||
    q.includes('hey') ||
    q.includes('kisan bot') ||
    q.includes('किसान बॉट') ||
    q.includes('सुनो') ||
    q.includes('बोलो')
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

  // 2. TOKEN STATUS
  if (
    q.includes('token') ||
    q.includes('टोकन') ||
    q.includes('status') ||
    q.includes('स्थिति') ||
    q.includes('gate') ||
    q.includes('गेट') ||
    q.includes('நிலை') ||
    q.includes('స్థితి') ||
    q === '1'
  ) {
    const activeBooking = bookings[0];
    if (activeBooking) {
      const stage = activeBooking.status.replace(/_/g, ' ');

      if (language === 'mr') {
        return {
          spokenText: `शेतकरी बंधू, तुमचा टोकन नंबर ${activeBooking.tokenNumber} आहे. तुमची सद्यस्थिती ${stage} आहे. गेट नंबर 3 वर अंदाजे प्रतीक्षा वेळ 12 मिनिटे आहे.`,
          displayText: `📋 **टोकन तपशील (मराठी):**\n• टोकन: ${activeBooking.tokenNumber}\n• स्थिती: ${stage}\n• मंडी: ${activeBooking.mandiName}\n• गेट प्रतीक्षा: ~12 मिनिटे`,
          smsContent: `KisanTrack: Token ${activeBooking.tokenNumber} status is [${stage}]. Mandi: ${activeBooking.mandiName}.`,
        };
      } else if (language === 'ta') {
        return {
          spokenText: `விவசாயி அவர்களே, உங்கள் டோக்கன் எண் ${activeBooking.tokenNumber}. தற்போதைய நிலை ${stage}. கேட் 3-ல் காத்திருப்பு நேரம் சுமார் 12 நிமிடங்கள்.`,
          displayText: `📋 **டோக்கன் விவரங்கள் (தமிழ்):**\n• டோக்கன்: ${activeBooking.tokenNumber}\n• நிலை: ${stage}\n• சந்தை: ${activeBooking.mandiName}`,
          smsContent: `KisanTrack: Token ${activeBooking.tokenNumber} status is [${stage}]. Mandi: ${activeBooking.mandiName}.`,
        };
      } else if (language === 'te') {
        return {
          spokenText: `రైతు సోదరా, మీ టోకెన్ సంఖ్య ${activeBooking.tokenNumber}. ప్రస్తుత స్థితి ${stage}. గేట్ 3 వద్ద సుమారు నిరీక్షణ సమయం 12 నిమిషాలు.`,
          displayText: `📋 **టోకెన్ వివరాలు (తెలుగు):**\n• టోకెన్: ${activeBooking.tokenNumber}\n• స్థితి: ${stage}\n• మార్కెట్: ${activeBooking.mandiName}`,
          smsContent: `KisanTrack: Token ${activeBooking.tokenNumber} status is [${stage}]. Mandi: ${activeBooking.mandiName}.`,
        };
      } else if (language === 'en') {
        return {
          spokenText: `Farmer friend, your token number is ${activeBooking.tokenNumber}. Your current status is ${stage}. Estimated gate waiting time is 12 minutes at ${activeBooking.mandiName}.`,
          displayText: `📋 **Token Status (English):**\n• Token: ${activeBooking.tokenNumber}\n• Status: ${stage}\n• Mandi: ${activeBooking.mandiName}\n• Gate Wait: ~12 mins`,
          smsContent: `KisanTrack: Token ${activeBooking.tokenNumber} status is [${stage}]. Mandi: ${activeBooking.mandiName}.`,
        };
      } else {
        return {
          spokenText: `किसान भाई, आपका टोकन नंबर ${activeBooking.tokenNumber} है। आपकी वर्तमान स्थिति ${stage} है। इंदौर मंडी गेट नंबर 3 पर औसत प्रतीक्षा समय 12 मिनट है।`,
          displayText: `📋 **टोकन विवरण (हिन्दी):**\n• **टोकन:** ${activeBooking.tokenNumber}\n• **स्थिति:** ${stage}\n• **मंडी:** ${activeBooking.mandiName}\n• **गेट प्रतीक्षा:** ~12 मिनट`,
          smsContent: `KisanTrack: Token ${activeBooking.tokenNumber} status is [${stage}]. Mandi: ${activeBooking.mandiName}.`,
        };
      }
    }
  }

  // 3. CROP RATES / MSP
  if (
    q.includes('rate') ||
    q.includes('bhav') ||
    q.includes('भाव') ||
    q.includes('msp') ||
    q.includes('price') ||
    q.includes('दाम') ||
    q.includes('விலை') ||
    q.includes('ధర') ||
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
    } else if (language === 'ta') {
      return {
        spokenText: `இன்று ${crop.name} குறைந்தபட்ச ஆதரவு விலை குவிண்டாலுக்கு ₹${crop.mspRate}. தனியார் சந்தை விலை ₹${crop.currentPrivatePrice}.`,
        displayText: `🌾 **${crop.name} விலை (தமிழ்):**\n• அரசு MSP: ₹${crop.mspRate}/குவிண்டால்\n• சந்தை விலை: ₹${crop.currentPrivatePrice}/குவிண்டால்`,
      };
    } else if (language === 'te') {
      return {
        spokenText: `నేడు ${crop.name} కనీస మద్దతు ధర క్వింటాలుకు ₹${crop.mspRate}. ప్రైవేట్ మార్కెట్ ధర ₹${crop.currentPrivatePrice} నడుస్తోంది.`,
        displayText: `🌾 **${crop.name} ధర (తెలుగు):**\n• ప్రభుత్వ మద్దతు ధర (MSP): ₹${crop.mspRate}/క్వింటాల్\n• ప్రైవేట్ మార్కెట్ ధర: ₹${crop.currentPrivatePrice}/క్వింటాల్`,
      };
    } else if (language === 'en') {
      return {
        spokenText: `Today, the official government MSP for ${crop.name} is ₹${crop.mspRate} per quintal. The private market rate is ₹${crop.currentPrivatePrice}, which is ₹${Math.abs(diff)} ${isHigher ? 'higher' : 'lower'}.`,
        displayText: `🌾 **${crop.name} Rates (English):**\n• Official MSP: ₹${crop.mspRate}/Qtl\n• Private Market Price: ₹${crop.currentPrivatePrice}/Qtl\n• Spread: ${isHigher ? '+' : '-'}₹${Math.abs(diff)}`,
      };
    } else {
      return {
        spokenText: `आज ${crop.hindiName} का सरकारी समर्थन मूल्य ₹${crop.mspRate} प्रति क्विंटल है। और प्राइवेट मंडी में भाव ₹${crop.currentPrivatePrice} चल रहा है, जो कि समर्थन मूल्य से ₹${Math.abs(diff)} ${isHigher ? 'अधिक' : 'कम'} है।`,
        displayText: `🌾 **${crop.name} आज का भाव:**\n• **सरकारी MSP:** ₹${crop.mspRate}/क्विंटल\n• **प्राइवेट बाजार भाव:** ₹${crop.currentPrivatePrice}/क्विंटल\n• **अंतर:** ${isHigher ? '+' : '-'}₹${Math.abs(diff)} (${isHigher ? 'प्राइवेट में अधिक लाभ' : 'सरकारी में बेचें'})`,
      };
    }
  }

  // 4. MANDI CONGESTION / QUEUE
  if (
    q.includes('mandi') ||
    q.includes('मंडी') ||
    q.includes('भीड़') ||
    q.includes('गर्दी') ||
    q.includes('கூட்டம்') ||
    q.includes('రద్దీ') ||
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
      case 'ta':
        return {
          spokenText: `இந்தூர் சந்தையில் கூட்டம் மிதமாக உள்ளது. கேட் 3-ல் சராசரி காத்திருப்பு நேரம் 18 நிமிடங்கள் மட்டுமே. 4 ராம்ப்கள் செயல்படுகின்றன.`,
          displayText: `🏛️ **சந்தை நிலை (தமிழ்):**\n• கூட்ட நிலை: மிதமானது\n• காத்திருப்பு நேரம்: ~18 நிமிடங்கள்`
        };
      case 'te':
        return {
          spokenText: `ఇండోర్ మార్కెట్‌లో రద్దీ సాధారణంగా ఉంది. గేట్ 3 వద్ద సగటు వేచి ఉండే సమయం 18 నిమిషాలు. 4 ర్యాంప్‌లు పనిచేస్తున్నాయి.`,
          displayText: `🏛️ **మార్కెట్ రద్దీ స్థితి (తెలుగు):**\n• రద్దీ: సాధారణం\n• నిరీక్షణ సమయం: ~18 నిమిషాలు`
        };
      case 'en':
        return {
          spokenText: `Indore APMC Mandi has moderate traffic today. Average wait time at Gate 3 is approximately 18 minutes with 4 active unloading ramps.`,
          displayText: `🏛️ **Indore APMC Live Congestion (English):**\n• Congestion Level: Moderate (Normal)\n• Gate Wait Time: ~18 minutes\n• Active Ramps: 4 of 6 open`
        };
      default:
        return {
          spokenText: `इंदौर कृषि उपज मंडी में वर्तमान में सामान्य भीड़ है। गेट नंबर 3 पर औसत प्रतीक्षा समय केवल 18 मिनट है और 4 रैंप सक्रिय रूप से चालू हैं।`,
          displayText: `🏛️ **इंदौर एपीएमसी मंडी लाइव स्थिति (हिन्दी):**\n• **भीड़ स्तर:** मध्यम (Normal)\n• **गेट प्रतीक्षा:** ~18 मिनट\n• **सक्रिय रैंप:** 4 / 6 चालू`
        };
    }
  }

  // 5. APMC OFFICER / HELPDESK
  if (q.includes('officer') || q.includes('अधिकारी') || q.includes('help') || q.includes('helpdesk') || q === '9') {
    return {
      spokenText:
        language === 'en'
          ? 'Connecting your call to APMC Mandi Officer Dr. Sunita Chouhan at Gate 3. You can also dial toll-free 1800-180-1551 directly.'
          : 'आपकी कॉल इंदौर मंडी सहायता डेस्क अधिकारी डॉ. सुनीता चौहान से जोड़ी जा रही है। टोल-फ्री 1800-180-1551 24 घंटे उपलब्ध है।',
      displayText: `📞 **APMC Mandi Helpdesk:**\n• Officer: Dr. Sunita Chouhan (Gate 3 In-Charge)\n• Phone: +91 94250 11920\n• Toll-Free: 1800-180-1551 (24x7)`,
    };
  }

  // DEFAULT
  return {
    spokenText:
      language === 'en'
        ? 'You can ask me about wheat, mustard, or soybean rates, check your token queue status, or inquire about mandi waiting times.'
        : 'आप मुझसे गेहूँ, सरसों, या सोयाबीन का भाव पूछ सकते हैं, अपने टोकन की स्थिति जान सकते हैं, या मंडी में भीड़ के बारे में पूछ सकते हैं।',
    displayText:
      language === 'en'
        ? '🤖 **You can ask me:**\n• "Today\'s wheat or mustard MSP rate"\n• "Check my token status"\n• "Mandi queue waiting time"'
        : '🤖 **आप मुझसे पूछ सकते हैं:**\n• "गेहूँ / सरसों / सोयाबीन का भाव"\n• "मेरे टोकन की स्थिति"\n• "मंडी में कितनी लाइन है"',
    quickActions: [
      { label: '🌾 भाव / Rates', action: 'भाव' },
      { label: '📋 टोकन / Token', action: 'टोकन स्थिति' },
      { label: '🏛️ मंडी भीड़ / Queue', action: 'मंडी भीड़' },
    ],
  };
};
