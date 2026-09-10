# Voicebot Overhaul — What Changed & Why

This covers the changes made to `PhoneBotModal` (the voice-call assistant)
to fix voice recognition, enable real barge-in, focus the language set, and
improve pronunciation.

## 1. Voice input wasn't being recognized

**Root causes found, both fixed:**

- **A race condition was starting the microphone twice per bot reply.**
  `speakText()` called `startListening()` immediately, and then the audio
  element's `onplay` handler called it *again* a moment later. Two
  overlapping `getUserMedia()` + `AudioRecorder.start()` calls fight over
  the same microphone and frequently corrupt or silently drop the capture.
  There was already an `isStartingRef` flag declared in the code for
  exactly this purpose — it was just never wired up. It now guards
  `startListening()`, and the redundant eager call was removed
  (`src/components/PhoneBot/PhoneBotModal.tsx`).

- **The speech-to-text backend used Google's free, unofficial
  `recognize_google` endpoint** (via the `SpeechRecognition` Python
  package). It has no API key, is undocumented, is aggressively
  rate-limited, and is unreliable for Hindi/Marathi in particular —
  frequently returning nothing at all. It's been replaced with a local
  **faster-whisper** model running in a persistent backend
  (`server/voice_server.py`), which works offline and doesn't depend on
  an unofficial API surviving unannounced changes.

- **The old dev-server spawned a `python` process per request** (see the
  old `vite.config.ts`). On machines where only `python3` exists on PATH
  (most modern Linux/macOS), that spawn silently failed — which, combined
  with no health checks, would quietly push the app onto its
  low-quality browser `speechSynthesis` fallback for *speech output* too.
  The new backend is a single long-running FastAPI process; Vite just
  proxies to it.

## 2. The bot couldn't be interrupted ("keeps talking")

Barge-in code already existed but used **fixed volume thresholds**. In
practice, a laptop or phone's microphone always picks up some of the bot's
own voice through the speaker (acoustic echo), and how loud that is varies
by device volume and hardware — so a fixed number is either too low (the
bot interrupts itself on its own echo) or too high (real barge-in never
fires, which reads as "it keeps talking over me").

`src/services/audioRecorder.ts` now:
- **Measures the actual echo level for every bot utterance** during a
  short ~280ms settle window right when the bot starts talking, and sets
  the barge-in threshold relative to *that* measured floor (≈2.2x) instead
  of a guessed constant.
- **Requires ~250ms of sustained loud audio** (not a single 128ms blip)
  before triggering a barge-in, filtering out clicks/pops that used to
  cause false interrupts.
- Also makes the *normal* (bot-silent) speech threshold adaptive to the
  room's measured ambient noise floor, instead of one fixed number for
  every environment.

**Caveat worth knowing:** true barge-in over a phone/laptop's built-in
speaker+mic (no headphones) is a hard acoustic echo cancellation problem in
general — Chrome/Safari's built-in AEC does most of the work, and this
adaptive layer compensates for what AEC leaves behind, but a demo on a
loud speaker in a noisy room will always barge-in less reliably than one
on headphones or a proper headset mic.

## 3. Language scope: Hindi, Marathi, English

`BOT_LANGUAGES` (in `src/services/phoneBotEngine.ts`) and the IVR keypad
(in `PhoneBotModal.tsx`) are trimmed to these three. The Tamil/Telugu
response logic is still present deeper in `phoneBotEngine.ts` in case you
want to re-enable it later — it's just no longer exposed in the language
picker or the "press 1/2/3" IVR menu, since it wasn't part of the tuned,
tested voice experience.

## 4. Natural speech / fewer mispronunciations

- Voices are Microsoft Edge's neural voices via `edge-tts`
  (`hi-IN-SwaraNeural`, `mr-IN-AarohiNeural`, `en-IN-NeerjaExpressiveNeural`)
  — these are the same engine/voices behind many production Indian-language
  assistants, and sound materially more natural than the browser's built-in
  `speechSynthesis`, which is now only a last-resort fallback if the
  backend is unreachable.
- Added `server/text_normalize.py`, which spells out `₹1,234` → `1234
  रुपये` / `1234 rupees` and `12%` → `12 प्रतिशत` / `12 percent` before
  sending text to the TTS engine — symbols like `₹` and `%` are one of the
  more common causes of odd or skipped pronunciation in neural TTS.
- Because the backend is now reliable (see §1), the assistant should hit
  the low-quality `speechSynthesis` fallback far less often — that fallback
  was almost certainly the main source of "not a natural speaker"
  complaints, since it's a completely different, robotic voice engine.

## Running it

```bash
# Terminal 1 — voice backend (STT + TTS), loads the Whisper model once
pip install -r server/requirements.txt
python3 server/voice_server.py

# Terminal 2 — the app itself
npm install
npm run dev
```

The first request after starting `voice_server.py` may take a few seconds
while the Whisper model loads; after that, transcription of a normal
sentence should be sub-second on a modern CPU. If you have a GPU available,
set `WHISPER_DEVICE=cuda` (and `WHISPER_COMPUTE_TYPE=float16`) as
environment variables before starting the server for a further speed-up.

If `/api/stt` calls fail with a connection error in the browser console,
it almost always means `voice_server.py` isn't running yet — start it
first, then reload the app.
