const fs = require('fs');
let modal = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

const startStr = '{/*';
const endStr = 'STATE: INCOMING CALL';

const langBarIndex = modal.indexOf('MULTILINGUAL LANGUAGE BAR');
if (langBarIndex !== -1) {
  const startCommentIndex = modal.lastIndexOf(startStr, langBarIndex);
  const endCommentIndex = modal.indexOf(endStr, langBarIndex);
  
  if (startCommentIndex !== -1 && endCommentIndex !== -1) {
    const nextStartCommentIndex = modal.lastIndexOf(startStr, endCommentIndex);
    // Delete from startCommentIndex to nextStartCommentIndex
    modal = modal.substring(0, startCommentIndex) + modal.substring(nextStartCommentIndex);
    fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', modal, 'utf8');
    console.log('Language bar successfully removed!');
  }
}
