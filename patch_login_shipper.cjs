const fs = require('fs');

let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

const roleRegex = /\{ role: 'admin', icon: 'ðŸ›¡ï¸ ', title: 'System Admin', hindiTitle: 'à¤¸à¤¿à¤¸à¥à¤Ÿà¤® à¤à¤¡à¤®à¤¿à¤¨', badge: 'bg-slate-100 text-slate-700 border-slate-300', btn: 'bg-slate-900 hover:bg-slate-800' \}/;
const roleReplacement = `{ role: 'admin', icon: '🛡️', title: 'System Admin', hindiTitle: 'सिस्टम एडमिन', badge: 'bg-slate-100 text-slate-700 border-slate-300', btn: 'bg-slate-900 hover:bg-slate-800' },
  {
    role: 'shipper',
    icon: '🚚',
    title: 'Transporter',
    hindiTitle: 'ट्रांसपोर्टर',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    btn: 'bg-orange-600 hover:bg-orange-500',
  }`;

// Actually because of encoding, I will just match the last role in the array.
const allRolesRegex = /btn: 'bg-slate-900 hover:bg-slate-800',\s*\}\s*\];/;
const replacement2 = `btn: 'bg-slate-900 hover:bg-slate-800',
    },
    {
      role: 'shipper',
      icon: '🚚',
      title: 'Transporter / Delivery',
      hindiTitle: 'ट्रांसपोर्टर',
      badge: 'bg-orange-100 text-orange-700 border-orange-300',
      btn: 'bg-orange-600 hover:bg-orange-500',
    }
  ];`;
content = content.replace(allRolesRegex, replacement2);

fs.writeFileSync('src/pages/LoginPage.tsx', content);
