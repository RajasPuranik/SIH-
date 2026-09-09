import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const VOICE_MAP: Record<string, string> = {
  hi: 'hi-IN-SwaraNeural',
  mr: 'mr-IN-AarohiNeural',
  ta: 'ta-IN-PallaviNeural',
  te: 'te-IN-ShrutiNeural',
  en: 'en-IN-NeerjaExpressiveNeural',
  pa: 'hi-IN-MadhurNeural',
}

function edgeTtsPlugin(): Plugin {
  return {
    name: 'edge-tts-api',
    configureServer(server) {
      server.middlewares.use('/api/tts', (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`)
          const text = url.searchParams.get('text') || ''
          const lang = url.searchParams.get('lang') || 'hi'
          const voice = url.searchParams.get('voice') || VOICE_MAP[lang] || 'hi-IN-SwaraNeural'

          if (!text.trim()) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing text parameter' }))
            return
          }

          const tmpFile = path.join(os.tmpdir(), `tts_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`)
          const baseDir = import.meta.dirname || __dirname
          const scriptPath = path.resolve(baseDir, 'server', 'generate_tts.py')

          const child = spawn('python', [scriptPath, voice, text, tmpFile])

          child.on('close', (code) => {
            if (code === 0 && fs.existsSync(tmpFile)) {
              const stat = fs.statSync(tmpFile)
              res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': stat.size,
                'Cache-Control': 'public, max-age=3600',
              })
              const readStream = fs.createReadStream(tmpFile)
              readStream.pipe(res)
              readStream.on('end', () => {
                fs.unlink(tmpFile, () => {})
              })
            } else {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to synthesize speech' }))
            }
          })
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    edgeTtsPlugin(),
  ],
  server: {
    watch: {
      ignored: ['**/android/**', '**/*.apk'],
    },
  },
})
