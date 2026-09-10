import fs from 'fs';
let f1 = 'd:/SIH/src/services/audioRecorder.ts';
let f2 = 'd:/SIH/src/services/phoneBotEngine.ts';

fs.writeFileSync(f1, fs.readFileSync(f1, 'utf-8').replace('const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });', '').replace(/gemini-flash-latest/g, 'gemini-flash-lite-latest'));
fs.writeFileSync(f2, fs.readFileSync(f2, 'utf-8').replace(/gemini-flash-latest/g, 'gemini-flash-lite-latest'));
console.log("Patched to use flash-lite-latest");
