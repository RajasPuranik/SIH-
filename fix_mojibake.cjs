const fs = require('fs');
const cp1252 = {
  '€':0x80, '‚':0x82, 'ƒ':0x83, '„':0x84, '…':0x85, '†':0x86, '‡':0x87, 'ˆ':0x88, '‰':0x89, 'Š':0x8A, '‹':0x8B, 'Œ':0x8C, 'Ž':0x8E, '‘':0x91, '’':0x92, '“':0x93, '”':0x94, '•':0x95, '–':0x96, '—':0x97, '˜':0x98, '™':0x99, 'š':0x9A, '›':0x9B, 'œ':0x9C, 'ž':0x9E, 'Ÿ':0x9F
};

function fixMojibake(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const buf = Buffer.alloc(content.length);
  let j = 0;
  for(let i=0; i<content.length; i++) {
    const c = content[i];
    if (cp1252[c] !== undefined) {
      buf[j++] = cp1252[c];
    } else {
      // In CP-1252, 0x81, 0x8D, 0x8F, 0x90, 0x9D are undefined.
      // If the corrupted file has spaces or other chars there, we might not perfectly recover it.
      // Let's just use the char code for everything else.
      buf[j++] = content.charCodeAt(i) & 0xFF;
    }
  }
  const fixed = buf.slice(0, j).toString('utf8');
  return fixed;
}

const text = fixMojibake('src/services/phoneBotEngine.ts');
console.log(text.match(/BOT_LANGUAGES[\s\S]*?\];/)[0]);
