import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  Bot,
  BrainCircuit,
  Cpu,
  CheckCircle2,
  ChevronRight,
  Globe,
  Layers,
  MessageSquare,
  Radio,
  RotateCw,
  Search,
  Send,
  Shield,
  Sparkles,
  Terminal,
  Volume2,
  Wrench,
  Zap,
  Boxes,
  HelpCircle,
  Code,
  Smartphone,
  Activity,
  Check,
  Copy,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { VoiceEngine } from '../lib/audioVoice';

interface IntentRoutingResult {
  rawInput: string;
  normalizedInput: string;
  detectedLanguage: 'Bangla' | 'English' | 'Banglish' | 'Mixed';
  intent: string;
  secondaryIntents: string[];
  responseMode: 'CHAT' | 'EXECUTE' | 'RESEARCH' | 'CREATE' | 'ANALYZE' | 'SYSTEM';
  isQuestion: boolean;
  isCommand: boolean;
  isWakeWordOnly: boolean;
  isSystemStatus: boolean;
  selectedAgent: string;
  recommendedModel: string;
  toolRequired: string | null;
  confidence: number;
  extractedEntities: Record<string, string>;
  debugTrace: {
    languageConfidence: number;
    intentReasoning: string;
    contextReferenced: boolean;
  };
  executionTimeMs?: number;
}

interface PipelineRouteDefinition {
  id: string;
  title: string;
  sampleQuery: string;
  language: string;
  intent: string;
  agent: string;
  agentIcon: React.ReactNode;
  model: string;
  tool: string;
  description: string;
}

const PRESET_ROUTES: PipelineRouteDefinition[] = [
  {
    id: 'feature_roadmap',
    title: 'Future Features & Evolution Roadmap',
    sampleQuery: 'Hey Ultron, তোমার ভিতরে আর কী কী feature হলে তুমি আরও advance হবে?',
    language: 'Banglish / Bangla',
    intent: 'CONVERSATION (Feature Roadmap)',
    agent: 'CONVERSATIONAL_CORE_AGENT',
    agentIcon: <BrainCircuit className="w-4 h-4 text-cyan-400" />,
    model: 'gemini-3.7-flash',
    tool: 'None (Direct Conversational Reasoning)',
    description: 'Routes directly to cognitive brain for in-depth AI roadmap discussions without falling back to generic standby.',
  },
  {
    id: '3d_geometry',
    title: '3D Spatial Geometry Synthesis',
    sampleQuery: 'Ultron, build a futuristic drone 3D model with rotor blades',
    language: 'English',
    intent: '3D_GENERATION',
    agent: 'SPATIAL_3D_ARCHITECT',
    agentIcon: <Boxes className="w-4 h-4 text-blue-400" />,
    model: 'threejs-procedural-spatial-engine',
    tool: 'THREEJS_HOLOGRAM_ENGINE',
    description: 'Synthesizes interactive 3D meshes, procedural wireframes, and exploded-view layers.',
  },
  {
    id: 'live_research',
    title: 'Live Web Intelligence & Search',
    sampleQuery: 'খুঁজে দাও latest AI news today',
    language: 'Mixed (Bangla + English)',
    intent: 'RESEARCH',
    agent: 'INTERNET_INTELLIGENCE_SCOUT',
    agentIcon: <Search className="w-4 h-4 text-emerald-400" />,
    model: 'gemini-3.7-flash',
    tool: 'GOOGLE_SEARCH_GROUNDING',
    description: 'Dispatches multi-source search query, retrieves live citations, and compiles structured takeaways.',
  },
  {
    id: 'code_engineering',
    title: 'Autonomous Coding & Engineering',
    sampleQuery: 'Write a TypeScript function for rate limiting with Redis',
    language: 'English',
    intent: 'CODING',
    agent: 'AUTONOMOUS_CODER_AGENT',
    agentIcon: <Code className="w-4 h-4 text-amber-400" />,
    model: 'gemini-3.7-flash',
    tool: 'CODE_SANDBOX',
    description: 'Analyzes architecture patterns, generates typed code, and self-checks syntax.',
  },
  {
    id: 'mobile_device',
    title: 'Mobile Device Hardware Control',
    sampleQuery: 'Torch light on koro',
    language: 'Banglish',
    intent: 'DEVICE_CONTROL',
    agent: 'MOBILE_DEVICE_COMPANION',
    agentIcon: <Smartphone className="w-4 h-4 text-purple-400" />,
    model: 'device-companion-engine',
    tool: 'DEVICE_BRIDGE_INTEGRATION',
    description: 'Actuates hardware flashlight, launches media, or initiates background communications.',
  },
  {
    id: 'identity_knowledge',
    title: 'Identity & Capability Query',
    sampleQuery: 'Ultron, তুমি কী এবং তুমি কী কী করতে পারো?',
    language: 'Bangla',
    intent: 'QUESTION',
    agent: 'KNOWLEDGE_SYNTHESIS_AGENT',
    agentIcon: <Bot className="w-4 h-4 text-teal-400" />,
    model: 'gemini-3.7-flash',
    tool: 'None (Self-Awareness Matrix)',
    description: 'Provides structured capabilities matrix in the user’s native language.',
  },
  {
    id: 'system_status',
    title: 'Explicit System Health Telemetry',
    sampleQuery: 'System status check koro',
    language: 'Banglish',
    intent: 'SYSTEM_COMMAND',
    agent: 'SYSTEM_HEALTH_MONITOR',
    agentIcon: <Activity className="w-4 h-4 text-rose-400" />,
    model: 'gemini-3.1-flash-lite',
    tool: 'HARDWARE_TELEMETRY',
    description: 'Collects CPU, memory, network, and agent failover telemetry.',
  },
  {
    id: 'wake_word',
    title: 'Wake Word Alone (Acknowledge)',
    sampleQuery: 'Hey Ultron',
    language: 'English',
    intent: 'SYSTEM_COMMAND',
    agent: 'EXECUTIVE_SUPERVISOR',
    agentIcon: <Radio className="w-4 h-4 text-sky-400" />,
    model: 'ultron-wake-engine',
    tool: 'WAKE_WORD_DETECTOR',
    description: 'Acknowledges startup/listening state only when no trailing prompt is provided.',
  },
];

