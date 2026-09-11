const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

txt = txt.replace(
  "vehicleNumber: 'MP-09-XX-0000',",
  "vehicleNumber: botRes.generatedToken.vehicleNumber || 'MP-09-XX-0000',"
);

// We should also display the Vehicle Number on the generated token card.
// Existing code has: <p><strong>Vehicle:</strong> {lastMessage.generatedToken.vehicle}</p>
const regexVehicleLine = /<p><strong>Vehicle:<\/strong> \{lastMessage\.generatedToken\.vehicle\}<\/p>/;
const newVehicleLine = `<p><strong>Vehicle:</strong> {lastMessage.generatedToken.vehicle} ({lastMessage.generatedToken.vehicleNumber})</p>`;
txt = txt.replace(regexVehicleLine, newVehicleLine);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Fixed PhoneBotModal vehicle registration number');
