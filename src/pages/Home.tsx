import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowRight,
  Code2,
  FolderGit2,
  Globe,
  Radio,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Smartphone,
  Youtube,
  PhoneCall,
  Brain,
  Eye,
  Terminal,
  Activity,
  Layers,
  Download,
  QrCode,
  Box,
  Compass,
} from 'lucide-react';
import { JarvisOrb } from '../components/JarvisOrb';
import { Jarvis3DCore, Jarvis3DModelType } from '../components/Jarvis3DCore';
import { OrbState, JarvisTask, CostPreference } from '../types/jarvis';

interface HomeProps {
  orbState: OrbState;
  audioLevel: number;
  onVoiceClick: () => void;
  onRunCommand: (cmd: string) => void;
  activeTask?: JarvisTask;
  isSecurityMode: boolean;
  onNavigateTab: (tab: any) => void;
  onOpenMobileDownload?: () => void;
  onOpenOnboarding?: () => void;
  currentLanguage?: 'en-US' | 'bn-BD';
  onToggleLanguage?: (lang: 'en-US' | 'bn-BD') => void;
}

export const Home: React.FC<HomeProps> = ({
  orbState,
  audioLevel,
  onVoiceClick,
  onRunCommand,
  activeTask,
  isSecurityMode,
  onNavigateTab,
  onOpenMobileDownload,
  onOpenOnboarding,
  currentLanguage = 'bn-BD',
  onToggleLanguage,
}) => {
  const [centerDisplayMode, setCenterDisplayMode] = useState<'3D_MODEL' | '2D_ORB'>('3D_MODEL');
  const [selected3DModel, setSelected3DModel] = useState<Jarvis3DModelType>('ARC_REACTOR');
  const quickCommands = [
    {
      title: '3D Hologram Circuit Board',
      command: 'Heyy ULTRON, show me a 3D circuit board',
      category: '3D_HOLOGRAM',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      desc: 'Interactive 3D WebGL circuit board with exploded layer view & component telemetry',
    },
    {
      title: 'Deep Analysis & Architecture',
      command: 'Heyy ULTRON, architect a full-stack mobile application with offline-first persistence and live voice intelligence',
      category: 'COGNITIVE_BRAIN',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      desc: 'Cognitive Core 8-stage decomposition, risk audit, and worker allocation',
    },
    {
      title: 'YouTube & Mobile Playback',
      command: 'Heyy ULTRON, YouTube e gan chalao',
      category: 'MOBILE_DEVICE',
      icon: <Youtube className="w-4 h-4 text-red-400" />,
      desc: 'Deep-link mobile YouTube search & playback ("YouTube e gan chalao")',
    },
    {
      title: 'Direct Phone Dialer & Contacts',
      command: 'Heyy ULTRON, Call Mom',
      category: 'MOBILE_DEVICE',
      icon: <PhoneCall className="w-4 h-4 text-emerald-400" />,
      desc: 'Instant tel: deep-link dialer & contacts directory ("Mom ke phone koro")',
    },
    {
      title: 'Build Restaurant Website',
      command: 'Build responsive Restaurant website with online menu, reservation system and gallery',
      category: 'WEB_DEVELOPMENT',
      icon: <Globe className="w-4 h-4 text-amber-400" />,
      desc: 'Auto-scan assets, scaffold layout, verify mobile touch UI',
    },
    {
      title: 'Debug C++ Project',
      command: 'ULTRON amar C++ spatial KD-Tree project ta check kore bug gula fix kore de',
      category: 'CODING',
      icon: <Code2 className="w-4 h-4 text-sky-400" />,
      desc: 'Bangla-English prompt, fix memory recursion, verify build',
    },
    {
      title: '24/7 Mobile Background Mode',
      command: 'Keep running in mobile background all the time',
      category: 'PERSISTENCE',
      icon: <Smartphone className="w-4 h-4 text-cyan-400" />,
      desc: 'Silent Audio oscillator + WakeLock to run 24/7 in background',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-300 min-w-0 overflow-x-hidden">
      {/* 1. HERO SECTION: JARVIS Central 3D Holographic Core & Avatar */}
      <section className="flex flex-col items-center justify-center text-center pt-2 pb-4 relative">
        {/* Background ambient lighting */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[110px] pointer-events-none transition-colors duration-500 ${
            isSecurityMode
              ? 'bg-rose-500/20'
              : orbState === 'LISTENING'
              ? 'bg-sky-500/25'
              : orbState === 'SPEAKING'
              ? 'bg-amber-500/25'
              : orbState === 'THINKING'
              ? 'bg-purple-500/25'
              : 'bg-cyan-500/20'
          }`}
        />

        {/* 3D Model vs 2D Orb Display Mode Selector */}
        <div className="mb-3 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 px-3 py-1 rounded-full text-xs font-mono">
          <button
            onClick={() => setCenterDisplayMode('3D_MODEL')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              centerDisplayMode === '3D_MODEL'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D HOLOGRAM CORE</span>
          </button>
          <button
            onClick={() => setCenterDisplayMode('2D_ORB')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              centerDisplayMode === '2D_ORB'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>QUANTUM ORB</span>
          </button>
        </div>

        {/* The Central Interactive View: 3D Holographic Model or 2D Orb */}
        {centerDisplayMode === '3D_MODEL' ? (
          <div className="w-full max-w-2xl mx-auto mb-2">
            <Jarvis3DCore
              orbState={orbState}
              audioLevel={audioLevel}
              onVoiceClick={onVoiceClick}
              height={380}
              initialModelType={selected3DModel}
            />
          </div>
        ) : (
          <JarvisOrb
            state={orbState}
            audioLevel={audioLevel}
            size={240}
            onClick={onVoiceClick}
          />
        )}

        <div className="mt-3 space-y-1.5 max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-white flex items-center justify-center gap-2">
            {isSecurityMode ? (
              <span className="text-rose-400">ULTRON SECURITY CORE</span>
            ) : (
              <span>ULTRON 3D HOLOGRAPHIC AI</span>
            )}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-neutral-400">
            {orbState === 'LISTENING'
              ? 'Listening... Say "Heyy ULTRON" or speak command in English, Bangla, or Banglish'
              : orbState === 'ANALYZING'
              ? 'Cognitive Super Brain analyzing intent, requirements & constraints...'
              : orbState === 'THINKING'
              ? 'Routing task across AI workers & preserving full state...'
              : orbState === 'SPEAKING'
              ? 'Speaking response. Say "Stop" or tap 3D core to interrupt.'
              : 'Always-On "Heyy ULTRON" standby active. 360° interactive spatial core operational.'}
          </p>
        </div>

        {/* Voice Trigger & Quick Mode CTA Buttons */}
        <div className="mt-5 flex flex-wrap justify-center items-center gap-3">
          <button
            id="home-main-voice-btn"
            onClick={onVoiceClick}
            className={`px-6 py-2.5 rounded-full font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition-all shadow-xl cursor-pointer ${
              orbState === 'LISTENING'
                ? 'bg-sky-400 text-black shadow-[0_0_25px_rgba(56,189,248,0.6)] scale-105 animate-pulse'
                : isSecurityMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{orbState === 'LISTENING' ? 'LISTENING (TAP TO STOP)' : 'SPEAK TO ULTRON'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('STARK_LAB')}
            className="px-4 py-2.5 rounded-full font-mono text-xs font-bold tracking-wider flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-amber-950/80 border border-amber-500/50 hover:border-amber-400 text-amber-300 transition-all cursor-pointer shadow-lg shadow-amber-950/40"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>STARK LAB & ARMORS</span>
          </button>
          <button
            onClick={() => onNavigateTab('HOLOGRAM_3D')}
            className="px-4 py-2.5 rounded-full font-mono text-xs font-bold tracking-wider flex items-center gap-2 bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>3D SCHEMATIC STUDIO</span>
          </button>
          <button
            onClick={() => onNavigateTab('COGNITIVE')}
            className="px-4 py-2.5 rounded-full font-mono text-xs font-bold tracking-wider flex items-center gap-2 bg-slate-900 border border-purple-500/40 hover:border-purple-400 text-purple-300 transition-all cursor-pointer shadow-lg"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span>SUPER BRAIN</span>
          </button>
          <button
            id="home-get-mobile-app-btn"
            onClick={onOpenMobileDownload}
            className="px-4 py-2.5 rounded-full font-mono text-xs font-bold tracking-wider flex items-center gap-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>GET MOBILE APP</span>
          </button>
        </div>

        {/* Voice STT Language & Phonetic Engine Selector */}
        {onToggleLanguage && (
          <div className="mt-4 inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-300 shadow-inner">
            <span className="text-neutral-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>VOICE LANGUAGE:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToggleLanguage('bn-BD')}
                className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] font-semibold cursor-pointer ${
                  currentLanguage === 'bn-BD'
                    ? 'bg-cyan-500 text-black shadow-sm font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                বাংলা (Bengali STT)
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage('en-US')}
                className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] font-semibold cursor-pointer ${
                  currentLanguage === 'en-US'
                    ? 'bg-cyan-500 text-black shadow-sm font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                English / Banglish (Auto-Correct)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 1.4. FIRST-RUN SETUP & 12-AGENT MATRIX QUICK BAR */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => onNavigateTab('NEXTGEN_OS')}
          className="p-4 rounded-2xl border border-cyan-500/60 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-purple-950/30 hover:border-cyan-400 transition-all flex items-center justify-between text-left group shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <span>NEXT-GEN AI OS SUITE</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-300 font-mono">
                  v5.4 OS
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-300 mt-0.5">
                Mission System, Tutor, Code QA, Vault & IoT Framework.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onOpenOnboarding}
          className="p-4 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 transition-all flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <span>SYSTEM CALIBRATION</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  SETUP
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Language (Banglish), voice persona & failover.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('COGNITIVE')}
          className="p-4 rounded-2xl border border-purple-500/40 bg-purple-950/20 hover:bg-purple-950/40 transition-all flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <span>12-AGENT COGNITIVE MATRIX</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                  12 CORES
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Deep analysis & multi-worker cognitive allocation.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* 1.5. MOBILE DOWNLOAD & PWA INSTALL BANNER */}
      <section
        id="home-mobile-download-banner"
        className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                DOWNLOAD JARVIS FOR YOUR MOBILE (ANDROID & iOS)
              </h2>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PWA / WebAPK
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              Scan instant QR code or download launcher for 24/7 background audio, flashlight control, YouTube automation, and lockscreen voice controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenMobileDownload}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>GET MOBILE LINK & QR</span>
          </button>
        </div>
      </section>

      {/* 2. PERSISTENT ACTIVE TASK HUD */}
      {activeTask && (
        <section
          id="home-active-task-hud"
          className="border border-cyan-500/30 bg-neutral-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl transition-all"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs font-bold text-cyan-400">
                ACTIVE TASK PERSISTENCE
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                {activeTask.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 uppercase">
                {activeTask.category}
              </span>
              <button
                onClick={() => onNavigateTab('TASKS')}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                View Timeline <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 space-y-1.5">
              <h3 className="text-sm font-medium text-white line-clamp-1">
                "{activeTask.originalCommand}"
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
                <span>
                  Provider:{' '}
                  <strong className="text-cyan-300 capitalize">{activeTask.currentProvider}</strong>{' '}
                  ({activeTask.currentModel})
                </span>
                {activeTask.previousProviders && activeTask.previousProviders.length > 0 && (
                  <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800 text-[10px]">
                    Failover from: {activeTask.previousProviders.join(' → ')}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-neutral-300">
                <span>Progress</span>
                <span className="text-cyan-400 font-bold">{activeTask.progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-500"
                  style={{ width: `${activeTask.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stepper overview */}
          {activeTask.steps && activeTask.steps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-2">
              {activeTask.steps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                      : step.status === 'IN_PROGRESS'
                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800 animate-pulse'
                      : 'bg-neutral-950 text-neutral-500 border border-neutral-800'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{step.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2.5. MOBILE AUTOMATION & 24/7 BACKGROUND PERSISTENCE SHORTCUT */}
      <section
        onClick={() => onNavigateTab('MOBILE')}
        className="bg-gradient-to-r from-cyan-950/40 via-neutral-900/80 to-blue-950/40 border border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group transition-all shadow-lg"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                MOBILE CONTROL & 24/7 BACKGROUND ENGINE
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              Control mobile apps (YouTube, Phone calls, WhatsApp), Flashlight, and keep JARVIS running 24/7 with lockscreen controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 shrink-0 group-hover:translate-x-1 transition-transform">
          <span>OPEN SUITE</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </section>

      {/* 2.6. SUPREME PLATFORM ARCHITECTURE SUITE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <button
          onClick={() => onNavigateTab('THINK_TANK')}
          className="text-left p-4 rounded-2xl border border-cyan-500/30 bg-neutral-900/50 hover:bg-neutral-900/90 hover:border-cyan-400/60 transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              5-STAGE CoT
            </span>
          </div>
          <h3 className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
            THINK-TANK & RECURSIVE DEBUGGER
          </h3>
          <p className="text-[11px] font-mono text-neutral-400 mt-1 line-clamp-2">
            Multi-phase reasoning, Bangla technical NLP, and autonomous sandboxed test-correction loops.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('MEMORY')}
          className="text-left p-4 rounded-2xl border border-purple-500/30 bg-neutral-900/50 hover:bg-neutral-900/90 hover:border-purple-400/60 transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              32-DIM VECTORS
            </span>
          </div>
          <h3 className="text-xs font-mono font-bold text-white group-hover:text-purple-300 transition-colors">
            LONG-TERM VECTOR MEMORY
          </h3>
          <p className="text-[11px] font-mono text-neutral-400 mt-1 line-clamp-2">
            User-specific knowledge graph, semantic document retrieval, and persistent coding preferences.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('PERCEPTION')}
          className="text-left p-4 rounded-2xl border border-emerald-500/30 bg-neutral-900/50 hover:bg-neutral-900/90 hover:border-emerald-400/60 transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              SCREEN + TONE
            </span>
          </div>
          <h3 className="text-xs font-mono font-bold text-white group-hover:text-emerald-300 transition-colors">
            REAL-WORLD PERCEPTION & TONE
          </h3>
          <p className="text-[11px] font-mono text-neutral-400 mt-1 line-clamp-2">
            IDE & UI/UX visual audit, camera hardware perception, and tactical adaptive voice synthesis.
          </p>
        </button>
      </section>

      {/* 3. QUICK COMMANDS (ONE-SHOT MULTI-AI WORKFLOWS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Action Templates</span>
          </h2>
          <span className="text-[11px] font-mono text-neutral-500">
            One command = Full task execution
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => onRunCommand(cmd.command)}
              className="text-left p-3.5 rounded-xl border border-neutral-800/90 bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-cyan-500/40 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 group-hover:border-cyan-500/30">
                {cmd.icon}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {cmd.title}
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {cmd.category}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-1">{cmd.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. SYSTEM HEALTH & MULTI-AI STATUS MATRIX */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-1">
          <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
            <span>AI ROUTER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-mono font-bold text-white">5 Active Providers</p>
          <p className="text-[10px] font-mono text-cyan-400">Auto Failover: ON</p>
        </div>

        <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-1">
          <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
            <span>VOICE PIPELINE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-mono font-bold text-white">VAD + STT/TTS</p>
          <p className="text-[10px] font-mono text-amber-400">Bangla + English</p>
        </div>

        <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-1">
          <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
            <span>TASK MEMORY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-mono font-bold text-white">Continuous Memory</p>
          <p className="text-[10px] font-mono text-purple-400">Checkpoints: Enabled</p>
        </div>

        <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-1">
          <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
            <span>SECURITY CORE</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSecurityMode ? 'bg-rose-400 animate-ping' : 'bg-neutral-600'
              }`}
            />
          </div>
          <p className="text-xs font-mono font-bold text-white">
            {isSecurityMode ? 'TERMINAL ACTIVE' : 'STANDBY'}
          </p>
          <p className="text-[10px] font-mono text-neutral-400">Ethical Shield Active</p>
        </div>
      </section>
    </div>
  );
};
