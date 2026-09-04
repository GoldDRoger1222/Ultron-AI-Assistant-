import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Target,
  Code2,
  GraduationCap,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Languages,
  Database,
  Radio,
  Activity,
  AlertOctagon,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Lock,
  Eye,
  Layers,
  Zap,
  RefreshCw,
  Search,
  BookOpen,
  ChevronRight,
  Terminal,
  ShieldAlert,
  Power,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  UltronPersonality,
  UltronSystemHealthDiagnostic,
  MissionObjective,
  TutorCourseSession,
  AutonomousCodingProject,
  DataIntelligenceAnalysis,
  DocumentIntelligenceAnalysis,
  CredentialVaultItem,
  VoiceUserProfile,
  UniversalTranslationOutput,
  SemanticMemoryRecord,
  DiscoveredLocalDevice,
  HardwareTelemetryState,
  AuditTimelineEvent,
} from '../types/jarvis';

type OSTab =
  | 'OVERVIEW'
  | 'MISSIONS'
  | 'AUTONOMOUS_CODE'
  | 'TUTOR'
  | 'DATA_DOCS'
  | 'IOT_NETWORK'
  | 'TRANSLATOR'
  | 'VAULT_VOICE'
  | 'MEMORY_CONTEXT'
  | 'AUDIT_DOCS';

