import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The voice backend (speech-to-text + text-to-speech) is now its own
// persistent Python process (server/voice_server.py) instead of being
// spawned fresh on every request. Run it separately:
//
//   pip install -r server/requirements.txt
//   python3 server/voice_server.py
//
// Vite just proxies /api/stt and /api/tts to it. This fixes two problems
// with the old per-request-spawn approach: (1) it was slow, since nothing
// stayed "warm" between requests, and (2) it spawned the `python` binary
// specifically, which doesn't exist on many machines that only have
// `python3` on PATH — that silent failure was quietly forcing the app onto
// its low-quality robotic browser-TTS fallback.
const VOICE_SERVER = process.env.VOICE_SERVER_URL || 'http://127.0.0.1:8787'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/android/**', '**/*.apk'],
    },
    proxy: {
      '/api/tts': {
        target: VOICE_SERVER,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, '/tts'),
      },
      '/api/stt': {
        target: VOICE_SERVER,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stt/, '/stt'),
      },
      '/api/bookings': {
        target: VOICE_SERVER,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bookings/, '/bookings'),
      },
      '/api/msp-rates': {
        target: VOICE_SERVER,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/msp-rates/, '/msp-rates'),
      },
    },
  },
})
