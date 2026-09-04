import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Volume2,
  Mic,
  MicOff,
  Server,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Zap,
  Sliders,
  Trash2,
  Lock,
  Globe,
  Radio,
  Compass,
} from 'lucide-react';
import { AIProviderConfig, CostPreference } from '../types/jarvis';
import { VoiceEngine } from '../lib/audioVoice';
import { apiFetch } from '../lib/api';
import { IntentRouterDashboard } from '../components/IntentRouterDashboard';
import { UltronSelfDiagnosticPanel } from '../components/UltronSelfDiagnosticPanel';

export const Diagnostics: React.FC = () => {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [costPreference, setCostPreference] = useState<CostPreference>('BALANCED');
  const [voicePipelineResult, setVoicePipelineResult] = useState<any | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<any | null>(null);

  // Live Mic Test State
  const [isLiveMicTesting, setIsLiveMicTesting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveAudioLevel, setLiveAudioLevel] = useState(0);
  const [liveLang, setLiveLang] = useState<'en-US' | 'bn-BD'>('en-US');
  const [micStatusMessage, setMicStatusMessage] = useState<string | null>(null);
  const [isSpeakingTest, setIsSpeakingTest] = useState(false);

  const fetchProviders = async () => {
    try {
      const data = await apiFetch<any>('/api/providers');
      setProviders(data.providers || []);
      if (data.costPreference) setCostPreference(data.costPreference);
    } catch (err: any) {
      console.warn('Failed to fetch providers:', err?.message || err);
    }
  };

  const fetchDeviceStatus = async () => {
    try {
      const data = await apiFetch<any>('/api/device/status');
      setDeviceStatus(data);
    } catch (err: any) {
      console.warn('Failed to fetch device status:', err?.message || err);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchDeviceStatus();
  }, []);

  const handleTestVoicePipeline = async () => {
    setIsTestingVoice(true);
    try {
      const data = await apiFetch<any>('/api/voice/pipeline-test');
      setVoicePipelineResult(data);
    } catch (err: any) {
      console.warn('Failed to test voice pipeline:', err?.message || err);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleToggleLiveMicTest = async () => {
    const engine = VoiceEngine.getInstance();
    engine.setLanguage(liveLang);

    if (isLiveMicTesting) {
      engine.stopListening();
      setIsLiveMicTesting(false);
      setMicStatusMessage('Live mic test stopped.');
    } else {
      setLiveTranscript('');
      setMicStatusMessage('Requesting microphone permission & listening...');
      const success = await engine.startListening((text) => {
        setLiveTranscript(text);
        setMicStatusMessage(`Transcribed: "${text}"`);
        setIsLiveMicTesting(false);
      });

      if (success) {
        setIsLiveMicTesting(true);
        setMicStatusMessage('Microphone active! Speak something in Bangla or English...');
      } else {
        setIsLiveMicTesting(false);
        setMicStatusMessage('Microphone access blocked or failed. Check browser permissions.');
      }
    }
  };

  const handleTestSpeechSynthesis = (lang: 'en' | 'bn') => {
    setIsSpeakingTest(true);
    const engine = VoiceEngine.getInstance();
    const text =
      lang === 'bn'
        ? 'আসসালামু আলাইকুম। জারভিস ভয়েস সিস্টেম অনলাইন এবং সম্পূর্ণ কার্যকর।'
        : 'JARVIS voice synthesis online and fully operational.';

    engine.speak(text, () => {
      setIsSpeakingTest(false);
    });
  };

  const handleTestProvider = async (providerId: string) => {
    setTestingProviderId(providerId);
    try {
      await apiFetch('/api/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });
      fetchProviders();
    } catch (err: any) {
      console.warn('Provider test notice:', err?.message || err);
    } finally {
      setTestingProviderId(null);
    }
  };

  const handleUpdateCostPreference = async (pref: CostPreference) => {
    setCostPreference(pref);
    try {
      await apiFetch('/api/providers/cost-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference: pref }),
      });
    } catch (err: any) {
      console.warn('Cost preference update notice:', err?.message || err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-300 min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-lg sm:text-xl font-mono font-bold text-white flex items-center gap-2 flex-wrap">
          <Activity className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="truncate">DEVELOPER DIAGNOSTICS & SYSTEM SETTINGS</span>
        </h1>
        <p className="text-xs font-mono text-neutral-400 mt-1">
          ULTRON live capability self-diagnostic engine, voice pipeline telemetry, real-time microphone tester, multi-AI failover router config, and PC Companion status.
        </p>
      </div>

      {/* 0. ULTRON LIVE CAPABILITY REGISTRY & SELF-DIAGNOSTIC ENGINE */}
      <UltronSelfDiagnosticPanel />

      {/* 1. LIVE INTERACTIVE MIC & MULTILINGUAL TESTER */}
      <section className="p-5 rounded-2xl border border-sky-500/40 bg-neutral-900/70 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white">
                Live Microphone & Speech Recognition Tester
              </h2>
              <p className="text-[11px] font-mono text-neutral-400">
                Test browser microphone permissions, Web Speech STT, and Gemini Multimodal audio fallback in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = liveLang === 'en-US' ? 'bn-BD' : 'en-US';
                setLiveLang(next);
                VoiceEngine.getInstance().setLanguage(next);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs font-mono text-neutral-200 flex items-center gap-1 hover:border-cyan-400"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{liveLang === 'en-US' ? 'English (EN)' : 'বাংলা (Bangla)'}</span>
            </button>

            <button
              onClick={handleToggleLiveMicTest}
              className={`px-4 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                isLiveMicTesting
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-sky-400 hover:bg-sky-300 text-black'
              }`}
            >
              {isLiveMicTesting ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isLiveMicTesting ? 'STOP MIC TEST' : 'START LIVE MIC TEST'}</span>
            </button>
          </div>
        </div>

        {/* Live Mic Feedback & Status */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isLiveMicTesting ? 'bg-sky-400 animate-ping' : 'bg-neutral-600'}`} />
              Status: <strong className="text-neutral-200">{micStatusMessage || 'Idle. Click "Start Live Mic Test" to verify.'}</strong>
            </span>
            <span className="text-[10px] text-cyan-400">Language: {liveLang}</span>
          </div>

          {liveTranscript && (
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-sm font-sans text-white">
              <span className="text-xs font-mono text-cyan-400 mr-2">Captured Voice:</span>
              "{liveTranscript}"
            </div>
          )}

          {/* Quick Voice Synthesis Playback Buttons with Dynamic Prosody & Moods */}
          <div className="space-y-2 pt-2 border-t border-neutral-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-neutral-400">Prosody & Mood Voice Synthesis (TTS):</span>
              <span className="text-[10px] font-mono text-cyan-400">Dynamic Pitch, Rate & Urgency</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                onClick={() => {
                  setIsSpeakingTest(true);
                  VoiceEngine.getInstance().speak(
                    'Warning! Security alert detected. Initiating immediate containment protocol.',
                    () => setIsSpeakingTest(false),
                    { urgency: 'critical', mood: 'serious' }
                  );
                }}
                disabled={isSpeakingTest}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300 hover:bg-rose-900/60 flex flex-col items-center justify-center text-center gap-1 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold text-[11px]">🚨 Urgent Alert</span>
                <span className="text-[9px] text-rose-400/80">1.25x • High Pitch</span>
              </button>

              <button
                onClick={() => {
                  setIsSpeakingTest(true);
                  VoiceEngine.getInstance().speak(
                    'Congratulations! System optimization is 100% complete with spectacular performance gains!',
                    () => setIsSpeakingTest(false),
                    { mood: 'excited', urgency: 'normal' }
                  );
                }}
                disabled={isSpeakingTest}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs font-mono text-amber-300 hover:bg-amber-900/60 flex flex-col items-center justify-center text-center gap-1 disabled:opacity-50"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-[11px]">✨ Excited</span>
                <span className="text-[9px] text-amber-400/80">1.14x • 1.15 Pitch</span>
              </button>

              <button
                onClick={() => {
                  setIsSpeakingTest(true);
                  VoiceEngine.getInstance().speak(
                    'Analyzing algorithmic telemetry. Memory fragmentation is minimized at zero point zero four percent.',
                    () => setIsSpeakingTest(false),
                    { mood: 'analytical', urgency: 'normal' }
                  );
                }}
                disabled={isSpeakingTest}
                className="px-2.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/60 text-xs font-mono text-purple-300 hover:bg-purple-900/60 flex flex-col items-center justify-center text-center gap-1 disabled:opacity-50"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold text-[11px]">🧠 Analytical</span>
                <span className="text-[9px] text-purple-400/80">1.06x • Low Pitch</span>
              </button>

              <button
                onClick={() => {
                  setIsSpeakingTest(true);
                  VoiceEngine.getInstance().speak(
                    'All tasks are resolved. System is standing by in peaceful equilibrium.',
                    () => setIsSpeakingTest(false),
                    { mood: 'calm', urgency: 'low' }
                  );
                }}
                disabled={isSpeakingTest}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs font-mono text-emerald-300 hover:bg-emerald-900/60 flex flex-col items-center justify-center text-center gap-1 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-[11px]">🌿 Calm / Low</span>
                <span className="text-[9px] text-emerald-400/80">0.89x • Soft Pitch</span>
              </button>

              <button
                onClick={() => {
                  setIsSpeakingTest(true);
                  VoiceEngine.getInstance().speak(
                    'I understand that was inconvenient. Let me assist you with correcting the setup immediately.',
                    () => setIsSpeakingTest(false),
                    { mood: 'empathetic', urgency: 'low' }
                  );
                }}
                disabled={isSpeakingTest}
                className="px-2.5 py-1.5 rounded-lg bg-sky-950/40 border border-sky-800/60 text-xs font-mono text-sky-300 hover:bg-sky-900/60 flex flex-col items-center justify-center text-center gap-1 disabled:opacity-50"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold text-[11px]">💙 Empathetic</span>
                <span className="text-[9px] text-sky-400/80">0.96x • 1.04 Pitch</span>
              </button>

              <button
                onClick={() => {
                  setIsSpeakingTest(true);
                  VoiceEngine.getInstance().speak(
                    'Primary subroutines active. Multi-part queue initialized. All parameters nominal and executing.',
                    () => setIsSpeakingTest(false),
                    { mood: 'cybernetic', urgency: 'high' }
                  );
                }}
                disabled={isSpeakingTest}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs font-mono text-cyan-300 hover:bg-cyan-900/60 flex flex-col items-center justify-center text-center gap-1 disabled:opacity-50"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-[11px]">⚡ Cybernetic</span>
                <span className="text-[9px] text-cyan-400/80">1.25x • Fast Command</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FULL 5-STAGE VOICE PIPELINE BENCHMARK */}
      <section className="p-5 rounded-2xl border border-cyan-500/30 bg-neutral-900/60 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white">
                5-Stage Full Voice Pipeline Diagnostic
              </h2>
              <p className="text-[11px] font-mono text-neutral-400">
                Tests Mic Capture → Audio VAD → STT Term Normalizer → AI Intent → TTS Clean Queue
              </p>
            </div>
          </div>

          <button
            onClick={handleTestVoicePipeline}
            disabled={isTestingVoice}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {isTestingVoice ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>TESTING PIPELINE...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>TEST FULL VOICE SYSTEM</span>
              </>
            )}
          </button>
        </div>

        {voicePipelineResult ? (
          <div className="space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-emerald-500/40 text-xs font-mono">
              <span className="text-emerald-400 font-bold">VOICE SYSTEM: READY</span>
              <span className="text-neutral-400">
                End-to-End Latency: <strong className="text-white">{voicePipelineResult.totalLatencyMs}ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {voicePipelineResult.steps.map((st: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between text-neutral-200">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {st.name}
                    </span>
                    <span className="text-[10px] text-cyan-400">{st.latencyMs}ms</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">{st.details}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono text-neutral-500 italic">
            Run the diagnostic to benchmark speech synthesis, interruption, and multilingual recognition latency.
          </p>
        )}
      </section>

      {/* 3. INTENT ROUTER DECISION-MAKING & MULTI-AGENT DIAGNOSTICS */}
      <IntentRouterDashboard />

      {/* 4. AI PROVIDER REGISTRY & ROUTER SETTINGS */}
      <section className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white">AI Provider Failover Registry</h2>
              <p className="text-[11px] font-mono text-neutral-400">
                Priority-scored failover routing. If primary limits are reached, tasks auto-checkpoint and continue.
              </p>
            </div>
          </div>

          {/* Cost Preference Mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">Routing Mode:</span>
            <select
              value={costPreference}
              onChange={(e) => handleUpdateCostPreference(e.target.value as CostPreference)}
              className="text-xs font-mono bg-neutral-950 border border-neutral-700 text-cyan-400 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="FREE_FIRST">FREE FIRST</option>
              <option value="BALANCED">BALANCED</option>
              <option value="BEST_QUALITY">BEST QUALITY</option>
              <option value="USER_CONTROLLED">USER CONTROLLED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/90 space-y-2.5 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase">{p.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    p.health === 'AVAILABLE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : p.health === 'RATE_LIMITED'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {p.health}
                </span>
              </div>

              <div className="text-[11px] text-neutral-400 space-y-0.5">
                <p>
                  Models: <span className="text-neutral-300">{p.models[0]}</span>
                </p>
                <p>
                  Latency: <span className="text-cyan-400">{p.latencyMs}ms</span> | Priority: #{p.priority}
                </p>
                <p>
                  Cost Mode: <span className="text-amber-300 uppercase">{p.costMode}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500">
                  {p.isConfigured ? '✓ Configured' : 'Local / Shared Adapter'}
                </span>
                <button
                  onClick={() => handleTestProvider(p.id)}
                  disabled={testingProviderId === p.id}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[11px] text-cyan-400 hover:text-white"
                >
                  {testingProviderId === p.id ? 'Pinging...' : 'Ping Test'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DEVICE & PC COMPANION STATUS */}
      {deviceStatus && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-neutral-800 pb-2">
              <Smartphone className="w-4 h-4" />
              <span>Mobile / Host Environment</span>
            </div>
            <div className="space-y-1 text-neutral-300">
              <p>Platform: {deviceStatus.platform}</p>
              <p>Mic Permission: {deviceStatus.permissions.microphone}</p>
              <p>
                Memory: {deviceStatus.memory.freeGB} GB Free / {deviceStatus.memory.totalGB} GB Total
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-neutral-800 pb-2">
              <Monitor className="w-4 h-4" />
              <span>Future PC Companion Link</span>
            </div>
            <div className="space-y-1 text-neutral-300">
              <p>Node: {deviceStatus.companionBridge.targetPC}</p>
              <p>Tunnel: {deviceStatus.companionBridge.tunnelType} (Encrypted)</p>
              <p>
                Tools: {deviceStatus.companionBridge.authorizedTools.join(', ')}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
