// Web Audio API recorder that encodes 16kHz 16-bit Mono WAV and calls /api/stt

export interface AudioRecorderOptions {
  sampleRate?: number;
  onVolume?: (volume: number) => void;
  onSpeechStart?: () => void;
  onSilenceTimeout?: () => void;
  onVoiceInterrupt?: () => void;
  isBotSpeaking?: () => boolean;
  silenceDurationMs?: number;
  speechThreshold?: number;
  botSpeakingThreshold?: number;
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
  private ambientNoise = 0.005;
  private options: AudioRecorderOptions;

  constructor(options: AudioRecorderOptions = {}) {
    this.options = {
      sampleRate: 16000,
      silenceDurationMs: 1100,
      speechThreshold: 0.010,
      botSpeakingThreshold: 0.035,
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
    this.ambientNoise = 0.005;

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

      // Adaptively track ambient noise floor when quiet
      if (!this.hasSpoken && !botIsSpeaking && rms < 0.02) {
        this.ambientNoise = this.ambientNoise * 0.92 + rms * 0.08;
      }

      // Dynamic thresholds
      const normalThreshold = Math.max(
        this.options.speechThreshold || 0.010,
        Math.min(0.025, this.ambientNoise * 2.2)
      );
      const interruptThreshold = Math.max(
        this.options.botSpeakingThreshold || 0.035,
        this.ambientNoise * 3.2
      );

      // 1. BARGE-IN: If bot is speaking and user speaks any word, immediately stop bot!
      if (botIsSpeaking && rms > interruptThreshold) {
        if (this.options.onVoiceInterrupt) {
          this.options.onVoiceInterrupt();
        }
        // Immediately start capturing user utterance from this chunk
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
        return;
      }

      // 2. NORMAL VOICE ACTIVITY DETECTION
      if (!botIsSpeaking) {
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
              }, this.options.silenceDurationMs || 1100);
            }
          } else {
            // Speech has not started yet; maintain a rolling 3-chunk pre-roll buffer (~384ms)
            this.preRollBuffers.push(chunk);
            if (this.preRollBuffers.length > 3) {
              this.preRollBuffers.shift();
            }
          }
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
    const response = await fetch(`/api/stt?lang=${encodeURIComponent(lang)}`, {
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
