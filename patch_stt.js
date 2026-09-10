import fs from 'fs';

const filePath = 'd:/SIH/src/services/audioRecorder.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const regex = /export async function transcribeWavWithApi\([\s\S]*?\): Promise<{ success: boolean; transcript: string; error\?: string }> {[\s\S]*?return {[\s\S]*?success: data\.success \?\? true,[\s\S]*?transcript: data\.transcript \|\| '',[\s\S]*?error: data\.error,[\s\S]*?};[\s\S]*?catch \(err: any\) {[\s\S]*?return { success: false, transcript: '', error: err\.message };[\s\S]*?}[\s\S]*?}/;

const newFunc = `import { GoogleGenerativeAI } from '@google/generative-ai';

export async function transcribeWavWithApi(
  wavBlob: Blob,
  lang: string = 'hi'
): Promise<{ success: boolean; transcript: string; error?: string }> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      const buffer = await wavBlob.arrayBuffer();
      // Convert buffer to base64
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
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

    // Fallback to python server if no API key
    const baseUrl = import.meta.env.VITE_API_BASE || '/api';
    const response = await fetch(\`\${baseUrl}/stt?lang=\${encodeURIComponent(lang)}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/wav',
      },
      body: wavBlob,
    });

    if (!response.ok) {
      return { success: false, transcript: '', error: \`Server error: \${response.status}\` };
    }

    const data = await response.json();
    return {
      success: data.success ?? true,
      transcript: data.transcript || '',
      error: data.error,
    };
  } catch (err: any) {
    return { success: false, transcript: '', error: err.message };
  }
}`;

content = content.replace(regex, newFunc);
fs.writeFileSync(filePath, content);
console.log("Rewrote STT to use Gemini native audio parsing!");
