const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regexIsMuted = /const \[isMuted, setIsMuted\] = useState\(false\);/;
txt = txt.replace(regexIsMuted, `const [isMuted, setIsMuted] = useState(false);\n  const isMutedRef = useRef(false);`);

const regexToggleMute = /const toggleMute = \(\) => \{[\s\S]*?\};/;
txt = txt.replace(regexToggleMute, `const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (audioRecorderRef.current) {
      audioRecorderRef.current.setMuted(nextMuted);
    }
  };`);

const regexStartListening = /startListening = async \([\s\S]*?if \(audioRecorderRef\.current\) \{[\s\S]*?return;\s*\}/;
txt = txt.replace(regexStartListening, `startListening = async (lang: SupportedBotLang = botLang) => {
    if (isStartingRef.current) return;
    if (audioRecorderRef.current) {
      audioRecorderRef.current.setMuted(isMutedRef.current);
      audioRecorderRef.current.resetBuffer();
      setIsListening(!isMutedRef.current);
      return;
    }`);

const regexRecorder = /const recorder = new AudioRecorder\(\{[\s\S]*?\}\);/;
txt = txt.replace(regexRecorder, `const recorder = new AudioRecorder({
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
      recorder.setMuted(isMutedRef.current);`);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed Mute issue!');
