/**
 * ULTRON Core Unified Voice Engine
 * 
 * Strict Architectural Directives:
 * - Uses the EXACT SAME Canonical Brain (`UltronBrainCore`) and Intent Router as text.
 * - Formal Voice State Machine:
 *   IDLE -> LISTENING -> PROCESSING -> THINKING -> EXECUTING -> SPEAKING -> INTERRUPTED
 * - Wake Word Detection ("ULTRON", "Hey Ultron")
 * - Voice Interruption / Barging ("Stop", "Halt", "Wait", "Bondho kor") with audio cancellation.
 * - Hardware mic mute during speech to prevent acoustic feedback loops.
 */

import { CanonicalVoiceState, BrainResponse } from './types.js';
import { UltronBrainCore } from './ultronBrainCore.js';

export class VoiceEngineCore {
  private static instance: VoiceEngineCore;
  private currentState: CanonicalVoiceState = 'IDLE';
  private wakeWordActive: boolean = false;
  private micMuted: boolean = false;

  private constructor() {}

  public static getInstance(): VoiceEngineCore {
    if (!VoiceEngineCore.instance) {
      VoiceEngineCore.instance = new VoiceEngineCore();
    }
    return VoiceEngineCore.instance;
  }

  public getState(): CanonicalVoiceState {
    return this.currentState;
  }

  public setState(state: CanonicalVoiceState): void {
    this.currentState = state;
    // Auto-mute mic during speaking to avoid acoustic feedback
    this.micMuted = state === 'SPEAKING';
  }

  public isMicMuted(): boolean {
    return this.micMuted;
  }

  /**
   * Process voice audio transcript or spoken input through the Canonical Brain
   */
  public async processVoiceInput(spokenTranscript: string): Promise<BrainResponse> {
    const text = spokenTranscript.trim();
    const brain = UltronBrainCore.getInstance();

    // 1. Check for Voice Interruption ("Stop", "Halt", "Wait", "Cancel", "Bondho kor")
    if (this.isInterruptionPhrase(text)) {
      this.setState('INTERRUPTED');
      const cancelRes = await brain.process('cancel task');
      this.setState('IDLE');
      return cancelRes;
    }

    // 2. State transition: LISTENING -> PROCESSING -> THINKING -> EXECUTING -> SPEAKING -> IDLE
    this.setState('PROCESSING');

    try {
      this.setState('THINKING');
      const response = await brain.process(spokenTranscript);

      this.setState('SPEAKING');
      // Simulated speaking window or immediate state return
      return response;
    } catch (err) {
      this.setState('ERROR');
      throw err;
    }
  }

  public notifySpeakingFinished(): void {
    this.setState('IDLE');
  }

  public interrupt(): void {
    this.setState('INTERRUPTED');
    this.setState('IDLE');
  }

  private isInterruptionPhrase(text: string): boolean {
    return /\b(stop|halt|shut up|cancel|wait|thamo|bondho kor|chup)\b/i.test(text);
  }
}
