// Web Audio API recorder that encodes 16kHz 16-bit Mono WAV and calls /api/stt
//
// v2 changes (voicebot overhaul):
//  - The old recorder used FIXED volume thresholds to decide "is the user
//    interrupting the bot?". On real devices the mic always picks up some of
//    the bot's own voice through the speaker (echo), and that echo level
//    varies with device volume, so a fixed number was either too low (bot
//    interrupts itself on its own echo) or too high (real barge-in never
//    triggers, so "it keeps talking"). This version measures the actual
//    echo level for every utterance the bot speaks and sets the barge-in
//    threshold relative to that measured floor instead of a guess.
//  - Barge-in now requires a short run of consecutive loud frames (not a
//    single 128ms blip) before it fires, which filters out clicks/pops.

export interface AudioRecorderOptions {
  sampleRate?: number;
  onVolume?: (volume: number) => void;
  onSpeechStart?: () => void;
  onSilenceTimeout?: () => void;
  onVoiceInterrupt?: () => void;
  isBotSpeaking?: () => boolean;
  silenceDurationMs?: number;
  /** Minimum RMS that counts as "someone is speaking" when the bot is silent. */
  speechThreshold?: number;
  /**
   * How many times louder than the measured echo floor a sound must be
   * before it's treated as the user barging in over the bot. 2.0-2.5 is a
   * good default; lower it if barge-in feels unresponsive, raise it if the
   * bot keeps interrupting itself.
   */
  interruptMultiplier?: number;
  /** Consecutive loud frames required to confirm a barge-in (debounce). */
  interruptMinFrames?: number;
  /** Grace period (ms) after the bot starts talking, used purely to sample the echo floor for THIS utterance before barge-in detection turns on. */
  bargeInSettleMs?: number;
}

