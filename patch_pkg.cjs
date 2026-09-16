const fs = require('fs');
let txt = fs.readFileSync('package.json', 'utf8');
txt = txt.replace(/"voice-server": "python3 server\/voice_server.py",/, '"voice-server": "python3 server/voice_server.py",\n    "scan-server": "python3 server/scan_server.py",\n    "servers": "concurrently \\"npm run voice-server\\" \\"npm run scan-server\\"",');
fs.writeFileSync('package.json', txt, 'utf8');