export const UltronNextGenOSSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OSTab>('OVERVIEW');
  const [diagnostics, setDiagnostics] = useState<UltronSystemHealthDiagnostic | null>(null);
  const [personality, setPersonality] = useState<UltronPersonality>('FUTURISTIC');
  const [isHalted, setIsHalted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [telemetry, setTelemetry] = useState<HardwareTelemetryState | null>(null);

  // Missions State
  const [missions, setMissions] = useState<MissionObjective[]>([]);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [isCreatingMission, setIsCreatingMission] = useState(false);

  // Autonomous Code & QA State
  const [codeProjects, setCodeProjects] = useState<AutonomousCodingProject[]>([]);
  const [projNameInput, setProjNameInput] = useState('');
  const [projSpecInput, setProjSpecInput] = useState('');
  const [projLang, setProjLang] = useState<AutonomousCodingProject['language']>('TYPESCRIPT');
  const [isBuildingCode, setIsBuildingCode] = useState(false);

  // Tutor State
  const [tutorSessions, setTutorSessions] = useState<TutorCourseSession[]>([]);
  const [tutorTopicInput, setTutorTopicInput] = useState('');
  const [tutorModeInput, setTutorModeInput] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [selectedTutorSession, setSelectedTutorSession] = useState<TutorCourseSession | null>(null);
  const [isLoadingTutor, setIsLoadingTutor] = useState(false);

  // Data & Docs State
  const [dataReports, setDataReports] = useState<DataIntelligenceAnalysis[]>([]);
  const [docReports, setDocReports] = useState<DocumentIntelligenceAnalysis[]>([]);
  const [rawDataInput, setRawDataInput] = useState('region,sales_q1,churn_rate,servers\nAPAC,450000,0.02,120\nEMEA,320000,0.04,95\nAMER,580000,0.01,180');
  const [isAnalyzingData, setIsAnalyzingData] = useState(false);

  // IoT State
  const [iotDevices, setIotDevices] = useState<DiscoveredLocalDevice[]>([]);
  const [isScanningIot, setIsScanningIot] = useState(false);

  // Translator State
  const [translateInput, setTranslateInput] = useState('');
  const [targetLang, setTargetLang] = useState('bn-BD');
  const [translationResult, setTranslationResult] = useState<UniversalTranslationOutput | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Vault & Voice State
  const [credentials, setCredentials] = useState<CredentialVaultItem[]>([]);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceUserProfile[]>([]);

  // Memory & Audit State
  const [memories, setMemories] = useState<SemanticMemoryRecord[]>([]);
  const [memorySearchQuery, setMemorySearchQuery] = useState('');
  const [auditTrail, setAuditTrail] = useState<AuditTimelineEvent[]>([]);

  // Initial Data Load
  useEffect(() => {
    fetchDiagnostics();
    fetchMissions();
    fetchCodeProjects();
    fetchTutorSessions();
    fetchTelemetry();
    fetchIotDevices();
    fetchCredentials();
    fetchVoiceProfiles();
    fetchMemories();
    fetchAuditTrail();

    const interval = setInterval(() => {
      fetchTelemetry();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/executive-os/diagnostics');
      const data = await res.json();
      setDiagnostics(data);
      const pRes = await fetch('/api/executive-os/personality');
      const pData = await pRes.json();
      setPersonality(pData.personality);
      setIsHalted(pData.isGlobalHalted);
      setIsOffline(pData.isOfflineMode);
    } catch {
      // Offline fallback
    }
  };

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/hardware/telemetry');
      const data = await res.json();
      setTelemetry(data);
    } catch {}
  };

  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/missions');
      const data = await res.json();
      if (data.missions) setMissions(data.missions);
    } catch {}
  };

  const fetchCodeProjects = async () => {
    try {
      const res = await fetch('/api/autonomous-coder/projects');
      const data = await res.json();
      if (data.projects) setCodeProjects(data.projects);
    } catch {}
  };

  const fetchTutorSessions = async () => {
    try {
      const res = await fetch('/api/tutor/sessions');
      const data = await res.json();
      if (data && data.sessions) {
        setTutorSessions(data.sessions);
        if (data.sessions.length > 0 && !selectedTutorSession) {
          setSelectedTutorSession(data.sessions[0]);
        }
      }
    } catch {}
  };

  const fetchIotDevices = async () => {
    try {
      const res = await fetch('/api/iot/devices');
      const data = await res.json();
      if (data.devices) setIotDevices(data.devices);
    } catch {}
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/vault/credentials');
      const data = await res.json();
      if (data.credentials) setCredentials(data.credentials);
    } catch {}
  };

  const fetchVoiceProfiles = async () => {
    try {
      const res = await fetch('/api/voice-profiles');
      const data = await res.json();
      if (data.profiles) setVoiceProfiles(data.profiles);
    } catch {}
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/semantic-memory');
      const data = await res.json();
      if (data.memories) setMemories(data.memories);
    } catch {}
  };

  const fetchAuditTrail = async () => {
    try {
      const res = await fetch('/api/audit/trail');
      const data = await res.json();
      if (data.trail) setAuditTrail(data.trail);
    } catch {}
  };

  // Actions
  const handleGlobalStop = async () => {
    try {
      const res = await fetch('/api/executive-os/global-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual Emergency Stop Button Triggered' }),
      });
      await res.json();
      setIsHalted(true);
      fetchMissions();
      fetchAuditTrail();
      fetchDiagnostics();
    } catch {}
  };

  const handleResume = async () => {
    try {
      const res = await fetch('/api/executive-os/resume', { method: 'POST' });
      await res.json();
      setIsHalted(false);
      fetchMissions();
      fetchAuditTrail();
      fetchDiagnostics();
    } catch {}
  };

  const handlePersonalityChange = async (newP: UltronPersonality) => {
    try {
      await fetch('/api/executive-os/personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality: newP }),
      });
      setPersonality(newP);
    } catch {}
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    setIsCreatingMission(true);
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: newGoalInput, category: 'ENGINEERING', priority: 'HIGH' }),
      });
      const data = await res.json();
      if (data.mission) {
        setMissions((prev) => [data.mission, ...prev]);
        setNewGoalInput('');
      }
    } catch {}
    setIsCreatingMission(false);
  };

  const handleRunAutonomousCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projNameInput.trim() || !projSpecInput.trim()) return;
    setIsBuildingCode(true);
    try {
      const res = await fetch('/api/autonomous-coder/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projNameInput, specification: projSpecInput, language: projLang }),
      });
      const data = await res.json();
      if (data.project) {
        setCodeProjects((prev) => [data.project, ...prev]);
        setProjNameInput('');
        setProjSpecInput('');
      }
    } catch {}
    setIsBuildingCode(false);
  };

  const handleStartLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorTopicInput.trim()) return;
    setIsLoadingTutor(true);
    try {
      const res = await fetch('/api/tutor/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: tutorTopicInput, mode: tutorModeInput }),
      });
      const data = await res.json();
      if (data.session) {
        setTutorSessions((prev) => [data.session, ...prev]);
        setSelectedTutorSession(data.session);
        setTutorTopicInput('');
      }
    } catch {}
    setIsLoadingTutor(false);
  };

  const handleAnswerQuiz = async (questionId: string, optionIdx: number) => {
    if (!selectedTutorSession) return;
    try {
      const res = await fetch(`/api/tutor/${selectedTutorSession.id}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedIndex: optionIdx }),
      });
      const data = await res.json();
      setSelectedTutorSession((prev) => {
        if (!prev) return prev;
        const updatedQuestions = prev.quizQuestions.map((q) =>
          q.id === questionId ? { ...q, userSelectedIndex: optionIdx, isCorrect: data.isCorrect } : q
        );
        return { ...prev, quizQuestions: updatedQuestions, masteryScore: data.updatedScore };
      });
    } catch {}
  };

  const handleScanIot = async () => {
    setIsScanningIot(true);
    try {
      const res = await fetch('/api/iot/scan', { method: 'POST' });
      const data = await res.json();
      if (data.devices) setIotDevices(data.devices);
    } catch {}
    setIsScanningIot(false);
  };

  const handleAuthorizeDevice = async (id: string, scope: 'CONTROL_ALLOWED' | 'READ_ONLY') => {
    try {
      await fetch(`/api/iot/devices/${id}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionScope: scope }),
      });
      fetchIotDevices();
    } catch {}
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!translateInput.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translator/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translateInput, targetLanguage: targetLang }),
      });
      const data = await res.json();
      setTranslationResult(data);
    } catch {}
    setIsTranslating(false);
  };

  const handleAnalyzeData = async () => {
    if (!rawDataInput.trim()) return;
    setIsAnalyzingData(true);
    try {
      const res = await fetch('/api/data-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: rawDataInput, datasetName: 'Live_Executive_Metrics.csv' }),
      });
      const data = await res.json();
      if (data.report) {
        setDataReports((prev) => [data.report, ...prev]);
      }
    } catch {}
    setIsAnalyzingData(false);
  };

  return (
    <div id="ultron-nextgen-suite" className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* HEADER & EXECUTIVE CONTROLS */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  ULTRON NEXT-GEN OS
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
                    v5.4 EXECUTIVE CORE
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Autonomous Goal Execution • Code QA & Healing • Interactive Tutor • Zero-Trust Vault
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action System Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Personality Selector */}
            <div className="flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-neutral-400 font-mono">Personality:</span>
              <select
                id="personality-select"
                value={personality}
                onChange={(e) => handlePersonalityChange(e.target.value as UltronPersonality)}
                className="bg-transparent text-cyan-300 font-mono focus:outline-none cursor-pointer"
              >
                <option value="FUTURISTIC">FUTURISTIC</option>
                <option value="DEVELOPER">DEVELOPER</option>
                <option value="TEACHER">TEACHER</option>
                <option value="RESEARCHER">RESEARCHER</option>
                <option value="PROFESSIONAL">PROFESSIONAL</option>
                <option value="FRIENDLY">FRIENDLY</option>
                <option value="MINIMAL">MINIMAL</option>
              </select>
            </div>

            {/* Offline Mode Toggle */}
            <button
              id="toggle-offline-btn"
              onClick={async () => {
                const next = !isOffline;
                setIsOffline(next);
                await fetch('/api/executive-os/toggle-offline', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ enabled: next }),
                });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                isOffline
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              {isOffline ? 'OFFLINE MODE' : 'ONLINE CLOUD'}
            </button>

            {/* Global Emergency Stop / Resume */}
            {isHalted ? (
              <button
                id="global-resume-btn"
                onClick={handleResume}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold font-mono bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                RESUME OS OPERATIONS
              </button>
            ) : (
              <button
                id="global-stop-btn"
                onClick={handleGlobalStop}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold font-mono bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all"
              >
                <AlertOctagon className="w-4 h-4" />
                GLOBAL STOP ("ULTRON STOP")
              </button>
            )}
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex flex-wrap gap-1.5 border-b border-neutral-800 pb-2">
          {[
            { id: 'OVERVIEW', label: 'Executive Diagnostics', icon: Activity },
            { id: 'MISSIONS', label: 'Goal & Mission System', icon: Target },
            { id: 'AUTONOMOUS_CODE', label: 'Autonomous Coder & QA', icon: Code2 },
            { id: 'TUTOR', label: 'Interactive Tutor Mode', icon: GraduationCap },
            { id: 'DATA_DOCS', label: 'Data & Doc Intelligence', icon: FileSpreadsheet },
            { id: 'IOT_NETWORK', label: 'IoT & Device Discovery', icon: Radio },
            { id: 'TRANSLATOR', label: 'Polyglot & Bangla Hub', icon: Languages },
            { id: 'VAULT_VOICE', label: 'Vault & Voice Profiles', icon: Lock },
            { id: 'MEMORY_CONTEXT', label: 'Semantic Memory', icon: Database },
            { id: 'AUDIT_DOCS', label: 'Audit & Documentation', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`os-tab-${tab.id.toLowerCase()}`}
                onClick={() => setActiveTab(tab.id as OSTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: EXECUTIVE DIAGNOSTICS & HARDWARE TELEMETRY */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Live Hardware Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <p className="text-[11px] text-neutral-400 font-mono">CPU LOAD</p>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-1">{telemetry?.cpuUsagePercent ?? 24}%</p>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${telemetry?.cpuUsagePercent ?? 24}%` }} />
                </div>
              </div>
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <p className="text-[11px] text-neutral-400 font-mono">RAM UTILIZATION</p>
                <p className="text-xl font-bold text-purple-400 font-mono mt-1">{telemetry?.ramUsagePercent ?? 48}%</p>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-400 h-full" style={{ width: `${telemetry?.ramUsagePercent ?? 48}%` }} />
                </div>
              </div>
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <p className="text-[11px] text-neutral-400 font-mono">CORE TEMP</p>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{telemetry?.cpuTemperatureC ?? 46.2} °C</p>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">Thermal Nominal</p>
              </div>
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <p className="text-[11px] text-neutral-400 font-mono">NETWORK LATENCY</p>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-1">{telemetry?.networkLatencyMs ?? 14} ms</p>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">Bandwidth: 850 Mbps</p>
              </div>
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <p className="text-[11px] text-neutral-400 font-mono">POWER / BATTERY</p>
                <p className="text-xl font-bold text-amber-400 font-mono mt-1">{telemetry?.batteryPercent ?? 98}%</p>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">AC Line Connected</p>
              </div>
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <p className="text-[11px] text-neutral-400 font-mono">HEALTH STATE</p>
                <p className={`text-xl font-bold font-mono mt-1 ${isHalted ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isHalted ? 'HALTED' : 'NOMINAL'}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">Zero Fault Isolation</p>
              </div>
            </div>

            {/* Subsystem Health Grid */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  ULTRON 15-SUBSYSTEM HEALTH MATRIX
                </h3>
                <button
                  onClick={fetchDiagnostics}
                  className="text-xs text-neutral-400 hover:text-cyan-400 flex items-center gap-1 font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-evaluate Diagnostics
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {diagnostics?.subsystems.map((sub, idx) => (
                  <div key={idx} className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-neutral-200">{sub.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          sub.status === 'HEALTHY'
                            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>Latency: {sub.latencyMs}ms</span>
                      <span className="text-neutral-500 truncate max-w-[140px]">{sub.notes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOAL & MISSION SYSTEM */}
        {activeTab === 'MISSIONS' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                INITIATE NEW AUTONOMOUS GOAL
              </h3>
              <p className="text-xs text-neutral-400">
                Give ULTRON any complex objective. The SuperBrain decomposes it into prioritized tasks, selects optimal agents, runs verification loops, and tracks full execution.
              </p>
              <form onSubmit={handleCreateMission} className="flex gap-2">
                <input
                  id="mission-goal-input"
                  type="text"
                  placeholder='e.g., "Build me an online store with Stripe payments and product recommendation AI"'
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-cyan-500/60 font-mono"
                />
                <button
                  id="submit-mission-btn"
                  type="submit"
                  disabled={isCreatingMission || !newGoalInput.trim()}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreatingMission ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  DECOMPOSE GOAL
                </button>
              </form>
            </div>

            {/* Active Missions List */}
            <div className="space-y-4">
              {missions.map((mission) => (
                <div key={mission.id} className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-semibold">
                          {mission.priority} PRIORITY
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">{mission.category}</span>
                      </div>
                      <h4 className="text-base font-bold text-white font-mono mt-1">{mission.title}</h4>
                      <p className="text-xs text-neutral-400">{mission.goal}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono text-neutral-400">Progress</span>
                        <p className="text-sm font-bold text-cyan-400 font-mono">{mission.progressPercent}%</p>
                      </div>
                      <span
                        className={`text-xs font-mono px-2.5 py-1 rounded-md border ${
                          mission.status === 'RUNNING'
                            ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                            : mission.status === 'COMPLETED'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : 'bg-neutral-950 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {mission.status}
                      </span>
                    </div>
                  </div>

                  {/* Subtask Breakdown */}
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-neutral-400">Subtask Execution Pipeline:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mission.subtasks.map((sub, idx) => (
                        <div key={sub.id} className="bg-neutral-950/80 border border-neutral-800/60 rounded-lg p-3 flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {sub.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : sub.status === 'RUNNING' ? (
                              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                            ) : (
                              <Clock className="w-4 h-4 text-neutral-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-medium text-neutral-200">
                                {idx + 1}. {sub.title}
                              </span>
                              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-800/40">
                                {sub.assignedAgent}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">{sub.description}</p>
                            {sub.output && (
                              <p className="text-[10px] text-cyan-300/80 font-mono mt-1 bg-cyan-950/20 px-2 py-1 rounded border border-cyan-900/40">
                                {sub.output}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AUTONOMOUS CODING & QA AGENT */}
        {activeTab === 'AUTONOMOUS_CODE' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                AUTONOMOUS CODING & CONTINUOUS QA ENGINE
              </h3>
              <p className="text-xs text-neutral-400">
                Specification → Architecture Planning → Code Implementation → Compilation → Unit/Integration/Security QA → Auto-Fixing → Verification.
              </p>

              <form onSubmit={handleRunAutonomousCode} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    id="code-proj-name"
                    type="text"
                    placeholder="Project / Feature Name"
                    value={projNameInput}
                    onChange={(e) => setProjNameInput(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500/60 font-mono"
                  />
                  <select
                    id="code-proj-lang"
                    value={projLang}
                    onChange={(e) => setProjLang(e.target.value as any)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500/60 font-mono cursor-pointer"
                  >
                    <option value="TYPESCRIPT">TypeScript / Node.js</option>
                    <option value="CPP">Modern C++ (RAII / Polymorphic)</option>
                    <option value="PYTHON">Python (AsyncIO / ML)</option>
                    <option value="RUST">Rust (Memory Safe / Cargo)</option>
                    <option value="SQL">PostgreSQL / Relational</option>
                    <option value="FLUTTER">Flutter / Dart</option>
                  </select>
                  <button
                    id="run-autonomous-code-btn"
                    type="submit"
                    disabled={isBuildingCode || !projNameInput.trim() || !projSpecInput.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold font-mono rounded-lg px-4 py-2 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {isBuildingCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                    EXECUTE DEV & QA CYCLE
                  </button>
                </div>
                <textarea
                  id="code-proj-spec"
                  rows={3}
                  placeholder="Specify system requirements, concurrency constraints, API contract, and test conditions..."
                  value={projSpecInput}
                  onChange={(e) => setProjSpecInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500/60 font-mono"
                />
              </form>
            </div>

            {/* Projects & QA Results */}
            <div className="space-y-4">
              {codeProjects.map((proj) => (
                <div key={proj.id} className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-semibold">
                          {proj.language}
                        </span>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          STATUS: {proj.executionStatus}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white font-mono mt-1">{proj.name}</h4>
                      <p className="text-xs text-neutral-400">{proj.architecturePlan}</p>
                    </div>
                  </div>

                  {/* QA Test Suite Grid */}
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-neutral-400">Continuous QA Test Results:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {proj.testSuite.map((test, idx) => (
                        <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs font-mono space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">{test.type}</span>
                            <span className={test.passed ? 'text-emerald-400' : 'text-rose-400'}>
                              {test.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <p className="text-white text-[11px] font-semibold truncate">{test.name}</p>
                          <p className="text-[10px] text-neutral-500">Latency: {test.durationMs}ms</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code File Preview */}
                  {proj.files && proj.files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-neutral-400">Generated Code Module ({proj.files[0].path}):</p>
                      <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-xs font-mono text-cyan-300 overflow-x-auto max-h-60">
                        {proj.files[0].content}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INTERACTIVE TUTOR & LEARNING MODE */}
        {activeTab === 'TUTOR' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                ULTRON INTERACTIVE TUTOR & STUDY PLANNER
              </h3>
              <p className="text-xs text-neutral-400">
                Interactive masterclass generator with real-time mistake diagnosis, step-by-step concepts, quizzes, and adaptive difficulty.
              </p>

              <form onSubmit={handleStartLesson} className="flex flex-col sm:flex-row gap-2">
                <input
                  id="tutor-topic-input"
                  type="text"
                  placeholder='e.g., "C++ Object-Oriented Programming & Smart Pointers"'
                  value={tutorTopicInput}
                  onChange={(e) => setTutorTopicInput(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-cyan-500/60 font-mono"
                />
                <select
                  id="tutor-difficulty-select"
                  value={tutorModeInput}
                  onChange={(e) => setTutorModeInput(e.target.value as any)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono cursor-pointer"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
                <button
                  id="start-lesson-btn"
                  type="submit"
                  disabled={isLoadingTutor || !tutorTopicInput.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold font-mono rounded-lg px-5 py-2 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isLoadingTutor ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                  GENERATE MASTERCLASS
                </button>
              </form>
            </div>

            {/* Active Lesson Display */}
            {selectedTutorSession && (
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-semibold">
                      {selectedTutorSession.mode} LEVEL
                    </span>
                    <h3 className="text-lg font-bold text-white font-mono mt-1">{selectedTutorSession.topic}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-neutral-400">Mastery Score</span>
                    <p className="text-xl font-bold text-emerald-400 font-mono">{selectedTutorSession.masteryScore}%</p>
                  </div>
                </div>

                {/* Concept Explanation */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold font-mono text-cyan-400">CONCEPT ARCHITECTURE:</h4>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                    {selectedTutorSession.conceptExplanation}
                  </p>
                </div>

                {/* Code Examples */}
                {selectedTutorSession.codeExamples.map((ex, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-xs font-mono text-neutral-400">Executable Code Demonstration:</p>
                    <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-xs font-mono text-purple-300 overflow-x-auto">
                      {ex.code}
                    </pre>
                    <p className="text-xs text-neutral-400 italic">{ex.explanation}</p>
                  </div>
                ))}

                {/* Interactive Quiz */}
                <div className="space-y-3 pt-2 border-t border-neutral-800">
                  <h4 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    INTERACTIVE VERIFICATION QUIZ
                  </h4>
                  <div className="space-y-3">
                    {selectedTutorSession.quizQuestions.map((q) => (
                      <div key={q.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-3">
                        <p className="text-xs sm:text-sm font-semibold text-neutral-200 font-mono">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = q.userSelectedIndex === optIdx;
                            const isCorrectAnswer = optIdx === q.correctIndex;
                            let btnStyle = 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700';

                            if (q.userSelectedIndex !== undefined) {
                              if (isSelected && q.isCorrect) {
                                btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300';
                              } else if (isSelected && !q.isCorrect) {
                                btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                              } else if (isCorrectAnswer) {
                                btnStyle = 'bg-emerald-950/30 border-emerald-700 text-emerald-400';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerQuiz(q.id, optIdx)}
                                className={`text-left p-2.5 rounded-lg text-xs font-mono border transition-all ${btnStyle}`}
                              >
                                <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {q.userSelectedIndex !== undefined && (
                          <p className={`text-xs font-mono ${q.isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {q.isCorrect ? '✓ Correct! ' : '⚠ Needs Improvement: '}
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Plan Roadmap */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold font-mono text-cyan-400">STRUCTURED STUDY ROADMAP:</h4>
                  <ul className="space-y-1.5 text-xs text-neutral-300 font-mono">
                    {selectedTutorSession.studyPlanSteps.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DATA & DOCUMENT INTELLIGENCE */}
        {activeTab === 'DATA_DOCS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Intelligence Box */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  RAW DATASET INTELLIGENCE (CSV / JSON)
                </h3>
                <textarea
                  id="data-raw-input"
                  rows={5}
                  value={rawDataInput}
                  onChange={(e) => setRawDataInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <button
                  id="analyze-data-btn"
                  onClick={handleAnalyzeData}
                  disabled={isAnalyzingData}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzingData ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  ANALYZE & DETECT PATTERNS
                </button>
              </div>

              {/* Document Analyzer Box */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  DOCUMENT OCR & FACT EXTRACTION
                </h3>
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-xs font-mono text-neutral-400 space-y-2">
                  <p className="text-emerald-400">✓ Ephemeral in-memory parsing active</p>
                  <p>✓ Zero-retention privacy policy enforced</p>
                  <p>✓ Extract tables, summaries, specifications & compare documents</p>
                </div>
              </div>
            </div>

            {/* Generated Data Reports */}
            {dataReports.map((report) => (
              <div key={report.id} className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{report.datasetName}</h4>
                    <p className="text-xs text-neutral-400">Rows: {report.rowCount} | Cleaned: {report.cleanedRowCount}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-mono text-cyan-400">Identified Trends & Patterns:</p>
                  <ul className="space-y-1 text-xs text-neutral-300 font-mono">
                    {report.identifiedPatterns.map((pat, idx) => (
                      <li key={idx}>• {pat}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-neutral-300">
                  {report.generatedReport}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: IOT & DEVICE DISCOVERY */}
        {activeTab === 'IOT_NETWORK' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    LOCAL NETWORK DEVICE DISCOVERY & SMART IOT
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Discovers authorized nodes on local subnet. Newly discovered devices require explicit user permission before receiving control access.
                  </p>
                </div>
                <button
                  id="scan-iot-btn"
                  onClick={handleScanIot}
                  disabled={isScanningIot}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-2"
                >
                  {isScanningIot ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  SCAN LOCAL SUBNET
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {iotDevices.map((dev) => (
                  <div key={dev.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          {dev.deviceType}
                        </span>
                        <h4 className="text-sm font-bold text-white font-mono mt-1">{dev.name}</h4>
                        <p className="text-xs text-neutral-400 font-mono">IP: {dev.ipAddress}</p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          dev.isAuthorized
                            ? 'bg-emerald-950/60 border border-emerald-500 text-emerald-300'
                            : 'bg-amber-950/60 border border-amber-500 text-amber-300'
                        }`}
                      >
                        {dev.isAuthorized ? dev.permissionScope : 'PENDING APPROVAL'}
                      </span>
                    </div>

                    {dev.telemetryData && (
                      <pre className="bg-neutral-900 border border-neutral-800 rounded p-2 text-[11px] font-mono text-neutral-300">
                        {JSON.stringify(dev.telemetryData, null, 2)}
                      </pre>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                      {!dev.isAuthorized ? (
                        <button
                          onClick={() => handleAuthorizeDevice(dev.id, 'CONTROL_ALLOWED')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold rounded"
                        >
                          AUTHORIZE DEVICE
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAuthorizeDevice(dev.id, 'READ_ONLY')}
                          className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono rounded"
                        >
                          SET READ-ONLY
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: POLYGLOT TRANSLATION & BANGLA HUB */}
        {activeTab === 'TRANSLATOR' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Languages className="w-4 h-4 text-cyan-400" />
                UNIVERSAL POLYGLOT & BANGLA / BANGLISH TRANSLATION ENGINE
              </h3>
              <form onSubmit={handleTranslate} className="space-y-3">
                <textarea
                  id="translate-input"
                  rows={3}
                  placeholder="Enter English, Bangla, or Banglish text..."
                  value={translateInput}
                  onChange={(e) => setTranslateInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs sm:text-sm font-mono text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-between gap-3">
                  <select
                    id="target-lang-select"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono"
                  >
                    <option value="bn-BD">Bangla (বাংলা + Romanized Banglish)</option>
                    <option value="en-US">English (US Technical)</option>
                    <option value="ja-JP">Japanese</option>
                    <option value="de-DE">German</option>
                  </select>
                  <button
                    id="submit-translate-btn"
                    type="submit"
                    disabled={isTranslating || !translateInput.trim()}
                    className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-2"
                  >
                    {isTranslating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    TRANSLATE
                  </button>
                </div>
              </form>

              {translationResult && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span>Source: {translationResult.sourceLanguage}</span>
                    <span>Target: {translationResult.targetLanguage}</span>
                  </div>
                  <div className="text-sm font-semibold text-white font-sans">
                    {translationResult.translatedText}
                  </div>
                  {translationResult.banglishRomanized && (
                    <div className="text-xs text-cyan-300 font-mono bg-cyan-950/30 p-2.5 rounded border border-cyan-800/40">
                      <span className="font-bold text-cyan-400">Banglish Phonetic: </span>
                      {translationResult.banglishRomanized}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: VAULT & VOICE PROFILES */}
        {activeTab === 'VAULT_VOICE' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vault */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  SECURE CREDENTIAL VAULT (ZERO-TRUST)
                </h3>
                <p className="text-xs text-neutral-400">
                  Raw API secrets are never exposed to LLM context or logs.
                </p>
                <div className="space-y-2">
                  {credentials.map((cred) => (
                    <div key={cred.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white font-bold">{cred.serviceName}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{cred.category}</span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">{cred.maskedValue}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice User Profiles */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  VOICE USER PROFILES
                </h3>
                <div className="space-y-2">
                  {voiceProfiles.map((p) => (
                    <div key={p.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white font-bold">{p.name}</span>
                        <span className={`text-[10px] font-mono ${p.isActive ? 'text-emerald-400' : 'text-neutral-500'}`}>
                          {p.isActive ? 'ACTIVE PRIMARY' : 'AUTHORIZED'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-mono">Language: {p.language} | Scope: {p.permissionLevel}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SEMANTIC MEMORY */}
        {activeTab === 'MEMORY_CONTEXT' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                SEMANTIC VECTOR MEMORY MATRIX
              </h3>
              <div className="space-y-3">
                {memories.map((mem) => (
                  <div key={mem.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
                        {mem.category}
                      </span>
                      <span className="text-xs font-mono text-cyan-400">Cosine Similarity: {(mem.similarityScore * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 font-mono">{mem.text}</p>
                    <div className="flex gap-1.5">
                      {mem.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: AUDIT TIMELINE & DOCUMENTATION */}
        {activeTab === 'AUDIT_DOCS' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  INTERNAL AUDIT TRAIL
                </h3>
                <button
                  onClick={async () => {
                    await fetch('/api/audit/clear', { method: 'POST' });
                    setAuditTrail([]);
                  }}
                  className="text-xs text-neutral-400 hover:text-rose-400 font-mono"
                >
                  Clear History
                </button>
              </div>

              <div className="space-y-2">
                {auditTrail.map((ev) => (
                  <div key={ev.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-bold">{ev.agentName}</span>
                      <span className="text-neutral-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-neutral-300">{ev.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