export const IntentRouterDashboard: React.FC = () => {
  const [inputQuery, setInputQuery] = useState(
    'Hey Ultron, তোমার ভিতরে আর কী কী feature হলে তুমি আরও advance হবে?'
  );
  const [simulatedHistory, setSimulatedHistory] = useState<string>('Ultron, tell me what you can do.');
  const [includeHistory, setIncludeHistory] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [routingResult, setRoutingResult] = useState<IntentRoutingResult | null>(null);
  const [fullCommandResult, setFullCommandResult] = useState<any | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('feature_roadmap');
  const [activeTab, setActiveTab] = useState<'visual_flow' | 'mapping_matrix' | 'trace_details'>(
    'visual_flow'
  );
  const [copiedResponse, setCopiedResponse] = useState(false);

  const handleClassify = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : inputQuery;
    if (!q.trim()) return;
    setIsClassifying(true);
    const startTime = Date.now();
    try {
      const historyPayload = includeHistory && simulatedHistory.trim()
        ? [
            { role: 'user', content: simulatedHistory },
            { role: 'assistant', content: 'I am ULTRON, ready to assist you.' },
          ]
        : [];

      const data = await apiFetch<any>('/api/chat/classify-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: q, conversationHistory: historyPayload }),
      });
      if (data && data.routing) {
        setRoutingResult({
          ...data.routing,
          executionTimeMs: Date.now() - startTime,
        });
      }
    } catch (err: any) {
      console.warn('Failed to classify intent:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleRunFullPipeline = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : inputQuery;
    if (!q.trim()) return;
    setIsRunningPipeline(true);
    const startTime = Date.now();
    try {
      const historyPayload = includeHistory && simulatedHistory.trim()
        ? [
            { role: 'user', content: simulatedHistory },
            { role: 'assistant', content: 'I am ULTRON, ready to assist you.' },
          ]
        : [];

      const data = await apiFetch<any>('/api/chat/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: q,
          conversationHistory: historyPayload,
        }),
      });

      setFullCommandResult(data);
      if (data.diagnostics) {
        setRoutingResult({
          rawInput: q,
          normalizedInput: data.diagnostics.user_input || q,
          detectedLanguage: data.diagnostics.detected_language || 'English',
          intent: data.diagnostics.detected_intent || 'CONVERSATION',
          secondaryIntents: [],
          responseMode: data.diagnostics.response_mode || 'CHAT',
          isQuestion: true,
          isCommand: false,
          isWakeWordOnly: data.diagnostics.detected_intent === 'WAKE_WORD_ACK',
          isSystemStatus: false,
          selectedAgent: data.diagnostics.selected_agent || 'CONVERSATIONAL_CORE_AGENT',
          recommendedModel: data.diagnostics.selected_model || 'gemini-3.7-flash',
          toolRequired: data.diagnostics.tool_used !== 'COGNITIVE_SUPER_BRAIN' ? data.diagnostics.tool_used : null,
          confidence: 0.98,
          extractedEntities: {},
          debugTrace: {
            languageConfidence: 0.96,
            intentReasoning: `Executed via live agent ${data.diagnostics.selected_agent}`,
            contextReferenced: includeHistory,
          },
          executionTimeMs: data.diagnostics.execution_time_ms || (Date.now() - startTime),
        });
      }
    } catch (err: any) {
      console.warn('Failed to run full pipeline:', err);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleSelectRoutePreset = (route: PipelineRouteDefinition) => {
    setSelectedRouteId(route.id);
    setInputQuery(route.sampleQuery);
    handleClassify(route.sampleQuery);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <section className="p-5 rounded-2xl border border-cyan-500/30 bg-neutral-900/70 backdrop-blur-2xl space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-mono font-bold text-white tracking-wide">
                Intent Router & Decision-Making Visualizer
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                v3.4 Multi-Agent Core
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 pt-0.5">
              Live mapping from raw user utterances (Bangla / English / Banglish) → detected intent → sub-agent allocation → model selection.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setActiveTab('visual_flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'visual_flow'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Decision Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('mapping_matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'mapping_matrix'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mapping Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('trace_details')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'trace_details'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Semantic Trace</span>
          </button>
        </div>
      </div>

      {/* Query Input Bench */}
      <div className="p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-mono font-semibold text-neutral-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Input Utterance:</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHistory}
                onChange={(e) => setIncludeHistory(e.target.checked)}
                className="rounded border-neutral-700 text-cyan-500 focus:ring-0 focus:outline-none bg-neutral-900"
              />
              <span>Simulate Prior Context Turn</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunFullPipeline();
              }}
              placeholder="e.g. Hey Ultron, তোমার ভিতরে আর কী কী feature হলে তুমি আরও advance হবে?"
              className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-all pr-24"
            />
            {inputQuery && (
              <button
                onClick={() => setInputQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500 hover:text-neutral-300"
              >
                CLEAR
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleClassify()}
              disabled={isClassifying || isRunningPipeline}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-cyan-400 font-mono text-xs font-bold flex items-center gap-1.5 border border-cyan-500/30 transition-all disabled:opacity-50"
            >
              {isClassifying ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
              <span>DECISION TRACE</span>
            </button>
            <button
              onClick={() => handleRunFullPipeline()}
              disabled={isClassifying || isRunningPipeline}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/10 transition-all disabled:opacity-50"
            >
              {isRunningPipeline ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>RUN PIPELINE</span>
            </button>
          </div>
        </div>

        {includeHistory && (
          <div className="pt-1">
            <label className="text-[11px] font-mono text-neutral-500 block mb-1">
              Prior Turn Context (Simulated):
            </label>
            <input
              type="text"
              value={simulatedHistory}
              onChange={(e) => setSimulatedHistory(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-300 focus:outline-none focus:border-cyan-500"
              placeholder="Prior user utterance..."
            />
          </div>
        )}

        {/* Preset Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-neutral-500 self-center mr-1">Presets:</span>
          {PRESET_ROUTES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectRoutePreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all flex items-center gap-1.5 ${
                selectedRouteId === preset.id
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {preset.agentIcon}
              <span className="truncate max-w-[200px]">{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: VISUAL FLOWCHART PIPELINE */}
      {activeTab === 'visual_flow' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4" />
              LIVE DECISION-MAKING STAGES:
            </span>
            {routingResult?.executionTimeMs !== undefined && (
              <span className="text-[11px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
                Decision Latency: <strong className="text-rose-400">{routingResult.executionTimeMs} ms</strong>
              </span>
            )}
          </div>

          {/* 5-Stage Interactive Pipeline Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {/* Stage 1: Input & Normalization */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 relative space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 border-b border-neutral-800 pb-1">
                  <span className="font-bold">STAGE 01</span>
                  <span>INGESTION</span>
                </div>
                <h4 className="text-xs font-mono font-bold text-white">Input & Normalization</h4>
                <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-300 break-words line-clamp-3">
                  {routingResult ? routingResult.normalizedInput || routingResult.rawInput : inputQuery || 'Waiting for query...'}
                </div>
              </div>
              <div className="pt-2 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Wake Stripped:</span>
                <span className="text-emerald-400">{routingResult?.isWakeWordOnly ? 'No (Wake Only)' : 'Yes'}</span>
              </div>
            </div>

            {/* Stage 2: Language & Syntax Detection */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-purple-900/40 relative space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-400/80 border-b border-neutral-800 pb-1">
                  <span className="font-bold">STAGE 02</span>
                  <span>LINGUISTIC</span>
                </div>
                <h4 className="text-xs font-mono font-bold text-white">Language & Syntax</h4>
                <div className="p-2 rounded bg-purple-950/20 border border-purple-900/30 text-[11px] font-mono text-purple-300">
                  {routingResult ? (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Language:</span>
                        <strong className="text-white">{routingResult.detectedLanguage}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="text-emerald-400">{Math.round((routingResult.debugTrace?.languageConfidence || 0.95) * 100)}%</span>
                      </div>
                    </div>
                  ) : (
                    <span>Awaiting analysis...</span>
                  )}
                </div>
              </div>
              <div className="pt-2 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Sentence Type:</span>
                <span className="text-cyan-400">
                  {routingResult ? (routingResult.isQuestion ? 'Question (?)' : routingResult.isCommand ? 'Command (!)' : 'Statement') : '-'}
                </span>
              </div>
            </div>

            {/* Stage 3: Intent Classification */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-cyan-900/50 relative space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 border-b border-neutral-800 pb-1">
                  <span className="font-bold">STAGE 03</span>
                  <span>SEMANTIC</span>
                </div>
                <h4 className="text-xs font-mono font-bold text-white">Intent Classification</h4>
                <div className="p-2 rounded bg-cyan-950/20 border border-cyan-900/40 text-[11px] font-mono text-cyan-300 font-bold uppercase">
                  {routingResult?.intent || 'Awaiting Intent...'}
                </div>
              </div>
              <div className="pt-2 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Response Mode:</span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-300">
                  {routingResult?.responseMode || '-'}
                </span>
              </div>
            </div>

            {/* Stage 4: Sub-Agent Allocation */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-900/40 relative space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-400/80 border-b border-neutral-800 pb-1">
                  <span className="font-bold">STAGE 04</span>
                  <span>AGENT DISPATCH</span>
                </div>
                <h4 className="text-xs font-mono font-bold text-white">Agent Allocation</h4>
                <div className="p-2 rounded bg-amber-950/20 border border-amber-900/40 text-[11px] font-mono text-amber-300 font-bold">
                  {routingResult?.selectedAgent || 'Awaiting Agent...'}
                </div>
              </div>
              <div className="pt-2 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Agent Pool:</span>
                <span className="text-neutral-300">12 Active</span>
              </div>
            </div>

            {/* Stage 5: Target Model & Tool Execution */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-blue-900/40 relative space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-blue-400/80 border-b border-neutral-800 pb-1">
                  <span className="font-bold">STAGE 05</span>
                  <span>EXECUTION</span>
                </div>
                <h4 className="text-xs font-mono font-bold text-white">Model & Tool</h4>
                <div className="p-2 rounded bg-blue-950/20 border border-blue-900/40 text-[11px] font-mono text-blue-300">
                  <div className="truncate font-bold text-white">
                    {routingResult?.recommendedModel || 'gemini-3.7-flash'}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate pt-0.5">
                    Tool: <span className="text-cyan-400">{routingResult?.toolRequired || 'Native LLM'}</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">Ready</span>
              </div>
            </div>
          </div>

          {/* Full Live Response Preview Box */}
          {fullCommandResult && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/30 space-y-3 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Live Pipeline Output:
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                  <span>
                    Provider: <strong className="text-cyan-400">{fullCommandResult.providerUsed}</strong>
                  </span>
                  <span>|</span>
                  <span>
                    Model: <strong className="text-white">{fullCommandResult.modelUsed}</strong>
                  </span>
                  <button
                    onClick={() => copyToClipboard(fullCommandResult.response)}
                    className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 ml-1"
                    title="Copy Response"
                  >
                    {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-neutral-200 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto leading-relaxed bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
                {fullCommandResult.response}
              </div>

              {fullCommandResult.spokenText && (
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-neutral-400 bg-neutral-900/40 p-2 rounded-lg border border-neutral-800/80">
                  <span className="truncate flex-1 mr-2">
                    🎙️ Voice Output: <span className="text-cyan-300 font-sans">"{fullCommandResult.spokenText}"</span>
                  </span>
                  <button
                    onClick={() => VoiceEngine.getInstance().speak(fullCommandResult.spokenText)}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-cyan-500/40 text-cyan-400 hover:text-white shrink-0 flex items-center gap-1 text-xs font-mono"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Play Voice
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MAPPING MATRIX REFERENCE TABLE */}
      {activeTab === 'mapping_matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              ULTRON DECISION & AGENT ROUTING MATRIX:
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              Click "Test Path" to load preset into visual pipeline
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="p-3">User Query Category</th>
                  <th className="p-3">Detected Intent</th>
                  <th className="p-3">Assigned Sub-Agent</th>
                  <th className="p-3">Selected AI Model</th>
                  <th className="p-3">Tool / Action</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/40">
                {PRESET_ROUTES.map((route) => (
                  <tr
                    key={route.id}
                    className={`hover:bg-neutral-800/40 transition-all ${
                      selectedRouteId === route.id ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <td className="p-3 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {route.agentIcon}
                        <span>{route.title}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-xs font-sans italic">
                        "{route.sampleQuery}"
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/50 text-[11px] text-cyan-300 font-bold uppercase">
                        {route.intent}
                      </span>
                    </td>
                    <td className="p-3 text-amber-300 font-semibold">{route.agent}</td>
                    <td className="p-3 text-blue-300 font-semibold">{route.model}</td>
                    <td className="p-3 text-neutral-300 text-[11px]">{route.tool}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          handleSelectRoutePreset(route);
                          setActiveTab('visual_flow');
                        }}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-neutral-700 text-[11px] font-mono inline-flex items-center gap-1"
                      >
                        <span>Test Path</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEEP SEMANTIC TRACE & ENTITIES */}
      {activeTab === 'trace_details' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              DETAILED SEMANTIC REASONING & EXTRACTION TRACE:
            </span>
          </div>

          {routingResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reasoning Card */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  Intent Reasoning & Confidence
                </h4>
                <div className="space-y-2 text-xs font-mono text-neutral-300">
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-500">Reasoning:</span>
                    <span className="text-cyan-300 font-sans text-right max-w-xs">
                      {routingResult.debugTrace?.intentReasoning || 'Direct semantic match'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-500">Overall Confidence:</span>
                    <span className="text-emerald-400 font-bold">
                      {Math.round((routingResult.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-500">Context Referenced:</span>
                    <span className="text-white">
                      {routingResult.debugTrace?.contextReferenced ? 'YES (Multi-Turn)' : 'NO (Single-Turn)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-500">Is Explicit System Status:</span>
                    <span className="text-white">{routingResult.isSystemStatus ? 'YES' : 'NO'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Is Standalone Wake Word:</span>
                    <span className="text-white">{routingResult.isWakeWordOnly ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              </div>

              {/* Extracted Entities & Secondary Intents */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                  <Boxes className="w-4 h-4 text-purple-400" />
                  Entities & Secondary Tags
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 block mb-1">
                      Secondary Intents:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {routingResult.secondaryIntents && routingResult.secondaryIntents.length > 0 ? (
                        routingResult.secondaryIntents.map((sec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-[10px] font-mono text-purple-300"
                          >
                            {sec}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-500 text-xs font-mono italic">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 block mb-1">
                      Extracted Entities:
                    </span>
                    {routingResult.extractedEntities && Object.keys(routingResult.extractedEntities).length > 0 ? (
                      <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800 text-xs font-mono">
                        {Object.entries(routingResult.extractedEntities).map(([key, val]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-neutral-400">{key}:</span>
                            <span className="text-cyan-300 font-semibold">{val}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-xs font-mono italic">No named entities extracted</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-xs font-mono text-neutral-500">
              Run a test query above to view semantic parsing details and entity extraction.
            </div>
          )}
        </div>
      )}
    </section>
  );
};
