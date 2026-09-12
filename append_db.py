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
