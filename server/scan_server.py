from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI(title="Scan Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store scanned tokens
scanned_tokens = set()

@app.get("/scan-wait")
async def scan_wait(token: str):
    # simple endpoint that tells if token is scanned
    if token in scanned_tokens:
        scanned_tokens.remove(token) # remove so we don't trigger again for same process
        return JSONResponse({"scanned": True})
    return JSONResponse({"scanned": False})

@app.post("/scan-trigger")
async def scan_trigger(request: Request):
    data = await request.json()
    token = data.get("token")
    if token:
        scanned_tokens.add(token)
    return JSONResponse({"success": True})

if __name__ == "__main__":
    port = int(os.environ.get("SCAN_SERVER_PORT", "8788"))
    uvicorn.run(app, host="127.0.0.1", port=port)
