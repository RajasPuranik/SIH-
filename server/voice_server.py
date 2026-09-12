"""
Persistent voice backend for the KisanTrack voicebot (STT + TTS).

WHY THIS FILE EXISTS
---------------------
The previous setup spawned a brand-new `python` process for every single
STT/TTS request (see vite.config.ts's old edgeTtsPlugin) and used the free,
unofficial "recognize_google" endpoint from the `SpeechRecognition` package
for transcription. That combination is the main reason voice input kept
failing:
  1. `recognize_google` is not a real, supported API — it's rate-limited,
     undocumented, and frequently returns nothing (or errors) for Hindi and
     Marathi audio in particular.
  2. Spawning `python` (not `python3`) per request silently fails on many
     Linux/macOS setups that only ship `python3`, which made the app fall
     back to the low-quality robotic browser TTS voice — explaining the
     "not natural / mispronounced" complaints.

This server instead:
  - Loads a local Whisper model ONCE at startup (faster-whisper), so
    transcription is fast, offline, and doesn't depend on an unofficial
    Google endpoint or your internet connection at all.
  - Talks to Microsoft Edge's neural TTS voices (edge-tts) for natural
    Hindi/Marathi/English speech, with basic text normalization to avoid
    misreading symbols like ₹ and %.
  - Runs as one long-lived process so nothing needs to "cold start" per
    request.

RUNNING IT
----------
    pip install -r server/requirements.txt
    python3 server/voice_server.py

It listens on http://127.0.0.1:8787 by default (override with the
VOICE_SERVER_PORT env var). `npm run dev` (see vite.config.ts) proxies
/api/stt and /api/tts to whatever VOICE_SERVER_URL points at, so just run
this alongside `npm run dev` in a second terminal.

The first request after startup may take a few seconds while the Whisper
model loads (see the startup warm-up hook below) — after that, transcription
for a normal sentence should be sub-second on a modern CPU.
"""
import io
import os
import time
import asyncio
import logging
from typing import Optional

from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import edge_tts

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from text_normalize import normalize_for_tts

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("voice_server")

# "small" is a good accuracy/speed balance for Hindi/Marathi/English on CPU.
# Use "base" or "tiny" on low-power cloud VMs with 512MB RAM limits (like Render Free Tier).
# Use "small" or "medium" locally or on a GPU.
WHISPER_MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "tiny")
WHISPER_DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

LANG_MAP = {"hi": "hi", "mr": "mr", "en": "en"}
VOICE_MAP = {
    "hi": "hi-IN-SwaraNeural",
    "mr": "mr-IN-AarohiNeural",
    "en": "en-IN-NeerjaExpressiveNeural",
}

app = FastAPI(title="KisanTrack Voice Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_whisper_model = None
_tts_cache: dict = {}


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel

        log.info(
            f"Loading faster-whisper model '{WHISPER_MODEL_SIZE}' "
            f"({WHISPER_DEVICE}/{WHISPER_COMPUTE})..."
        )
        t0 = time.time()
        _whisper_model = WhisperModel(
            WHISPER_MODEL_SIZE, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE
        )
        log.info(f"Whisper model loaded in {time.time() - t0:.1f}s")
    return _whisper_model


@app.on_event("startup")
async def warm_up():
    # Render's free tier has a 512MB RAM limit. Eagerly loading the model on startup
    # can crash the server immediately. We will lazily load it on the first request.
    pass


@app.get("/health")
async def health():
    return {"ok": True, "model": WHISPER_MODEL_SIZE}


@app.post("/stt")
async def stt(request: Request, lang: str = Query("hi")):
    audio_bytes = await request.body()
    if len(audio_bytes) < 800:
        return JSONResponse({"success": True, "transcript": "", "lang": lang})

    model = get_whisper_model()
    lang_hint = LANG_MAP.get(lang)  # None => let Whisper auto-detect

    def _run():
        segments, info = model.transcribe(
            io.BytesIO(audio_bytes),
            language=None, # Allow multi-language auto-detection
            task="transcribe",
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 400},
            beam_size=2, # Bumped to 2 for better accuracy on accents while still being fast
            condition_on_previous_text=False,
            initial_prompt="Kisan Track mandi rates weather token status. किसान मंडी भाव टोकन. शेतकरी बाजारभाव टोकन."
        )
        text = "".join(seg.text for seg in segments).strip()
        return text, info.language

    try:
        loop = asyncio.get_event_loop()
        text, detected_lang = await loop.run_in_executor(None, _run)
        return JSONResponse(
            {"success": True, "transcript": text, "lang": detected_lang or lang}
        )
    except Exception as e:  # keep the API contract stable even on failure
        log.exception("STT failed")
        return JSONResponse(
            {"success": False, "transcript": "", "error": str(e)}, status_code=500
        )


@app.get("/tts")
async def tts(text: str, lang: str = "hi", voice: Optional[str] = None):
    voice_name = voice or VOICE_MAP.get(lang, VOICE_MAP["hi"])
    clean_text = normalize_for_tts(text, lang)

    cache_key = f"{voice_name}:{clean_text}"
    cached = _tts_cache.get(cache_key)
    if cached:
        return StreamingResponse(iter([cached]), media_type="audio/mpeg")

    async def generate():
        chunks = []
        # Slight +15% rate keeps pacing brisk without sounding rushed or
        # unnatural; tune per-voice if you want it slower/faster.
        communicate = edge_tts.Communicate(clean_text, voice_name, rate="+15%")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                chunks.append(chunk["data"])
                yield chunk["data"]
        if chunks:
            _tts_cache[cache_key] = b"".join(chunks)

    return StreamingResponse(generate(), media_type="audio/mpeg")


import sqlite3
import json
import os

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.sqlite')

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.get("/bookings")
async def get_bookings():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT data FROM bookings")
    rows = c.fetchall()
    conn.close()
    
    bookings = []
    for r in rows:
        try:
            bookings.append(json.loads(r[0]))
        except:
            pass
    
    # Sort bookings chronologically by id descending (assuming bk-timestamp)
    bookings.sort(key=lambda x: x.get('id', ''), reverse=True)
    return JSONResponse(bookings)

@app.post("/bookings")
async def save_booking(request: Request):
    data = await request.json()
    b_id = data.get('id')
    if not b_id:
        return JSONResponse({"error": "Missing ID"}, status_code=400)
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO bookings (id, data) VALUES (?, ?)", (b_id, json.dumps(data)))
    conn.commit()
    conn.close()
    return JSONResponse({"success": True, "id": b_id})


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("VOICE_SERVER_PORT", "8787"))
    uvicorn.run(app, host="127.0.0.1", port=port)
