from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import edge_tts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

VOICE_MAP = {
    "hi": "hi-IN-SwaraNeural",
    "mr": "mr-IN-AarohiNeural",
    "en": "en-IN-NeerjaExpressiveNeural",
}

@app.get("/api/tts")
async def tts(text: str, lang: str = "hi", voice: str = None):
    voice_name = voice or VOICE_MAP.get(lang, VOICE_MAP["hi"])
    
    async def generate():
        communicate = edge_tts.Communicate(text, voice_name, rate="+15%")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

    return StreamingResponse(generate(), media_type="audio/mpeg")

@app.post("/api/stt")
async def stt():
    # Deprecated: Frontend uses Gemini directly now.
    return JSONResponse({"success": False, "error": "STT moved to frontend Gemini API"})