export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private pcmBuffers: Float32Array[] = [];
  private preRollBuffers: Float32Array[] = [];
  private totalSamples = 0;
  private isRecording = false;
  private hasSpoken = false;
  private isMuted = false;
  private silenceTimer: any = null;
  private options: AudioRecorderOptions;

  // Adaptive levels, continuously re-estimated while the recorder runs.
  private ambientNoise = 0.004; // room noise floor while bot is silent
  private echoFloor = 0.006; // speaker->mic leakage floor while bot is talking
  private wasBotSpeaking = false;
  private botSpeakingStartedAt = 0;
  private interruptStreak = 0;
  private lastDebugLogAt = 0;

  constructor(options: AudioRecorderOptions = {}) {
    this.options = {
      sampleRate: 16000,
      silenceDurationMs: 1200,
      speechThreshold: 0.010,
      interruptMultiplier: 2.2,
      interruptMinFrames: 2,
      bargeInSettleMs: 280,
      ...options,
    };
  }

  async start(): Promise<void> {
    this.stop();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.mediaStream = stream;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({ sampleRate: this.options.sampleRate || 16000 });

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    // Buffer size 2048 at 16kHz = ~128ms per chunk
    this.processorNode = this.audioContext.createScriptProcessor(2048, 1, 1);

    this.pcmBuffers = [];
    this.preRollBuffers = [];
    this.totalSamples = 0;
    this.isRecording = true;
    this.hasSpoken = false;
    this.isMuted = false;
    this.wasBotSpeaking = false;
    this.botSpeakingStartedAt = 0;
    this.interruptStreak = 0;

    this.processorNode.onaudioprocess = (e) => {
      if (!this.isRecording || this.isMuted) return;

      const channelData = e.inputBuffer.getChannelData(0);
      const chunk = new Float32Array(channelData.length);
      
      chunk.set(channelData);

      // Calculate Root Mean Square (RMS) volume
      let sum = 0;
      for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sum / channelData.length);

      if (this.options.onVolume) {
        this.options.onVolume(rms);
      }

      const botIsSpeaking = this.options.isBotSpeaking ? this.options.isBotSpeaking() : false;
      const now = performance.now();

      if (botIsSpeaking && !this.wasBotSpeaking) {
        // Bot just started a new utterance: start a fresh settle window so we
        // can measure how loud ITS OWN echo is before treating anything as barge-in.
        this.botSpeakingStartedAt = now;
        this.interruptStreak = 0;
      }
      this.wasBotSpeaking = botIsSpeaking;

      if (botIsSpeaking) {
        const elapsed = now - this.botSpeakingStartedAt;
        const settleMs = this.options.bargeInSettleMs ?? 280;

        if (elapsed < settleMs) {
          // Pure calibration window: this energy is (almost certainly) just
          // the bot's own voice leaking into the mic. Use it to learn the
          // echo floor for this utterance instead of reacting to it.
          this.echoFloor = this.echoFloor * 0.6 + rms * 0.4;
          this.interruptStreak = 0;
          return;
        }

        const dynamicThreshold = Math.max(
          this.options.speechThreshold || 0.003,
          this.echoFloor * (this.options.interruptMultiplier ?? 2.2)
        );

        if (rms > dynamicThreshold) {
          this.interruptStreak += 1;
        } else {
          this.interruptStreak = 0;
          // Keep tracking the echo floor slowly during quiet-ish stretches too,
          // in case playback volume drifts mid-sentence.
          this.echoFloor = this.echoFloor * 0.98 + rms * 0.02;
        }

        const framesNeeded = this.options.interruptMinFrames ?? 2;
        if (this.interruptStreak >= framesNeeded) {
          console.log(
            `[VAD] Barge-in confirmed. RMS ${rms.toFixed(4)} vs echo floor ${this.echoFloor.toFixed(4)} (x${(this.options.interruptMultiplier ?? 2.2).toFixed(1)})`
          );
          this.interruptStreak = 0;
          if (this.options.onVoiceInterrupt) {
            this.options.onVoiceInterrupt();
          }
          // Immediately start capturing the user's utterance from this chunk.
          this.pcmBuffers = [chunk];
          this.totalSamples = chunk.length;
          this.preRollBuffers = [];
          this.hasSpoken = true;
          if (this.options.onSpeechStart) {
            this.options.onSpeechStart();
          }
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        }
        return;
      }

      // --- Bot is silent: normal voice activity detection, with the speech
      // threshold anchored to the measured room-noise floor rather than a
      // single fixed number that may be wrong for a noisy mandi or a quiet room.
      const normalThreshold = Math.max(this.options.speechThreshold || 0.003, this.ambientNoise * 2.5);

      // Twice-a-second debug readout: if you say something and the "rms"
      // number below never gets anywhere close to "threshold", the mic
      // input itself is too quiet for this device/browser and the
      // threshold needs lowering further (or the input gain needs raising
      // at the OS level) — this is not a code bug at that point, it's a
      // hardware/gain calibration issue specific to your mic.
      if (now - this.lastDebugLogAt > 500) {
        this.lastDebugLogAt = now;
        console.log(
          `[VAD] rms=${rms.toFixed(4)} threshold=${normalThreshold.toFixed(4)} ambientFloor=${this.ambientNoise.toFixed(4)} hasSpoken=${this.hasSpoken}`
        );
      }

      if (rms > normalThreshold) {
        if (!this.hasSpoken) {
          this.hasSpoken = true;
          // Prepend pre-roll buffer (approx 350ms of audio before threshold was hit)
          this.pcmBuffers = [...this.preRollBuffers, chunk];
          this.totalSamples = this.pcmBuffers.reduce((acc, c) => acc + c.length, 0);
          this.preRollBuffers = [];

          if (this.options.onSpeechStart) {
            this.options.onSpeechStart();
          }
        } else {
          // User continues speaking
          this.pcmBuffers.push(chunk);
          this.totalSamples += chunk.length;
        }

        // Reset silence timer while speech is active
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      } else {
        // Below speech threshold
        if (this.hasSpoken) {
          // User has spoken and is now pausing/silent
          this.pcmBuffers.push(chunk);
          this.totalSamples += chunk.length;

          if (!this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              if (this.options.onSilenceTimeout) {
                this.options.onSilenceTimeout();
              }
            }, this.options.silenceDurationMs || 650);
          }
        } else {
          // Speech has not started yet; maintain a rolling 3-chunk pre-roll buffer (~384ms)
          this.preRollBuffers.push(chunk);
          if (this.preRollBuffers.length > 3) {
            this.preRollBuffers.shift();
          }
          // Also use this quiet stretch to keep the ambient noise estimate fresh.
          this.ambientNoise = this.ambientNoise * 0.97 + rms * 0.03;
        }
      }
    };

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.resetBuffer();
    }
  }

  resetBuffer(): void {
    this.pcmBuffers = [];
    this.preRollBuffers = [];
    this.totalSamples = 0;
    this.hasSpoken = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Extracts WAV audio of the user's utterance and resets the buffer,
   * keeping the audio stream alive for instant turn-taking.
   */
  extractWavAndReset(): Blob | null {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.totalSamples === 0 || this.pcmBuffers.length === 0) {
      this.resetBuffer();
      return null;
    }

    const mergedPcm = new Float32Array(this.totalSamples);
    let offset = 0;
    for (const chunk of this.pcmBuffers) {
      mergedPcm.set(chunk, offset);
      offset += chunk.length;
    }

    this.resetBuffer();
    return encodeWav(mergedPcm, this.options.sampleRate || 16000);
  }

  stop(): Blob | null {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    this.isRecording = false;

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {}
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.mediaStream = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    if (this.totalSamples === 0 || this.pcmBuffers.length === 0) {
      return null;
    }

    const mergedPcm = new Float32Array(this.totalSamples);
    let offset = 0;
    for (const chunk of this.pcmBuffers) {
      mergedPcm.set(chunk, offset);
      offset += chunk.length;
    }

    this.pcmBuffers = [];
    this.preRollBuffers = [];
    this.totalSamples = 0;
    this.hasSpoken = false;

    return encodeWav(mergedPcm, this.options.sampleRate || 16000);
  }

  getHasSpoken(): boolean {
    return this.hasSpoken;
  }
}

