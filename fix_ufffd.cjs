const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace(/currentUser\?\.name\?\.split\(' '\)\[0\] \|\| '[^']*';/g, "currentUser?.name?.split(' ')[0] || 'किसान भाई';");

// Check if any U+FFFD are left
const idx = txt.indexOf('\uFFFD');
if (idx !== -1) {
    console.log(txt.substring(idx - 50, idx + 50));
} else {
    console.log('No U+FFFD found!');
}

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
