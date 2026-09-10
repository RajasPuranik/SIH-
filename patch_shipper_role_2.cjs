const fs = require('fs');
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

const regex = /\s*btn: 'bg-slate-900 hover:bg-slate-800',\r?\n\s*},\r?\n\];/;

const replacement = `    btn: 'bg-slate-900 hover:bg-slate-800',
  },
  {
    role: 'shipper' as UserRole,
    icon: '🚚',
    title: 'Transporter / Delivery',
    hindiTitle: 'ट्रांसपोर्टर',
    desc: 'Accept logistics jobs, track routes, manage shipments',
    accent: 'border-l-orange-500',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    btn: 'bg-orange-600 hover:bg-orange-500',
  }
];`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/LoginPage.tsx', content);
