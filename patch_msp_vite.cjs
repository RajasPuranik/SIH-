const fs = require('fs');
let txt = fs.readFileSync('vite.config.ts', 'utf8');

const regex = /'\/api\/bookings': \{/;
const replacement = `'/api/msp-rates': {
        target: VOICE_SERVER,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api\\/msp-rates/, '/msp-rates'),
      },
      '/api/bookings': {`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('vite.config.ts', txt, 'utf8');
