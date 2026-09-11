const fs = require('fs');

const cp1252 = {
  '€':0x80, '‚':0x82, 'ƒ':0x83, '„':0x84, '…':0x85, '†':0x86, '‡':0x87, 'ˆ':0x88, '‰':0x89, 'Š':0x8A, '‹':0x8B, 'Œ':0x8C, 'Ž':0x8E, '‘':0x91, '’':0x92, '“':0x93, '”':0x94, '•':0x95, '–':0x96, '—':0x97, '˜':0x98, '™':0x99, 'š':0x9A, '›':0x9B, 'œ':0x9C, 'ž':0x9E, 'Ÿ':0x9F
};

function fixMojibakeSafe(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const buf = Buffer.alloc(content.length * 4);
  let j = 0;
  for(let i=0; i<content.length; i++) {
    const code = content.charCodeAt(i);
    if (code >= 0x80 && code <= 0xFF) {
      // Reconstruct CP1252 byte
      const c = content[i];
      if (cp1252[c] !== undefined) {
        buf[j++] = cp1252[c];
      } else {
        buf[j++] = code;
      }
    } else if (code < 0x80) {
      // ASCII character
      buf[j++] = code;
    } else {
      // Intact Unicode character (e.g. emojis or new text)
      let charStr = content[i];
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < content.length) {
         charStr += content[++i];
      }
      const utf8Bytes = Buffer.from(charStr, 'utf8');
      for (let k = 0; k < utf8Bytes.length; k++) {
        buf[j++] = utf8Bytes[k];
      }
    }
  }
  const fixed = buf.slice(0, j).toString('utf8');
  fs.writeFileSync(filePath, fixed);
  console.log(`Safely fixed ${filePath}`);
}

fixMojibakeSafe('src/services/phoneBotEngine.ts');
fixMojibakeSafe('src/components/PhoneBot/PhoneBotModal.tsx');
