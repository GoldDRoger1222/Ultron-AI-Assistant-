import { VoiceState, OrbState, VoiceMood, TaskUrgency, ProsodyParameters } from '../types/jarvis';
import { MobileBridge, playWakeChime, playEndpointChime, playSuccessChime } from './mobileBridge';

// Helper to encode raw PCM Float32 audio samples into standard 16-bit PCM WAV Blob
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16)

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write PCM audio samples (float to 16-bit int)
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Prosody and Emotional Acoustic Tuning Matrices
export const MOOD_PROSODY_MATRIX: Record<VoiceMood, { baseRate: number; basePitch: number; baseVolume: number }> = {
  neutral: { baseRate: 1.02, basePitch: 1.00, baseVolume: 1.0 },
  calm: { baseRate: 0.94, basePitch: 0.93, baseVolume: 0.95 },
  authoritative: { baseRate: 1.08, basePitch: 0.94, baseVolume: 1.0 },
  excited: { baseRate: 1.14, basePitch: 1.15, baseVolume: 1.0 },
  empathetic: { baseRate: 0.96, basePitch: 1.04, baseVolume: 0.95 },
  analytical: { baseRate: 1.06, basePitch: 0.96, baseVolume: 1.0 },
  serious: { baseRate: 1.04, basePitch: 0.90, baseVolume: 1.0 },
  friendly: { baseRate: 1.03, basePitch: 1.06, baseVolume: 1.0 },
  cybernetic: { baseRate: 1.10, basePitch: 0.93, baseVolume: 1.0 },
};

export const URGENCY_MULTIPLIERS: Record<TaskUrgency, { rateMult: number; pitchMult: number; volumeMult: number }> = {
  low: { rateMult: 0.95, pitchMult: 0.98, volumeMult: 0.95 },
  normal: { rateMult: 1.00, pitchMult: 1.00, volumeMult: 1.00 },
  medium: { rateMult: 1.06, pitchMult: 1.03, volumeMult: 1.00 },
  high: { rateMult: 1.14, pitchMult: 1.08, volumeMult: 1.00 },
  critical: { rateMult: 1.22, pitchMult: 1.12, volumeMult: 1.00 },
  emergency: { rateMult: 1.28, pitchMult: 1.16, volumeMult: 1.00 },
};

export interface SpeakOptions {
  deduplicate?: boolean;
  interruptCurrent?: boolean;
  mood?: VoiceMood;
  urgency?: TaskUrgency;
  rate?: number;
  pitch?: number;
  volume?: number;
  prosody?: Partial<ProsodyParameters>;
}

export interface QueuedSpeechSegment {
  id: string;
  text: string;
  originalText?: string;
  fragmentIndex?: number;
  totalFragments?: number;
  onEnd?: () => void;
  timestamp: number;
  hash: string;
  prosody?: {
    rate: number;
    pitch: number;
    volume: number;
    mood: VoiceMood;
    urgency: TaskUrgency;
  };
}

// Phonetic Banglish client-side normalizer for WebSpeech misheard audio
function cleanAndNormalizeBanglishText(raw: string): string {
  let text = raw.trim();
  const replacements: [RegExp, string][] = [
    // Audio comprehension / Mishearing phrases
    [/\b(?:o\s+)?voice\s+input\s+ta\s+bhujhe\s+nah?\b/gi, 'voice input bujhte parcho na'],
    [/\b(?:ami\s+)?boli\s+ekta\s+(?:o\s+)?shune\s+arekta\b/gi, 'voice input shunte parcho na'],
    [/\bbujhte\s+paroni\b/gi, 'bujhte paro ni'],
    [/\bshunte\s+paroni\b/gi, 'shunte paro ni'],

    // Greetings & Common Inquiries
    [/\b(?:camera\s+show|come\s+on\s+asho|to\s+me\s+come\s+on\s+a\s+show|to\s+me\s+can\s+make\s+sure|kemon\s+asho|kemon\s+aso|kamn\s+aso|kmn\s+aso)\b/gi, 'tumi kemon acho'],
    [/\b(?:to\s+make|to\s+me\s+care|to\s+make\s+ke|tumi\s+k|tumi\s+key)\b/gi, 'tumi ke'],
    [/\b(?:ki\s+korsos|ki\s+korchis|key\s+course\s+show|kick\s+or\s+so|key\s+korco|ki\s+koro)\b/gi, 'ki korcho'],
    [/\b(?:key\s+obosta|ki\s+obstha|ki\s+obosta|key\s+obostha)\b/gi, 'ki obostha'],
    [/\b(?:ki\s+korte\s+paro|key\s+coat\s+the\s+par\s+row|ki\s+korte\s+parba|ki\s+parba)\b/gi, 'ki korte paro'],
    [/\b(?:shon\s+ultron|sun\s+ultron|shono\s+altron|suno\s+ultron)\b/gi, 'shono ultron'],
    [/\b(?:kichu\s+bolo|key\s+to\s+bolo|kisu\s+bolo|kisu\s+bol|kisu\s+kotha\s+bolo)\b/gi, 'kichu bolo'],
    [/\b(?:weather\s+kemon|abohawa\s+kemon|whether\s+kemon|ajker\s+weather|ajk\s+weather)\b/gi, 'ajker weather kemon'],
    [/\b(?:news\s+ki|ajker\s+news|khobor\s+ki|ajker\s+khobor)\b/gi, 'ajker khobor ki'],
    [/\b(?:kothai\s+aso|kothai\s+acho|tumi\s+kothai|tumi\s+koi)\b/gi, 'kothay acho'],
    [/\b(?:valoo|valo|thik\s+ase|tik\s+ache|tick\s+ase)\b/gi, 'thik ache'],

    // Media & Automation
    [/\byoutube\s+(?:a|e)\s+(?:gun|gan|can)\s+(?:chalo|chalao|bajao|play)\b/gi, 'youtube e gan chalao'],
    [/\byoutube\s+(?:a|e)\s+gun\b/gi, 'youtube e gan'],
    [/\b(?:gun|can)\s+(?:chalao|bajao|chalo|play)\b/gi, 'gan chalao'],
    [/\b(?:torches?\s+alla|torch\s+allow|light\s+allow|torch\s+chalao|light\s+jalao|torch\s+jalo)\b/gi, 'turn on flashlight'],
    [/\b(?:torch\s+bondho|light\s+bondho|torch\s+off|light\s+off|light\s+of|torch\s+of)\b/gi, 'turn off flashlight'],
    [/\b(?:mom\s+key\s+phone\s+call|ammo\s+key\s+phone|ammu\s+k\s+phone|abbu\s+ke\s+phone)\b/gi, 'ammu ke phone koro'],
    [/\b(?:open\s+whats\s*app|whatsapp\s+message|watsapp|whats\s*up)\b/gi, 'open whatsapp'],

    // Air Gesture & Spatial Hand Control
    [/\b(?:hawa\s+(?:a|te|e)\s+hat\s+(?:naraile|narao|narale)|hat\s+naraile\s+kaj\s+(?:kora|korba)|air\s+gesture\s+(?:koi|chalu|on|koro|kaj\s+kore\s+na))\b/gi, 'turn on air gesture hand control'],
    [/\b(?:hat\s+diye\s+control|hat\s+dekiye\s+control|air\s+hand\s+gesture|air\s+motion)\b/gi, 'turn on air gesture hand control'],

    // Projects, Coding & 3D Schematics
    [/\b(?:a\s+mar\s+website|amr\s+website|amar\s+websit)\b/gi, 'amar website'],
    [/\b(?:a\s+mar\s+project|amr\s+project|amar\s+projct)\b/gi, 'amar project'],
    [/\b(?:actor|acta|ekta)\s+website\s+(?:now|bun\s+now|banaw|banao|banau)\b/gi, 'ekta website banao'],
    [/\b(?:actor|acta|ekta)\s+project\s+(?:banaw|banao|make)\b/gi, 'ekta project banao'],
    [/\b(?:iron\s+man\s+armor|iron\s+man\s+reactor|arc\s+reactor|arc\s+react)\b/gi, 'Build 3D holographic Iron Man Arc Reactor'],
    [/\b(?:drone\s+banao|drone\s+banaw|3d\s+drone|quantum\s+drone)\b/gi, 'Build 3D Quantum Drone'],
    [/\b(?:smart\s+home|smart\s+house|bari\s+banao|3d\s+house)\b/gi, 'Build 3D Smart Cybernetic House'],
    [/\b(?:explode\s+view|explode\s+parts|disassemble\s+3d)\b/gi, 'Explode 3D hologram components'],
    [/\b(?:ki\s+ki\s+lagbe|malikana\s+list|materials\s+list|construction\s+guide|kivabe\s+banabo)\b/gi, 'Show Bill of Materials and Construction Guide'],

    // Bengali Verb Fixes
    [/\bcore\s+dao\b/gi, 'kore dao'],
    [/\bcore\s+de\b/gi, 'kore de'],
    [/\bbhujsos\b/gi, 'bujhsos'],
    [/\bbujhesos\b/gi, 'bujhsos'],
    [/\baitaw\b/gi, 'etaw'],
    [/\boitao\b/gi, 'oitao'],
    [/\bthamo\b/gi, 'stop'],
    [/\bchup\s+koro\b/gi, 'stop'],
    [/\bjarvis\s+stop\b/gi, 'stop'],
    [/\bultron\s+stop\b/gi, 'stop'],
  ];

  for (const [re, rep] of replacements) {
    text = text.replace(re, rep);
  }
  return text;
}

