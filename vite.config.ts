import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { spawn } from 'child_process'
import path from 'path'

const VOICE_MAP: Record<string, string> = {
  hi: 'hi-IN-SwaraNeural',
  mr: 'mr-IN-AarohiNeural',
  ta: 'ta-IN-PallaviNeural',
  te: 'te-IN-ShrutiNeural',
  en: 'en-IN-NeerjaExpressiveNeural',
  pa: 'hi-IN-MadhurNeural',
}

// In-memory cache for ultra-fast instant playback of repeated responses
const ttsCache = new Map<string, Buffer>()

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

          const cacheKey = `${voice}:${text.trim()}`
          const cached = ttsCache.get(cacheKey)
          if (cached) {
            res.writeHead(200, {
              'Content-Type': 'audio/mpeg',
              'Content-Length': cached.length,
              'Cache-Control': 'public, max-age=86400',
            })
            res.end(cached)
            return
          }

          const baseDir = import.meta.dirname || __dirname
          const scriptPath = path.resolve(baseDir, 'server', 'generate_tts.py')

          // Stream chunks directly to browser without writing to disk
          const child = spawn('python', [scriptPath, voice, text, '-'])
          const audioChunks: Buffer[] = []

          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'public, max-age=86400',
          })

          child.stdout.on('data', (chunk) => {
            audioChunks.push(chunk)
            res.write(chunk)
          })

          child.on('close', (code) => {
            if (code === 0 && audioChunks.length > 0) {
              const fullBuffer = Buffer.concat(audioChunks)
              ttsCache.set(cacheKey, fullBuffer)
              res.end()
            } else {
              res.end()
            }
          })

          child.on('error', () => {
            res.statusCode = 500
            res.end()
          })
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(err) }))
        }
      })

      server.middlewares.use('/api/stt', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`)
          const lang = url.searchParams.get('lang') || 'hi'

          const chunks: Buffer[] = []
          req.on('data', (chunk) => chunks.push(chunk))
          req.on('end', () => {
            const buffer = Buffer.concat(chunks)
            if (buffer.length < 100) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, transcript: '', lang }))
              return
            }

            const baseDir = import.meta.dirname || __dirname
            const scriptPath = path.resolve(baseDir, 'server', 'transcribe_stt.py')

            // Stream audio bytes directly into Python stdin in memory
            const child = spawn('python', [scriptPath, 'stdin', lang])
            let output = ''
            let errorOutput = ''
            child.stdout.on('data', (d) => (output += d))
            child.stderr.on('data', (d) => (errorOutput += d))

            child.stdin.write(buffer)
            child.stdin.end()

            child.on('close', (code) => {
              res.setHeader('Content-Type', 'application/json')
              if (code === 0 && output.trim()) {
                try {
                  res.end(output.trim())
                } catch {
                  res.end(JSON.stringify({ success: true, transcript: '', lang }))
                }
              } else {
                console.error('STT error output:', errorOutput)
                res.end(JSON.stringify({ success: false, transcript: '', lang, error: errorOutput }))
              }
            })
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
