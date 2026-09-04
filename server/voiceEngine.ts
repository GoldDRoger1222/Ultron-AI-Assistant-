/**
 * ULTRON Server Voice Coordinator & Session Manager
 * 
 * Pipeline:
 * Microphone -> VAD -> Noise Reduction -> Speech Recognition -> Language Detection -> Intent Router -> Brain Engine -> Response -> TTS -> Speaker
 * 
 * Explicit Voice States:
 * IDLE -> LISTENING -> PROCESSING -> THINKING -> SPEAKING -> ERROR
 * 
 * Interruption / Barge-in:
 * User speaking or saying "Stop" halts TTS playback immediately.
 */

import { UltronBrainEngine, BrainProcessResult } from './ultronBrainEngine.js';
import { synthesizeGeminiSpeech, cleanTextForSpeech } from './voice.js';

export type UltronVoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'THINKING' | 'SPEAKING' | 'ERROR';

export interface VoiceSessionState {
  currentState: UltronVoiceState;
  wakeWordEnabled: boolean;
  wakeWord: string; // 'ULTRON'
  continuousMode: boolean;
  activeSpeakerStream: boolean;
  lastTranscript: string;
  detectedLanguage: 'Bangla' | 'English' | 'Banglish' | 'Mixed';
  lastSpokenText: string;
  interruptedCount: number;
  lastError?: string;
  updatedAt: string;
}

export class UltronVoiceEngine {
  private static instance: UltronVoiceEngine;
  private state: VoiceSessionState;

  private constructor() {
    this.state = {
      currentState: 'IDLE',
      wakeWordEnabled: true,
      wakeWord: 'ULTRON',
      continuousMode: false,
      activeSpeakerStream: false,
      lastTranscript: '',
      detectedLanguage: 'English',
      lastSpokenText: '',
      interruptedCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  public static getInstance(): UltronVoiceEngine {
    if (!UltronVoiceEngine.instance) {
      UltronVoiceEngine.instance = new UltronVoiceEngine();
    }
    return UltronVoiceEngine.instance;
  }

  public getState(): VoiceSessionState {
    return { ...this.state };
  }

  public setState(newState: UltronVoiceState, errorMsg?: string) {
    this.state.currentState = newState;
    if (errorMsg) this.state.lastError = errorMsg;
    this.state.updatedAt = new Date().toISOString();
  }

  public setWakeWordEnabled(enabled: boolean) {
    this.state.wakeWordEnabled = enabled;
  }

  public setContinuousMode(enabled: boolean) {
    this.state.continuousMode = enabled;
  }

  /**
   * Handles user barge-in / speech interruption
   */
  public handleInterruption(): { interrupted: boolean; message: string } {
    if (this.state.currentState === 'SPEAKING' || this.state.activeSpeakerStream) {
      this.state.activeSpeakerStream = false;
      this.state.currentState = 'IDLE';
      this.state.interruptedCount += 1;
      this.state.updatedAt = new Date().toISOString();
      return { interrupted: true, message: 'Audio output halted immediately on barge-in.' };
    }
    return { interrupted: false, message: 'No active speaker output to interrupt.' };
  }

  /**
   * Processes voice input transcript through the unified pipeline
   */
  public async processVoiceInput(transcript: string): Promise<{
    brainResult: BrainProcessResult;
    voiceState: UltronVoiceState;
    speechAudioBase64?: string;
    interrupted: boolean;
  }> {
    const raw = transcript.trim();
    this.state.lastTranscript = raw;

    // Check for explicit stop command
    if (/^(stop|halt|chup|thamo|bondho)$/i.test(raw)) {
      this.handleInterruption();
    }

    // Check wake word if enabled
    if (this.state.wakeWordEnabled && !this.state.continuousMode) {
      const lower = raw.toLowerCase();
      const hasWake = lower.includes('ultron') || lower.includes('jarvis') || lower.includes('hey ultron');
      if (!hasWake && raw.length > 0) {
        this.setState('IDLE');
        return {
          brainResult: {
            success: true,
            intent: 'CONVERSATION',
            rawInput: raw,
            normalizedInput: raw,
            language: 'en',
            spokenResponse: 'Wake word "ULTRON" required.',
            markdownResponse: 'Waiting for wake word "ULTRON".',
            toolResults: [],
            verificationStatus: 'NOT_APPLICABLE',
            executionTimeMs: 0,
          },
          voiceState: 'IDLE',
          interrupted: false,
        };
      }
    }

    // 1. LISTENING -> PROCESSING
    this.setState('PROCESSING');

    // 2. PROCESSING -> THINKING
    this.setState('THINKING');
    const brain = UltronBrainEngine.getInstance();
    const brainRes = await brain.process(raw);

    // 3. THINKING -> SPEAKING
    this.setState('SPEAKING');
    this.state.activeSpeakerStream = true;
    this.state.lastSpokenText = brainRes.spokenResponse;

    let audioBase64: string | undefined;
    try {
      const clean = cleanTextForSpeech(brainRes.spokenResponse);
      const synth = await synthesizeGeminiSpeech(clean);
      if (synth) {
        audioBase64 = synth;
      }
    } catch {
      // Client WebSpeech fallback
    }

    // 4. Return to IDLE or LISTENING if continuous mode
    if (!this.state.continuousMode) {
      this.setState('IDLE');
    } else {
      this.setState('LISTENING');
    }
    this.state.activeSpeakerStream = false;

    return {
      brainResult: brainRes,
      voiceState: this.state.currentState,
      speechAudioBase64: audioBase64,
      interrupted: false,
    };
  }

  public stopSpeaking() {
    this.handleInterruption();
  }
}
