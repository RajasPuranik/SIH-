import { DISTRICT_RATES } from '../data/mockData';
import { CropInfo, SlotBooking } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
try {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
} catch (e) {
  // Ignore
}

// Helper to construct AI prompt
const generateAiPrompt = (query: string, lang: string, crops: CropInfo[], bookings: SlotBooking[], coords: any, weatherData: string) => {
  const cropData = crops.map(c => `${c.hindiName} (${c.name}): ₹${c.mspRate}/q`).join(', ');
  const tokenData = bookings.map(b => `Token ${b.id}: Status ${b.status}, Crop: ${b.cropName}`).join(', ');
  return `You are "KisanTrack Voicebot", a helpful, empathetic, and smart AI phone assistant for Indian farmers. 
The user is speaking in ${lang === 'hi' ? 'Hindi / Hinglish' : lang === 'mr' ? 'Marathi' : 'English'}.
They might use English words mixed with their native language (Hinglish). 
Due to heavy rural accents, dialects, and speech-to-text transcription errors, the text might contain misspellings or phonetically garbled words. 
AUTOCORRECT and infer their intent. 

If they ask general human questions (e.g. how are you, who are you), reply naturally like a friendly human assistant.
If they ask about the weather, use this live weather data: ${weatherData}

Current Market Rates: ${cropData}
User's Active Tokens: ${tokenData}
Location Coords: ${coords ? JSON.stringify(coords) : 'Unknown'}

User said: "${query}"

Respond as a human-like voice assistant. Be concise, polite, and helpful. 
Respond ONLY with a valid JSON object in this exact format:
{
  "spokenText": "The conversational reply to read aloud (in the user's language/script). Keep it conversational and natural.",
  "displayText": "A markdown formatted text to show on screen with emojis and bullet points.",
  "quickActions": [ {"label": "Action Name", "action": "action_id"} ]
}
Do not include any markdown backticks around the JSON.`;
};



export interface BotResponse {
  spokenText: string;
  displayText: string;
  quickActions?: { label: string; action: string }[];
  smsContent?: string;
}

export type SupportedBotLang = 'hi' | 'mr' | 'ta' | 'te' | 'en';

// Trimmed to the three languages the voicebot is built and tuned for.
// (Tamil/Telugu response logic still exists further down in this file for
// future re-enabling, but is no longer exposed in the language picker/IVR
// since it wasn't part of the tested, natural-voice experience.)
export const BOT_LANGUAGES: { code: SupportedBotLang; label: string; nativeName: string; voice: string; flag: string }[] = [
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', voice: 'hi-IN-SwaraNeural', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', voice: 'mr-IN-AarohiNeural', flag: '🚩' },
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

/**
 * Detect language from transcript text based on Unicode script and vocabulary
 */
export const detectLanguageFromText = (text: string): SupportedBotLang | null => {
  if (!text || !text.trim()) return null;
  // Tamil script block: U+0B80 - U+0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  // Telugu script block: U+0C00 - U+0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  // Devanagari script block: U+0900 - U+097F (Hindi & Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    const marathiKeywords = [
      'आहे', 'काय', 'गहू', 'कांदा', 'सांगा', 'गर्दी', 'कसा', 'कशी', 'हवामान',
      'पाऊस', 'करा', 'होय', 'नाही', 'चालू', 'दर', 'भाव', 'शेतकरी', 'पाहिजे'
    ];
    const words = text.split(/\s+/);
    if (words.some((w) => marathiKeywords.includes(w))) {
      return 'mr';
    }
    return 'hi';
  }
  // English words detection
  if (/[a-zA-Z]/.test(text)) {
    return 'en';
  }
  return null;
};

const CROP_SYNONYMS: { id: string; terms: string[] }[] = [
  { id: 'wheat', terms: ['wheat', 'गेहूं', 'गेहूँ', 'कनक', 'गहू', 'गव्हाचा', 'கோதுமை', 'கோதூமை', 'గోధుమ', 'గోధుమలు'] },
  { id: 'soybean', terms: ['soybean', 'soya', 'सोयाबीन', 'सोया', 'सोयाबीनचा', 'சோயாபீன்', 'சோயா', 'సోయాబీన్', 'సోయా'] },
  { id: 'mustard', terms: ['mustard', 'sarson', 'सरसों', 'राई', 'मोहरी', 'கடுகு', 'ఆవాలు'] },
  { id: 'onion', terms: ['onion', 'प्याज', 'प्याज़', 'कांदा', 'कांद्याचा', 'வெங்காயம்', 'உల్లిపాయ', 'ఉల్లి'] },
  { id: 'cotton', terms: ['cotton', 'कपास', 'रुई', 'कापूस', 'कपाशी', 'பருத்தி', 'పత్తి', 'ప్రత్తి'] },
  { id: 'gram', terms: ['gram', 'chana', 'चना', 'चने', 'हरभरा', 'கொண்டைக்கடலை', 'கடலை', 'శనగలు'] },
  { id: 'maize', terms: ['maize', 'corn', 'मक्का', 'मका', 'भुट्टा', 'மக்காச்சோளம்', 'மக்கா சோளம்', 'మొక్కజొన్న'] },
];

