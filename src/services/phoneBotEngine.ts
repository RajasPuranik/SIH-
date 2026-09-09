import { CropInfo, SlotBooking, DistrictMandiRate } from '../types';

export interface BotResponse {
  spokenText: string;
  displayText: string;
  quickActions?: { label: string; action: string }[];
  smsContent?: string;
}

export const processBotQuery = (
  rawQuery: string,
  crops: CropInfo[],
  bookings: SlotBooking[],
  userDistrict: string = 'Indore',
  language: string = 'hi'
): BotResponse => {
  const q = rawQuery.toLowerCase().trim();

  // 1. GREETING
  if (
    q.includes('hello') ||
    q.includes('namaste') ||
    q.includes('नमस्ते') ||
    q.includes('ram ram') ||
    q.includes('राम राम') ||
    q.includes('hi') ||
    q.includes('प्रणाम')
  ) {
    return {
      spokenText:
        'नमस्ते किसान भाई! मैं किसानट्रैक वॉइस बॉट हूँ। आप मुझसे मंडी भाव, टोकन स्थिति, या स्लॉट बुकिंग के बारे में पूछ सकते हैं। आप क्या जानना चाहते हैं?',
      displayText:
        '🙏 नमस्ते किसान भाई! मैं किसानट्रैक फोन बॉट हूँ। आप मुझसे पूछ सकते हैं:\n• "गेहूँ का आज का भाव क्या है?"\n• "मेरे टोकन की स्थिति क्या है?"\n• "इंदौर मंडी में कितनी भीड़ है?"',
      quickActions: [
        { label: '🌾 गेहूँ का भाव', action: 'गेहूँ का भाव' },
        { label: '📋 टोकन स्थिति', action: 'टोकन स्थिति' },
        { label: '🏛️ इंदौर मंडी भीड़', action: 'मंडी भीड़' },
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
    q.includes('ट्रैकिंग') ||
    q === '1'
  ) {
    const activeBooking = bookings[0];
    if (activeBooking) {
      const stageMap: Record<string, string> = {
        BOOKED: 'स्लॉट बुक हो चुका है',
        IN_TRANSIT: 'रास्ते में हैं',
        ARRIVED_AT_GATE: 'गेट नंबर 3 पर पहुँच चुके हैं',
        QUALITY_VERIFIED: 'गुणवत्ता जाँच ग्रेड-ए पास हो चुकी है',
        WEIGHED: 'वजन तुला पूर्ण हो चुका है',
        MSP_BILLED: 'बिल जनरेट हो चुका है',
        PAYMENT_COMPLETED: 'खाते में डायरेक्ट बेनिफिट ट्रांसफर सफल हो चुका है',
      };
      const stageHindi = stageMap[activeBooking.status] || activeBooking.status;

      return {
        spokenText: `किसान भाई, आपका टोकन नंबर ${activeBooking.tokenNumber.split('-').slice(-2).join(' ')} है। आपकी वर्तमान स्थिति ${stageHindi}। आपकी मंडी ${activeBooking.mandiName} है और अनुमानित गेट प्रतीक्षा समय 12 मिनट है।`,
        displayText: `📋 **टोकन विवरण:**\n• **टोकन:** ${activeBooking.tokenNumber}\n• **स्थिति:** ${stageHindi}\n• **मंडी:** ${activeBooking.mandiName}\n• **फसल:** ${activeBooking.cropName}\n• **गेट प्रतीक्षा:** ~12 मिनट`,
        quickActions: [
          { label: '📱 SMS पर टोकन भेजें', action: 'SMS_TOKEN' },
          { label: '🌾 सरसों का भाव', action: 'सरसों का भाव' },
        ],
        smsContent: `KisanTrack: Token ${activeBooking.tokenNumber} status is [${activeBooking.status}]. Mandi: ${activeBooking.mandiName}. Gate 3.`,
      };
    } else {
      return {
        spokenText: 'किसान भाई, आपके पास अभी कोई सक्रिय टोकन नहीं है। क्या आप नया स्लॉट बुक करना चाहते हैं?',
        displayText: 'आपके पास अभी कोई सक्रिय टोकन नहीं मिला। नया स्लॉट बुक करने के लिए बोलें "स्लॉट बुक करें"।',
      };
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
    q.includes('मूल्य') ||
    q === '2'
  ) {
    let matchedCrop = crops.find(
      (c) =>
        q.includes(c.id) ||
        q.includes(c.name.toLowerCase()) ||
        q.includes(c.hindiName.toLowerCase())
    );

    if (!matchedCrop) {
      matchedCrop = crops.find((c) => c.id === 'wheat') || crops[0];
    }

    const diff = matchedCrop.currentPrivatePrice - matchedCrop.mspRate;
    const isHigher = diff > 0;

    return {
      spokenText: `आज ${matchedCrop.hindiName} का सरकारी समर्थन मूल्य ₹${matchedCrop.mspRate} प्रति क्विंटल है। और प्राइवेट मंडी में भाव ₹${matchedCrop.currentPrivatePrice} चल रहा है, जो कि समर्थन मूल्य से ₹${Math.abs(diff)} ${isHigher ? 'अधिक' : 'कम'} है।`,
      displayText: `🌾 **${matchedCrop.name} आज का भाव:**\n• **सरकारी MSP:** ₹${matchedCrop.mspRate}/क्विंटल\n• **प्राइवेट बाजार भाव:** ₹${matchedCrop.currentPrivatePrice}/क्विंटल\n• **अंतर:** ${isHigher ? '+' : '-'}₹${Math.abs(diff)} (${isHigher ? 'प्राइवेट में अधिक लाभ' : 'सरकारी में बेचें'})`,
      quickActions: [
        { label: '🌾 सोयाबीन भाव', action: 'सोयाबीन का भाव' },
        { label: '🌾 चना भाव', action: 'चना का भाव' },
        { label: '📅 स्लॉट बुक करें', action: 'स्लॉट बुक करें' },
      ],
      smsContent: `KisanTrack: ${matchedCrop.name} Official MSP is Rs ${matchedCrop.mspRate}/Qtl. Private rate: Rs ${matchedCrop.currentPrivatePrice}/Qtl.`,
    };
  }

  // 4. MANDI CONGESTION / QUEUE
  if (
    q.includes('mandi') ||
    q.includes('मंडी') ||
    q.includes('भीड़') ||
    q.includes('queue') ||
    q.includes('line') ||
    q.includes('wait') ||
    q.includes('इंतजार') ||
    q === '3'
  ) {
    return {
      spokenText:
        'इंदौर कृषि उपज मंडी में वर्तमान में सामान्य भीड़ है। गेट नंबर 3 पर औसत प्रतीक्षा समय केवल 18 मिनट है और 4 रैंप सक्रिय रूप से चालू हैं। आप आराम से अपनी उपज ला सकते हैं।',
      displayText:
        '🏛️ **इंदौर एपीएमसी मंडी लाइव स्थिति:**\n• **भीड़ स्तर:** मध्यम (Normal)\n• **गेट प्रतीक्षा:** ~18 मिनट\n• **सक्रिय रैंप:** 4 / 6 चालू\n• **सुझाव:** सुबह 10 बजे से दोपहर 12 बजे का स्लॉट सबसे तेज है।',
      quickActions: [
        { label: '📅 स्लॉट बुक करें', action: 'स्लॉट बुक करें' },
        { label: '🌾 गेहूँ भाव', action: 'गेहूँ भाव' },
      ],
    };
  }

  // 5. BOOKING ASSISTANCE
  if (
    q.includes('book') ||
    q.includes('booking') ||
    q.includes('बुक') ||
    q.includes('slot') ||
    q.includes('स्लॉट') ||
    q === '4'
  ) {
    return {
      spokenText:
        'स्लॉट बुक करने के लिए आपका इंदौर मंडी में कल सुबह 10:30 बजे का समय उपलब्ध है। क्या आप 65 क्विंटल गेहूँ के लिए यह समय पक्का करना चाहते हैं?',
      displayText:
        '📅 **स्लॉट बुकिंग सहायता:**\n• **मंडी:** इंदौर एपीएमसी\n• **उपलब्ध समय:** कल सुबह 10:30 AM - 11:45 AM\n• **फसल:** गेहूँ (Sharbati)\n• **अनुमानित टोकन:** KT-MP-2026-LIVE',
      quickActions: [
        { label: '✅ हाँ, स्लॉट पक्का करें', action: 'CONFIRM_SLOT' },
        { label: '❌ कोई दूसरा समय', action: 'CHANGE_TIME' },
      ],
    };
  }

  // 6. APMC OFFICER / HELPDESK
  if (
    q.includes('officer') ||
    q.includes('अधिकारी') ||
    q.includes('help') ||
    q.includes('बात') ||
    q.includes('शिकायत') ||
    q === '9'
  ) {
    return {
      spokenText:
        'आपकी कॉल इंदौर मंडी सहायता डेस्क अधिकारी डॉ. सुनीता चौहान से जोड़ी जा रही है। कृपया लाइन पर बने रहें। आप टोल-फ्री 1551 पर भी सीधे संपर्क कर सकते हैं।',
      displayText:
        '📞 **सहायता डेस्क संपर्क:**\n• **अधिकारी:** डॉ. सुनीता चौहान (गेट प्रभारी)\n• **फोन:** +91 94250 11920\n• **टोल-फ्री हेल्पलाइन:** 1800-180-1551 (24x7)',
      quickActions: [
        { label: '📞 1551 पर कॉल करें', action: 'CALL_1551' },
        { label: '📋 टोकन स्थिति', action: 'टोकन स्थिति' },
      ],
    };
  }

  // DEFAULT FALLBACK
  return {
    spokenText:
      'माफ़ कीजिये, मैं समझ नहीं पाया। आप बोल सकते हैं: गेहूँ का भाव, मेरा टोकन स्थिति, या मंडी में भीड़ कितनी है।',
    displayText:
      '🤖 **मैं आपकी इन विषयों पर सहायता कर सकता हूँ:**\n• "गेहूँ / सरसों / सोयाबीन का भाव"\n• "मेरे टोकन की स्थिति"\n• "मंडी में कितनी लाइन है"\n• "स्लॉट कैसे बुक करें"',
    quickActions: [
      { label: '🌾 गेहूँ भाव', action: 'गेहूँ का भाव' },
      { label: '📋 टोकन स्थिति', action: 'टोकन स्थिति' },
      { label: '🏛️ मंडी भीड़', action: 'मंडी भीड़' },
    ],
  };
};
