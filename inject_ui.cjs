const fs = require('fs');

const modalPath = 'src/components/PhoneBot/PhoneBotModal.tsx';
const modalLines = fs.readFileSync(modalPath, 'utf8').split('\n');
const returnIndex = modalLines.findIndex(l => l.startsWith('  return ('));

const newUi = fs.readFileSync('new_ui.tsx', 'utf8');

const finalModal = modalLines.slice(0, returnIndex).join('\n') + '\n' + newUi;

fs.writeFileSync(modalPath, finalModal, 'utf8');
console.log('UI injected successfully!');
