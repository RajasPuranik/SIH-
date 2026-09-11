const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

// 1. Quantity Glitch Fix
const qtyRegex = /const numMatch = q\.match\(\/\\d\+\/\);\s*const qty = numMatch \? numMatch\[0\] : '50'; \/\/ Default to 50 if they just say text/;
const newQty = `const wordsToNum: Record<string, string> = {
        'ten': '10', 'twenty': '20', 'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70', 'eighty': '80', 'ninety': '90', 'hundred': '100',
        'दस': '10', 'बीस': '20', 'तीस': '30', 'चालीस': '40', 'पचास': '50', 'साठ': '60', 'सत्तर': '70', 'अस्सी': '80', 'नब्बे': '90', 'सौ': '100',
        'दहा': '10', 'वीस': '20', 'तीस': '30', 'चाळीस': '40', 'पन्नास': '50'
      };
      let parsedQty = '50';
      const numMatch = q.match(/\\d+/);
      if (numMatch && parseInt(numMatch[0]) > 0) {
        parsedQty = numMatch[0];
      } else {
        for (const [word, num] of Object.entries(wordsToNum)) {
          if (q.includes(word)) { parsedQty = num; break; }
        }
      }
      const qty = parsedQty;`;
txt = txt.replace(qtyRegex, newQty);

// 2. Vehicle Types (4 options)
const vehicleBlockRegex = /if \(bookingContext\.step === 'vehicle'\) \{[\s\S]*?newBookingContext: \{ \.\.\.bookingContext, step: 'vehicleNumber', vehicle: vehicleType \},[\s\S]*?\]\s*\};\s*\}/;
const newVehicleBlock = `if (bookingContext.step === 'vehicle') {
      let vehicleType = 'Tractor Trolley';
      if (q.includes('heavy') || q.includes('commercial') || q.includes('भारी')) vehicleType = 'Heavy Commercial Truck';
      else if (q.includes('pickup') || q.includes('mini') || q.includes('पिकअप')) vehicleType = 'Pickup / Mini Truck';
      else if (q.includes('bullock') || q.includes('animal') || q.includes('बैल') || q.includes('बैलगाड़ी') || q.includes('बैलगाडी')) vehicleType = 'Bullock Cart / Animal Cart';
      else if (q.includes('truck') || q.includes('ट्रक')) vehicleType = 'Heavy Commercial Truck';

      return {
        spokenText: language === 'hi' ? "वाहन का रजिस्ट्रेशन नंबर बताएं? (जैसे MP-09-AB-1234)" : language === 'mr' ? "वाहनाचा नोंदणी क्रमांक सांगा?" : "Please provide the Vehicle Registration Number (e.g. MP-09-AB-1234).",
        displayText: language === 'hi' ? "🔢 वाहन का नंबर (VRN) दर्ज करें" : language === 'mr' ? "🔢 वाहनाचा नंबर (VRN) प्रविष्ट करा" : "🔢 Enter Vehicle Registration Number",
        newBookingContext: { ...bookingContext, step: 'vehicleNumber', vehicle: vehicleType },
        quickActions: []
      };
    }`;
// Wait, the user wants 4 vehicle types in Quick Actions! My replacement above removes them (`quickActions: []`). Let me fix that.
// The quickActions are attached to the `quantity` step's return object because they are shown while prompting for `vehicle`.
const qtyReturnRegex = /newBookingContext: \{ \.\.\.bookingContext, step: 'vehicle', quantity: qty \},[\s\S]*?\]\s*\};\s*\}/;
const newQtyReturn = `newBookingContext: { ...bookingContext, step: 'vehicle', quantity: qty },
        quickActions: [
          { label: language === 'hi' ? '🚜 ट्रैक्टर' : language === 'mr' ? '🚜 ट्रॅक्टर' : '🚜 Tractor Trolley', action: 'Tractor' },
          { label: language === 'hi' ? '🛻 पिकअप' : language === 'mr' ? '🛻 पिकअप' : '🛻 Pickup / Mini Truck', action: 'Pickup' },
          { label: language === 'hi' ? '🚚 भारी ट्रक' : language === 'mr' ? '🚚 भारी ट्रक' : '🚚 Heavy Truck', action: 'Heavy Commercial Truck' },
          { label: language === 'hi' ? '🐂 बैलगाड़ी' : language === 'mr' ? '🐂 बैलगाडी' : '🐂 Bullock Cart', action: 'Bullock Cart' },
        ]
      };
    }`;
txt = txt.replace(qtyReturnRegex, newQtyReturn);

// Also replace the vehicle handling logic properly
const vehicleHandlingRegex = /let vehicleType = 'Tractor Trolley';[\s\S]*?else if \(q\.includes\('bullock'\) \|\| q\.includes\('बैल'\)\) vehicleType = 'Bullock Cart';/;
const newVehicleHandling = `let vehicleType = 'Tractor Trolley';
      if (q.includes('heavy') || q.includes('commercial') || q.includes('भारी')) vehicleType = 'Heavy Commercial Truck';
      else if (q.includes('pickup') || q.includes('mini') || q.includes('पिकअप')) vehicleType = 'Pickup / Mini Truck';
      else if (q.includes('bullock') || q.includes('animal') || q.includes('बैल') || q.includes('बैलगाड़ी')) vehicleType = 'Bullock Cart / Animal Cart';
      else if (q.includes('truck') || q.includes('ट्रक')) vehicleType = 'Heavy Commercial Truck';`;
txt = txt.replace(vehicleHandlingRegex, newVehicleHandling);

// 3. VRN Rubbish Filter
const vrnStepRegex = /let vrn = rawQuery\.toUpperCase\(\)\.replace\(\/\[\^A-Z0-9-\]\/g, ''\);[\s\S]*?vrn = 'MP-09-XX-0000'; \/\/ Fallback\s*\}/;
const newVrnStep = `const wordToDigit: Record<string, string> = {
        'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
        'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9',
        'दोन': '2', 'पाच': '5', 'सहा': '6'
      };
      let processedQuery = rawQuery.toLowerCase();
      for (const [word, digit] of Object.entries(wordToDigit)) {
        processedQuery = processedQuery.split(word).join(digit);
      }
      let vrn = processedQuery.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      const pureAlphaNum = vrn.replace(/-/g, '');
      const vrnMatch = pureAlphaNum.match(/^([A-Z]{2})([0-9]{1,2})([A-Z]{1,3})([0-9]{1,4})$/);
      
      if (vrnMatch) {
        vrn = \`\${vrnMatch[1]}-\${vrnMatch[2]}-\${vrnMatch[3]}-\${vrnMatch[4]}\`;
      } else {
        return {
          spokenText: language === 'hi' ? "यह एक अमान्य वाहन नंबर है। कृपया सही नंबर बताएं, जैसे एम पी 0 9 ए बी 1 2 3 4" : language === 'mr' ? "हा एक अवैध वाहन क्रमांक आहे. कृपया योग्य क्रमांक सांगा." : "That is an invalid vehicle number. Please state a valid VRN, for example MP 09 AB 1234.",
          displayText: language === 'hi' ? "❌ अमान्य VRN! कृपया सही नंबर बताएं।" : language === 'mr' ? "❌ अवैध VRN! कृपया योग्य क्रमांक सांगा." : "❌ Invalid VRN! Please provide a valid number.",
          newBookingContext: bookingContext,
          quickActions: []
        };
      }`;
txt = txt.replace(vrnStepRegex, newVrnStep);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Fixed engine bugs');
