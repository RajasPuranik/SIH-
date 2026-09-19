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

interface ChatBubble {
  id: number;
  type: 'bot' | 'user';
  text: string;
  speaking?: boolean;
}

export const AudioAssistantModal: React.FC = () => {
  const { isAudioAssistantOpen, setIsAudioAssistantOpen, crops, selectedCropId, bookings } = useApp();
  const { language } = useLanguage();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatBubble[]>([
    { id: 0, type: 'bot', text: 'नमस्ते! मैं किसान वाणी हूँ। नीचे दिए गए विकल्प चुनें या बोलें।' }
  ]);
  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];
  const activeBooking = bookings[0];

  const handleSpeak = (textToSpeak: string, queryLabel: string) => {
    // Add user bubble
    setChatHistory(prev => [
      ...prev,
      { id: Date.now(), type: 'user', text: queryLabel },
      { id: Date.now() + 1, type: 'bot', text: textToSpeak, speaking: true }
    ]);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setChatHistory(prev => prev.map(b => ({ ...b, speaking: false })));
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setChatHistory(prev => prev.map(b => ({ ...b, speaking: false })));
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text to speech is not supported in this browser.');
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setChatHistory(prev => prev.map(b => ({ ...b, speaking: false })));
    }
  };

  if (!isAudioAssistantOpen) return null;

  const langLabel = language === 'hi' ? 'हिन्दी' : language === 'mr' ? 'मराठी' : language === 'pa' ? 'ਪੰਜਾਬੀ' : 'English';

  const queryOptions = [
    {
      label: '📊 आज के बाजार भाव',
      sublabel: "Today's MSP & private rates",
      text: `नमस्ते किसान भाई! आज इंदौर मंडी में गेहूँ का सरकारी न्यूनतम समर्थन मूल्य ₹2,425 प्रति क्विंटल है, और निजी बाजार भाव ₹2,580 प्रति क्विंटल चल रहा है। आज निजी बाजार में ₹155 अधिक मिल रहा है।`,
    },
    {
      label: '🎫 मेरे टोकन की स्थिति',
      sublabel: 'Token & queue status',
      text: `आपका टोकन नंबर ${activeBooking?.tokenNumber || 'N/A'} है। आपकी वर्तमान स्थिति है: क्वालिटी चेक एवं नमी परीक्षण पूरा हो चुका है। मंडी में अनुमानित प्रतीक्षा समय 15 मिनट है।`,
    },
    {
      label: '🤖 AgroAI — कब बेचें?',
      sublabel: 'AI sell/hold recommendation',
      text: `AgroAI की सलाह: अगले 7 दिनों में गेहूँ के भाव में 4.8 प्रतिशत की बढ़ोतरी की संभावना है। हमारी सिफारिश है कि यदि संभव हो तो स्टॉक को होल्ड करें।`,
    },
  ];

  return (
    <>
      {/* Backdrop — mobile: full screen, desktop: semi-transparent */}
      <div className="fixed inset-0 z-50 sm:flex sm:items-end sm:justify-end sm:p-5 bg-slate-950/60 sm:bg-transparent sm:pointer-events-none">
        {/* Panel */}
        <div className="
          w-full h-full sm:h-auto sm:w-96 sm:max-h-[75vh]
          bg-white sm:rounded-2xl sm:shadow-2xl sm:border sm:border-slate-200
          flex flex-col animate-slide-up sm:animate-fade-in-up
          sm:pointer-events-auto
        ">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-3 sm:rounded-t-2xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">किसान वाणी</h3>
                <p className="text-[10px] text-amber-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  {langLabel} • Voice Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                handleStopSpeech();
                setIsAudioAssistantOpen(false);
              }}
              className="text-amber-100 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Waveform visualizer */}
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-center gap-1">
            {[40, 70, 90, 60, 85, 50, 95, 75, 45, 80, 65, 55].map((h, i) => (
              <span
                key={i}
                style={{ '--bar-target': `${h}%` } as React.CSSProperties}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isSpeaking
                    ? 'bg-amber-500 voice-bar-active'
                    : 'bg-amber-200 h-[20%]'
                }`}
              />
            ))}
            <span className="ml-2 text-[11px] font-semibold text-amber-800">
              {isSpeaking ? 'बोल रहे हैं...' : 'Ready'}
            </span>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {chatHistory.map((bubble) => (
              <div
                key={bubble.id}
                className={`flex animate-fade-in-up ${bubble.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  bubble.type === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200'
                }`}>
                  {bubble.speaking && (
                    <div className="flex items-center gap-1 mb-1">
                      <Volume2 className="w-3 h-3 text-amber-500 animate-pulse" />
                      <span className="text-[10px] text-amber-600 font-semibold">Speaking...</span>
                    </div>
                  )}
                  {bubble.text}
                </div>
              </div>
            ))}
          </div>

          {/* Query suggestions */}
          <div className="border-t border-slate-100 p-3 space-y-2 shrink-0 bg-slate-50 sm:rounded-b-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tap to Listen (ध्वनि सुनें)
            </span>
            {queryOptions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSpeak(q.text, q.label)}
                className="w-full p-2.5 bg-white hover:bg-amber-50 active:bg-amber-100 rounded-xl border border-slate-200 text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-slate-800 text-xs block">{q.label}</span>
                  <span className="text-[10px] text-slate-400">{q.sublabel}</span>
                </div>
                <Play className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:text-amber-600" />
              </button>
            ))}

            {/* Stop button */}
            {isSpeaking && (
              <button
                onClick={handleStopSpeech}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <VolumeX className="w-4 h-4" />
                <span>आवाज बंद करें (Stop)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