/**
 * Encodes Float32Array PCM samples into standard 16-bit Mono WAV Blob
 */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk (format)
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // 16 for PCM
  view.setUint16(20, 1, true); // Audio format: 1 = PCM
  view.setUint16(22, 1, true); // Channels: 1 = Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate: sampleRate * 1 * 2
  view.setUint16(32, 2, true); // Block align: 1 * 2
  view.setUint16(34, 16, true); // Bits per sample: 16

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit signed PCM samples
  let byteOffset = 44;
  for (let i = 0; i < samples.length; i++, byteOffset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(byteOffset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Transcribe WAV Blob using backend STT API
 */
export async function transcribeWavWithApi(
  wavBlob: Blob,
  lang: string = 'hi'
): Promise<{ success: boolean; transcript: string; error?: string }> {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE || '/api';
    const response = await fetch(`${baseUrl}/stt?lang=${encodeURIComponent(lang)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/wav',
      },
      body: wavBlob,
    });

    if (!response.ok) {
      return { success: false, transcript: '', error: `Server error: ${response.status}` };
    }

    const data = await response.json();
    return {
      success: data.success ?? true,
      transcript: data.transcript || '',
      error: data.error,
    };
  } catch (err: any) {
    return {
      success: false,
      transcript: '',
      error: err?.message || 'Network error connecting to STT server',
    };
  }
}


// --- WEB SPEECH API (Native Browser STT) ---
// Kept as an optional fallback path. Not used by default because browser
// support/accuracy for Hindi & Marathi via this API is inconsistent across
// devices, but it's here (and free, zero-latency) if you want to wire it in
// as an instant first guess while the server-based transcription confirms.
export class SpeechRecognitionService {
  private recognition: any = null;
  private isRecording = false;
  private onResult: (text: string, isFinal: boolean) => void;
  private onEnd: () => void;
  private onError: (err: any) => void;

  constructor(
    onResult: (text: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError: (err: any) => void
  ) {
    this.onResult = onResult;
    this.onEnd = onEnd;
    this.onError = onError;
  }

  start(lang: string = 'hi-IN') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.onError(new Error('SpeechRecognition not supported in this browser.'));
      return;
    }

    if (this.recognition && this.isRecording) {
      this.stop();
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    // Map internal lang to BCP-47
    const langMap: Record<string, string> = {
      hi: 'hi-IN',
      mr: 'mr-IN',
      en: 'en-IN',
    };
    this.recognition.lang = langMap[lang] || lang;
    this.recognition.maxAlternatives = 1;

    let finalTranscript = '';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          this.onResult(event.results[i][0].transcript, true);
        } else {
          interimTranscript += event.results[i][0].transcript;
          this.onResult(interimTranscript, false);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return; // Ignore simple silence timeouts
      this.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.onEnd();
    };

    try {
      this.recognition.start();
      this.isRecording = true;
    } catch (e) {
      this.onError(e);
    }
  }

  stop() {
    if (this.recognition && this.isRecording) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isRecording = false;
    }
  }

  abort() {
    if (this.recognition && this.isRecording) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.isRecording = false;
    }
  }
}
