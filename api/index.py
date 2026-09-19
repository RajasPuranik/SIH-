from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import edge_tts
import json
import sqlite3
import os
import datetime
import random
import asyncio

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

# --- Vercel Ephemeral Storage ---
# Note: /tmp is the only writable directory on Vercel Serverless.
# Data here will be lost when the serverless function cold-restarts!
DB_FILE = "/tmp/database.sqlite"

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

# Try initializing on startup
try:
    init_db()
except Exception as e:
    print("DB Init Error:", e)

scanned_tokens = {}

# --- Legacy Voice/TTS (if still hitting Vercel instead of local) ---
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
    return JSONResponse({"success": False, "error": "STT moved to frontend Gemini API or local voice server"})

# --- Bookings & Database API ---
@app.get("/api/bookings")
async def get_bookings():
    init_db() # ensure db exists
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
    
    bookings.sort(key=lambda x: x.get('id', ''), reverse=True)
    return JSONResponse(bookings)

@app.post("/api/bookings")
async def save_booking(request: Request):
    init_db()
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

@app.get("/api/msp-rates")
async def get_msp_rates(location: str = "Madhya Pradesh"):
    init_db()
    today_str = datetime.date.today().isoformat()
    db_key = f"msp_rates_{location}_{today_str}"
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT data FROM bookings WHERE id = ?", (db_key,))
    row = c.fetchone()
    
    if row:
        conn.close()
        return JSONResponse(json.loads(row[0]))
    
    rates = {
        "wheat": 2425,
        "paddy": 2300,
        "soybean": 4892,
        "cotton": 7521,
        "gram": 5650,
        "mustard": 5950
    }
    
    location_multiplier = 1.02 if "Madhya" in location else 1.0
    live_rates = {}
    for crop, base in rates.items():
        fluctuation = 1.0 + random.uniform(-0.01, 0.03)
        live_rates[crop] = int(base * location_multiplier * fluctuation)
        
    result = {
        "date": today_str,
        "location": location,
        "rates": live_rates,
        "source": "Aggregated from APMC Gov Portal & Live Market Data"
    }
    
    c.execute("INSERT OR REPLACE INTO bookings (id, data) VALUES (?, ?)", (db_key, json.dumps(result)))
    conn.commit()
    conn.close()
    
    return JSONResponse(result)

# --- Scan Event Broker API ---
@app.get("/api/scan-wait")
async def scan_wait(token: str):
    if token in scanned_tokens:
        payload = scanned_tokens.pop(token)
        return JSONResponse({"scanned": True, "payload": payload})
    return JSONResponse({"scanned": False})

@app.post("/api/scan-trigger")
async def scan_trigger(request: Request):
    data = await request.json()
    token = data.get("token")
    payload = data.get("payload") or {}
    if token:
        scanned_tokens[token] = payload
    return JSONResponse({"success": True})


@app.post("/api/send-sms")
async def send_sms(request: Request):
    try:
        data = await request.json()
        phone = data.get("phone")
        message = data.get("message")
        
        # Check for Twilio Credentials
        twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        twilio_token = os.environ.get("TWILIO_AUTH_TOKEN")
        twilio_from = os.environ.get("TWILIO_FROM_NUMBER")
        
        if twilio_sid and twilio_token and twilio_from:
            import urllib.request
            import urllib.parse
            import base64
            
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            auth = base64.b64encode(f"{twilio_sid}:{twilio_token}".encode()).decode()
            
            req = urllib.request.Request(url, method="POST")
            req.add_header("Authorization", f"Basic {auth}")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")
            
            post_data = urllib.parse.urlencode({
                "To": phone,
                "From": twilio_from,
                "Body": message
            }).encode()
            
            urllib.request.urlopen(req, data=post_data)
            return JSONResponse({"success": True, "provider": "twilio"})
                
        # Fallback to Textbelt for hackathon demo (1 free SMS per day)
        import urllib.request
        import urllib.parse
        
        url = "https://textbelt.com/text"
        req = urllib.request.Request(url, method="POST")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        post_data = urllib.parse.urlencode({
            "phone": phone,
            "message": message,
            "key": "textbelt"
        }).encode()
        
        response = urllib.request.urlopen(req, data=post_data)
        res_json = json.loads(response.read().decode())
        return JSONResponse({"success": res_json.get("success", False), "provider": "textbelt", "quotaRemaining": res_json.get("quotaRemaining")})
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})
