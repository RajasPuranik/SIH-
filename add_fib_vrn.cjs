const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regexInput = /onChange=\{\(e\) => setVrnInput\(e\.target\.value\.toUpperCase\(\)\)\}\s*placeholder="Type VRN\.\.\."\s*maxLength=\{13\}/;

const newInput = `onChange={(e) => {
                      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      let formatted = '';
                      if (val.length > 0) formatted += val.substring(0, 2);
                      if (val.length > 2) formatted += '-' + val.substring(2, 4);
                      if (val.length > 4) formatted += '-' + val.substring(4, 6);
                      if (val.length > 6) formatted += '-' + val.substring(6, 10);
                      setVrnInput(formatted);
                    }}
                    placeholder="__-__-__-____"
                    maxLength={13}`;

txt = txt.replace(regexInput, newInput);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Added FIB formatting for VRN input');
