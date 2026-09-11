const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace(/const toggleMute = \(\) => \{[\s\S]*?if \(audioRecorderRef\.current\) \{[\s\S]*?\}\s*\};/g, 
  `const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (audioRecorderRef.current) {
      audioRecorderRef.current.setMuted(nextMuted);
    }
    if (nextMuted) {
      setMicVolume(0);
    }
  };`);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed toggleMute');
