import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  X,
  Play,
  Mic,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

interface Turn {
  id: number;
  question: string;
  answer: string;
}

export const AudioAssistantModal: React.FC = () => {
  const { isAudioAssistantOpen, setIsAudioAssistantOpen, crops, selectedCropId, bookings } = useApp();
  const { language } = useLanguage();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Turn[]>([]);
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

  // Presentation-only helper: logs the tapped query + answer as a chat turn,
  // then plays it through the existing handleSpeak function unchanged.
  const ask = (question: string, answer: string) => {
    setTranscript((prev) => [...prev, { id: prev.length, question, answer }]);
    handleSpeak(answer);
  };

  if (!isAudioAssistantOpen) return null;

  const QUICK_QUERIES = [
    {
      label: '1. आज के सरकारी एवं निजी बाजार भाव',
      sub: "Today's MSP and private rates",
      answer: `नमस्ते किसान भाई! आज इंदौर मंडी में गेहूँ का सरकारी न्यूनतम समर्थन मूल्य ₹2,425 प्रति क्विंटल है, और निजी बाजार भाव ₹2,580 प्रति क्विंटल चल रहा है। आज निजी बाजार में ₹155 अधिक मिल रहा है।`,
    },
    {
      label: '2. मेरे टोकन की लाइव स्थिति',
      sub: 'Check current token & queue position',
      answer: `आपका टोकन नंबर ${activeBooking?.tokenNumber ?? '—'} है। आपकी वर्तमान स्थिति है: क्वालिटी चेक एवं नमी परीक्षण पूरा हो चुका है। मंडी में अनुमानित प्रतीक्षा समय 15 मिनट है।`,
    },
    {
      label: '3. फसल कब बेचें? (AgroAI सलाह)',
      sub: 'AgroAI harvesting & selling recommendation',
      answer: `AgroAI की सलाह: अगले 7 दिनों में गेहूँ के भाव में 4.8 प्रतिशत की बढ़ोतरी की संभावना है। हमारी सिफारिश है कि यदि संभव हो तो स्टॉक को होल्ड करें।`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full sm:max-w-md h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
              {isSpeaking && (
                <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              )}
              <Volume2 className="w-5 h-5 relative" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate">किसान वाणी (Kisan Vaani)</h3>
              <p className="text-[11px] text-amber-100 truncate">Voice-Powered Mandi & Status Assistant</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopSpeech();
              setIsAudioAssistantOpen(false);
            }}
            className="text-amber-100 hover:text-white p-1 rounded-lg shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listening indicator */}
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex flex-col items-center justify-center text-center shrink-0">
          <div className="flex items-center gap-1 h-7 mb-1.5">
            {[40, 70, 90, 60, 85, 50, 95, 75, 45, 80].map((h, i) => (
              <span
                key={i}
                style={{ height: isSpeaking ? `${h}%` : '20%' }}
                className={`w-1 bg-amber-500 rounded-full transition-all duration-150 ${isSpeaking ? 'animate-pulse' : ''}`}
              />
            ))}
          </div>
          <span className="font-bold text-amber-900 text-xs">
            {isSpeaking ? 'बोल रहे हैं... (Speaking now)' : 'नीचे एक सवाल चुनें (Choose a question below)'}
          </span>
        </div>

        {/* Conversation transcript */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 text-xs bg-slate-50">
          {transcript.length === 0 && (
            <p className="text-center text-slate-400 text-[11px] pt-6">
              Tap a question chip below to hear it — your conversation will appear here.
            </p>
          )}
          {transcript.map((turn) => (
            <div key={turn.id} className="space-y-1.5">
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-slate-900 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-[12px]">
                  {turn.question}
                </div>
              </div>
              <div className="flex justify-start items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Volume2 className="w-3 h-3 text-amber-700" />
                </div>
                <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2 text-[12px] text-slate-700 leading-relaxed">
                  {turn.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick voice queries + stop control */}
        <div className="p-3.5 space-y-2 border-t border-slate-200 shrink-0 bg-white">
          {isSpeaking && (
            <button
              onClick={handleStopSpeech}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
            >
              <VolumeX className="w-4 h-4" />
              <span>आवाज बंद करें (Stop Voice)</span>
            </button>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {QUICK_QUERIES.map((q) => (
              <button
                key={q.label}
                onClick={() => ask(q.label, q.answer)}
                className="shrink-0 max-w-[220px] p-2.5 bg-slate-50 hover:bg-amber-50 active:bg-amber-100 rounded-xl border border-slate-200 text-left transition flex items-start gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block text-[11px] leading-snug">{q.label}</span>
                  <span className="text-[10px] text-slate-500 leading-snug block truncate">{q.sub}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
            <Mic className="w-3 h-3" />
            <span>Natural Indian English & हिन्दी Speech Synthesis</span>
          </div>
        </div>
      </div>
    </div>
  );
};
