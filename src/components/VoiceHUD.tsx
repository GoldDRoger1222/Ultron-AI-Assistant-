import React from 'react';
import { Mic, MicOff, Volume2, Square, Globe, Sparkles, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { VoiceState } from '../types/jarvis';

interface VoiceHUDProps {
  voiceState: VoiceState;
  onInterrupt: () => void;
  onStopListening: () => void;
  onFinishSpeaking?: () => void;
  onToggleLanguage: (lang: 'en-US' | 'bn-BD') => void;
  currentLanguage: 'en-US' | 'bn-BD';
  onQuickCommandSelect?: (cmd: string) => void;
  onEndConversation?: () => void;
  onToggleWakeWord?: () => void;
  isWakeWordActive?: boolean;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({
  voiceState,
  onInterrupt,
  onStopListening,
  onFinishSpeaking,
  onToggleLanguage,
  currentLanguage,
}) => {
  const isListening = voiceState.state === 'LISTENING' || voiceState.state === 'STARTING_MIC';
  const isSpeaking = voiceState.state === 'SPEAKING' || voiceState.state === 'PREPARING_TTS';
  const isAnalyzing = voiceState.state === 'ANALYZING';
  const isWorking = voiceState.state === 'WORKING';
  const isAiSwitching = voiceState.state === 'AI_SWITCHING';
  const isThinking = voiceState.state === 'THINKING' || voiceState.state === 'PROCESSING_STT';
  const isWake = voiceState.state === 'WAKE';
  const isInterrupted = voiceState.state === 'INTERRUPTED';

  // HIDE COMPLETELY during IDLE or WAKE_WORD_STANDBY so NO box clutters the UI!
  if (
    (voiceState.state === 'IDLE' || voiceState.state === 'WAKE_WORD_STANDBY' || voiceState.state === 'STANDBY') &&
    !voiceState.errorMessage
  ) {
    return null;
  }

  const audioLevel = voiceState.audioLevel || 0;

  return (
    <div
      id="ultron-voice-hud-active"
      className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg bg-neutral-950/95 border rounded-2xl p-3 shadow-[0_0_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
        voiceState.bargeInDetected
          ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)]'
          : isSpeaking
          ? 'border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
          : isListening
          ? 'border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
          : isAnalyzing || isAiSwitching
          ? 'border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
          : isWorking
          ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
          : isThinking
          ? 'border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
          : 'border-neutral-800'
      }`}
    >
      {/* Sleek Top Status Pill Bar */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isListening
                ? 'bg-sky-400 animate-ping'
                : isSpeaking
                ? 'bg-amber-400 animate-pulse'
                : isAnalyzing
                ? 'bg-purple-400 animate-pulse'
                : isWorking
                ? 'bg-emerald-400 animate-pulse'
                : isAiSwitching
                ? 'bg-amber-400 animate-ping'
                : isThinking
                ? 'bg-purple-400 animate-spin'
                : isWake
                ? 'bg-cyan-400 animate-ping'
                : isInterrupted
                ? 'bg-rose-500 animate-bounce'
                : 'bg-cyan-400'
            }`}
          />
          <span className="font-mono text-xs font-bold tracking-wider text-neutral-200 uppercase flex items-center gap-1.5 min-w-0 truncate">
            {isInterrupted ? (
              <span className="text-rose-400 flex items-center gap-1 truncate">
                <Zap className="w-3 h-3 shrink-0" /> BARGE-IN DETECTED
              </span>
            ) : isWake ? (
              <span className="text-cyan-300 flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 animate-pulse shrink-0" /> "Heyy ULTRON" DETECTED
              </span>
            ) : isListening ? (
              <span className="text-cyan-400 flex items-center gap-1 truncate">
                <Mic className="w-3 h-3 animate-pulse shrink-0" /> LISTENING...
              </span>
            ) : isSpeaking ? (
              <span className="text-amber-400 flex items-center gap-1.5 truncate">
                <Volume2 className="w-3 h-3 animate-pulse shrink-0" />
                <span>SPEAKING</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                  <MicOff className="w-2.5 h-2.5 text-amber-400" />
                  MIC OFF
                </span>
                {voiceState.currentMood && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300">
                    {voiceState.currentMood}
                  </span>
                )}
                {voiceState.currentUrgency && voiceState.currentUrgency !== 'normal' && (
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                    voiceState.currentUrgency === 'critical' || voiceState.currentUrgency === 'emergency'
                      ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                      : 'bg-orange-950/80 border-orange-600 text-orange-300'
                  }`}>
                    {voiceState.currentUrgency}
                  </span>
                )}
              </span>
            ) : isAnalyzing ? (
              <span className="text-purple-400 flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 animate-spin shrink-0" /> DEEP ANALYSIS...
              </span>
            ) : isAiSwitching ? (
              <span className="text-amber-400 flex items-center gap-1 truncate">
                <Zap className="w-3 h-3 animate-spin shrink-0" /> SWITCHING AI...
              </span>
            ) : isWorking ? (
              <span className="text-emerald-400 flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 animate-pulse shrink-0" /> EXECUTING...
              </span>
            ) : isThinking ? (
              <span className="text-purple-400 flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 animate-spin shrink-0" /> PROCESSING...
              </span>
            ) : (
              voiceState.state.replace('_', ' ')
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Toggle */}
          <button
            id="voice-lang-toggle"
            type="button"
            onClick={() => onToggleLanguage(currentLanguage === 'en-US' ? 'bn-BD' : 'en-US')}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300 hover:border-cyan-500 transition-colors"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{currentLanguage === 'en-US' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Submit Done Button when listening */}
          {isListening && onFinishSpeaking && (
            <button
              id="voice-hud-done-btn"
              type="button"
              onClick={onFinishSpeaking}
              className="flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-sm"
              title="Click when done speaking"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Done</span>
            </button>
          )}

          {/* Instant Interruption / Stop */}
          {(isListening || isSpeaking) && (
            <button
              id="voice-hud-interrupt-btn"
              type="button"
              onClick={isListening ? onStopListening : onInterrupt}
              className="flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors"
              title="Stop voice"
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Square className="w-3 h-3" />}
              <span>{isListening ? 'PAUSE' : 'STOP'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Waveform when listening */}
      {isListening && (
        <div className="flex items-center justify-center gap-1 h-6 my-2">
          {[...Array(24)].map((_, i) => {
            const heightFactor = Math.sin((i / 24) * Math.PI) * (audioLevel * 24 + 4);
            const barHeight = Math.max(3, Math.min(24, heightFactor));
            return (
              <div
                key={i}
                className="w-1 rounded-full transition-all duration-75 bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>
      )}

      {/* Hearing / Spoken Preview Line */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl px-3 py-2 mt-2 flex flex-col justify-center min-h-[40px] gap-1 overflow-hidden">
        {voiceState.errorMessage ? (
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono w-full break-words">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="break-words">{voiceState.errorMessage}</span>
          </div>
        ) : voiceState.rawTranscript ? (
          <div className="space-y-1 overflow-hidden">
            <p className="text-xs font-sans text-white leading-normal flex flex-wrap items-baseline gap-1.5 break-words">
              <span className="text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
                {voiceState.wakeWordTriggered ? 'Wake:' : 'Hearing:'}
              </span>
              <span className="font-medium text-cyan-100 break-words">{voiceState.rawTranscript}</span>
            </p>
            {voiceState.normalizedTranscript && voiceState.normalizedTranscript !== voiceState.rawTranscript && (
              <p className="text-[11px] font-mono text-emerald-400 flex flex-wrap items-center gap-1 break-words">
                <span className="shrink-0">🎯 Intent:</span>
                <span className="text-emerald-300 break-words">{voiceState.normalizedTranscript}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-wrap items-center justify-between gap-1.5">
            <p className="text-xs text-neutral-400 font-mono italic break-words flex-1 min-w-[180px]">
              {isListening
                ? currentLanguage === 'bn-BD'
                  ? 'কথা বলুন (বাংলা মোড: "গান চালাও", "ওয়েবসাইট বানাও", "তুমি কে")...'
                  : 'Listening for command in English or Banglish...'
                : isThinking
                ? 'Analyzing task and processing response...'
                : isSpeaking
                ? 'Voice output active • Microphone OFF (মাইক বন্ধ)...'
                : 'Ready.'}
            </p>
            {isListening && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 animate-pulse shrink-0 hidden xs:inline-block">
                ⚡ Auto-Submits
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
