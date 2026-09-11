const fs = require('fs');
let modal = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// Pass userRole to processBotQuery
modal = modal.replace(
  `const botRes: BotResponse = processBotQuery(
      query,
      crops,
      bookings,
      currentUser?.district || 'Indore',
      lang
    );`,
  `const botRes: BotResponse = processBotQuery(
      query,
      crops,
      bookings,
      currentUser?.district || 'Indore',
      lang,
      currentUser?.role || 'farmer'
    );`
);

// Also add userRole to the destructured useApp
if (!modal.includes("userRole,")) {
  modal = modal.replace(
    `crops,
    bookings,
    currentUser,`,
    `crops,
    bookings,
    currentUser,
    userRole,`
  );
}

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', modal);
console.log('PhoneBotModal handleUserUtterance patched with userRole!');
