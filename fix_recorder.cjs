const fs = require('fs');
const path = 'src/services/audioRecorder.ts';
let txt = fs.readFileSync(path, 'utf8');

txt = txt.replace(/this\.hasSpoken\s*=\s*false;\s*this\.isMuted\s*=\s*false;\s*this\.wasBotSpeaking\s*=\s*false;/g, 
                  'this.hasSpoken = false;\n    this.wasBotSpeaking = false;');

fs.writeFileSync(path, txt, 'utf8');
console.log('Fixed AudioRecorder using regex');
