import React, { createContext, useContext, useState } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    pa: string;
    mr: string;
  };
}

export const TRANSLATIONS: Translations = {
  appName: {
    en: 'KisanTrack',
    hi: 'किसानट्रैक (किसान सेतु)',
    pa: 'ਕਿਸਾਨਟ੍ਰੈਕ (ਕਿਸਾਨ ਸੇਤੂ)',
    mr: 'किसानट्रॅक (किसान सेतू)'
  },
  tagline: {
    en: 'Zero Wait Time, Guaranteed MSP & Fair Trade Ecosystem',
    hi: 'शून्य प्रतीक्षा समय, सुनिश्चित एमएसपी एवं पारदर्शी व्यापार प्रणाली',
    pa: 'ਜ਼ੀਰੋ ਉਡੀਕ ਸਮਾਂ, ਯਕੀਨੀ ਐਮ.ਐਸ.ਪੀ ਅਤੇ ਪਾਰਦਰਸ਼ੀ ਵਪਾਰ',
    mr: 'शून्य प्रतीक्षा वेळ, हमीभाव एमएसपी आणि पारदर्शक व्यापार'
  },
  pillar1Title: {
    en: 'Govt MSP Procurement',
    hi: 'सरकारी एमएसपी खरीद',
    pa: 'ਸਰਕਾਰੀ ਐਮ.ਐਸ.ਪੀ ਖਰੀਦ',
    mr: 'सरकारी हमीभाव (MSP) खरेदी'
  },
  pillar1Subtitle: {
    en: 'Fixed Price, Guaranteed Buyer, Slot Booking & Direct DBT',
    hi: 'निश्चित मूल्य, सुनिश्चित सरकारी खरीद, डिजिटल स्लॉट व प्रत्यक्ष बैंक अंतरण',
    pa: 'ਨਿਸ਼ਚਿਤ ਮੁੱਲ, ਯਕੀਨੀ ਸਰਕਾਰੀ ਖਰੀਦ, ਸਲਾਟ ਬੁਕਿੰਗ ਅਤੇ ਡੀ.ਬੀ.ਟੀ',
    mr: 'निश्चित दर, हमी खरेदीदार, स्लॉट बुकिंग आणि थेट डीबीटी'
  },
  pillar2Title: {
    en: 'Crop Stock Exchange',
    hi: 'फसल स्टॉक एक्सचेंज (निजी बाजार)',
    pa: 'ਫਸਲ ਸਟਾਕ ਐਕਸਚੇਂਜ (ਨਿੱਜੀ ਮੰਡੀ)',
    mr: 'शेतमाल रोखे बाजार (खाजगी बाजार)'
  },
  pillar2Subtitle: {
    en: 'Market-Driven Live Trading, Bids & AI Price Forecasts',
    hi: 'बाजार भाव पर सीधा व्यापार, लाइव ऑर्डर बुक एवं AI मूल्य भविष्यवाणी',
    pa: 'ਲਾਈਵ ਬੋਲੀਆਂ, ਆਰਡਰ ਬੁੱਕ ਅਤੇ ਏ.ਆਈ ਭਵਿੱਖਬਾਣੀ',
    mr: 'थेट बाजारभाव, थेट खरेदीदार आणि AI किंमत अंदाज'
  },
  bookSlot: {
    en: 'Book Mandi Slot',
    hi: 'मंडी स्लॉट बुक करें',
    pa: 'ਮੰਡੀ ਸਲਾਟ ਬੁੱਕ ਕਰੋ',
    mr: 'मंडी स्लॉट बुक करा'
  },
  trackStatus: {
    en: 'Live Status Tracker',
    hi: 'लाइव स्थिति ट्रैकर',
    pa: 'ਲਾਈਵ ਸਥਿਤੀ ਟਰੈਕਰ',
    mr: 'थेट स्थिती ट्रॅकर'
  },
  myTokens: {
    en: 'Token & Gate Pass',
    hi: 'डिजिटल टोकन व पास',
    pa: 'ਡਿਜੀਟਲ ਟੋਕਨ ਅਤੇ ਪਾਸ',
    mr: 'डिजिटल टोकन आणि गेट पास'
  },
  paymentStatus: {
    en: 'DBT Payment Status',
    hi: 'डीबीटी भुगतान विवरण',
    pa: 'ਡੀ.ਬੀ.ਟੀ ਭੁਗਤਾਨ ਵੇਰਵੇ',
    mr: 'डीबीटी पेमेंट तपशील'
  },
  liveOrderBook: {
    en: 'Live Order Book',
    hi: 'लाइव ऑर्डर बुक',
    pa: 'ਲਾਈਵ ਆਰਡਰ ਬੁੱਕ',
    mr: 'थेट ऑर्डर बुक'
  },
  aiPrediction: {
    en: 'AgroAI Price Forecast',
    hi: 'AgroAI मूल्य भविष्यवाणी',
    pa: 'AgroAI ਕੀਮਤ ਭਵਿੱਖਬਾਣੀ',
    mr: 'AgroAI किंमत अंदाज'
  },
  districtRates: {
    en: 'District Mandi Comparison',
    hi: 'जिलावार मंडी भाव तुलना',
    pa: 'ਜ਼ਿਲ੍ਹਾਵਾਰ ਮੰਡੀ ਭਾਅ ਤੁਲਨਾ',
    mr: 'जिल्हानिहाय बाजारभाव तुलना'
  },
  voiceAssistant: {
    en: 'Kisan Vaani Audio',
    hi: 'किसान वाणी आवाज सहायता',
    pa: 'ਕਿਸਾਨ ਵਾਣੀ ਆਵਾਜ਼',
    mr: 'किसान वाणी आवाज सहाय्यक'
  },
  helpline: {
    en: 'Kisan Helpline 1551 (Toll-Free)',
    hi: 'किसान हेल्पलाइन 1551 (निःशुल्क)',
    pa: 'ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ 1551 (ਮੁਫ਼ਤ)',
    mr: 'शेतकरी हेल्पलाइन 1551 (टोल-फ्री)'
  },
  enterTokenPlaceholder: {
    en: 'Enter Token Number (e.g. KT-MP-2026-9041)...',
    hi: 'टोकन नंबर दर्ज करें (उदा. KT-MP-2026-9041)...',
    pa: 'ਟੋਕਨ ਨੰਬਰ ਦਰਜ ਕਰੋ...',
    mr: 'टोकन नंबर प्रविष्ट करा...'
  },
  agriTickerLive: {
    en: 'AGRI TICKER (LIVE)',
    hi: 'कृषि भाव टिकर (लाइव)',
    pa: 'ਖੇਤੀਬਾੜੀ ਭਾਅ ਟਿਕਰ (ਲਾਈਵ)',
    mr: 'कृषी बाजारभाव टिकर (थेट)'
  },
  mandiSynced: {
    en: 'Real-time APMC Mandi feeds synced',
    hi: 'वास्तविक समय APMC मंडी फीड्स सक्रिय',
    pa: 'ਅਸਲ ਸਮੇਂ APMC ਮੰਡੀ ਫੀਡ ਸਰਗਰਮ',
    mr: 'रिअल-टाइम APMC मंडी दर अद्ययावत'
  },
  sellOnGovtMSP: {
    en: 'Sell on Govt MSP',
    hi: 'सरकारी MSP पर बेचें',
    pa: 'ਸਰਕਾਰੀ MSP ਤੇ ਵੇਚੋ',
    mr: 'सरकारी हमीभावावर विका'
  },
  vsMSP: {
    en: 'vs MSP',
    hi: 'MSP से अधिक',
    pa: 'MSP ਤੋਂ ਵੱਧ',
    mr: 'MSP पेक्षा जास्त'
  },
  login: {
    en: 'Login',
    hi: 'लॉग इन करें',
    pa: 'ਲਾਗ ਇਨ',
    mr: 'लॉगिन करा'
  },
  register: {
    en: 'Register',
    hi: 'नया खाता बनाएं',
    pa: 'ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ',
    mr: 'नोंदणी करा'
  },
  myProfile: {
    en: 'My Profile',
    hi: 'मेरी प्रोफाइल',
    pa: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ',
    mr: 'माझे प्रोफाइल'
  },
  signOut: {
    en: 'Sign Out',
    hi: 'लॉग आउट',
    pa: 'ਲਾਗ ਆਉਟ',
    mr: 'लॉगआउट'
  },
  roleKissan: {
    en: 'Kissan (Farmer)',
    hi: 'किसान (Kissan)',
    pa: 'ਕਿਸਾਨ (Kissan)',
    mr: 'शेतकरी (Kissan)'
  },
  roleOfficer: {
    en: 'APMC Officer',
    hi: 'मंडी अधिकारी (Officer)',
    pa: 'ਮੰਡੀ ਅਧਿਕਾਰੀ (Officer)',
    mr: 'मंडी अधिकारी (Officer)'
  },
  roleBuyer: {
    en: 'Corporate Buyer',
    hi: 'व्यापारी / खरीदार (Buyer)',
    pa: 'ਵਪਾਰੀ / ਖਰੀਦਦਾਰ (Buyer)',
    mr: 'व्यापारी / खरेदीदार (Buyer)'
  },
  cropWheat: {
    en: 'Wheat',
    hi: 'गेहूँ (Wheat)',
    pa: 'ਕਣਕ (Wheat)',
    mr: 'गहू (Wheat)'
  },
  cropMustard: {
    en: 'Mustard',
    hi: 'सरसों (Mustard)',
    pa: 'ਸਰ੍ਹੋਂ (Mustard)',
    mr: 'मोहरी (Mustard)'
  },
  cropSoybean: {
    en: 'Soybean',
    hi: 'सोयाबीन (Soybean)',
    pa: 'ਸੋਇਆਬੀਨ (Soybean)',
    mr: 'सोयाबीन (Soybean)'
  },
  cropChana: {
    en: 'Gram / Chana',
    hi: 'चना (Chana)',
    pa: 'ਛੋਲੇ (Chana)',
    mr: 'हरभरा (Chana)'
  },
  cropCotton: {
    en: 'Cotton',
    hi: 'कपास (Cotton)',
    pa: 'ਕਪਾਹ (Cotton)',
    mr: 'कापूस (Cotton)'
  },
  cropPaddy: {
    en: 'Paddy',
    hi: 'धान (Paddy)',
    pa: 'ਝੋਨਾ (Paddy)',
    mr: 'भात / धान (Paddy)'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