export const processBotQuery = async (
  rawQuery: string,
  crops: CropInfo[],
  bookings: SlotBooking[],
  userDistrict: string = 'Indore',
  coords?: {lat: number, lon: number},
  language: SupportedBotLang = 'hi'
): Promise<BotResponse> => {
  const q = rawQuery.toLowerCase().trim();

  let weatherString = "Weather data not requested.";
  if (q.includes('weather') || q.includes('rain') || q.includes('मौसम') || q.includes('बारिश') || q.includes('पानी') || q.includes('तापमान') || q.includes('हवामान') || q.includes('पाऊस') || q.includes('temperature') || q.includes('garmi') || q.includes('thandi') || q.includes('mausam')) {
    try {
      const lat = coords?.lat || 22.7179;
      const lon = coords?.lon || 75.8333;
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true');
      const data = await res.json();
      if (data.current_weather) {
        weatherString = `${data.current_weather.temperature}°C, condition code ${data.current_weather.weathercode} (>50 means rainy)`;
      }
    } catch(e) {}
  }

  // Try AI engine first if configured
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = generateAiPrompt(rawQuery, language, crops, bookings, coords, weatherString);
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (parsed.spokenText && parsed.displayText) {
        return parsed as BotResponse;
      }
    } catch (err) {
      console.error("AI engine failed, falling back to rules:", err);
    }
  }

  // Helper to find crop across Hindi, Marathi, Tamil, Telugu, English
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

  // 2. WEATHER / FORECAST
  if (
    q.includes('weather') || q.includes('rain') || q.includes('मौसम') || q.includes('बारिश') ||
    q.includes('पानी') || q.includes('तापमान') || q.includes('हवामान') || q.includes('पाऊस') ||
    q.includes('வானிலை') || q.includes('மழை') || q.includes('వాతావరణం') || q.includes('వర్షం')
  ) {
    let temp = 31;
    let desc = 'Clear';
    try {
      const lat = coords?.lat || 22.7179;
      const lon = coords?.lon || 75.8333;
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true');
      const data = await res.json();
      if (data.current_weather) {
        temp = data.current_weather.temperature;
        desc = data.current_weather.weathercode > 50 ? 'Rainy' : 'Clear/Cloudy';
      }
    } catch(e) {}
    
    const isRain = desc === 'Rainy';
    const rainTxt = isRain ? 'बारिश की संभावना है' : 'मौसम साफ रहेगा';

    switch (language) {
      case 'mr':
        return {
          spokenText: 'आजचे तापमान ' + temp + ' अंश आहे. ' + (isRain ? 'पावसाची शक्यता आहे.' : 'हवामान निरभ्र राहील.'),
          displayText: '🌤️ **हवामान अंदाज (Real-time):**\n• तापमान: ' + temp + '°C\n• स्थिती: ' + desc
        };
      case 'en':
        return {
          spokenText: 'Current temperature is ' + temp + ' degrees. Conditions are ' + desc + '.',
          displayText: '🌤️ **Live Weather:**\n• Temp: ' + temp + '°C\n• Status: ' + desc
        };
      default:
        return {
          spokenText: 'आज का तापमान ' + temp + ' डिग्री है। ' + rainTxt + '।',
          displayText: '🌤️ **लाइव मौसम (Real-time):**\n• तापमान: ' + temp + '°C\n• स्थिति: ' + desc
        };
    }
  }

  // 2.5 NEAREST MANDI (GEO TRACKING)
  if (q.includes('nearest') || q.includes('पास') || q.includes('नजदीक') || q.includes('जवळची') || q.includes('దగ్గర') || q.includes('அருகில்') || q.includes('जवळ')) {
    let bestMandi = 'Indore APMC Mandi';
    let distance = 12;
    
    if (coords) {
      
      const toRad = (value: number) => value * Math.PI / 180;
      let minDistance = Infinity;
      
      for (const mandi of DISTRICT_RATES) {
        if (!mandi.lat || !mandi.lon) continue;
        const R = 6371; // km
        const dLat = toRad(mandi.lat - coords.lat);
        const dLon = toRad(mandi.lon - coords.lon);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(coords.lat)) * Math.cos(toRad(mandi.lat)) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = R * c;
        if (dist < minDistance) {
          minDistance = dist;
          bestMandi = mandi.mandiName;
        }
      }
      
      if (minDistance !== Infinity) {
        distance = Math.round(minDistance);
      }
    }
    
    switch (language) {
      case 'en':
        return {
          spokenText: 'The nearest APMC Mandi is ' + bestMandi + ', which is approximately ' + distance + ' kilometers from your current location.',
          displayText: '📍 **Nearest Mandi Found:**\n• Mandi: ' + bestMandi + '\n• Distance: ' + distance + ' km away'
        };
      default:
        return {
          spokenText: 'आपकी लोकेशन से सबसे नज़दीकी मंडी ' + bestMandi + ' है, जो लगभग ' + distance + ' किलोमीटर दूर है।',
          displayText: '📍 **नज़दीकी मंडी (Live Geo):**\n• मंडी: ' + bestMandi + '\n• दूरी: ' + distance + ' कि.मी.'
        };
    }
  }

  // 3. SLOT BOOKING
  if (
    q.includes('book') ||
    q.includes('booking') ||
    q.includes('slot') ||
    q.includes('स्लॉट') ||
    q.includes('बुकिंग') ||
    q.includes('नवीन टोकन') ||
    q.includes('नया टोकन') ||
    q.includes('मुன்பதிவு') ||
    q.includes('స్లాట్') ||
    q.includes('బుకింగ్') ||
    q === '4'
  ) {
    switch (language) {
      case 'mr':
        return {
          spokenText: `नवीन स्लॉट बुक करण्यासाठी, कृपया डॅशबोर्डवरील 'स्लॉट बुकिंग' पर्यायावर जा. आज संध्याकाळी 4 वाजताचे स्लॉट उपलब्ध आहेत.`,
          displayText: `📦 **स्लॉट बुकिंग (मराठी):**\n• आजचे उपलब्ध स्लॉट: संध्याकाळी 4:00 ते 6:00\n• गेट: गेट नंबर 3\n• आपण ॲपमधून त्वरित बुक करू शकता.`,
        };
      case 'ta':
        return {
          spokenText: `புதிய ஸ்லாட் பதிவு செய்ய, முகப்பு பக்கத்தில் உள்ள ஸ்லாட் புக்கிங் பகுதிக்கு செல்லவும். இன்று மாலை 4 மணிக்கு ஸ்லாட்டுகள் உள்ளன.`,
          displayText: `📦 **ஸ்லாட் முன்பதிவு (தமிழ்):**\n• கிடைக்கும் நேரம்: மாலை 4:00 - 6:00\n• கேட்: கேட் 3\n• செயலியில் நேரடியாக முன்பதிவு செய்யலாம்.`,
        };
      case 'te':
        return {
          spokenText: `కొత్త స్లాట్ బుకింగ్ కోసం, దయచేసి యాప్‌లోని స్లాట్ బుకింగ్ విభాగానికి వెళ్ళండి. నేడు సాయంత్రం 4 గంటలకు స్లాట్‌లు అందుబాటులో ఉన్నాయి.`,
          displayText: `📦 **స్లాట్ బుకింగ్ (తెలుగు):**\n• లభ్యమయ్యే సమయం: సాయంత్రం 4:00 - 6:00\n• గేట్: గేట్ 3\n• యాప్‌లో వెంటనే బుక్ చేసుకోండి.`,
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
    q.includes('விலை') ||
    q.includes('ரேட்') ||
    q.includes('ధర') ||
    q.includes('రేటు') ||
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

  // 6. MANDI CONGESTION / QUEUE
  if (
    q.includes('mandi') ||
    q.includes('मंडी') ||
    q.includes('भीड़') ||
    q.includes('गर्दी') ||
    q.includes('रांग') ||
    q.includes('கூட்டம்') ||
    q.includes('வரிசை') ||
    q.includes('రద్దీ') ||
    q.includes('క్యూ') ||
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

  // 7. APMC OFFICER / HELPDESK
  if (
    q.includes('officer') ||
    q.includes('अधिकारी') ||
    q.includes('help') ||
    q.includes('helpdesk') ||
    q.includes('मदत') ||
    q.includes('உதவி') ||
    q.includes('సహాయం') ||
    q === '9'
  ) {
    switch (language) {
      case 'mr':
        return {
          spokenText: `आपला कॉल इंदूर कृषी बाजार समितीचे अधिकारी डॉ. सुनीता चौहान यांच्याशी जोडला जात आहे. आपण 1800-180-1551 वर थेट संपर्क करू शकता.`,
          displayText: `📞 **एपीएमसी मदत कक्ष (मराठी):**\n• अधिकारी: डॉ. सुनीता चौहान (गेट 3 प्रभारी)\n• फोन: +91 94250 11920\n• टोल-फ्री: 1800-180-1551 (24x7)`,
        };
      case 'ta':
        return {
          spokenText: `உங்கள் அழைப்பு இந்தூர் சந்தை அலுவலர் டாக்டர் சுனிதா சௌஹானுடன் இணைக்கப்படுகிறது. 1800-180-1551 என்ற எண்ணில் நேரடியாக தொடர்பு கொள்ளலாம்.`,
          displayText: `📞 **உதவி மையம் (தமிழ்):**\n• அலுவலர்: டாக்டர் சுனிதா சௌஹான்\n• தொலைபேசி: +91 94250 11920\n• கட்டணமில்லா எண்: 1800-180-1551`,
        };
      case 'te':
        return {
          spokenText: `మీ కాల్ ఇండోర్ మార్కెట్ అధికారి డాక్టర్ సునీతా చౌహాన్ కు బదిలీ చేయబడుతోంది. 1800-180-1551 కు నేరుగా డయల్ చేయవచ్చు.`,
          displayText: `📞 **సహాయ కేంద్రం (తెలుగు):**\n• అధికారి: డాక్టర్ సునీతా చౌహాన్\n• ఫోన్: +91 94250 11920\n• టోల్ ఫ్రీ: 1800-180-1551`,
        };
      case 'en':
        return {
          spokenText: `Connecting your call to APMC Mandi Officer Dr. Sunita Chouhan at Gate 3. You can also dial toll-free 1800-180-1551 directly.`,
          displayText: `📞 **APMC Mandi Helpdesk:**\n• Officer: Dr. Sunita Chouhan (Gate 3 In-Charge)\n• Phone: +91 94250 11920\n• Toll-Free: 1800-180-1551 (24x7)`,
        };
      default:
        return {
          spokenText: `आपकी कॉल इंदौर मंडी सहायता डेस्क अधिकारी डॉ. सुनीता चौहान से जोड़ी जा रही है। टोल-फ्री 1800-180-1551 24 घंटे उपलब्ध है।`,
          displayText: `📞 **APMC Mandi Helpdesk:**\n• Officer: Dr. Sunita Chouhan (Gate 3 In-Charge)\n• Phone: +91 94250 11920\n• Toll-Free: 1800-180-1551 (24x7)`,
        };
    }
  }

  // 8. DEFAULT FALLBACK (NATIVE FOR ALL 5 LANGUAGES)
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
    case 'ta':
      return {
        spokenText: `நீங்கள் கோதுமை, சோயாபீன் அல்லது வெங்காயத்தின் விலையை கேட்கலாம், உங்கள் டோக்கன் நிலையை சரிபார்க்கலாம் அல்லது சந்தை கூட்டத்தை அறியலாம்.`,
        displayText: `🤖 **நீங்கள் கேட்கலாம் (தமிழ்):**\n• "இன்றைய கோதுமை அல்லது வெங்காய விலை"\n• "என் டோக்கன் நிலை என்ன?"\n• "சந்தையில் எவ்வளவு கூட்டம் இருக்கிறது?"\n• "இன்றைய வானிலை எப்படி?"`,
        quickActions: [
          { label: '🌾 இன்றைய விலை', action: 'விலை' },
          { label: '📋 டோக்கன் நிலை', action: 'டோக்கன் நிலை' },
          { label: '🏛️ சந்தை கூட்டம்', action: 'கூட்டம்' },
        ],
      };
    case 'te':
      return {
        spokenText: `మీరు నన్ను గోధుమ, సోయాబీన్ లేదా ఉల్లిపాయ ధరల గురించి అడగవచ్చు, టోకెన్ స్థితిని తనిఖీ చేయవచ్చు లేదా మార్కెట్ రద్దీ గురించి తెలుసుకోవచ్చు.`,
        displayText: `🤖 **మీరు అడగవచ్చు (తెలుగు):**\n• "నేటి గోధుమ లేదా ఉల్లిపాయ ధర"\n• "నా టోకెన్ స్థితి ఏమిటి?"\n• "మార్కెట్‌లో రద్దీ ఎంత ఉంది?"\n• "నేటి వాతావरणం ఎలా ఉంది?"`,
        quickActions: [
          { label: '🌾 నేటి ధర', action: 'ధర' },
          { label: '📋 టోకెన్ స్థితి', action: 'టోకెన్ స్థితి' },
          { label: '🏛️ మార్కెట్ రద్దీ', action: 'రద్దీ' },
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
