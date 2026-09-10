import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  Globe,
  MapPin,
  Bot
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  processBotQuery,
  BotResponse,
  SupportedBotLang,
  BOT_LANGUAGES,
  getInitialGreeting,
  detectLanguageFromText,
} from '../../services/phoneBotEngine';


import { AudioRecorder, transcribeWavWithApi } from '../../services/audioRecorder';

export const PhoneBotModal: React.FC = () => {
  const {
    isPhoneBotOpen,
    setIsPhoneBotOpen,
    phoneBotMode,
    crops,
    bookings,
    currentUser,
    playFeedbackTone,
    addNotification,
  } = useApp();

  const [botLang, setBotLang] = useState<SupportedBotLang>('hi');
  const [callState, setCallState] = useState<'incoming' | 'calling' | 'ivr' | 'connected' | 'ended'>('incoming');
  const callStateRef = useRef(callState);
  
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);
  
  const [coords, setCoords] = useState<{lat: number, lon: number} | undefined>(undefined);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isBotSpeakingRef = useRef(false);
  const isStartingRef = useRef(false);
  
  const audioRecorderRef = useRef<any>(null);
  const speechRecRef = useRef<any>(null);
  
  const timerRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<
    { sender: 'bot' | 'farmer'; text: string; time: string; quickActions?: { label: string; action: string }[] }[]
  >([]);

  const activeLangConfig = BOT_LANGUAGES.find((l) => l.code === botLang) || BOT_LANGUAGES[0];

  useEffect(() => {
    if (isPhoneBotOpen) {
      if (phoneBotMode === 'outbound') {
        setCallState('incoming');
        playFeedbackTone('ping');
      } else {
        setCallState('calling');
        setTimeout(() => startIvr(), 1600);
      }
    } else {
      endCall();
    }
  }, [isPhoneBotOpen, phoneBotMode]);

  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startIvr = () => {
    setCallState('ivr');
    playFeedbackTone('success');
    speakText("Welcome to Kisan Track. Hindi ke liye 1 dabaye. For English press 2. Marathi sathi 3 daba.", 'en');
  };

  const connectCall = (targetLang?: SupportedBotLang) => {
    const lang = targetLang || botLang;
    setCallState('connected');
    playFeedbackTone('success');

    const farmerFirstName = currentUser?.name?.split(' ')[0] || 'Kisan';
    const activeBooking = bookings[0];

    const greeting = getInitialGreeting(lang, farmerFirstName, phoneBotMode === 'outbound', activeBooking?.tokenNumber);

    setMessages([{
      sender: 'bot',
      text: greeting.displayText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: 'Rates', action: 'भाव' },
        { label: 'Token Status', action: 'टोकन स्थिति' },
        { label: 'Nearest Mandi', action: 'nearest' },
      ],
    }]);
    
    speakText(greeting.spokenText, lang);
  };

  const interruptBot = () => {
    if (!isBotSpeakingRef.current) return;
    isBotSpeakingRef.current = false;
    setIsBotSpeaking(false);
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {}
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  };

  const speakText = (text: string, currentLang: SupportedBotLang = botLang) => {
    if (!isSpeakerOn) {
      if (!isMuted && callStateRef.current === 'connected') setTimeout(() => startListening(currentLang), 300);
      return;
    }

    isBotSpeakingRef.current = true;
    setIsBotSpeaking(true);

    // NOTE: we deliberately do NOT start the mic here too. startListening()
    // already gets called from audio.onplay / utterance.onstart below, once
    // playback has actually begun. Calling it here as well used to fire two
    // overlapping getUserMedia()+AudioRecorder.start() calls back-to-back,
    // which on many devices corrupts/aborts the mic capture — this was the
    // main reason voice input kept silently failing to recognize anything.

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (audioElementRef.current) {
      try { audioElementRef.current.pause(); audioElementRef.current.currentTime = 0; } catch {}
    }

    const voiceName = BOT_LANGUAGES.find((l) => l.code === currentLang)?.voice || 'hi-IN-SwaraNeural';
    const baseUrl = import.meta.env.VITE_API_BASE || '/api';
    const audioUrl = `${baseUrl}/tts?text=${encodeURIComponent(text)}&lang=${currentLang}&voice=${voiceName}`;

    try {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.onplay = () => {
        setIsBotSpeaking(true);
        isBotSpeakingRef.current = true;
        if (!isMuted && callStateRef.current === 'connected') startListening(currentLang);
      };
      audio.onended = () => {
        setIsBotSpeaking(false);
        isBotSpeakingRef.current = false;
        if (!isMuted && callStateRef.current === 'connected') startListening(currentLang);
      };
      audio.onerror = () => fallbackSpeakText(text, currentLang);
      audio.play().catch(() => fallbackSpeakText(text, currentLang));
    } catch {
      fallbackSpeakText(text, currentLang);
    }
  };

  const fallbackSpeakText = (text: string, currentLang: SupportedBotLang) => {
    if (!('speechSynthesis' in window)) {
      setIsBotSpeaking(false); isBotSpeakingRef.current = false;
      if (!isMuted && callState === 'connected') setTimeout(() => startListening(currentLang), 300);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const langCodeMap: Record<string, string> = { hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', te: 'te-IN', en: 'en-IN' };
    utterance.lang = langCodeMap[currentLang] || 'hi-IN';
    utterance.onstart = () => {
      setIsBotSpeaking(true);
      isBotSpeakingRef.current = true;
      if (!isMuted && callStateRef.current === 'connected') startListening(currentLang);
    };
    utterance.onend = () => {
      setIsBotSpeaking(false);
      isBotSpeakingRef.current = false;
      if (!isMuted && callStateRef.current === 'connected') startListening(currentLang);
    };
    window.speechSynthesis.speak(utterance);
  };

  const startListening = (lang: SupportedBotLang = botLang) => {
    if (isMuted || callStateRef.current !== 'connected') return;
    // Guard against overlapping start requests (e.g. onplay firing again
    // before a previous start() has finished setting up getUserMedia).
    // This was previously declared but never used — the missing guard let
    // two AudioRecorder instances race for the mic at once.
    if (isStartingRef.current) return;
    setMicStatusMsg(null);
    startFallbackWavRecording(lang);
  };

  const startFallbackWavRecording = async (lang: SupportedBotLang) => {
    isStartingRef.current = true;
    try {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
        audioRecorderRef.current = null;
      }
      // @ts-ignore
      audioRecorderRef.current = new AudioRecorder({
        sampleRate: 16000,
        silenceDurationMs: 700, // generous pause allowance before we consider the sentence finished
        speechThreshold: 0.005, // baseline; the recorder also adapts this to the room's actual noise floor
        interruptMultiplier: 2.2, // barge-in fires once mic energy is ~2.2x the bot's own measured echo
        interruptMinFrames: 2, // require ~250ms of sustained voice, not a single click/pop
        bargeInSettleMs: 280, // brief window to learn this utterance's echo level before enabling barge-in
        isBotSpeaking: () => isBotSpeakingRef.current,
        onVoiceInterrupt: () => {
          interruptBot();
        },
        onSilenceTimeout: () => finishAndTranscribeWav(lang),
        onVolume: (v: number) => setMicVolume(Math.min(100, Math.round(v * 450)))
      });
      await audioRecorderRef.current.start();
      setIsListening(true);
    } catch(err: any) {
      console.error(err);
      const isPermissionError = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
      setMicStatusMsg(isPermissionError ? 'Mic permission denied. Allow mic access and retry.' : 'Mic unavailable. Retrying…');
      setIsListening(false);
      // If it's a transient device error (not a permanent permission denial),
      // retry shortly instead of leaving the assistant deaf for the rest of the call.
      if (!isPermissionError && !isMuted && callStateRef.current === 'connected') {
        setTimeout(() => startListening(lang), 1200);
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  const finishAndTranscribeWav = async (lang: SupportedBotLang) => {
    if (!audioRecorderRef.current) return;
    const wavBlob = audioRecorderRef.current.extractWavAndReset();
    if (!wavBlob || wavBlob.size < 1000) {
      if (!isMuted && callStateRef.current === 'connected') startListening(lang);
      return;
    }
    
    setIsListening(false);
    setMicVolume(0);

    const res = await transcribeWavWithApi(wavBlob, lang);
    if (res.success && res.transcript) {
      handleUserUtterance(res.transcript, lang);
    } else {
      if (!res.success && res.error) {
        setMicStatusMsg(`STT Error: ${res.error.slice(0, 20)}...`);
        console.error('STT API Error:', res.error);
      } else if (res.success && !res.transcript) {
        setMicStatusMsg('Did not catch that.');
      }
      if (!isMuted && callStateRef.current === 'connected') {
        setTimeout(() => startListening(lang), 1000);
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setMicVolume(0);
    if (audioRecorderRef.current) {
      try { audioRecorderRef.current.stop(); } catch {}
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (next) {
      stopListening();
    } else {
      startListening(botLang);
    }
  };

  const handleUserUtterance = async (query: string, lang: SupportedBotLang = botLang) => {
    if (!query.trim()) return;
    stopListening();
    
    if (audioElementRef.current) { try { audioElementRef.current.pause(); } catch {} }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    isBotSpeakingRef.current = false;
    setIsBotSpeaking(false);

    // Auto-detect language strictly between en, hi, mr
    const detectedLang = detectLanguageFromText(query);
    const finalLang = (detectedLang === 'en' || detectedLang === 'hi' || detectedLang === 'mr') ? detectedLang : lang;

    setMessages((prev) => [...prev, { sender: 'farmer', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

    const botRes: BotResponse = await processBotQuery(query, crops, bookings, currentUser?.district, coords, finalLang);

    setMessages((prev) => [
      ...prev,
      {
        sender: 'bot',
        text: botRes.displayText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: botRes.quickActions,
      },
    ]);
    
    speakText(botRes.spokenText, finalLang);

    if (botRes.smsContent) {
      addNotification({ type: 'SMS', title: 'SMS Sent', message: botRes.smsContent });
    }
  };

  const endCall = () => {
    stopListening();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (audioElementRef.current) { try { audioElementRef.current.pause(); } catch {} }
    setCallState('ended');
    playFeedbackTone('alert');
    setTimeout(() => {
      setIsPhoneBotOpen(false);
      setMessages([]);
      setCallDuration(0);
    }, 600);
  };

  if (!isPhoneBotOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      {/* Sleek Modern Modal replacing the fake phone frame */}
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] min-h-[600px] border border-slate-200/50">
        
        {/* Header Area */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex items-center justify-between shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">KisanTrack AI Assistant</h3>
              <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified APMC Helpdesk</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar hidden sm:flex">
            {BOT_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setBotLang(lang.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  botLang === lang.code
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
          
          {/* Mobile language selector dropdown */}
          <div className="sm:hidden flex items-center">
            <select 
               value={botLang} 
               onChange={(e) => setBotLang(e.target.value as SupportedBotLang)}
               className="bg-white/20 text-white text-xs rounded-lg px-2 py-1 outline-none border border-white/30"
            >
              {BOT_LANGUAGES.map(l => <option key={l.code} value={l.code} className="text-slate-800">{l.nativeName}</option>)}
            </select>
          </div>
        </div>

        {/* INCOMING STATE */}
        {callState === 'incoming' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner border-[6px] border-white animate-pulse mb-6">
              <PhoneCall className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Incoming Call...</h3>
            <p className="text-slate-500 font-medium mt-2 text-lg">KisanTrack Automated Alert</p>
            
            <div className="flex gap-6 mt-12 w-full max-w-sm">
              <button onClick={endCall} className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20 flex flex-col items-center gap-2 transition-transform hover:scale-105 cursor-pointer">
                <PhoneOff className="w-6 h-6" /> Decline
              </button>
              <button onClick={() => startIvr()} className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex flex-col items-center gap-2 transition-transform hover:scale-105 cursor-pointer animate-bounce">
                <PhoneCall className="w-6 h-6" /> Accept
              </button>
            </div>
          </div>
        )}

        {/* CALLING STATE */}
        {callState === 'calling' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner border-[6px] border-white animate-pulse mb-6">
              <Bot className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Connecting to AI...</h3>
            <p className="text-emerald-600 font-semibold mt-2 text-lg animate-pulse">Dialing secure connection</p>
            <button onClick={endCall} className="mt-12 w-16 h-16 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 cursor-pointer">
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* IVR STATE */}
        {callState === 'ivr' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">
              Welcome to KisanTrack
            </h3>
            <p className="text-slate-500 font-medium mb-10 text-center text-lg">
              Please select your language
            </p>
            
            <div className="grid grid-cols-3 gap-5 max-w-[280px] mx-auto mb-12">
              {[
                { digit: 1, lang: 'hi' as SupportedBotLang, label: 'हिन्दी' },
                { digit: 2, lang: 'en' as SupportedBotLang, label: 'English' },
                { digit: 3, lang: 'mr' as SupportedBotLang, label: 'मराठी' },
              ].map(({ digit, lang, label }) => (
                <button
                  key={digit}
                  onClick={() => {
                    interruptBot();
                    setBotLang(lang);
                    connectCall(lang);
                  }}
                  className="w-20 h-20 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-2xl font-semibold leading-none">{digit}</span>
                  <span className="text-[10px] font-medium mt-1">{label}</span>
                </button>
              ))}
            </div>

            <button onClick={endCall} className="w-16 h-16 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 cursor-pointer">
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* CONNECTED STATE */}
        {callState === 'connected' && (
          <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden relative">
            
            {/* Status Bar inside connected */}
            <div className="px-6 py-2 bg-white flex justify-between items-center border-b border-slate-100 shrink-0 shadow-sm z-10">
               <div className="flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="text-sm font-semibold text-emerald-700 tracking-wide uppercase">Call in Progress</span>
               </div>
               <span className="font-mono text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-md">
                 {Math.floor(callDuration/60)}:{(callDuration%60).toString().padStart(2,'0')}
               </span>
            </div>

            {/* Chat Area */}
            <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex w-full ${msg.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col ${msg.sender === 'farmer' ? 'items-end max-w-[75%]' : 'items-start max-w-[85%]'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] shadow-sm ${
                        msg.sender === 'farmer'
                          ? 'bg-emerald-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                      }`}>
                      <div className="whitespace-pre-line leading-relaxed font-medium">{msg.text}</div>
                      
                      {msg.quickActions && msg.quickActions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                          {msg.quickActions.map((qa, i) => (
                            <button key={i} onClick={() => handleUserUtterance(qa.action)} className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200 hover:border-emerald-200 cursor-pointer">
                              {qa.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 mt-1.5 mx-2 font-medium">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Controls Panel */}
            <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex flex-col gap-4">
              
              <div className="flex justify-between items-center max-w-md mx-auto w-full">
                <button 
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer ${isMuted ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'}`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {/* Central Status Indicator */}
                <div className="flex-1 flex flex-col items-center justify-center h-14">
                  {micStatusMsg ? (
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wide text-center px-2">
                      {micStatusMsg}
                    </span>
                  ) : isBotSpeaking ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex gap-1">
                        {[1,2,3].map(i => <span key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.15}s`}}></span>)}
                      </div>
                      <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 mt-1">Speaking</span>
                    </div>
                  ) : isListening ? (
                    <div className="flex items-center gap-1.5">
                      {[1,2,3,4,5,6].map(i => (
                        <span key={i} className="w-1.5 bg-emerald-500 rounded-full transition-all duration-75" style={{ height: `${Math.max(6, (micVolume * (Math.random()+0.5)) / 2)}px` }} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {isMuted ? 'Muted' : 'Standby'}
                    </span>
                  )}
                </div>

                <button 
                  onClick={endCall}
                  className="w-14 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-rose-500/30 transition-transform hover:scale-105 cursor-pointer"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>

              {/* Text Fallback Input */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('query') as HTMLInputElement;
                if (input.value.trim()) {
                  handleUserUtterance(input.value.trim());
                  input.value = '';
                }
              }} className="flex gap-2 max-w-md mx-auto w-full">
                <input 
                  type="text" 
                  name="query" 
                  placeholder="Or type your message here..." 
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoComplete="off"
                />
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white font-medium text-sm rounded-xl hover:bg-slate-700 transition">
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
