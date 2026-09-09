/**
 * KisanTrack (KisanSetu) - Automated Telephony & IVR Phone Bot Webhook Server
 * Compatible with Twilio Voice API / Exotel Voice Platform
 *
 * Handles incoming toll-free calls to 1800-180-1551 (Kisan Call Center)
 * and dispatches automated outbound status alerts to farmers' feature phones.
 */

const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Mock database reference
const CROP_RATES = {
  wheat: { name: 'Wheat (गेहूँ)', msp: 2425, privateRate: 2580 },
  mustard: { name: 'Mustard (सरसों)', msp: 5950, privateRate: 6240 },
  soybean: { name: 'Soybean (सोयाबीन)', msp: 4892, privateRate: 4620 },
  chana: { name: 'Chana (चना)', msp: 5650, privateRate: 6150 },
};

/**
 * 1. INBOUND CALL WEBHOOK
 * Twilio hits this URL when a farmer dials the 1800-180-1551 toll-free number.
 */
app.post('/api/telephony/voice/incoming', (req, res) => {
  const callerNumber = req.body.From || 'Farmer';
  console.log(`[PhoneBot] Incoming call received from: ${callerNumber}`);

  // Generate TwiML response with bilingual text-to-speech and DTMF / Voice speech gather
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">
    नमस्ते किसान भाई! किसानट्रैक 24 घंटे वॉइस हेल्पलाइन में आपका स्वागत है।
  </Say>
  <Gather numDigits="1" action="/api/telephony/voice/menu" method="POST" timeout="10" input="dtmf speech" speechTimeout="auto" language="hi-IN">
    <Say language="hi-IN" voice="Polly.Aditi">
      अपने टोकन की स्थिति जानने के लिए 1 दबाएं।
      आज का सरकारी समर्थन मूल्य जानने के लिए 2 दबाएं।
      इंदौर मंडी में प्रतीक्षा समय जानने के लिए 3 दबाएं।
      मंडी अधिकारी से सीधे बात करने के लिए 9 दबाएं।
      या अपनी बात सीधे बोलें।
    </Say>
  </Gather>
  <Say language="hi-IN" voice="Polly.Aditi">
    हमें आपकी ओर से कोई उत्तर नहीं मिला। कॉल समाप्त की जा रही है। धन्यवाद!
  </Say>
  <Hangup/>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

/**
 * 2. IVR MENU SELECTION / SPEECH HANDLER
 */
app.post('/api/telephony/voice/menu', (req, res) => {
  const digits = req.body.Digits;
  const speechResult = req.body.SpeechResult ? req.body.SpeechResult.toLowerCase() : '';
  console.log(`[PhoneBot] User input: Digits=${digits}, Speech=${speechResult}`);

  let replyText = '';

  if (digits === '1' || speechResult.includes('टोकन') || speechResult.includes('स्थिति')) {
    replyText =
      'किसान भाई, आपका टोकन नंबर 9041 गेट नंबर 3 पर सत्यापित हो चुका है। औसत प्रतीक्षा समय 12 मिनट है। आपके मोबाइल पर एसएमएस भेज दिया गया है।';
  } else if (digits === '2' || speechResult.includes('भाव') || speechResult.includes('msp') || speechResult.includes('रेट')) {
    replyText =
      'आज इंदौर मंडी में गेहूँ का सरकारी समर्थन मूल्य 2425 रुपये प्रति क्विंटल है और प्राइवेट बोली 2580 रुपये चल रही है। सरसों का समर्थन मूल्य 5950 रुपये है।';
  } else if (digits === '3' || speechResult.includes('भीड़') || speechResult.includes('लाइन') || speechResult.includes('मंडी')) {
    replyText =
      'इंदौर कृषि उपज मंडी में सामान्य भीड़ है। गेट 3 पर 4 रैंप चालू हैं और वाहनों की औसत प्रतीक्षा केवल 18 मिनट है।';
  } else if (digits === '9' || speechResult.includes('अधिकारी') || speechResult.includes('मदद')) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">
    आपकी कॉल मंडी अधिकारी डॉ. सुनीता चौहान को स्थानांतरित की जा रही है।
  </Say>
  <Dial>+919425011920</Dial>
</Response>`;
    res.type('text/xml');
    return res.send(twiml);
  } else {
    replyText =
      'माफ़ कीजिये, हम आपकी बात समझ नहीं पाए। सहायता के लिए टोल-फ्री नंबर 1551 पर पुनः संपर्क करें। धन्यवाद!';
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">${replyText}</Say>
  <Pause length="1"/>
  <Say language="hi-IN" voice="Polly.Aditi">किसानट्रैक से जुड़ने के लिए धन्यवाद। आपका दिन शुभ हो!</Say>
  <Hangup/>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

/**
 * 3. OUTBOUND AUTOMATED ROBO-CALL TRIGGER
 * Called when an officer validates a token or when a slot is booked.
 */
app.post('/api/telephony/voice/outbound-alert', (req, res) => {
  const { farmerPhone, tokenNumber, mandiName, status } = req.body;
  console.log(`[PhoneBot] Initiating automated outbound call to: ${farmerPhone} for token: ${tokenNumber}`);

  // In production with Twilio client:
  // twilioClient.calls.create({
  //   url: `https://your-server.com/api/telephony/voice/outbound-twiml?token=${tokenNumber}`,
  //   to: farmerPhone,
  //   from: '+9118001801551'
  // });

  res.json({
    success: true,
    message: `Outbound call scheduled for ${farmerPhone}`,
    callId: `CALL-${Date.now()}`,
  });
});

app.listen(PORT, () => {
  console.log(`KisanTrack Telephony Voice Server running on port ${PORT}`);
});
