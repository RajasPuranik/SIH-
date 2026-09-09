import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  X, 
  Mic, 
  Play, 
  Pause, 
  Sparkles, 
  CheckCircle2, 
  Radio 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export const AudioAssistantModal: React.FC = () => {
  const { isAudioAssistantOpen, setIsAudioAssistantOpen, crops, selectedCropId, bookings } = useApp();
  const { language } = useLanguage();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];
  const activeBooking = bookings[0];

  const handleSpeak = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel any active speech

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select appropriate voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text to speech is not supported in this browser.');
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isAudioAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-xs">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">किसान वाणी (Kisan Vaani Audio Desk)</h3>
              <p className="text-[11px] text-amber-100">Voice-Powered Mandi & Status Assistant</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopSpeech();
              setIsAudioAssistantOpen(false);
            }}
            className="text-amber-100 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Audio Wave Visualizer Simulation */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5 h-8 mb-2">
              {[40, 70, 90, 60, 85, 50, 95, 75, 45, 80].map((h, i) => (
                <span
                  key={i}
                  style={{ height: isSpeaking ? `${h}%` : '20%' }}
                  className={`w-1 bg-amber-500 rounded-full transition-all duration-150 ${isSpeaking ? 'animate-pulse' : ''}`}
                />
              ))}
            </div>
            <span className="font-bold text-amber-900 text-sm">
              {isSpeaking ? 'बोल रहे हैं (Speaking now...)' : 'सुनने के लिए नीचे दिए गए विकल्प चुनें'}
            </span>
            <span className="text-[11px] text-amber-700 mt-0.5">
              Natural Indian English & हिन्दी Speech Synthesis
            </span>
          </div>

          {/* Quick Voice Queries */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
              Tap to Listen (ध्वनि सुनें):
            </span>

            <button
              onClick={() => handleSpeak(
                `नमस्ते किसान भाई! आज इंदौर मंडी में गेहूँ का सरकारी न्यूनतम समर्थन मूल्य ₹2,425 प्रति क्विंटल है, और निजी बाजार भाव ₹2,580 प्रति क्विंटल चल रहा है। आज निजी बाजार में ₹155 अधिक मिल रहा है।`
              )}
              className="w-full p-3 bg-slate-50 hover:bg-amber-50 active:bg-amber-100 rounded-xl border border-slate-200 text-left transition flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-800 block">1. आज के सरकारी एवं निजी बाजार भाव</span>
                <span className="text-[11px] text-slate-500">Listen to today's MSP and private rates</span>
              </div>
              <Play className="w-4 h-4 text-amber-600 shrink-0" />
            </button>

            <button
              onClick={() => handleSpeak(
                `आपका टोकन नंबर ${activeBooking.tokenNumber} है। आपकी वर्तमान स्थिति है: क्वालिटी चेक एवं नमी परीक्षण पूरा हो चुका है। मंडी में अनुमानित प्रतीक्षा समय 15 मिनट है।`
              )}
              className="w-full p-3 bg-slate-50 hover:bg-amber-50 active:bg-amber-100 rounded-xl border border-slate-200 text-left transition flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-800 block">2. मेरे टोकन की लाइव स्थिति</span>
                <span className="text-[11px] text-slate-500">Check current token & queue position</span>
              </div>
              <Play className="w-4 h-4 text-amber-600 shrink-0" />
            </button>

            <button
              onClick={() => handleSpeak(
                `AgroAI की सलाह: अगले 7 दिनों में गेहूँ के भाव में 4.8 प्रतिशत की बढ़ोतरी की संभावना है। हमारी सिफारिश है कि यदि संभव हो तो स्टॉक को होल्ड करें।`
              )}
              className="w-full p-3 bg-slate-50 hover:bg-amber-50 active:bg-amber-100 rounded-xl border border-slate-200 text-left transition flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-800 block">3. फसल कब बेचें? (AgroAI सलाह)</span>
                <span className="text-[11px] text-slate-500">AgroAI harvesting & selling recommendation</span>
              </div>
              <Play className="w-4 h-4 text-amber-600 shrink-0" />
            </button>
          </div>

          {/* Stop button */}
          {isSpeaking && (
            <button
              onClick={handleStopSpeech}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <VolumeX className="w-4 h-4" />
              <span>आवाज बंद करें (Stop Voice)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
