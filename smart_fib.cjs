const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const oldOnChange = /onChange=\{\(e\) => \{\s*let val = e\.target\.value\.toUpperCase\(\)\.replace\(\/\[\^A-Z0-9\]\/g, ''\);\s*let formatted = '';\s*if \(val\.length > 0\) formatted \+= val\.substring\(0, 2\);\s*if \(val\.length > 2\) formatted \+= '-' \+ val\.substring\(2, 4\);\s*if \(val\.length > 4\) formatted \+= '-' \+ val\.substring\(4, 6\);\s*if \(val\.length > 6\) formatted \+= '-' \+ val\.substring\(6, 10\);\s*setVrnInput\(formatted\);\s*\}\}/;

const smartOnChange = `onChange={(e) => {
                      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      let state = val.match(/^[A-Z]{0,2}/)?.[0] || '';
                      let city = val.substring(state.length).match(/^[0-9]{0,2}/)?.[0] || '';
                      let series = val.substring(state.length + city.length).match(/^[A-Z]{0,2}/)?.[0] || ''; // Force max 2 for FIB style
                      let number = val.substring(state.length + city.length + series.length).match(/^[0-9]{0,4}/)?.[0] || '';
                      
                      let formatted = state;
                      if (state.length === 2 && val.length > 2) formatted += '-' + city;
                      if (city.length === 2 && val.length > 4) formatted += '-' + series;
                      if (series.length > 0 && val.length > 4 + series.length) formatted += '-' + number;
                      
                      setVrnInput(formatted);
                    }}`;

txt = txt.replace(oldOnChange, smartOnChange);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Improved smart FIB formatting for VRN input');
