import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid,
  X,
  Sparkles,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  processBotQuery,
  BotResponse,
  SupportedBotLang,
  BOT_LANGUAGES,
  getInitialGreeting,
  
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

  // Active Language State
  const [botLang, setBotLang] = useState<SupportedBotLang>('hi');

  // Call States
  const [callState, setCallState] = useState<'incoming' | 'calling' | 'lang_select' | 'connected' | 'ended'>('incoming');
  const callStateRef = useRef<'incoming' | 'calling' | 'lang_select' | 'connected' | 'ended'>('incoming');
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [currentSpeechTranscript, setCurrentSpeechTranscript] = useState('');
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');

  // Audio element reference for Edge-TTS neural speech playback
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Recognition Control Refs
  const wantListeningRef = useRef(false);
  const isBotSpeakingRef = useRef(false);
  const isStartingRef = useRef(false);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef('');

  // Conversation transcript
  const [messages, setMessages] = useState<
    { sender: 'bot' | 'farmer'; text: string; time: string; quickActions?: { label: string; action: string }[] }[]
  >([]);

  const speechRecognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const activeLangConfig = BOT_LANGUAGES.find((l) => l.code === botLang) || BOT_LANGUAGES[0];

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isPhoneBotOpen) {
      if (phoneBotMode === 'outbound') {
        setCallState('incoming');
        playFeedbackTone('ping');
      } else {
        setCallState('lang_select');
      }
    } else {
      endCall();
    }
  }, [isPhoneBotOpen, phoneBotMode]);

  // Call timer
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Auto-scroll messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, currentSpeechTranscript]);

  const connectCall = (targetLang?: SupportedBotLang) => {
    const lang = targetLang || botLang;
    setCallState('connected');
    playFeedbackTone('success');

    const farmerFirstName = currentUser?.name?.split(' ')[0] || 'किसान भाई';
    const activeBooking = bookings[0];

    const greeting = getInitialGreeting(
      lang,
      farmerFirstName,
      phoneBotMode === 'outbound',
      activeBooking?.tokenNumber
    );

    const initialMsg = {
      sender: 'bot' as const,
      text: greeting.displayText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '🌾 भाव / Rates', action: 'भाव' },
        { label: '📋 टोकन / Token', action: 'टोकन स्थिति' },
        { label: '🏛️ भीड़ / Queue', action: 'मंडी भीड़' },
      ],
    };

    setMessages([initialMsg]);
    speakText(greeting.spokenText, lang);
    if (!isMuted) {
      setTimeout(() => {
        startListening(lang);
      }, 300);
    }
  };

  // -”€-”€-”€ NATURAL TEXT-TO-SPEECH (Edge-TTS with Fallback) -”€-”€-”€
  const speakText = (text: string, currentLang: SupportedBotLang = botLang) => {
    if (!isSpeakerOn) {
      if (!isMuted && callStateRef.current === 'connected') {
        setTimeout(() => startListening(currentLang), 300);
      }
      return;
    }

    isBotSpeakingRef.current = true;
    setIsBotSpeaking(true);

    // Keep recorder running but reset buffer so voice interruption can detect a spoken word
    if (audioRecorderRef.current) {
      audioRecorderRef.current.resetBuffer();
    } else if (!isMuted && callStateRef.current === 'connected') {
      startListening(currentLang);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {}
      audioElementRef.current = null;
    }

    const voiceName = BOT_LANGUAGES.find((l) => l.code === currentLang)?.voice || 'hi-IN-SwaraNeural';
    const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${currentLang}&voice=${voiceName}`;

    try {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.onplay = () => {
        setIsBotSpeaking(true);
        isBotSpeakingRef.current = true;
      };

      audio.onended = () => {
        setIsBotSpeaking(false);
        isBotSpeakingRef.current = false;
        audioElementRef.current = null;
        if (audioRecorderRef.current) {
          audioRecorderRef.current.resetBuffer();
        } else if (!isMuted && callStateRef.current === 'connected') {
          startListening(currentLang);
        }
      };

      audio.onerror = () => {
        fallbackSpeakText(text, currentLang);
      };

      audio.play().catch(() => {
        fallbackSpeakText(text, currentLang);
      });
    } catch {
      fallbackSpeakText(text, currentLang);
    }
  };

  const fallbackSpeakText = (text: string, currentLang: SupportedBotLang) => {
    if (!('speechSynthesis' in window)) {
      setIsBotSpeaking(false);
      isBotSpeakingRef.current = false;
      if (!isMuted && callState === 'connected') {
        setTimeout(() => startListening(currentLang), 300);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const langCodeMap: Record<string, string> = {
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      en: 'en-IN',
    };
    utterance.lang = langCodeMap[currentLang] || 'hi-IN';

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.includes(currentLang) || v.lang.includes('IN'));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsBotSpeaking(true);
      isBotSpeakingRef.current = true;
    };

    utterance.onend = () => {
      setIsBotSpeaking(false);
      isBotSpeakingRef.current = false;
      if (audioRecorderRef.current) {
        audioRecorderRef.current.resetBuffer();
      } else if (!isMuted && callStateRef.current === 'connected') {
        startListening(currentLang);
      }
    };

    utterance.onerror = () => {
      setIsBotSpeaking(false);
      isBotSpeakingRef.current = false;
      if (audioRecorderRef.current) {
        audioRecorderRef.current.resetBuffer();
      } else if (!isMuted && callStateRef.current === 'connected') {
        startListening(currentLang);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // -”€-”€-”€ INSTANT BOT INTERRUPTION -”€-”€-”€
  const interruptBot = () => {
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {}
      audioElementRef.current = null;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    isBotSpeakingRef.current = false;
    setIsBotSpeaking(false);
    playFeedbackTone('ping');

    if (audioRecorderRef.current) {
      audioRecorderRef.current.resetBuffer();
    } else if (!isMuted && callStateRef.current === 'connected') {
      startListening(botLang);
    }
  };

  // -”€-”€-”€ ROBUST FULL-DUPLEX CONTINUOUS SPEECH-TO-TEXT -”€-”€-”€
  const startListening = async (lang: SupportedBotLang = botLang) => {
    if (isStartingRef.current) return;
    if (audioRecorderRef.current) {
      audioRecorderRef.current.setMuted(isMutedRef.current);
      audioRecorderRef.current.resetBuffer();
      setIsListening(!isMutedRef.current);
      return;
    }

    isStartingRef.current = true;
    wantListeningRef.current = true;
    setMicStatusMsg(null);
    setCurrentSpeechTranscript('');
    setIsProcessingAudio(false);

    try {
      const recorder = new AudioRecorder({
        sampleRate: 16000,
        silenceDurationMs: 650,
        speechThreshold: 0.010,
        isBotSpeaking: () => isBotSpeakingRef.current,
        onVoiceInterrupt: () => {
          if ('speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
            } catch {}
          }
          isBotSpeakingRef.current = false;
          setIsBotSpeaking(false);
          playFeedbackTone('ping');
        },
        onVolume: (vol) => {
          const level = Math.min(100, Math.round(vol * 450));
          setMicVolume(level);
        },
        onSpeechStart: () => {
          setIsUserSpeaking(true);
        },
        onSilenceTimeout: () => {
          finishAndTranscribe(lang);
        },
      });
      recorder.setMuted(isMutedRef.current);

      audioRecorderRef.current = recorder;
      await recorder.start();
      setIsListening(true);
      isStartingRef.current = false;
    } catch (err: any) {
      console.warn('Microphone start error:', err);
      isStartingRef.current = false;
      setIsListening(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setMicStatusMsg('मा-‡-• -…नुमति -…स्व-€-•-ƒत (Microphone blocked). ब्रा-‰-œ़र स-‡-Ÿि-‚-—्स म-‡-‚ -…नुमति द-‡-‚.');
      }
    }
  };

  const finishAndTranscribe = async (lang: SupportedBotLang = botLang) => {
    if (!audioRecorderRef.current) return;

    const hasSpoken = audioRecorderRef.current.getHasSpoken();
    if (!hasSpoken) {
      audioRecorderRef.current.resetBuffer();
      return;
    }

    setIsProcessingAudio(true);
    setIsUserSpeaking(false);
    setMicVolume(0);

    // Extract utterance WAV while keeping the live microphone stream active
    const wavBlob = audioRecorderRef.current.extractWavAndReset();

    if (!wavBlob || wavBlob.size < 1200) {
      setIsProcessingAudio(false);
      return;
    }

    try {
      const res = await transcribeWavWithApi(wavBlob, lang);
      setIsProcessingAudio(false);

      if (res.success && res.transcript && res.transcript.trim()) {
        const text = res.transcript.trim();
        // Auto-detect language from spoken words or server result for instant multilingual matching
        // Multi-language adaptability removed by user request
        // Force use of the currently selected botLang
        handleUserUtterance(text, botLang);
      }
    } catch (err) {
      console.error('STT transcribing error:', err);
      setIsProcessingAudio(false);
    }
  };

  const stopListening = () => {
    wantListeningRef.current = false;
    isStartingRef.current = false;
    setIsListening(false);
    setIsUserSpeaking(false);
    setMicVolume(0);
    if (audioRecorderRef.current) {
      try {
        audioRecorderRef.current.stop();
      } catch {}
      audioRecorderRef.current = null;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (audioRecorderRef.current) {
      audioRecorderRef.current.setMuted(nextMuted);
    }
    if (nextMuted) {
      setMicVolume(0);
    }
  };

  // Process user input with ZERO artificial delay
  const handleUserUtterance = (query: string, lang: SupportedBotLang = botLang) => {
    if (!query.trim()) return;

    // Interrupt bot immediately if it was speaking
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {}
      audioElementRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    isBotSpeakingRef.current = false;
    setIsBotSpeaking(false);

    stopListening();
    accumulatedTranscriptRef.current = '';
    setCurrentSpeechTranscript('');

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'farmer', text: query, time: userTime }]);

    const botRes: BotResponse = processBotQuery(
      query,
      crops,
      bookings,
      currentUser?.district || 'Indore',
      lang
    );

    // Speak and display immediately with zero delay
    setMessages((prev) => [
      ...prev,
      {
        sender: 'bot',
        text: botRes.displayText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: botRes.quickActions,
      },
    ]);
    speakText(botRes.spokenText, lang);

    if (botRes.smsContent) {
      addNotification({
        type: 'SMS',
        title: 'SMS Sent to Phone',
        message: botRes.smsContent,
      });
    }
  };

  const handleLanguageChange = (newLang: SupportedBotLang) => {
    setBotLang(newLang);
    playFeedbackTone('ping');
    stopListening();
    if (callState === 'connected') {
      const greeting = getInitialGreeting(newLang, currentUser?.name?.split(' ')[0] || '-•िसान भा-ˆ');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: greeting.displayText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickActions: [
        { label: '🌾 भाव / Rates', action: 'भाव' },
        { label: '📋 टोकन / Token', action: 'टोकन स्थिति' },
        { label: '🏛️ भीड़ / Queue', action: 'मंडी भीड़' },
      ],
        },
      ]);
      speakText(greeting.spokenText, newLang);
    }
  };

  const handleKeypadPress = (digit: string) => {
    playFeedbackTone('ping');
    if (digit === '1') {
      setBotLang('en');
      handleUserUtterance('switch to english');
    } else if (digit === '2') {
      setBotLang('hi');
      handleUserUtterance('switch to hindi');
    } else if (digit === '3') {
      setBotLang('mr');
      handleUserUtterance('switch to marathi');
    } else {
      handleUserUtterance(digit);
    }
  };

  const endCall = () => {
    wantListeningRef.current = false;
    isBotSpeakingRef.current = false;
    isStartingRef.current = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {}
      audioElementRef.current = null;
    }
    stopListening();
    setCallState('ended');
    playFeedbackTone('alert');
    setTimeout(() => {
      setIsPhoneBotOpen(false);
      setCallDuration(0);
      setMessages([]);
      setShowKeypad(false);
      setMicStatusMsg(null);
      setCurrentSpeechTranscript('');
      accumulatedTranscriptRef.current = '';
    }, 600);
  };

  if (!isPhoneBotOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const orbScale = 1 + (micVolume / 100) * 0.3;
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-3xl animate-fade-in font-sans">
      <div className="w-full h-full sm:h-[750px] sm:max-w-[420px] bg-slate-950 sm:rounded-[48px] overflow-hidden flex flex-col relative border border-slate-800/50 shadow-2xl">
        
        {/* TOP STATUS BAR */}
        <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-white tracking-widest text-sm uppercase">Track AI</span>
          </div>
          {callState === 'connected' && (
            <div className="px-3 py-1 bg-slate-900/80 rounded-full text-xs font-medium text-slate-400 border border-slate-800">
              {formatTimer(callDuration)}
            </div>
          )}
        </div>

        {/* MAIN VISUAL AREA */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-8 mt-10">
          
          {callState === 'incoming' && (
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-4xl mb-8 animate-pulse">
                🏛️
              </div>
              <h2 className="text-2xl font-light text-white mb-2">Track AI</h2>
              <p className="text-slate-400 text-center text-sm px-4">Ready to assist with Mandi rates, tokens, and shipments.</p>
              
              <button 
                onClick={() => setCallState('lang_select')}
                className="mt-12 w-20 h-20 bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_40px_rgba(5,150,105,0.4)] animate-bounce"
              >
                <Phone className="w-8 h-8" />
              </button>
            </div>
          )}

          
          {callState === 'lang_select' && (
            <div className="flex flex-col items-center w-full animate-fade-in px-4">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <Globe className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-light text-white mb-2">Select Language</h3>
              <p className="text-slate-400 mb-8">भाषा चुनें / भाषा निवडा</p>
              
              <div className="w-full space-y-4 max-w-[280px]">
                <button 
                  onClick={() => { setBotLang('en'); connectCall('en'); }} 
                  className="w-full py-4 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer group"
                >
                  <span className="text-xl">🇬🇧</span>
                  <span className="text-white font-medium text-lg tracking-wide group-hover:text-white">English</span>
                </button>
                <button 
                  onClick={() => { setBotLang('hi'); connectCall('hi'); }} 
                  className="w-full py-4 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer group"
                >
                  <span className="text-xl">🇮🇳</span>
                  <span className="text-white font-medium text-lg tracking-wide group-hover:text-white">हिन्दी</span>
                </button>
                <button 
                  onClick={() => { setBotLang('mr'); connectCall('mr'); }} 
                  className="w-full py-4 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer group"
                >
                  <span className="text-xl">🚩</span>
                  <span className="text-white font-medium text-lg tracking-wide group-hover:text-white">मराठी</span>
                </button>
              </div>
            </div>
          )}


          {callState === 'connected' && (
            <div className="flex flex-col items-center w-full h-full justify-center">
              
              {/* THE ORB */}
              <div className="relative flex items-center justify-center w-48 h-48 mb-12">
                {/* Outer Glow */}
                <div 
                  className={`absolute inset-0 rounded-full blur-3xl transition-all duration-300 ${
                    isProcessingAudio ? 'bg-purple-600/40' :
                    isBotSpeaking ? 'bg-blue-500/40' : 
                    isUserSpeaking ? 'bg-emerald-500/40' : 'bg-slate-700/20'
                  }`}
                  style={{ transform: `scale(${orbScale * 1.2})` }}
                />
                
                {/* Core Sphere */}
                <div 
                  className={`relative w-36 h-36 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 ${
                    isProcessingAudio ? 'bg-gradient-to-tr from-purple-700 to-pink-500 animate-pulse' :
                    isBotSpeaking ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-400' : 
                    isUserSpeaking ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300' : 
                    'bg-gradient-to-tr from-slate-800 to-slate-700'
                  }`}
                  style={{ transform: `scale(${orbScale})` }}
                >
                  <div className="absolute inset-0 bg-white/10 blur-xl mix-blend-overlay rounded-full" />
                  
                  {/* Subtle inner animated ring for speaking */}
                  {isBotSpeaking && (
                    <div className="absolute inset-0 rounded-full border-[6px] border-white/20 border-t-white/60 animate-spin-slow" />
                  )}
                  {isUserSpeaking && (
                    <div className="absolute inset-0 rounded-full border-[4px] border-emerald-200/30 scale-90" />
                  )}
                </div>
              </div>

              {/* TRANSCRIPT AREA */}
              <div className="h-32 w-full flex flex-col items-center justify-start text-center px-6">
                {currentSpeechTranscript ? (
                  <p className="text-xl font-light text-slate-300 animate-fade-in-up">
                    "{currentSpeechTranscript}"
                  </p>
                ) : isProcessingAudio ? (
                  <p className="text-lg font-light text-purple-400 animate-pulse">Thinking...</p>
                ) : isBotSpeaking ? (
                   <p className="text-xl font-light text-white animate-fade-in-up">
                     {(lastMessage?.text?.length || 0) > 90 ? lastMessage?.text.substring(0, 90) + '...' : lastMessage?.text}
                   </p>
                ) : (
                  <p className="text-lg font-light text-slate-500">Listening...</p>
                )}
              </div>
            </div>
          )}

          {callState === 'ended' && (
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-3xl mb-6">
                📞
              </div>
              <h3 className="text-xl font-light text-white mb-2">Call Ended</h3>
              <p className="text-slate-500">Duration: {formatTimer(callDuration)}</p>
            </div>
          )}

        </div>

        {/* BOTTOM CONTROLS */}
        {callState === 'connected' && (
          <div className="w-full flex flex-col bg-slate-900/80 backdrop-blur-lg border-t border-slate-800/50 pb-8 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            
            {/* Quick Actions (only show if keyboard isn't open and bot gave some) */}
            {!showKeypad && lastMessage?.quickActions && (
              <div className="flex gap-2 overflow-x-auto p-4 no-scrollbar">
                {lastMessage.quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUserUtterance(action.action)}
                    className="shrink-0 px-4 py-2.5 bg-slate-800/80 hover:bg-emerald-900/40 text-emerald-100 text-sm font-medium rounded-2xl border border-slate-700/50 transition whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* DTMF Keypad Drawer */}
            {showKeypad && (
              <div className="p-4 animate-slide-up bg-slate-900/50 border-b border-slate-800/50">
                <div className="text-xs text-slate-400 text-center mb-4 font-mono tracking-widest">
                  LANG: 1=ENG | 2=HIN | 3=MAR
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeypadPress(k)}
                      className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 text-white font-medium text-lg transition cursor-pointer border border-slate-700/50"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="px-8 py-4 flex items-center justify-between">
              
              <button
                onClick={() => setShowKeypad(!showKeypad)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
                  showKeypad ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>

              <button
                onClick={toggleMute}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition cursor-pointer shadow-xl ${
                  isMuted
                    ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={endCall}
                className="w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition cursor-pointer border border-red-500/20"
              >
                <PhoneOff className="w-5 h-5" />
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
