const fs = require('fs');
let txt = fs.readFileSync('vite.config.ts', 'utf8');

const regex = /\/api\/stt': \{\s*target: VOICE_SERVER,\s*changeOrigin: true,\s*rewrite: \(path\) => path.replace\(\/\\^\/api\\\/stt\/, '\/stt'\),\s*\},\s*/;
const replacement = `'/api/stt': {
        target: VOICE_SERVER,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api\\/stt/, '/stt'),
      },
      '/api/bookings': {
        target: VOICE_SERVER,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api\\/bookings/, '/bookings'),
      },
      `;
txt = txt.replace(regex, replacement);

fs.writeFileSync('vite.config.ts', txt, 'utf8');
console.log('Added /api/bookings to vite proxy');
