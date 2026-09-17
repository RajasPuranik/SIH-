import re
import os

# 1. Update AndroidManifest.xml for Camera & Mic permissions
manifest_path = 'android/app/src/main/AndroidManifest.xml'
with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = f.read()

permissions = """    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />"""

manifest = manifest.replace('<uses-permission android:name="android.permission.INTERNET" />', permissions)
with open(manifest_path, 'w', encoding='utf-8') as f:
    f.write(manifest)


# 2. Add API_BASE logic to frontend requests
api_base_logic = """const API_BASE = (window as any).Capacitor && (window as any).Capacitor.isNative ? 'https://kisantrack.vercel.app' : '';"""

# AppContext.tsx
with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

if "const API_BASE =" not in txt:
    txt = txt.replace("export const AppProvider", api_base_logic + "\n\nexport const AppProvider")

txt = txt.replace("fetch(`/api/scan-wait", "fetch(`${API_BASE}/api/scan-wait")
with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)


# MandiGateOfficerModal.tsx
with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

if "const API_BASE =" not in txt:
    txt = txt.replace("export const MandiGateOfficerModal: React.FC = () => {", api_base_logic + "\n\nexport const MandiGateOfficerModal: React.FC = () => {")

txt = txt.replace("fetch('/api/scan-trigger", "fetch(`${API_BASE}/api/scan-trigger")
with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)


# LiveTicker.tsx
with open('src/components/PillarGovt/LiveTicker.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

if "const API_BASE =" not in txt:
    txt = txt.replace("export const LiveTicker: React.FC = () => {", api_base_logic + "\n\nexport const LiveTicker: React.FC = () => {")

txt = txt.replace("fetch('/api/msp-rates", "fetch(`${API_BASE}/api/msp-rates")
with open('src/components/PillarGovt/LiveTicker.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)


# PhoneBotModal.tsx
with open('src/components/PhoneBot/PhoneBotModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

if "const API_BASE =" not in txt:
    txt = txt.replace("export const PhoneBotModal: React.FC = () => {", api_base_logic + "\n\nexport const PhoneBotModal: React.FC = () => {")

txt = txt.replace("fetch('/api/stt", "fetch(`${API_BASE}/api/stt")
txt = txt.replace("fetch('/api/tts", "fetch(`${API_BASE}/api/tts")
# Also the Audio(url) element needs the absolute URL
txt = txt.replace("new Audio(`/api/tts", "new Audio(`${API_BASE}/api/tts")
with open('src/components/PhoneBot/PhoneBotModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Patched all API paths for Capacitor and updated Manifest.")
