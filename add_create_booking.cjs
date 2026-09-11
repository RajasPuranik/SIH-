const fs = require('fs');
let txt = fs.readFileSync('src/components/PhoneBot/PhoneBotModal.tsx', 'utf8');

// 1. Extract createBooking from useApp
txt = txt.replace(
  'bookings,\n    currentUser,',
  'bookings,\n    currentUser,\n    createBooking,'
);

// 2. Handle createBooking logic in handleUserUtterance
const replaceTarget = `if (botRes.newBookingContext !== undefined) {
      bookingContextRef.current = botRes.newBookingContext;
    }`;

const replacement = `if (botRes.newBookingContext !== undefined) {
      bookingContextRef.current = botRes.newBookingContext;
    }

    if (botRes.generatedToken && !botRes.generatedToken.alreadyBooked) {
      botRes.generatedToken.alreadyBooked = true;
      
      const matchedCrop = crops.find(c => c.name.toLowerCase().includes(botRes.generatedToken.crop.toLowerCase()) || botRes.generatedToken.crop.toLowerCase().includes(c.id));
      const finalCropId = matchedCrop ? matchedCrop.id : 'wheat';
      const finalCropName = matchedCrop ? matchedCrop.name : botRes.generatedToken.crop;

      const newBooking = createBooking({
        farmerName: currentUser?.name || 'Kisan',
        farmerPhone: currentUser?.phone || '9999999999',
        aadhaarMasked: currentUser?.aadhaar || 'XXXX-XXXX-1234',
        state: currentUser?.state || 'Madhya Pradesh',
        district: currentUser?.district || 'Indore',
        mandiName: 'Indore Central Mandi',
        cropId: finalCropId,
        cropName: finalCropName,
        estimatedQuantityQuintals: parseInt(botRes.generatedToken.quantity) || 50,
        vehicleType: botRes.generatedToken.vehicle.toLowerCase().includes('truck') ? 'Truck' : 'Tractor Trolley',
        vehicleNumber: 'MP-09-XX-0000',
        bookingDate: new Date().toISOString().split('T')[0],
        scheduledTimeSlot: botRes.generatedToken.time,
      });
      botRes.generatedToken.tokenNumber = newBooking.tokenNumber;
    }`;

txt = txt.replace(replaceTarget, replacement);

fs.writeFileSync('src/components/PhoneBot/PhoneBotModal.tsx', txt, 'utf8');
console.log('Added createBooking logic to PhoneBotModal.tsx');
