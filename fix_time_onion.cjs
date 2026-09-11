const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

// Replace the time mapping logic
const timeRegex = /let mappedTime = '10:15 AM - 11:45 AM';[\s\S]*?mappedTime = '02:30 PM - 04:00 PM';\n\s*\}/;

const newTimeMapping = `let mappedTime = '12:00 PM - 01:30 PM'; // default
      const timeText = q.toLowerCase();
      
      // Extract numbers or words
      const hourMatch = timeText.match(/(?:1[0-2]|[1-9])(?:\\s*:\\s*[0-5][0-9])?\\s*(?:am|pm)?/i) || 
                        timeText.match(/(one|two|three|four|five|eight|nine|ten|eleven|twelve)/i);
                        
      if (hourMatch) {
        let hour = 0;
        const val = hourMatch[0];
        if (val.includes('8') || val.includes('eight') || val.includes('9') || val.includes('nine')) hour = 9;
        else if (val.includes('10') || val.includes('ten') || val.includes('11') || val.includes('eleven')) hour = 11;
        else if (val.includes('12') || val.includes('twelve') || val.includes('1') || val.includes('one')) hour = 13;
        else if (val.includes('2') || val.includes('two') || val.includes('3') || val.includes('three') || val.includes('4') || val.includes('four') || val.includes('5') || val.includes('five')) hour = 15;

        if (hour === 9 || timeText.includes('morning') || timeText.includes('सुबह') || timeText.includes('सकाळ')) mappedTime = '08:30 AM - 10:00 AM';
        else if (hour === 11) mappedTime = '10:15 AM - 11:45 AM';
        else if (hour === 13 || timeText.includes('afternoon') || timeText.includes('दोपहर') || timeText.includes('दुपार')) mappedTime = '12:00 PM - 01:30 PM';
        else if (hour >= 15 || timeText.includes('evening') || timeText.includes('शाम') || timeText.includes('संध्याकाळ')) mappedTime = '02:30 PM - 04:00 PM';
      } else {
        // Fallbacks for general terms
        if (timeText.includes('morning') || timeText.includes('early') || timeText.includes('सुबह') || timeText.includes('सकाळ')) mappedTime = '08:30 AM - 10:00 AM';
        else if (timeText.includes('evening') || timeText.includes('शाम') || timeText.includes('संध्याकाळ')) mappedTime = '02:30 PM - 04:00 PM';
        else if (timeText.includes('afternoon') || timeText.includes('दोपहर') || timeText.includes('दुपार')) mappedTime = '12:00 PM - 01:30 PM';
      }`;

txt = txt.replace(timeRegex, newTimeMapping);

// Remove the Onion option from the Crop Quick Actions
txt = txt.replace(/\{\s*label:\s*'🧅 Onion',\s*action:\s*'onion'\s*\},\n?\s*/g, '');

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Fixed time mapping and removed Onion from quick actions');
