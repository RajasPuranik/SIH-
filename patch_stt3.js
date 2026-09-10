import fs from 'fs';

const filePath = 'd:/SIH/src/services/audioRecorder.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const regex = /export async function transcribeWavWithApi\([\s\S]*?error: err\.message \};\s*\n\s*\}\s*\n\s*\}/g;

const newFunc = `export async function transcribeWavWithApi(
  wavBlob: Blob,
  lang: string = 'hi'
): Promise<{ success: boolean; transcript: string; error?: string }> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      const buffer = await wavBlob.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
      
      const prompt = "Transcribe the speech in this audio accurately. If it contains Hindi, Marathi, or English, transcribe it natively in its respective script. Return ONLY the transcribed text without quotes or markdown.";
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64,
            mimeType: "audio/wav"
          }
        },
        { text: prompt }
      ]);
      const text = result.response.text().trim();
      return { success: true, transcript: text };
    }

    return { success: false, transcript: '', error: "VITE_GEMINI_API_KEY is missing from Vercel! Add it and redeploy." };
  } catch (err: any) {
    return { success: false, transcript: '', error: \`Gemini Error: \${err.message}\` };
  }
}`;

// I will just substring it since regex is unreliable when file is messed up
const startIdx = content.indexOf('export async function transcribeWavWithApi');
content = content.substring(0, startIdx) + newFunc;

fs.writeFileSync(filePath, content);
