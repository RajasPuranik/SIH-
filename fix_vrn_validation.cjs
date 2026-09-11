const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const regexForm = /onSubmit=\{\(e\) => \{\s*e\.preventDefault\(\);\s*if \(vrnInput\.trim\(\)\) \{\s*handleUserUtterance\(vrnInput\.trim\(\)\);\s*setVrnInput\(''\);\s*\}\s*\}\}/;

const newForm = `onSubmit={(e) => {
                    e.preventDefault();
                    const cleaned = vrnInput.trim().toUpperCase();
                    if (!cleaned) return;
                    
                    const vrnRegex = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{1,4}$/;
                    if (!vrnRegex.test(cleaned)) {
                      addNotification('Invalid VRN Format. Example: MP-09-AB-1234', 'error');
                      return;
                    }
                    
                    handleUserUtterance(cleaned);
                    setVrnInput('');
                  }}`;

txt = txt.replace(regexForm, newForm);

// Add maxLength to input
const regexInput = /onChange=\{\(e\) => setVrnInput\(e\.target\.value\.toUpperCase\(\)\)\}\s*placeholder="Type VRN\.\.\."/;
const newInput = `onChange={(e) => setVrnInput(e.target.value.toUpperCase())}
                    placeholder="Type VRN..."
                    maxLength={13}`;
txt = txt.replace(regexInput, newInput);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Added VRN validation to PhoneBotModal');