export interface WakeWordResult {
  hasWakeWord: boolean;
  commandText: string;
  isWakeWordOnly: boolean;
}

// Comprehensive English, Banglish & Bengali Wake Word Extractor for ULTRON & JARVIS
export function extractWakeWordAndCommand(raw: string): WakeWordResult {
  const text = raw.trim();

  // Pattern A: Wake word followed by command (e.g. "Heyy ULTRON analyze login error" or "হে আলট্রন প্রজেক্ট চেক করো")
  const wakeWordWithCommandPatterns = [
    /^(?:heyy+|hey+|hi+|hello+|ok+|okay|oi+|oy+|yo+|ey+|ay+|hay+|ae+|ohe)\s*(?:,\s*)?(?:ultron+|altron|oltron|jarvis+|jarves|jarvish|jarbis|jarvice|dharves|service)[\s,.:;!-]+(.+)$/i,
    /^(?:হে+|এই+|হেই+|শোনো+|বলো+|ওহে+|হ্যালো+)\s*(?:,\s*)?(?:আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস|জারভিস|জারবিস)[\s,.:;!-]+(.+)$/i,
    /^(?:ultron+|altron|oltron|jarvis+|jarves|jarvish|jarbis|jarvice|আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস|জারভিস|জারবিস)[\s,.:;!-]+(.+)$/i,
    // Wake word followed by space and command without punctuation
    /^(?:heyy+|hey+|hi+|hello+|ok+|okay|oi+|oy+|yo+|ey+|ay+|hay+|ae+|ohe)\s+(?:ultron+|altron|oltron|jarvis+|jarves|jarvish|jarbis|jarvice|dharves|service)\s+(.+)$/i,
    /^(?:হে+|এই+|হেই+|শোনো+|বলো+|ওহে+|হ্যালো+)\s+(?:আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস|জারভিস|জারবিস)\s+(.+)$/i,
    /^(?:ultron+|altron|oltron|jarvis+|jarves|jarvish|jarbis|jarvice|আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস|জারভিস|জারবিস)\s+(.+)$/i,
  ];

  for (const pattern of wakeWordWithCommandPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const command = match[1].trim();
      if (command.length > 0) {
        return {
          hasWakeWord: true,
          commandText: command,
          isWakeWordOnly: false,
        };
      }
    }
  }

  // Pattern B: Wake word alone (e.g. "Heyy ULTRON" or "হে আলট্রন")
  const wakeWordAlonePatterns = [
    /^(?:heyy+|hey+|hi+|hello+|ok+|okay|oi+|oy+|yo+|ey+|ay+|hay+|ae+|ohe)\s*(?:,\s*)?(?:ultron+|altron|oltron|jarvis+|jarves|jarvish|jarbis|jarvice|dharves|service)[\s,.:;!-]*$/i,
    /^(?:হে+|এই+|হেই+|শোনো+|বলো+|ওহে+|হ্যালো+)\s*(?:,\s*)?(?:আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস|jarvis|ultron|জারভিস|জারবিস)[\s,.:;!-]*$/i,
    /^(?:ultron+|altron|oltron|jarvis+|jarves|jarvish|jarbis|jarvice|আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস|জারভিস|জারবিস)[\s,.:;!-]*$/i,
  ];

  for (const pattern of wakeWordAlonePatterns) {
    if (pattern.test(text)) {
      return {
        hasWakeWord: true,
        commandText: '',
        isWakeWordOnly: true,
      };
    }
  }

  return {
    hasWakeWord: false,
    commandText: text,
    isWakeWordOnly: false,
  };
}

export class VoiceEngine {
  private static instance: VoiceEngine;
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private isExecutingCommand = false; // ATOMIC COMMAND LOCK
  private isConversationMode = false;
  private isWakeWordMode = true; // Always-On Hey Jarvis / ULTRON Mode
  private turnCount = 0;
  private isBargeInMonitoring = false;
  private bargeInThresholdCounter = 0;
  private speechStartTime = 0;
  private speechEndTime = 0;
  private lastSpokenSpeechText = ''; // ACOUSTIC ECHO CANCELLATION BUFFER
  private lastWakeWordTime = 0;
  private lastVoiceActivityTime = 0;
  private ttsKeepAliveTimer: any = null;
  private currentSpeechSessionId = 0;
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  
  // Prosody & Emotional Voice Synthesis State
  private globalMood: VoiceMood = 'neutral';
  private globalUrgency: TaskUrgency = 'normal';
  private customProsodyOverrides: Partial<ProsodyParameters> = {};

  // Multi-Part Distinct Segment Queue & Repetition Prevention Buffer
  private speechQueue: QueuedSpeechSegment[] = [];
  private isProcessingQueue = false;
  private spokenSegmentsHistory: Map<string, number> = new Map(); // normalized hash -> timestamp
  private readonly duplicateRetentionWindowMs = 60000; // 60s duplicate filter window
  private readonly maxSpokenHistorySize = 250;
  
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private masterOutputGain: number = 2.2; // 2.2x High-Volume Boost
  private noiseFloor: number = 0.02; // Adaptive baseline room noise
  private speechOnsetFrames: number = 0;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private pcmChunks: Float32Array[] = [];
  private totalSamples = 0;

  private mediaRecorder: MediaRecorder | null = null;
  private recordedBlobChunks: Blob[] = [];

  private audioLevel = 0;
  private animationFrameId: number | null = null;

  private voiceState: VoiceState = {
    state: 'WAKE_WORD_STANDBY',
    isConversationMode: false,
    isWakeWordActive: true,
    turnCount: 0,
    bargeInDetected: false,
  };
  private stateChangeListeners: ((state: VoiceState, orbState: OrbState) => void)[] = [];
  private silenceTimer: any = null;
  private fastFinalTimer: any = null;
  private recordingTimer: any = null;
  private recordingSeconds = 0;
  private speechDetected = false;
  private currentTranscript = '';
  private language: 'en-US' | 'bn-BD' = 'en-US';
  private finalCommandHandler: ((transcript: string) => void) | null = null;

  private cachedVoices: SpeechSynthesisVoice[] = [];

  private constructor() {
    this.loadSavedSettings();
    this.initSpeechRecognition();
    this.initVoiceEngineAudio();
  }

