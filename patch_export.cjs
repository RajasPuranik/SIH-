const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /orderBook,(\r?\n\s*)addOrderItem,/;
const replacement = "orderBook,$1shipments,$1updateShipmentStatus,$1addOrderItem,";

content = content.replace(regex, replacement);
fs.writeFileSync('src/context/AppContext.tsx', content);
