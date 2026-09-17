import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace("scanned_tokens = set()", "scanned_tokens = {}")

txt = txt.replace(
    """@app.get("/api/scan-wait")
async def scan_wait(token: str):
    if token in scanned_tokens:
        scanned_tokens.remove(token)
        return JSONResponse({"scanned": True})
    return JSONResponse({"scanned": False})""",
    """@app.get("/api/scan-wait")
async def scan_wait(token: str):
    if token in scanned_tokens:
        payload = scanned_tokens.pop(token)
        return JSONResponse({"scanned": True, "payload": payload})
    return JSONResponse({"scanned": False})"""
)

txt = txt.replace(
    """@app.post("/api/scan-trigger")
async def scan_trigger(request: Request):
    data = await request.json()
    token = data.get("token")
    if token:
        scanned_tokens.add(token)
    return JSONResponse({"success": True})""",
    """@app.post("/api/scan-trigger")
async def scan_trigger(request: Request):
    data = await request.json()
    token = data.get("token")
    payload = data.get("payload") or {}
    if token:
        scanned_tokens[token] = payload
    return JSONResponse({"success": True})"""
)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Updated api/index.py for payload support")