  private initVoiceEngineAudio() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  /**
   * Explicitly unlocks audio on user gestures (tap/click) for Mobile browsers (iOS Safari, Android Chrome)
   */
  public async unlockAudio(): Promise<void> {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
    } catch {
      // Non-fatal
    }
  }

  /**
   * Synthesizes an audible harmonic acknowledgment pulse directly through Web Audio destination
   */
  private playAcousticSynthesisPulse(frequency = 587.33, duration = 0.12) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }
      if (!this.audioContext) return;
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + duration);

      gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    } catch {
      // AudioContext fallback
    }
  }

  private loadSavedSettings() {
    try {
      const saved = localStorage.getItem('jarvis_wakeword_active');
      if (saved !== null) {
        this.isWakeWordMode = saved === 'true';
      } else {
        this.isWakeWordMode = true;
        localStorage.setItem('jarvis_wakeword_active', 'true');
      }
      this.voiceState.isWakeWordActive = this.isWakeWordMode;

      const savedLang = localStorage.getItem('jarvis_language');
      if (savedLang === 'bn-BD' || savedLang === 'en-US') {
        this.language = savedLang;
      }
    } catch {
      this.isWakeWordMode = true;
    }
  }

  public static getInstance(): VoiceEngine {
    if (!VoiceEngine.instance) {
      VoiceEngine.instance = new VoiceEngine();
    }
    return VoiceEngine.instance;
  }

  public setProcessing(processing: boolean) {
    this.isExecutingCommand = processing;
    if (processing) {
      this.isListening = false;
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch {
          // ignore
        }
      }
    } else {
      // When done processing, if wake word mode is on and not speaking, return to Wake Word Standby
      if (this.isWakeWordMode && !this.isSpeaking && !this.isConversationMode) {
        this.startWakeWordStandby(this.finalCommandHandler || undefined);
      }
    }
  }

  public isWakeWordEnabled(): boolean {
    return this.isWakeWordMode;
  }

  public setWakeWordEnabled(enabled: boolean, onFinalCommand?: (transcript: string) => void) {
    this.isWakeWordMode = enabled;
    try {
      localStorage.setItem('jarvis_wakeword_active', enabled ? 'true' : 'false');
    } catch {
      // ignore
    }
    this.updateState({ isWakeWordActive: enabled });

    if (enabled) {
      MobileBridge.getInstance().startBackgroundKeepAlive();
      this.startWakeWordStandby(onFinalCommand);
    } else {
      if (this.voiceState.state === 'WAKE_WORD_STANDBY') {
        this.stopListening();
        this.updateState({ state: 'IDLE', isWakeWordActive: false });
      }
    }
  }

  public toggleWakeWordMode(onFinalCommand?: (transcript: string) => void): boolean {
    const next = !this.isWakeWordMode;
    this.setWakeWordEnabled(next, onFinalCommand);
    return next;
  }

  private initSpeechRecognition() {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
        this.recognition.lang = this.language;

        this.recognition.onstart = () => {
          if (this.isSpeaking || this.isExecutingCommand) {
            try {
              this.recognition.abort();
              this.recognition.stop();
            } catch {}
            return;
          }
          if (this.isListening) {
            this.updateState({ state: 'LISTENING', errorMessage: undefined });
          } else if (this.isWakeWordMode) {
            this.updateState({ state: 'WAKE_WORD_STANDBY', isWakeWordActive: true });
          }
        };

        this.recognition.onresult = (event: any) => {
          // STRICT ATOMIC LOCK: If ULTRON is speaking or executing, or within 400ms of speech output, DROP ALL INPUT!
          if (this.isExecutingCommand || this.isSpeaking || Date.now() - this.speechEndTime < 400) {
            return;
          }

          let interim = '';
          let final = '';
          let hasFinalChunk = false;

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            let bestTranscript = item[0].transcript;

            // Multi-alternative evaluation: check if alternatives contain higher-fidelity matches
            if (item.length > 1) {
              for (let altIdx = 1; altIdx < item.length; altIdx++) {
                const altText = item[altIdx].transcript;
                if (/[\u0980-\u09FF]/.test(altText) || /ultron|jarvis|গান|বানাও|website|project/i.test(altText)) {
                  bestTranscript = altText;
                  break;
                }
              }
            }

            if (item.isFinal) {
              final += bestTranscript;
              hasFinalChunk = true;
            } else {
              interim += bestTranscript;
            }
          }

          const rawCombined = (final || interim || '').trim();
          if (!rawCombined) return;

          const normalized = cleanAndNormalizeBanglishText(rawCombined);
          const lowerNorm = normalized.toLowerCase();

          // Echo suppression immediately after speech output ends (within 900ms)
          if (Date.now() - this.speechEndTime < 900 && this.lastSpokenSpeechText.includes(lowerNorm)) {
            return;
          }

          // -------------------------------------------------------------
          // 2. WAKE WORD DETECTION (Always-On "Hey ULTRON" / "Hey Jarvis" Mode)
          // -------------------------------------------------------------
          const wakeResult = extractWakeWordAndCommand(normalized);
          const now = Date.now();

          // If wake word was detected and not in active execution
          if (wakeResult.hasWakeWord && now - this.lastWakeWordTime > 1500) {
            this.lastWakeWordTime = now;
            playWakeChime();
            MobileBridge.getInstance().vibrate([100, 50, 100, 50, 150]);

            // Case A: Wake word + Direct Command in one breath ("Hey ULTRON, YouTube e gan chalao")
            if (!wakeResult.isWakeWordOnly && wakeResult.commandText) {
              this.isListening = false;
              this.isExecutingCommand = true;
              this.updateState({
                state: 'PROCESSING_STT',
                wakeWordTriggered: true,
                rawTranscript: normalized,
                normalizedTranscript: wakeResult.commandText,
              });

              if (this.recognition) {
                try {
                  this.recognition.stop();
                } catch {}
              }

              if (this.finalCommandHandler) {
                this.finalCommandHandler(wakeResult.commandText);
              }
              return;
            }

            // Case B: Wake word alone ("Heyy ULTRON" / "হে আলট্রন") -> Wake up & listen for follow-up
            if (wakeResult.isWakeWordOnly) {
              this.isListening = true;
              this.speechDetected = false;
              this.lastVoiceActivityTime = Date.now();
              this.currentTranscript = '';
              this.updateState({
                state: 'WAKE',
                wakeWordTriggered: true,
                rawTranscript: 'Heyy ULTRON...',
                normalizedTranscript: 'ULTRON is awake and listening...',
              });

              // Play natural wake voice prompt or chime, then capture command
              const isBengali = this.language.startsWith('bn');
              const wakePrompt = isBengali ? 'বলুন, আলট্রন শুনছে।' : 'ULTRON is online. I am listening.';
              this.speak(wakePrompt, () => {
                this.startListening(this.finalCommandHandler || undefined);
              });
              return;
            }
          }

          // -------------------------------------------------------------
          // 3. ACTIVE COMMAND CAPTURE (When in LISTENING mode)
          // -------------------------------------------------------------
          if (this.isListening) {
            this.speechDetected = true;
            this.lastVoiceActivityTime = Date.now();
            this.currentTranscript = normalized;
            this.updateState({
              state: 'LISTENING',
              rawTranscript: normalized,
              normalizedTranscript: normalized,
              bargeInDetected: false,
            });

            // Instant voice emergency cancellation keywords
            const lower = normalized.toLowerCase().trim();
            if (
              lower === 'stop' ||
              lower === 'cancel' ||
              lower === 'wait' ||
              lower === 'jarvis stop' ||
              lower === 'ultron stop' ||
              lower === 'halt' ||
              lower === 'exit conversation' ||
              lower === 'end conversation' ||
              lower === 'থামো' ||
              lower === 'বন্ধ করো' ||
              lower === 'কথা বন্ধ করো'
            ) {
              if (lower.includes('exit') || lower.includes('end') || lower.includes('বন্ধ')) {
                this.endConversation();
              } else {
                this.interrupt();
              }
              return;
            }

            // Automatic Fast Endpoint Submission on finalized speech chunk
            if (hasFinalChunk && normalized.length > 2 && !wakeResult.isWakeWordOnly) {
              this.scheduleFastFinalSubmit(normalized);
            } else {
              // Smart VAD Silence Timer (1.35s after user finishes speaking - NO MANUAL TAP NEEDED!)
              this.resetSilenceTimer(normalized);
            }
          }
        };

        this.recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            // Benign silence timeout in continuous mode; allow onend to restart
            return;
          }
          console.warn('Speech recognition status/warning:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            this.updateState({
              micPermission: 'denied',
              errorMessage:
                'Microphone access blocked. Allow mic in browser (ব্রাউজারে মাইক্রোফোন allow করুন) or use Gemini Audio recording.',
            });
          }
        };

        this.recognition.onend = () => {
          // If ULTRON is speaking or executing command, NEVER restart recognition
          if (this.isSpeaking || this.isExecutingCommand) {
            return;
          }

          // Auto-restart recognition if in Active Listening, Conversation Mode, OR Wake-Word Standby
          const shouldKeepAlive =
            this.isListening ||
            this.isConversationMode ||
            (this.isWakeWordMode && !this.isExecutingCommand && !this.isSpeaking);

          if (shouldKeepAlive && !this.voiceState.isTranscribing) {
            try {
              if (this.recognition) {
                this.recognition.start();
              }
            } catch {
              // Ignore restart collisions
            }
          }
        };
      }
    } catch (e) {
      console.warn('Web Speech API not directly available in this environment, using Gemini Multimodal Audio:', e);
    }
  }

  public setLanguage(lang: 'en-US' | 'bn-BD') {
    this.language = lang;
    try {
      localStorage.setItem('jarvis_language', lang);
    } catch {}
    if (this.recognition) {
      this.recognition.lang = lang;
      if (this.isListening || this.isWakeWordMode) {
        try {
          this.recognition.stop();
        } catch {}
      }
    }
  }

  public getLanguage(): 'en-US' | 'bn-BD' {
    return this.language;
  }

  public onStateChange(callback: (state: VoiceState, orbState: OrbState) => void) {
    this.stateChangeListeners.push(callback);
    callback(this.voiceState, this.mapVoiceToOrbState(this.voiceState.state));
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter((cb) => cb !== callback);
    };
  }

  private mapVoiceToOrbState(state: VoiceState['state']): OrbState {
    switch (state) {
      case 'LISTENING':
      case 'STARTING_MIC':
        return 'LISTENING';
      case 'PROCESSING_STT':
      case 'THINKING':
        return 'THINKING';
      case 'TOOL_EXECUTION':
        return 'EXECUTING';
      case 'SPEAKING':
      case 'PREPARING_TTS':
        return 'SPEAKING';
      case 'ERROR':
        return 'ERROR';
      case 'WAKE_WORD_STANDBY':
      default:
        return 'IDLE';
    }
  }

  public updateState(partial: Partial<VoiceState>) {
    this.voiceState = { ...this.voiceState, ...partial };
    const orb = this.mapVoiceToOrbState(this.voiceState.state);
    this.stateChangeListeners.forEach((cb) => cb(this.voiceState, orb));
  }

  /**
   * Starts Always-On "Hey Jarvis" Standby Listening in the background
   */
  public async startWakeWordStandby(onFinalCommand?: (transcript: string) => void): Promise<boolean> {
    if (onFinalCommand) {
      this.finalCommandHandler = onFinalCommand;
    }
    this.isListening = false;
    this.isExecutingCommand = false;
    this.isSpeaking = false;
    this.isWakeWordMode = true;

    // Start background keep-alive loop to prevent mobile browser suspension
    MobileBridge.getInstance().startBackgroundKeepAlive();

    this.updateState({
      state: 'WAKE_WORD_STANDBY',
      isWakeWordActive: true,
      rawTranscript: undefined,
      normalizedTranscript: undefined,
      errorMessage: undefined,
    });

    if (this.recognition) {
      try {
        this.recognition.lang = this.language;
        this.recognition.start();
        return true;
      } catch {
        // Recognition already active
        return true;
      }
    }
    return false;
  }

  public async startListening(onFinalCommand?: (transcript: string) => void): Promise<boolean> {
    if (this.isSpeaking) {
      this.interrupt();
    }

    if (onFinalCommand) {
      this.finalCommandHandler = onFinalCommand;
    }

    this.currentTranscript = '';
    this.speechDetected = false;
    this.pcmChunks = [];
    this.totalSamples = 0;
    this.recordedBlobChunks = [];
    this.recordingSeconds = 0;

    try {
      this.updateState({
        state: 'STARTING_MIC',
        errorMessage: undefined,
        rawTranscript: undefined,
        isTranscribing: false,
        audioLevel: 0,
      });

      // 1. Acquire Real Microphone MediaStream
      const streamReady = await this.initAudioStream();
      if (!streamReady) {
        return false;
      }

      // 2. Start Web Audio PCM recorder & MediaRecorder
      this.startPCMRecording();
      this.startMediaRecorder();

      // 3. Start Browser Web Speech in parallel
      if (this.recognition) {
        try {
          this.recognition.lang = this.language;
          this.recognition.start();
        } catch {
          // Handled
        }
      }

      this.isListening = true;
      const reqId = `VOICE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      this.updateState({
        state: 'LISTENING',
        requestId: reqId,
        micPermission: 'granted',
      });

      // Track recording elapsed time
      if (this.recordingTimer) clearInterval(this.recordingTimer);
      this.recordingTimer = setInterval(() => {
        this.recordingSeconds++;
      }, 1000);

      return true;
    } catch (err: any) {
      const isPermError =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.name === 'SecurityError' ||
        err?.message?.includes('denied') ||
        err?.message?.includes('Permission');

      console.warn('Voice listening status:', isPermError ? 'Microphone permission denied or blocked' : err?.message || err);

      this.updateState({
        state: 'ERROR',
        micPermission: isPermError ? 'denied' : 'unsupported',
        errorMessage: isPermError
          ? 'Microphone permission denied. Click the 🔒 lock icon or microphone icon in the browser address bar to Allow Microphone.'
          : err?.message || 'Microphone capture failed. Please check your audio input device.',
      });
      return false;
    }
  }

  private async initAudioStream(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Browser does not support navigator.mediaDevices.getUserMedia');
        this.updateState({
          state: 'ERROR',
          micPermission: 'unsupported',
          errorMessage: 'Browser does not support microphone capture.',
        });
        return false;
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx({ sampleRate: 16000 });
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // 1. Setup Master Gain & Dynamics Compressor for high-volume, distortion-free output
      if (!this.masterGainNode) {
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.gain.setValueAtTime(this.masterOutputGain, this.audioContext.currentTime);

        this.compressorNode = this.audioContext.createDynamicsCompressor();
        this.compressorNode.threshold.setValueAtTime(-18, this.audioContext.currentTime);
        this.compressorNode.knee.setValueAtTime(4, this.audioContext.currentTime);
        this.compressorNode.ratio.setValueAtTime(8, this.audioContext.currentTime);
        this.compressorNode.attack.setValueAtTime(0.002, this.audioContext.currentTime);
        this.compressorNode.release.setValueAtTime(0.15, this.audioContext.currentTime);

        this.masterGainNode.connect(this.compressorNode);
        this.compressorNode.connect(this.audioContext.destination);
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      this.trackAudioLevels();
      return true;
    } catch (err: any) {
      const isPermError =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.name === 'SecurityError' ||
        err?.message?.includes('denied') ||
        err?.message?.includes('Permission');

      console.warn('Audio stream status:', isPermError ? 'Microphone permission denied or blocked' : err?.message || err);

      this.updateState({
        state: 'ERROR',
        micPermission: isPermError ? 'denied' : 'unsupported',
        errorMessage: isPermError
          ? 'Microphone permission denied. Click the 🔒 lock icon in the browser address bar to Allow Microphone.'
          : err?.message || 'Microphone capture failed. Please check your audio input device.',
      });
      return false;
    }
  }

  public setMasterVolume(gain: number) {
    this.masterOutputGain = Math.max(0.5, Math.min(4.0, gain));
    if (this.masterGainNode && this.audioContext) {
      this.masterGainNode.gain.setValueAtTime(this.masterOutputGain, this.audioContext.currentTime);
    }
  }

  public getMasterVolume(): number {
    return this.masterOutputGain;
  }

  private startPCMRecording() {
    if (!this.audioContext || !this.mediaStream) return;
    try {
      this.pcmChunks = [];
      this.totalSamples = 0;

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      // Create ScriptProcessor for capturing raw PCM float32 buffers
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isListening) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const copy = new Float32Array(inputData.length);
        copy.set(inputData);
        this.pcmChunks.push(copy);
        this.totalSamples += copy.length;
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('ScriptProcessor PCM recording setup error:', e);
    }
  }

  private startMediaRecorder() {
    if (!this.mediaStream) return;
    try {
      this.recordedBlobChunks = [];
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav',
      ];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      if (typeof MediaRecorder !== 'undefined') {
        this.mediaRecorder = selectedMime
          ? new MediaRecorder(this.mediaStream, { mimeType: selectedMime })
          : new MediaRecorder(this.mediaStream);

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.recordedBlobChunks.push(e.data);
          }
        };

        this.mediaRecorder.start(100);
      }
    } catch (err) {
      console.warn('MediaRecorder error:', err);
    }
  }

  private resetSilenceTimer(transcript: string) {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }
    // Ultra-Responsive 1.35 seconds of silence auto-submits - ZERO MANUAL TAP NEEDED!
    this.silenceTimer = setTimeout(() => {
      if (this.isListening && transcript.trim()) {
        playEndpointChime();
        this.finishListeningAndSubmit();
      }
    }, 1350);
  }

  private scheduleFastFinalSubmit(transcript: string) {
    if (this.fastFinalTimer) {
      clearTimeout(this.fastFinalTimer);
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }
    // 500ms post-finalization auto-commit
    this.fastFinalTimer = setTimeout(() => {
      if (this.isListening && transcript.trim()) {
        playEndpointChime();
        this.finishListeningAndSubmit();
      }
    }, 500);
  }

  public async finishListeningAndSubmit() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.fastFinalTimer) {
      clearTimeout(this.fastFinalTimer);
      this.fastFinalTimer = null;
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }

    const hadWebSpeechTranscript = this.currentTranscript.trim();
    this.isListening = false;
    this.isExecutingCommand = true; // LOCK: Prevent restarting until response finishes

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }

    // Stop MediaRecorder and collect any buffered chunks
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.requestData();
        this.mediaRecorder.stop();
      } catch (err) {
        console.warn('MediaRecorder stop error:', err);
      }
    }

    // Disconnect PCM scriptProcessor
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
        this.scriptProcessor = null;
      } catch {
        // ignore
      }
    }

    // Stop and cleanup mic tracks
    this.stopAudioAnalyser();

    // 1. If WebSpeech captured speech, dispatch immediately!
    if (hadWebSpeechTranscript) {
      this.updateState({
        state: 'PROCESSING_STT',
        rawTranscript: hadWebSpeechTranscript,
        isTranscribing: false,
      });
      if (this.finalCommandHandler) {
        this.finalCommandHandler(hadWebSpeechTranscript);
      }
      return;
    }

    // 2. Multimodal Fallback: Encode captured audio to standard PCM WAV or WebM & send to Gemini AI
    let audioBlob: Blob | null = null;
    let mimeType = 'audio/wav';

    // Prioritize pure 16-bit PCM WAV (100% reliable)
    if (this.pcmChunks.length > 0 && this.totalSamples > 1600) {
      const merged = new Float32Array(this.totalSamples);
      let offset = 0;
      for (const chunk of this.pcmChunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      const sampleRate = this.audioContext?.sampleRate || 16000;
      audioBlob = encodeWAV(merged, sampleRate);
      mimeType = 'audio/wav';
    } else if (this.recordedBlobChunks.length > 0) {
      audioBlob = new Blob(this.recordedBlobChunks, {
        type: this.mediaRecorder?.mimeType || 'audio/webm',
      });
      mimeType = audioBlob.type || 'audio/webm';
    }

    if (audioBlob && audioBlob.size > 200) {
      this.updateState({
        state: 'PROCESSING_STT',
        isTranscribing: true,
        rawTranscript: 'Transcribing speech with Gemini AI Audio...',
      });

      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(audioBlob);
        const audioBase64 = await base64Promise;

        const res = await fetch('/api/voice/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64,
            mimeType,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const transcript = (data.transcript || '').trim();
          if (transcript && transcript.toLowerCase() !== 'empty' && transcript.length > 0) {
            this.updateState({
              state: 'PROCESSING_STT',
              rawTranscript: transcript,
              detectedLanguage: data.detectedLanguage,
              isTranscribing: false,
            });
            if (this.finalCommandHandler) {
              this.finalCommandHandler(transcript);
            }
            return;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error || 'Transcription service returned an error';
          console.warn('Transcription API error:', errMsg);
          this.isExecutingCommand = false;
          this.updateState({
            state: 'ERROR',
            isTranscribing: false,
            errorMessage: errMsg,
          });
          return;
        }
      } catch (err: any) {
        console.warn('Gemini Audio transcription fetch error:', err);
      }
    }

    // If no speech detected at all, return to Wake Word Standby or Idle
    this.isExecutingCommand = false;
    if (this.isWakeWordMode) {
      this.startWakeWordStandby(this.finalCommandHandler || undefined);
    } else {
      this.updateState({
        state: 'IDLE',
        isTranscribing: false,
        errorMessage: 'No speech was detected. Please speak closer to your microphone or click one of the quick commands below.',
      });
    }
  }

  public stopListening() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
        this.scriptProcessor = null;
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    this.stopAudioAnalyser();
    this.updateState({
      state: this.isWakeWordMode ? 'WAKE_WORD_STANDBY' : 'IDLE',
      isTranscribing: false,
    });
  }

  private trackAudioLevels() {
    if (!this.analyser) return;
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    const timeData = new Uint8Array(this.analyser.fftSize);

    const update = () => {
      if ((!this.isListening && !this.isSpeaking && !this.isConversationMode && !this.isWakeWordMode) || !this.analyser) return;
      
      this.analyser.getByteFrequencyData(freqData);
      this.analyser.getByteTimeDomainData(timeData);

      // 1. Calculate Real RMS Energy from time domain samples
      let sumSquares = 0;
      for (let i = 0; i < timeData.length; i++) {
        const norm = (timeData[i] - 128) / 128;
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / timeData.length);

      // 2. Frequency Spectral Energy
      let freqSum = 0;
      for (let i = 0; i < freqData.length; i++) {
        freqSum += freqData[i];
      }
      const freqAvg = freqSum / freqData.length;
      const computedLevel = Math.min(1, Math.max(rms * 3.5, freqAvg / 95));
      this.audioLevel = computedLevel;

      // 3. Adaptive Noise Floor Tracking (smooth slow EMA during silence)
      if (!this.speechDetected) {
        this.noiseFloor = this.noiseFloor * 0.95 + computedLevel * 0.05;
      }

      // 4. Dedicated High-Precision Voice Activity Detection (VAD)
      // STRICT MIC OFF RULE: If ULTRON is speaking output or executing a task, mic input is completely off & ignored
      if (this.isSpeaking || this.isExecutingCommand) {
        this.audioLevel = 0;
        this.speechDetected = false;
        this.speechOnsetFrames = 0;
        this.updateState({ audioLevel: 0 });
        this.animationFrameId = requestAnimationFrame(update);
        return;
      }

      if (this.isListening && !this.isSpeaking && !this.isExecutingCommand) {
        const speechThreshold = Math.max(0.045, this.noiseFloor * 2.0);
        const silenceThreshold = Math.max(0.025, this.noiseFloor * 1.35);

        if (computedLevel >= speechThreshold) {
          this.speechOnsetFrames++;
          if (this.speechOnsetFrames >= 2) {
            this.speechDetected = true;
            this.lastVoiceActivityTime = Date.now();
          }
        } else if (computedLevel <= silenceThreshold) {
          this.speechOnsetFrames = 0;
          if (this.speechDetected) {
            const silenceElapsed = Date.now() - this.lastVoiceActivityTime;
            // If user has spoken something and is now silent for > 1250ms (or > 950ms if finalized transcript exists)
            const requiredSilenceMs = this.currentTranscript.trim().length > 0 ? 1100 : 1350;
            if (silenceElapsed >= requiredSilenceMs) {
              this.speechDetected = false;
              playEndpointChime();
              this.finishListeningAndSubmit();
            }
          }
        }
      }

      this.updateState({ audioLevel: this.audioLevel });
      this.animationFrameId = requestAnimationFrame(update);
    };
    update();
  }

  /**
   * Strictly mutes and shuts down all microphone input sources during Voice Output / Speech Synthesis.
   * Ensures ULTRON NEVER takes any voice input, listens to ambient audio, or hears itself while speaking.
   */
  public muteMicrophoneDuringSpeech(): void {
    this.isSpeaking = true;
    this.isExecutingCommand = true;
    this.speechDetected = false;
    this.speechOnsetFrames = 0;
    this.currentTranscript = '';
    this.audioLevel = 0;

    // 1. Abort & stop speech recognition immediately
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      try {
        this.recognition.stop();
      } catch {}
    }

    // 2. Disable physical microphone input tracks on active MediaStream
    if (this.mediaStream) {
      try {
        this.mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      } catch {}
    }

    // 3. Disconnect raw PCM audio capture processor
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
        this.scriptProcessor = null;
      } catch {}
    }

    // 4. Halt MediaRecorder if active
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }

    // 5. Clear all temporary PCM & audio blob buffers
    this.pcmChunks = [];
    this.totalSamples = 0;
    this.recordedBlobChunks = [];

    // 6. Cancel pending silence / fast-final auto-commit timers
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.fastFinalTimer) {
      clearTimeout(this.fastFinalTimer);
      this.fastFinalTimer = null;
    }

    this.updateState({
      audioLevel: 0,
      bargeInDetected: false,
    });
  }

  /**
   * Safely restores microphone listening after Voice Output has completely finished.
   * Includes a 400ms acoustic echo suppression buffer.
   */
  public restoreMicrophoneAfterSpeech(): void {
    this.isSpeaking = false;
    this.isExecutingCommand = false;
    this.speechEndTime = Date.now();
    this.speechDetected = false;
    this.speechOnsetFrames = 0;

    // Re-enable microphone tracks
    if (this.mediaStream) {
      try {
        this.mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
      } catch {}
    }

    // Acoustic grace delay: wait 400ms after speech ends before un-muting recognition
    setTimeout(() => {
      if (this.isSpeaking || this.isExecutingCommand) return;

      if (this.isConversationMode) {
        this.turnCount++;
        this.updateState({
          state: 'IDLE',
          turnCount: this.turnCount,
          isConversationMode: true,
          audioLevel: 0,
        });
        this.startListening(this.finalCommandHandler || undefined);
      } else if (this.isWakeWordMode) {
        this.startWakeWordStandby(this.finalCommandHandler || undefined);
      } else {
        this.updateState({
          state: 'IDLE',
          audioLevel: 0,
        });
      }
    }, 400);
  }

  private stopAudioAnalyser() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.audioLevel = 0;
    this.updateState({ audioLevel: 0 });
  }

  public getAudioLevel(): number {
    return this.audioLevel;
  }

  public isConversationActive(): boolean {
    return this.isConversationMode;
  }

  public async startConversation(onFinalCommand?: (transcript: string) => void): Promise<boolean> {
    this.isConversationMode = true;
    this.turnCount = 1;
    this.updateState({
      isConversationMode: true,
      turnCount: this.turnCount,
      bargeInDetected: false,
    });
    return this.startListening(onFinalCommand);
  }

  public endConversation() {
    this.clearSpeechQueue();
    this.isConversationMode = false;
    this.turnCount = 0;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.stopListening();
    if (this.isWakeWordMode) {
      this.startWakeWordStandby(this.finalCommandHandler || undefined);
    } else {
      this.updateState({
        state: 'IDLE',
        isConversationMode: false,
        turnCount: 0,
        bargeInDetected: false,
      });
    }
  }

  public toggleConversationMode(onFinalCommand?: (transcript: string) => void) {
    if (this.isConversationMode) {
      this.endConversation();
    } else {
      this.startConversation(onFinalCommand);
    }
  }

  public triggerBargeIn(capturedText?: string) {
    // 1. Immediately kill TTS speech synthesis & clear queue
    this.clearSpeechQueue();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.isExecutingCommand = false;
    this.bargeInThresholdCounter = 0;

    // 2. Broadcast INTERRUPTED with barge-in feedback
    this.updateState({
      state: 'INTERRUPTED',
      bargeInDetected: true,
      rawTranscript: capturedText || 'Barge-in: Listening to you...',
    });

    // 3. Immediately transition straight into active listening
    setTimeout(() => {
      this.isListening = true;
      this.currentTranscript = capturedText || '';
      this.speechDetected = !!capturedText;
      this.pcmChunks = [];
      this.totalSamples = 0;
      this.recordedBlobChunks = [];

      this.updateState({
        state: 'LISTENING',
        bargeInDetected: true,
        rawTranscript: capturedText || undefined,
        isConversationMode: this.isConversationMode,
      });

      // Start capture if stream is alive
      this.startPCMRecording();
      this.startMediaRecorder();

      if (capturedText) {
        this.resetSilenceTimer(capturedText);
      }
    }, 120);
  }

  public interrupt() {
    this.clearSpeechQueue();
    this.currentSpeechSessionId++;
    if (this.ttsKeepAliveTimer) {
      clearInterval(this.ttsKeepAliveTimer);
      this.ttsKeepAliveTimer = null;
    }
    this.activeUtterances.clear();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.updateState({ state: 'INTERRUPTED' });
    this.restoreMicrophoneAfterSpeech();
  }

  /**
   * Intelligently detects appropriate vocal mood and task urgency from textual cues, syntax, and task context
   */
  public detectProsodyContext(
    text: string,
    hints?: { mood?: VoiceMood; urgency?: TaskUrgency; intent?: string }
  ): { mood: VoiceMood; urgency: TaskUrgency; prosody: ProsodyParameters } {
    let detectedMood: VoiceMood = hints?.mood || this.globalMood || 'neutral';
    let detectedUrgency: TaskUrgency = hints?.urgency || this.globalUrgency || 'normal';

    const lower = text.toLowerCase();

    // 1. Critical Emergency / Hazard / Error / Breach Detection
    if (
      /\b(danger|critical|emergency|breach|firewall failure|error occurred|failed to|alert|warning|threat|intruder|attack|malware|জরুরী|বিপদ|সতর্কবার্তা|হুমকি|ব্যর্থ)\b/i.test(
        lower
      )
    ) {
      detectedUrgency = 'critical';
      detectedMood = hints?.mood || 'serious';
    }
    // 2. High Urgency / Time-Sensitive Commands
    else if (
      /\b(urgent|immediately|asap|fast|quick|hurry|speed\s*up|now|run|cancel\s*all|দ্রুত|তাড়াতাড়ি|এখনই)\b/i.test(
        lower
      )
    ) {
      detectedUrgency = 'high';
      detectedMood = hints?.mood || 'authoritative';
    }
    // 3. Excited / Celebratory / High Accomplishment
    else if (
      /\b(success|congratulations|completed\s*successfully|awesome|great|fantastic|wonderful|amazing|congrats|hooray|দারুণ|চমৎকার|সফল|অভিনন্দন|সাবাশ)\b/i.test(
        lower
      ) ||
      (text.includes('!') && !text.includes('warning') && !text.includes('error'))
    ) {
      detectedMood = hints?.mood || 'excited';
      detectedUrgency = hints?.urgency || 'normal';
    }
    // 4. Empathetic / Apologetic / Reassuring
    else if (
      /\b(sorry|apologize|couldn't\s*find|please\s*forgive|unfortunately|regret|my\s*mistake|দুঃখিত|ক্ষমা\s*করবেন|চিন্তা\s*করবেন\s*না)\b/i.test(
        lower
      )
    ) {
      detectedMood = hints?.mood || 'empathetic';
      detectedUrgency = hints?.urgency || 'low';
    }
    // 5. Analytical / Computation / Deep Reasoning / Code Matrix
    else if (
      /\b(analyzing|calculating|computing|diagnostics|telemetry|matrix|memory|decompilation|algorithm|schematic|optimization|benchmark|cpu|gpu|ram|network|packet|code|stack|বিশ্লেষণ|হিসাব|এলগরিদম|ডাটা)\b/i.test(
        lower
      )
    ) {
      detectedMood = hints?.mood || 'analytical';
      detectedUrgency = hints?.urgency || 'normal';
    }
    // 6. Cybernetic / Holographic / Hardware Automation
    else if (
      /\b(hologram|spatial|drone|arc\s*reactor|subsystem|core\s*online|cybernetic|quantum|jarvis|ultron|protocol|ইঞ্জিন\s*সক্রিয়|অনলাইন)\b/i.test(
        lower
      )
    ) {
      detectedMood = hints?.mood || 'cybernetic';
      detectedUrgency = hints?.urgency || 'normal';
    }
    // 7. Calm / Standby / Passive Readiness
    else if (
      /\b(standby|idle|ready|waiting|all\s*systems\s*nominal|resting|relaxed|good\s*night|শান্ত|প্রস্তুত|অপেক্ষায়\s*আছি|ঘুম)\b/i.test(
        lower
      )
    ) {
      detectedMood = hints?.mood || 'calm';
      detectedUrgency = hints?.urgency || 'low';
    }
    // 8. Friendly / Conversational Greeting
    else if (
      /\b(hello|hi|welcome|good\s*morning|good\s*afternoon|good\s*evening|how\s*can\s*i\s*help|glad|happy|friend|স্বাগতম|হ্যালো|কেমন\s*আছো|ধন্যবাদ)\b/i.test(
        lower
      )
    ) {
      detectedMood = hints?.mood || 'friendly';
      detectedUrgency = hints?.urgency || 'normal';
    }

    const calculated = this.calculateProsody({
      mood: detectedMood,
      urgency: detectedUrgency,
      text,
    });

    return {
      mood: detectedMood,
      urgency: detectedUrgency,
      prosody: calculated,
    };
  }

  /**
   * Computes the base acoustic prosody (rate, pitch, volume) from mood, urgency, and custom overrides
   */
  public calculateProsody(options?: {
    mood?: VoiceMood;
    urgency?: TaskUrgency;
    rate?: number;
    pitch?: number;
    volume?: number;
    text?: string;
  }): ProsodyParameters {
    const mood: VoiceMood = options?.mood || this.globalMood || 'neutral';
    const urgency: TaskUrgency = options?.urgency || this.globalUrgency || 'normal';

    const moodConfig = MOOD_PROSODY_MATRIX[mood] || MOOD_PROSODY_MATRIX.neutral;
    const urgencyConfig = URGENCY_MULTIPLIERS[urgency] || URGENCY_MULTIPLIERS.normal;

    // Mathematical acoustic blending
    let finalRate = moodConfig.baseRate * urgencyConfig.rateMult;
    let finalPitch = moodConfig.basePitch * urgencyConfig.pitchMult;
    let finalVolume = moodConfig.baseVolume * urgencyConfig.volumeMult;

    // Apply engine-level custom overrides
    if (this.customProsodyOverrides.rate !== undefined) {
      finalRate = this.customProsodyOverrides.rate;
    }
    if (this.customProsodyOverrides.pitch !== undefined) {
      finalPitch = this.customProsodyOverrides.pitch;
    }
    if (this.customProsodyOverrides.volume !== undefined) {
      finalVolume = this.customProsodyOverrides.volume;
    }

    // Apply explicit call-level overrides
    if (options?.rate !== undefined) finalRate = options.rate;
    if (options?.pitch !== undefined) finalPitch = options.pitch;
    if (options?.volume !== undefined) finalVolume = options.volume;

    // Safety bounding for browser SpeechSynthesis limits
    finalRate = Math.max(0.75, Math.min(1.45, Number(finalRate.toFixed(2))));
    finalPitch = Math.max(0.70, Math.min(1.40, Number(finalPitch.toFixed(2))));
    finalVolume = Math.max(0.10, Math.min(1.00, Number(finalVolume.toFixed(2))));

    let inflection: 'flat' | 'expressive' | 'curious' | 'commanding' | 'balanced' = 'balanced';
    if (mood === 'excited' || mood === 'friendly') inflection = 'expressive';
    else if (mood === 'authoritative' || urgency === 'critical') inflection = 'commanding';
    else if (mood === 'analytical' || mood === 'calm') inflection = 'flat';

    return {
      rate: finalRate,
      pitch: finalPitch,
      volume: finalVolume,
      mood,
      urgency,
      inflection,
      dynamicPacing: true,
    };
  }

  /**
   * Applies micro-prosody modulations across fragment sequences (rising pitch for questions, emphasis for exclamations, statement termination)
   */
  public calculateFragmentMicroProsody(
    fragment: string,
    baseProsody: ProsodyParameters,
    fragmentIndex: number,
    totalFragments: number
  ): ProsodyParameters {
    let { rate, pitch, volume, mood, urgency, inflection } = baseProsody;
    const cleanFrag = fragment.trim();

    // 1. Question Intonation Modulation (terminal upward inflection)
    if (cleanFrag.endsWith('?') || /[\u0980-\u09FF]+\s*কি\b/i.test(cleanFrag) || /\b(why|what|where|who|when|how)\b/i.test(cleanFrag)) {
      pitch += 0.06;
      inflection = 'curious';
    }
    // 2. Exclamation / Alert Modulation
    else if (cleanFrag.endsWith('!') || /\b(alert|danger|success)\b/i.test(cleanFrag)) {
      pitch += 0.04;
      rate += 0.03;
      inflection = 'expressive';
    }
    // 3. Opening Segment Affirmation
    else if (fragmentIndex === 0 && totalFragments > 1) {
      pitch += 0.02;
      rate += 0.01;
    }
    // 4. Concluding Statement Finality
    else if (fragmentIndex === totalFragments - 1 && totalFragments > 1) {
      pitch -= 0.02;
    }

    // 5. Subtle micro-jitter to prevent mechanical monotonicity on multi-line responses
    const jitter = ((fragmentIndex % 3) - 1) * 0.012;
    pitch += jitter;

    return {
      rate: Math.max(0.75, Math.min(1.45, Number(rate.toFixed(2)))),
      pitch: Math.max(0.70, Math.min(1.40, Number(pitch.toFixed(2)))),
      volume: Math.max(0.10, Math.min(1.00, Number(volume.toFixed(2)))),
      mood,
      urgency,
      inflection,
      dynamicPacing: true,
    };
  }

  /**
   * Public setters to tune global vocal mood, task urgency, and custom acoustic parameters
   */
  public setMood(mood: VoiceMood): void {
    this.globalMood = mood;
  }

  public setUrgency(urgency: TaskUrgency): void {
    this.globalUrgency = urgency;
  }

  public setProsody(prosody: Partial<ProsodyParameters>): void {
    this.customProsodyOverrides = {
      ...this.customProsodyOverrides,
      ...prosody,
    };
    if (prosody.mood) this.globalMood = prosody.mood;
    if (prosody.urgency) this.globalUrgency = prosody.urgency;
  }

  public getProsodyConfig(): ProsodyParameters {
    return this.calculateProsody();
  }

  public resetProsody(): void {
    this.globalMood = 'neutral';
    this.globalUrgency = 'normal';
    this.customProsodyOverrides = {};
  }

  /**
   * Computes a normalized phonetic/alphanumeric fingerprint of speech text to prevent duplicate speech
   */
  public computeSegmentHash(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Checks if a speech segment was recently spoken within the retention window or is in queue
   */
  public isDuplicateSegment(hashOrText: string): boolean {
    const hash = this.computeSegmentHash(hashOrText);
    if (!hash || hash.length < 3) return false;

    // Purge expired entries
    const now = Date.now();
    for (const [key, timestamp] of this.spokenSegmentsHistory.entries()) {
      if (now - timestamp > this.duplicateRetentionWindowMs) {
        this.spokenSegmentsHistory.delete(key);
      }
    }

    // Check history map
    if (this.spokenSegmentsHistory.has(hash)) {
      const ts = this.spokenSegmentsHistory.get(hash)!;
      if (now - ts < this.duplicateRetentionWindowMs) {
        return true;
      }
    }

    // Check if already queued in the active speechQueue
    const alreadyQueued = this.speechQueue.some((item) => item.hash === hash);
    return alreadyQueued;
  }

  /**
   * Records a segment as spoken to prevent duplicate repeats
   */
  public recordSpokenSegment(hashOrText: string): void {
    const hash = this.computeSegmentHash(hashOrText);
    if (!hash || hash.length < 3) return;

    // Maintain history size cap
    if (this.spokenSegmentsHistory.size >= this.maxSpokenHistorySize) {
      const oldestKey = this.spokenSegmentsHistory.keys().next().value;
      if (oldestKey) this.spokenSegmentsHistory.delete(oldestKey);
    }

    this.spokenSegmentsHistory.set(hash, Date.now());
  }

  /**
   * Splits a multi-part message (with markdown, lists, paragraphs, or multiple statements)
   * into clean, distinct, deduplicated speech fragments.
   */
  public splitIntoDistinctFragments(rawText: string, filterDuplicates = true): string[] {
    // 1. Clean markdown formatting
    let clean = rawText.replace(/```[\s\S]*?```/g, ' [Code block omitted] ');
    clean = clean.replace(/`([^`]+)`/g, '$1');
    clean = clean.replace(/^#{1,6}\s+/gm, '');
    clean = clean.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    clean = clean.replace(/https?:\/\/\S+/gi, 'link');

    // 2. Break down into discrete paragraphs or list lines first
    const linesAndParagraphs = clean
      .split(/\n{1,}/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const subFragments: string[] = [];

    for (const block of linesAndParagraphs) {
      // Split by sentence delimiters (period, exclamation, question mark, Bengali dari ।)
      const sentences = block
        .split(/(?<=[.?!।])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const sent of sentences) {
        if (sent.length <= 110) {
          subFragments.push(sent);
        } else {
          // Sub-divide long compound sentences at clause boundaries
          const subParts = sent.split(/(?<=[,;:\-—])\s+/);
          let currentPart = '';
          for (const sub of subParts) {
            if ((currentPart + ' ' + sub).trim().length > 110 && currentPart) {
              subFragments.push(currentPart.trim());
              currentPart = sub;
            } else {
              currentPart = currentPart ? `${currentPart} ${sub}` : sub;
            }
          }
          if (currentPart.trim()) {
            subFragments.push(currentPart.trim());
          }
        }
      }
    }

    if (subFragments.length === 0 && clean.trim().length > 0) {
      subFragments.push(clean.trim());
    }

    // Deduplicate within the current multi-part message itself and against recent history
    if (!filterDuplicates) {
      return subFragments;
    }

    const seenLocalHashes = new Set<string>();
    const distinctFragments: string[] = [];

    for (const frag of subFragments) {
      const hash = this.computeSegmentHash(frag);
      if (!hash || hash.length < 3) {
        if (frag.length > 0) distinctFragments.push(frag);
        continue;
      }

      if (seenLocalHashes.has(hash)) {
        continue; // Skip duplicate inside same multi-part message
      }

      if (this.isDuplicateSegment(hash)) {
        continue; // Skip duplicate from recent spoken history
      }

      seenLocalHashes.add(hash);
      distinctFragments.push(frag);
    }

    return distinctFragments.length > 0 ? distinctFragments : (subFragments.length > 0 ? [subFragments[0]] : []);
  }

  /**
   * Enqueues a single distinct speech fragment into the speech queue with prosody parameters.
   * If allowDuplicate is false (default), it skips fragments that match recent spoken history.
   * Returns true if queued, false if rejected as a duplicate.
   */
  public enqueueSpeechFragment(
    fragment: string,
    onEnd?: () => void,
    allowDuplicate = false,
    prosodyOverride?: Partial<ProsodyParameters>
  ): boolean {
    const clean = fragment.trim();
    if (!clean) return false;

    const hash = this.computeSegmentHash(clean);
    if (!allowDuplicate && this.isDuplicateSegment(hash)) {
      console.log(`[VoiceEngine] Filtered duplicate speech segment: "${clean.slice(0, 40)}..."`);
      if (onEnd) onEnd();
      return false;
    }

    const detected = this.detectProsodyContext(clean, {
      mood: prosodyOverride?.mood,
      urgency: prosodyOverride?.urgency,
    });

    const calculatedProsody = {
      ...detected.prosody,
      ...prosodyOverride,
    };

    const segment: QueuedSpeechSegment = {
      id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text: clean,
      originalText: fragment,
      onEnd,
      timestamp: Date.now(),
      hash,
      prosody: {
        rate: calculatedProsody.rate,
        pitch: calculatedProsody.pitch,
        volume: calculatedProsody.volume,
        mood: calculatedProsody.mood,
        urgency: calculatedProsody.urgency,
      },
    };

    this.speechQueue.push(segment);

    // If not currently executing speech queue, kick off processing
    if (!this.isProcessingQueue && !this.isSpeaking) {
      this.processSpeechQueue();
    }

    return true;
  }

  /**
   * Enqueues multiple distinct fragments for a multi-part message.
   * Returns the count of distinct fragments successfully queued.
   */
  public enqueueSpeechFragments(
    fragments: string[],
    onEnd?: () => void,
    allowDuplicate = false,
    prosodyOverride?: Partial<ProsodyParameters>
  ): number {
    let queuedCount = 0;
    const validFragments = fragments.filter((f) => f.trim().length > 0);

    validFragments.forEach((frag, idx) => {
      const isLast = idx === validFragments.length - 1;
      const wasQueued = this.enqueueSpeechFragment(
        frag,
        isLast ? onEnd : undefined,
        allowDuplicate,
        prosodyOverride
      );
      if (wasQueued) queuedCount++;
    });

    return queuedCount;
  }

  /**
   * Clears the pending queue of speech segments and stops processing
   */
  public clearSpeechQueue(): void {
    this.speechQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Returns copy of the active speech queue
   */
  public getSpeechQueue(): QueuedSpeechSegment[] {
    return [...this.speechQueue];
  }

  /**
   * Returns recently spoken segment hashes
   */
  public getSpokenSegmentsHistory(): { hash: string; timestamp: number }[] {
    return Array.from(this.spokenSegmentsHistory.entries()).map(([hash, timestamp]) => ({
      hash,
      timestamp,
    }));
  }

  /**
   * Resets the spoken history duplicate prevention buffer
   */
  public resetSpokenHistory(): void {
    this.spokenSegmentsHistory.clear();
  }

  /**
   * Master speak method:
   * Analyzes vocal mood, urgency, and prosody parameters, splits multi-part messages into
   * distinct fragments, applies micro-prosody, deduplicates, and executes sequentially.
   */
  public speak(
    text: string,
    onEnd?: () => void,
    options?: SpeakOptions
  ) {
    const deduplicate = options?.deduplicate ?? true;
    const interruptCurrent = options?.interruptCurrent ?? true;

    // 1. Strictly mute and shut down microphone while voice output is playing
    this.muteMicrophoneDuringSpeech();

    // 2. Prime and unlock device audio output hardware
    this.unlockAudio();
    this.playAcousticSynthesisPulse(659.25, 0.08);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isExecutingCommand = false;
      this.playAcousticSynthesisPulse(440, 0.25);
      if (onEnd) onEnd();
      this.restoreMicrophoneAfterSpeech();
      return;
    }

    if (interruptCurrent) {
      this.clearSpeechQueue();
      this.currentSpeechSessionId++;
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {}
      this.activeUtterances.clear();
    }

    // 2. Intelligent Prosody Context Detection (Mood & Urgency)
    const context = this.detectProsodyContext(text, {
      mood: options?.mood || options?.prosody?.mood,
      urgency: options?.urgency || options?.prosody?.urgency,
    });

    const baseProsody = this.calculateProsody({
      mood: context.mood,
      urgency: context.urgency,
      rate: options?.rate ?? options?.prosody?.rate,
      pitch: options?.pitch ?? options?.prosody?.pitch,
      volume: options?.volume ?? options?.prosody?.volume,
      text,
    });

    // 3. Break text down into distinct, non-repetitive response fragments
    const distinctFragments = this.splitIntoDistinctFragments(text, deduplicate);

    if (distinctFragments.length === 0) {
      this.isSpeaking = false;
      this.isExecutingCommand = false;
      if (onEnd) onEnd();
      return;
    }

    // 4. Enqueue all distinct fragments with customized micro-prosody
    distinctFragments.forEach((fragmentText, index) => {
      const isLastFragment = index === distinctFragments.length - 1;
      const hash = this.computeSegmentHash(fragmentText);

      // Micro-prosody variation per segment
      const segmentProsody = this.calculateFragmentMicroProsody(
        fragmentText,
        baseProsody,
        index,
        distinctFragments.length
      );

      const segment: QueuedSpeechSegment = {
        id: `seg-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
        text: fragmentText,
        originalText: text,
        fragmentIndex: index,
        totalFragments: distinctFragments.length,
        onEnd: isLastFragment ? onEnd : undefined,
        timestamp: Date.now(),
        hash,
        prosody: {
          rate: segmentProsody.rate,
          pitch: segmentProsody.pitch,
          volume: segmentProsody.volume,
          mood: segmentProsody.mood,
          urgency: segmentProsody.urgency,
        },
      };

      this.speechQueue.push(segment);
    });

    // Start processing queue
    if (!this.isProcessingQueue) {
      this.processSpeechQueue();
    }
  }

  /**
   * Internal queue runner: processes queued speech segments sequentially with individual prosody parameters
   */
  private processSpeechQueue() {
    if (this.speechQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.speechQueue = [];
      this.isProcessingQueue = false;
      return;
    }

    const currentSegment = this.speechQueue.shift();
    if (!currentSegment) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const sessionId = this.currentSpeechSessionId;

    // Strictly shut down and mute microphone while speaking so ULTRON never listens to itself or accepts input
    this.muteMicrophoneDuringSpeech();

    // Compute segment prosody values
    const segmentProsody = currentSegment.prosody || {
      rate: 1.03,
      pitch: 1.0,
      volume: 1.0,
      mood: this.globalMood,
      urgency: this.globalUrgency,
    };

    // STRICT ATOMIC LOCK
    this.isSpeaking = true;
    this.isExecutingCommand = true;
    this.speechStartTime = Date.now();
    this.bargeInThresholdCounter = 0;
    this.lastSpokenSpeechText = currentSegment.text.toLowerCase();

    this.updateState({
      state: 'SPEAKING',
      bargeInDetected: false,
      isConversationMode: this.isConversationMode,
      turnCount: this.turnCount,
      currentMood: segmentProsody.mood,
      currentUrgency: segmentProsody.urgency,
      activeProsody: {
        rate: segmentProsody.rate,
        pitch: segmentProsody.pitch,
        volume: segmentProsody.volume,
        mood: segmentProsody.mood,
        urgency: segmentProsody.urgency,
      },
    });

    if (this.ttsKeepAliveTimer) {
      clearInterval(this.ttsKeepAliveTimer);
      this.ttsKeepAliveTimer = null;
    }

    this.ttsKeepAliveTimer = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && this.isSpeaking) {
          window.speechSynthesis.resume();
        }
      }
    }, 1500);

    const hasBangla = /[\u0980-\u09FF]/.test(currentSegment.text);
    const targetLang = hasBangla ? 'bn-BD' : this.language;

    const voices =
      window.speechSynthesis.getVoices && window.speechSynthesis.getVoices().length > 0
        ? window.speechSynthesis.getVoices()
        : this.cachedVoices;

    const naturalVoice = voices.find((v) =>
      targetLang.startsWith('bn')
        ? v.lang.includes('bn')
        : (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Premium') ||
            v.name.includes('Daniel') ||
            v.name.includes('Samantha') ||
            v.name.includes('David') ||
            v.name.includes('Alex')) &&
          v.lang.includes('en')
    );

    const utterance = new SpeechSynthesisUtterance(currentSegment.text);
    utterance.volume = Math.max(0.1, Math.min(1.0, segmentProsody.volume));
    utterance.rate = Math.max(0.75, Math.min(1.45, segmentProsody.rate));
    utterance.pitch = Math.max(0.70, Math.min(1.40, segmentProsody.pitch));
    utterance.lang = targetLang;
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    // Keep strong reference in memory to prevent GC clipping
    this.activeUtterances.add(utterance);

    let segmentHandled = false;
    let watchdogTimer: any = null;

    const handleSegmentFinished = () => {
      if (segmentHandled) return;
      segmentHandled = true;
      if (watchdogTimer) clearTimeout(watchdogTimer);
      this.activeUtterances.delete(utterance);

      // Record this segment in history buffer to prevent duplicate repetition
      this.recordSpokenSegment(currentSegment.hash);

      if (currentSegment.onEnd) {
        try {
          currentSegment.onEnd();
        } catch (err) {
          console.warn('Speech segment onEnd error:', err);
        }
      }

      if (sessionId !== this.currentSpeechSessionId) {
        this.isProcessingQueue = false;
        return;
      }

      // If more distinct fragments remain in queue, smoothly process next segment
      if (this.speechQueue.length > 0) {
        setTimeout(() => {
          if (sessionId === this.currentSpeechSessionId) {
            this.processSpeechQueue();
          }
        }, 120);
      } else {
        // All fragments in multi-part message have finished
        if (this.ttsKeepAliveTimer) {
          clearInterval(this.ttsKeepAliveTimer);
          this.ttsKeepAliveTimer = null;
        }

        this.isProcessingQueue = false;
        // Safely restore microphone listening after voice output completes
        this.restoreMicrophoneAfterSpeech();
      }
    };

    utterance.onend = () => {
      handleSegmentFinished();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis segment error:', e);
      this.playAcousticSynthesisPulse(330, 0.15);
      handleSegmentFinished();
    };

    // Watchdog Timer for browser speech synthesis hangs
    const estimatedDurationMs = Math.max(1800, (currentSegment.text.length / 10) * 1000 + 1200);
    watchdogTimer = setTimeout(() => {
      if (!segmentHandled && sessionId === this.currentSpeechSessionId) {
        console.warn('SpeechSynthesis watchdog triggered for segment, advancing queue safely.');
        handleSegmentFinished();
      }
    }, estimatedDurationMs);

    // Safe dispatch
    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (speakErr) {
        console.warn('SpeechSynthesis speak call error:', speakErr);
        handleSegmentFinished();
      }
    }, 30);
  }
}
