import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    api = f.read()

# Add the SMS route
sms_route = """

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
"""

api = api + sms_route

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(api)


# Now modify AppContext.tsx to call the route
with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    ctx = f.read()

notification_old = r"""        addNotification\(\{
          type: 'SMS',
          title: `Token \$\{\(pushedBooking as any\)\.tokenNumber\} Updated`,
          message: `Your token has successfully advanced to the '\$\{stageName\}' stage\. \$\{remarks\}`
        \}\);"""

notification_new = """        addNotification({
          type: 'SMS',
          title: `Token ${(pushedBooking as any).tokenNumber} Updated`,
          message: `Your token has successfully advanced to the '${stageName}' stage. ${remarks}`
        });

        fetch(`${API_BASE}/api/send-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: (pushedBooking as any).farmerPhone, 
            message: `KisanTrack: Token ${(pushedBooking as any).tokenNumber} advanced to ${stageName}.`
          })
        }).catch(() => {});"""

ctx = re.sub(notification_old, notification_new, ctx)

with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(ctx)

print("Added real SMS route and integration!")
