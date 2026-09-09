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

  // Active Language State
  const [botLang, setBotLang] = useState<SupportedBotLang>('hi');

  // Call States
  const [callState, setCallState] = useState<'incoming' | 'calling' | 'connected' | 'ended'>('incoming');
  const callStateRef = useRef<'incoming' | 'calling' | 'connected' | 'ended'>('incoming');
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
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
        setCallState('calling');
        setTimeout(() => {
          connectCall();
        }, 1600);
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
        { label: '🏛️ मंडी भीड़ / Queue', action: 'मंडी भीड़' },
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

  // ─── NATURAL TEXT-TO-SPEECH (Edge-TTS with Fallback) ───
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

  // ─── INSTANT BOT INTERRUPTION ───
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

  // ─── ROBUST FULL-DUPLEX CONTINUOUS SPEECH-TO-TEXT ───
  const startListening = async (lang: SupportedBotLang = botLang) => {
    if (isStartingRef.current) return;
    if (audioRecorderRef.current) {
      audioRecorderRef.current.setMuted(false);
      audioRecorderRef.current.resetBuffer();
      setIsListening(true);
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
        botSpeakingThreshold: 0.035,
        isBotSpeaking: () => isBotSpeakingRef.current,
        onVoiceInterrupt: () => {
          // Whenever ANY word is spoken by user while bot is speaking, instantly stop the bot!
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

      audioRecorderRef.current = recorder;
      await recorder.start();
      setIsListening(true);
      isStartingRef.current = false;
    } catch (err: any) {
      console.warn('Microphone start error:', err);
      isStartingRef.current = false;
      setIsListening(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setMicStatusMsg('माइक अनुमति अस्वीकृत (Microphone blocked). ब्राउज़र सेटिंग्स में अनुमति दें.');
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
        const detected = ((res as any).lang as SupportedBotLang) || detectLanguageFromText(text);
        const activeLang: SupportedBotLang = detected || lang || botLang;
        if (activeLang !== botLang) {
          setBotLang(activeLang);
        }
        handleUserUtterance(text, activeLang);
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
    if (audioRecorderRef.current) {
      audioRecorderRef.current.setMuted(nextMuted);
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
      const greeting = getInitialGreeting(newLang, currentUser?.name?.split(' ')[0] || 'किसान भाई');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: greeting.displayText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickActions: [
            { label: '🌾 भाव / Rates', action: 'भाव' },
            { label: '📋 टोकन / Token', action: 'टोकन स्थिति' },
          ],
        },
      ]);
      speakText(greeting.spokenText, newLang);
    }
  };

  const handleKeypadPress = (digit: string) => {
    playFeedbackTone('ping');
    const labelMap: Record<string, string> = {
      '1': 'टोकन स्थिति (1)',
      '2': 'सरकारी MSP भाव (2)',
      '3': 'मंडी भीड़ व प्रतीक्षा (3)',
      '4': 'नया स्लॉट बुक करें (4)',
      '9': 'मंडी अधिकारी से बात (9)',
    };
    const query = labelMap[digit] || digit;
    handleUserUtterance(query);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Mobile Phone Device Container */}
      <div className="bg-slate-900 text-white w-full max-w-sm rounded-[36px] shadow-2xl overflow-hidden border-4 border-slate-700/80 flex flex-col h-[670px] relative">
        {/* Phone Top Notch / Header Bar */}
        <div className="pt-3 pb-2 px-5 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0 border-b border-slate-800">
          <span className="font-semibold text-slate-300">1800-180-1551</span>
          <div className="w-12 h-3 bg-slate-800 rounded-full border border-slate-700" />
          <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
            <span>Neural 4G</span>
            <span>📶</span>
          </div>
        </div>

        {/* ────────── MULTILINGUAL LANGUAGE BAR ────────── */}
        <div className="bg-slate-950/90 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 mr-1">
            <Globe className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold">Voice:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {BOT_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer shrink-0 border ${
                  botLang === lang.code
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {lang.flag} {lang.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* ────────── STATE: INCOMING CALL ────────── */}
        {callState === 'incoming' && (
          <div className="flex-1 flex flex-col items-center justify-between p-6 text-center">
            <div className="pt-6 space-y-3">
              <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-5xl shadow-lg animate-pulse">
                🏛️
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">APMC Mandi Helpdesk</h3>
                <p className="text-xs text-emerald-400 font-medium mt-1">KisanTrack Automated Outbound Call</p>
                <p className="text-xs text-slate-400 mt-1">Toll-Free: 1800-180-1551</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-mono rounded-full border border-emerald-800">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Edge-TTS: {activeLangConfig.voice.split('-')[1]}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 max-w-xs text-xs text-slate-300 leading-relaxed">
              🔔 <strong className="text-white">Live Voice Alert:</strong> Slot status verification &amp; priority entry update for your vehicle.
            </div>

            {/* Accept / Decline Buttons */}
            <div className="w-full grid grid-cols-2 gap-4 pt-4 pb-2">
              <button
                onClick={endCall}
                className="py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-lg shadow-red-600/30"
              >
                <PhoneOff className="w-6 h-6" />
                <span className="text-xs">Decline</span>
              </button>

              <button
                onClick={() => connectCall()}
                className="py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-lg shadow-emerald-600/30 animate-bounce"
              >
                <PhoneCall className="w-6 h-6" />
                <span className="text-xs">Accept Call</span>
              </button>
            </div>
          </div>
        )}

        {/* ────────── STATE: DIALING / CALLING ────────── */}
        {callState === 'calling' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-4xl animate-pulse">
              🌾
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">किसान वॉइस बॉट</h3>
              <p className="text-xs text-slate-400">1800-180-1551 (Toll-Free)</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium animate-pulse">कॉल मिलाई जा रही है (Connecting...)</p>
            </div>
            <button
              onClick={endCall}
              className="mt-6 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* ────────── STATE: CONNECTED CALL ────────── */}
        {callState === 'connected' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Call Header */}
            <div className="p-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold">
                  🌾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">किसान फोन बॉट</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">{formatTimer(callDuration)}</span>
                    <span className="text-[9px] text-slate-400 font-mono">• {activeLangConfig.voice.split('-')[1]}</span>
                  </div>
                </div>
              </div>

              {/* Bot Speaking Indicator & Sound Waves */}
              <div
                className={`flex items-center gap-1.5 h-6 px-2 rounded-lg border transition ${
                  isBotSpeaking
                    ? 'bg-amber-950/80 border-amber-500/80'
                    : isListening
                    ? 'bg-emerald-950/80 border-emerald-500/80'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                {[30, 80, 50, 95, 40, 75, 60].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      height: isBotSpeaking
                        ? `${h}%`
                        : isListening
                        ? `${Math.max(20, Math.min(100, (micVolume * h) / 35))}%`
                        : '20%',
                    }}
                    className={`w-0.5 rounded-full transition-all duration-100 ${
                      isBotSpeaking ? 'bg-amber-400 animate-pulse' : isListening ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                ))}
                <span className="text-[9px] font-mono font-bold">
                  {isBotSpeaking ? (
                    <span className="text-amber-300">बोल रहा है</span>
                  ) : isListening ? (
                    <span className="text-emerald-300">सुन रहे हैं</span>
                  ) : (
                    <span className="text-slate-400">तैयार</span>
                  )}
                </span>
              </div>
            </div>

            {/* Conversation Messages Container */}
            <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.sender === 'farmer' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                      msg.sender === 'farmer'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line text-[11px]">{msg.text}</div>

                    {/* Quick action buttons attached to bot reply */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                        {msg.quickActions.map((qa, i) => (
                          <button
                            key={i}
                            onClick={() => handleUserUtterance(qa.action)}
                            className="px-2 py-1 bg-slate-700/70 hover:bg-emerald-700 text-[10px] text-emerald-300 hover:text-white rounded-lg transition cursor-pointer border border-slate-600/50"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}

              {/* Persistent Quick Options Chips */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[9px] text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  <span>त्वरित प्रश्न (Quick Questions):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🌾 आज का भाव', q: 'आज का मंडी भाव क्या है' },
                    { label: '📋 मेरा टोकन', q: 'मेरा टोकन नंबर और स्थिति बताएं' },
                    { label: '🏛️ मंडी भीड़', q: 'मंडी में अभी भीड़ और कतार कितनी है' },
                    { label: '🌤️ मौसम', q: 'आज का मौसम कैसा रहेगा' },
                    { label: '📦 नया टोकन', q: 'नया स्लॉट बुक करना है' },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUserUtterance(chip.q)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-700 active:scale-95 text-slate-200 hover:text-white rounded-xl text-[10px] font-medium border border-slate-700/80 transition cursor-pointer shadow-xs"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status or error banner (only for actual permission blocks) */}
              {micStatusMsg && (
                <div className="p-2 bg-amber-950/80 border border-amber-500/50 rounded-xl text-[10px] text-amber-200 text-center flex items-center justify-center gap-1.5 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{micStatusMsg}</span>
                </div>
              )}
            </div>

            {/* ─── BOT SPEAKING PILL (Clean & Informational, NO Interrupt button) ─── */}
            {isBotSpeaking && (
              <div className="mx-3 my-1 p-2 bg-slate-800/90 text-emerald-300 rounded-2xl border border-slate-700 shadow-md flex items-center justify-center gap-2 shrink-0 animate-fade-in">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-200">
                  बॉट बोल रहा है... ({activeLangConfig.nativeName})
                </span>
              </div>
            )}

            {/* ─── LIVE MIC LISTENING BANNER (WITH REAL-TIME EQUALIZER) ─── */}
            {isListening && !isBotSpeaking && (
              <div className="mx-3 my-1 p-2.5 bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-500/60 rounded-2xl shadow-lg flex items-center justify-between gap-2 shrink-0 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-7 h-7">
                    <span className="absolute w-7 h-7 rounded-full bg-emerald-500/30 animate-ping" />
                    <Mic className="w-4 h-4 text-emerald-300 relative z-10 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-emerald-200">
                      {isUserSpeaking ? '🎙️ आपकी आवाज़ आ रही है...' : '🎙️ बोलिए, हम सुन रहे हैं...'}
                    </div>
                    <div className="text-[9px] text-emerald-400 font-medium">
                      ({activeLangConfig.nativeName} — बोलकर 1-2 सेकंड रुकें)
                    </div>
                  </div>
                </div>

                {/* Real-time Dynamic Voice Equalizer Bars */}
                <div className="flex items-center gap-1 h-6 px-2.5 bg-slate-900/80 rounded-lg border border-emerald-700/50">
                  {[20, 50, 85, 100, 75, 45, 60].map((h, i) => {
                    const barHeight = Math.max(15, Math.min(100, (micVolume * h) / 35));
                    return (
                      <span
                        key={i}
                        style={{ height: `${barHeight}%` }}
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── PROCESSING VOICE INDICATOR ─── */}
            {isProcessingAudio && (
              <div className="mx-3 my-1 p-2 bg-slate-800/90 text-amber-300 rounded-2xl border border-amber-500/40 shadow-md flex items-center justify-center gap-2 shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-[11px] font-bold text-amber-200">
                  आपकी बात समझ रहे हैं... (Processing voice...)
                </span>
              </div>
            )}

            {/* ─── LIVE SPEECH TRANSCRIPT PREVIEW ─── */}
            {currentSpeechTranscript && (
              <div className="mx-3 my-1 p-2 bg-emerald-800/90 text-white rounded-xl text-xs font-semibold italic text-center animate-fade-in shrink-0 border border-emerald-400/60 shadow-md">
                "{currentSpeechTranscript}"
              </div>
            )}

            {/* DTMF Keypad Drawer */}
            {showKeypad && (
              <div className="p-3 bg-slate-950/95 border-t border-slate-800 animate-slide-up shrink-0">
                <div className="text-[10px] text-slate-400 text-center mb-2 font-mono">
                  IVR: 1=Token | 2=MSP | 3=Queue | 4=Book | 9=Officer
                </div>
                <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeypadPress(k)}
                      className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white font-bold text-sm transition cursor-pointer border border-slate-700/50"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Text Input */}
            <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/80 flex gap-2 shrink-0">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textInput.trim()) {
                    handleUserUtterance(textInput);
                    setTextInput('');
                  }
                }}
                placeholder="बोलें या लिखें (Speak or type)..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  if (textInput.trim()) {
                    handleUserUtterance(textInput);
                    setTextInput('');
                  }
                }}
                className="px-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white text-xs font-bold transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Call Action Bar (Mute, Keypad, Speaker, Hangup) */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-around shrink-0">
              {/* Mute / Unmute Button */}
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer shadow-md ${
                  isMuted
                    ? 'bg-amber-600 text-white animate-pulse ring-2 ring-amber-400'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={isMuted ? 'माइक अनम्यूट करें (Unmute)' : 'माइक म्यूट करें (Mute)'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-[8px] font-bold mt-0.5">{isMuted ? 'म्यूट' : 'माइक चालू'}</span>
              </button>

              {/* Keypad toggle */}
              <button
                onClick={() => setShowKeypad(!showKeypad)}
                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer border ${
                  showKeypad ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="DTMF कीपैड (Keypad)"
              >
                <Grid className="w-4 h-4" />
                <span className="text-[8px] mt-0.5">Keypad</span>
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer border ${
                  isSpeakerOn ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}
                title={isSpeakerOn ? 'स्पीकर चालू' : 'स्पीकर बंद'}
              >
                {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-[8px] mt-0.5">{isSpeakerOn ? 'स्पीकर' : 'शांत'}</span>
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center transition cursor-pointer shadow-lg shadow-red-600/30"
                title="कॉल काटें (End Call)"
              >
                <PhoneOff className="w-5 h-5" />
                <span className="text-[8px] font-bold mt-0.5">कॉल काटें</span>
              </button>
            </div>
          </div>
        )}

        {/* ────────── STATE: ENDED ────────── */}
        {callState === 'ended' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl">
              📞
            </div>
            <h3 className="text-base font-bold text-white">कॉल समाप्त (Call Ended)</h3>
            <p className="text-xs text-slate-400">Duration: {formatTimer(callDuration)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
