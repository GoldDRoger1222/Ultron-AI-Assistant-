import React, { useState, useEffect } from 'react';
import {
  Brain,
  Mic,
  Cpu,
  Terminal,
  Shield,
  Layers,
  Search,
  FileCode,
  Play,
  Square,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Database,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  FileText,
  Activity,
  ListOrdered,
  Lock,
} from 'lucide-react';

interface ToolSchema {
  name: string;
  category: string;
  description: string;
  permissionLevel: number;
  isAvailable: boolean;
}

interface TestResult {
  testNumber: number;
  name: string;
  category: string;
  passed: boolean;
  evidence: string;
  durationMs: number;
  error?: string;
}

export const UltronCoreArchitecturePanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'BRAIN' | 'VOICE' | 'TOOLS' | 'TASKS' | 'MEMORY' | 'TEST_SUITE'>('BRAIN');
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastBrainResult, setLastBrainResult] = useState<any>(null);

  // Voice state
  const [voiceState, setVoiceState] = useState<string>('IDLE');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(false);
  const [isVoiceStreaming, setIsVoiceStreaming] = useState(false);

  // Tools & Tasks
  const [toolsList, setToolsList] = useState<ToolSchema[]>([]);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [memoriesList, setMemoriesList] = useState<any[]>([]);
  const [memorySearchQuery, setMemorySearchQuery] = useState('');

  // Test suite
  const [isRunningTestSuite, setIsRunningTestSuite] = useState(false);
  const [testSuiteSummary, setTestSuiteSummary] = useState<any>(null);

  // Model health
  const [modelHealth, setModelHealth] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [toolsRes, tasksRes, memRes, healthRes, voiceRes] = await Promise.all([
        fetch('/api/ultron/tools/list').then((r) => r.json()),
        fetch('/api/ultron/tasks/list').then((r) => r.json()),
        fetch('/api/ultron/memory/list').then((r) => r.json()),
        fetch('/api/ultron/models/health').then((r) => r.json()),
        fetch('/api/ultron/voice/state').then((r) => r.json()),
      ]);

      if (toolsRes?.tools) setToolsList(toolsRes.tools);
      if (tasksRes?.tasks) setTasksList(tasksRes.tasks);
      if (memRes?.memories) setMemoriesList(memRes.memories);
      if (healthRes?.providers) setModelHealth(healthRes.providers);
      if (voiceRes?.voiceState) {
        setVoiceState(voiceRes.voiceState.currentState);
        setWakeWordEnabled(voiceRes.voiceState.wakeWordEnabled);
        setContinuousMode(voiceRes.voiceState.continuousMode);
      }
    } catch (err) {
      console.error('Failed to load initial ULTRON core data:', err);
    }
  };

  const handleProcessInput = async (textToProcess?: string) => {
    const text = textToProcess || userInput;
    if (!text.trim()) return;

    setIsProcessing(true);
    setVoiceState('THINKING');
    try {
      const res = await fetch('/api/ultron/brain/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      });
      const data = await res.json();
      setLastBrainResult(data);
      setVoiceState(data.success ? 'IDLE' : 'ERROR');
      fetchInitialData();
    } catch (err: any) {
      setLastBrainResult({
        success: false,
        error: err.message,
        intent: 'UNKNOWN',
        spokenResponse: 'System pipeline encountered an unhandled error.',
        markdownResponse: `❌ Error: ${err.message}`,
      });
      setVoiceState('ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInterruptVoice = async () => {
    try {
      await fetch('/api/ultron/voice/interrupt', { method: 'POST' });
      setVoiceState('IDLE');
      setIsVoiceStreaming(false);
    } catch (err) {
      console.error('Failed to interrupt voice:', err);
    }
  };

  const handleRunTestSuite = async () => {
    setIsRunningTestSuite(true);
    try {
      const res = await fetch('/api/ultron/test-suite/run', { method: 'POST' });
      const data = await res.json();
      setTestSuiteSummary(data);
    } catch (err) {
      console.error('Test suite execution failed:', err);
    } finally {
      setIsRunningTestSuite(false);
    }
  };

  const acceptanceCommands = [
    { label: 'What can you do?', command: 'ULTRON, what can you do?', intent: 'QUESTION' },
    { label: 'Explain API', command: 'ULTRON, explain what an API is.', intent: 'QUESTION' },
    { label: 'Create Test File', command: 'ULTRON, create a test file.', intent: 'FILE_OPERATION' },
    { label: 'Read Test File', command: 'ULTRON, read the test file.', intent: 'FILE_OPERATION' },
    { label: 'Write Python Hello', command: 'ULTRON, write a Python program that prints Hello.', intent: 'CODING' },
    { label: 'Run Python Program', command: 'ULTRON, run the Python program.', intent: 'CODE_EXECUTION' },
    { label: 'Search Web', command: 'ULTRON, search the web for the latest information about quantum computing.', intent: 'RESEARCH' },
    { label: 'Stop', command: 'ULTRON, stop.', intent: 'CANCEL_TASK' },
    { label: 'Banglish: amar website banaw', command: 'amar website banaw', intent: 'MULTI_STEP_TASK' },
    { label: 'Bangla: তুমি কেমন আছো?', command: 'তুমি কেমন আছো?', intent: 'CONVERSATION' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Brain className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-wider text-cyan-300 font-mono">
                  ULTRON CORE ARCHITECTURE
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  v5.0 UNIFIED
                </span>
              </div>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Centralized Brain Engine &bull; Dedicated Voice Engine &bull; Verified Tool & Task Execution Engine
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Voice State:</span>
              <span className={`font-bold ${voiceState === 'SPEAKING' ? 'text-amber-400 animate-pulse' : voiceState === 'THINKING' ? 'text-purple-400 animate-pulse' : 'text-cyan-400'}`}>
                {voiceState}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Model:</span>
              <span className="font-bold text-emerald-400">Gemini 3.7 Pro/Flash</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          {[
            { id: 'BRAIN', label: '1. Brain Engine & Pipeline', icon: Brain },
            { id: 'VOICE', label: '2. Dedicated Voice Engine', icon: Mic },
            { id: 'TOOLS', label: '3. Tool Registry (0-3)', icon: Terminal },
            { id: 'TASKS', label: '4. Task Orchestrator', icon: ListOrdered },
            { id: 'MEMORY', label: '5. Multi-Tier Memory', icon: Database },
            { id: 'TEST_SUITE', label: '6. 20-Point Test Suite', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-mono font-medium transition-all ${
                  active
                    ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BRAIN ENGINE & LIVE INTENT ROUTER */}
      {/* ========================================================= */}
      {activeSubTab === 'BRAIN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Input and Quick Acceptance Tests */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono font-bold">
                <Brain className="w-4 h-4" />
                <span>CENTRAL BRAIN INPUT</span>
              </div>

              <div className="space-y-2">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter command or question in English, Bangla, or Banglish..."
                  className="w-full h-24 bg-slate-950 border border-slate-700/60 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all resize-none font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleProcessInput();
                    }
                  }}
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleProcessInput()}
                    disabled={isProcessing || !userInput.trim()}
                    className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all font-mono"
                  >
                    {isProcessing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>EXECUTE COGNITIVE PIPELINE</span>
                  </button>

                  <button
                    onClick={() => handleProcessInput('ULTRON, stop.')}
                    className="py-2.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all font-mono"
                    title="Stop / Cancel Task"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>STOP</span>
                  </button>
                </div>
              </div>

              {/* Acceptance Test Quick Triggers */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  Quick Acceptance Commands
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {acceptanceCommands.map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setUserInput(cmd.command);
                        handleProcessInput(cmd.command);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5"
                    >
                      <span>{cmd.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Architecture Pipeline Map */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl font-mono text-xs">
              <div className="text-cyan-400 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>10-STAGE PIPELINE FLOW</span>
              </div>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>1. Input Normalizer</span>
                  <span className="text-cyan-400">Bangla/Banglish/EN</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>2. Intent Router</span>
                  <span className="text-purple-400">16 Intent Types</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>3. Context Manager</span>
                  <span className="text-indigo-400">Anaphora Resolution</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>4. Memory Manager</span>
                  <span className="text-blue-400">4 Tiered Layers</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>5. Reasoning Planner</span>
                  <span className="text-amber-400">Step Decomposition</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>6. Model Router</span>
                  <span className="text-emerald-400">Gemini/Cascade</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>7. Tool Selector</span>
                  <span className="text-rose-400">Permission 0-3</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>8. Task Orchestrator</span>
                  <span className="text-cyan-400">State Machine</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>9. Verification Engine</span>
                  <span className="text-emerald-400">Evidence Checked</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span>10. Response Generator</span>
                  <span className="text-yellow-400">Voice + Markdown</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Execution Observability / Debug Mode */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-mono font-bold text-slate-200">
                    REAL-TIME OBSERVABILITY & DEBUG TRACE
                  </h3>
                </div>
                {lastBrainResult && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    lastBrainResult.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {lastBrainResult.success ? 'PIPELINE SUCCESS' : 'EXECUTION FAILED'}
                  </span>
                )}
              </div>

              {lastBrainResult ? (
                <div className="space-y-4">
                  {/* Metadata Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">CLASSIFIED INTENT</span>
                      <span className="font-bold text-cyan-300">{lastBrainResult.intent || 'NONE'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">DETECTED LANGUAGE</span>
                      <span className="font-bold text-purple-300">{lastBrainResult.language || 'English'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">TASK ID</span>
                      <span className="font-bold text-amber-300">{lastBrainResult.taskId || 'N/A (Direct)'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">EVIDENCE STATUS</span>
                      <span className={`font-bold ${lastBrainResult.verificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {lastBrainResult.verificationStatus || 'NONE'}
                      </span>
                    </div>
                  </div>

                  {/* Spoken Response Preview */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>SPOKEN OUTPUT (TTS STREAM)</span>
                      </span>
                      <span>Latency: {lastBrainResult.executionTimeMs}ms</span>
                    </div>
                    <p className="text-slate-200 text-sm font-sans italic">
                      "{lastBrainResult.spokenResponse}"
                    </p>
                  </div>

                  {/* Markdown Response Output */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                    <span className="text-xs font-mono text-cyan-400 block font-bold">
                      MARKDOWN / TEXT RESPONSE
                    </span>
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      {lastBrainResult.markdownResponse}
                    </pre>
                  </div>

                  {/* Tool Dispatches & Evidence */}
                  {lastBrainResult.toolResults && lastBrainResult.toolResults.length > 0 && (
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                      <span className="text-xs font-mono text-emerald-400 block font-bold">
                        VERIFIED TOOL EXECUTIONS ({lastBrainResult.toolResults.length})
                      </span>
                      <div className="space-y-2">
                        {lastBrainResult.toolResults.map((tr: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono flex items-start justify-between">
                            <div>
                              <span className="text-cyan-400 font-bold">{tr.tool}</span>
                              <p className="text-slate-400 text-[11px] mt-0.5">
                                {tr.success ? 'Execution exit 0' : tr.error?.message}
                              </p>
                              {tr.evidence && (
                                <span className="text-[10px] text-emerald-400/90 block mt-1">
                                  Evidence: {JSON.stringify(tr.evidence)}
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${tr.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {tr.success ? 'VERIFIED' : 'FAILED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 space-y-2 font-mono text-xs">
                  <Brain className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
                  <p>No active cognitive trace. Select a quick acceptance command or type a query above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DEDICATED VOICE ENGINE & BARGE-IN */}
      {/* ========================================================= */}
      {activeSubTab === 'VOICE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold text-slate-200">
                  VOICE SESSION & EXPLICIT STATES
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                STATE: {voiceState}
              </span>
            </div>

            {/* Voice States Flow Visualizer */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-xs">
              {['IDLE', 'LISTENING', 'PROCESSING', 'THINKING', 'SPEAKING', 'ERROR'].map((st) => (
                <div
                  key={st}
                  className={`p-2 rounded-xl border transition-all ${
                    voiceState === st
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] block">{st}</span>
                </div>
              ))}
            </div>

            {/* Voice Controls */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs font-mono text-slate-200 font-bold block">Wake Word Mode ("ULTRON")</span>
                  <span className="text-[11px] text-slate-400">Activates processing only after "ULTRON" is spoken</span>
                </div>
                <input
                  type="checkbox"
                  checked={wakeWordEnabled}
                  onChange={(e) => {
                    setWakeWordEnabled(e.target.checked);
                    fetch('/api/ultron/voice/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ wakeWordEnabled: e.target.checked }),
                    });
                  }}
                  className="w-4 h-4 accent-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs font-mono text-slate-200 font-bold block">Continuous Conversation Mode</span>
                  <span className="text-[11px] text-slate-400">Keeps listening active for rapid back-and-forth</span>
                </div>
                <input
                  type="checkbox"
                  checked={continuousMode}
                  onChange={(e) => {
                    setContinuousMode(e.target.checked);
                    fetch('/api/ultron/voice/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ continuousMode: e.target.checked }),
                    });
                  }}
                  className="w-4 h-4 accent-cyan-500"
                />
              </div>

              {/* Barge-In / Interruption Handler */}
              <button
                onClick={handleInterruptVoice}
                className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <VolumeX className="w-4 h-4" />
                <span>BARGE-IN / STOP SPEAKING PLAYBACK</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>MULTILINGUAL AUDIO NLP CAPABILITIES</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              ULTRON natively parses multilingual acoustics across <strong>English</strong>, <strong>Bangla script (বাংলা)</strong>, and <strong>Banglish idioms</strong> ("amar website banaw", "ei file ta run koro", "chup koro").
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-bold block">1. Non-Blocking Barge-in</span>
                <span className="text-slate-400 text-[11px]">Microphone & speaker pipelines are strictly decoupled. User speech immediately halts TTS output without echo collision.</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-purple-400 font-bold block">2. Automatic Language Calibration</span>
                <span className="text-slate-400 text-[11px]">Replies in the exact language & tone spoken, while locking technical engineering terms in context.</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block">3. Streaming Audio Output</span>
                <span className="text-slate-400 text-[11px]">Synthesizes speech segments with high-fidelity prosody and dynamic emotional mood modulation.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TOOL REGISTRY & PERMISSIONS (0-3) */}
      {/* ========================================================= */}
      {activeSubTab === 'TOOLS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-mono font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                CENTRALIZED TOOL REGISTRY & PERMISSION MATRIX
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Level 0 (Read-Only) &bull; Level 1 (Modifications) &bull; Level 2 (Sensitive) &bull; Level 3 (Destructive/Confirmed)
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
              {toolsList.length} REGISTERED TOOLS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {toolsList.map((tool) => (
              <div
                key={tool.name}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 text-sm">{tool.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tool.permissionLevel === 0
                          ? 'bg-blue-500/20 text-blue-400'
                          : tool.permissionLevel === 1
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : tool.permissionLevel === 2
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      LEVEL {tool.permissionLevel}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block uppercase mt-0.5">{tool.category}</span>
                  <p className="text-slate-400 text-[11px] font-sans mt-2 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                  <span className={tool.isAvailable ? 'text-emerald-400' : 'text-rose-400'}>
                    {tool.isAvailable ? '● READY IN RUNTIME' : '○ UNAVAILABLE'}
                  </span>
                  <button
                    onClick={() => {
                      setUserInput(`ULTRON, test ${tool.name}`);
                      handleProcessInput(`Test tool ${tool.name}`);
                    }}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded border border-slate-800"
                  >
                    Test Tool
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TASK ORCHESTRATOR & STATE MACHINE */}
      {/* ========================================================= */}
      {activeSubTab === 'TASKS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-mono font-bold text-slate-200">
                TASK ORCHESTRATOR & AUTONOMOUS STATE MACHINE
              </h3>
            </div>
            <button
              onClick={fetchInitialData}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded-lg border border-slate-800"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {tasksList.length > 0 ? (
              tasksList.map((task) => (
                <div key={task.taskId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">{task.taskId}</span>
                      <span className="text-slate-300 font-sans font-medium text-sm">"{task.goal}"</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                      task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      task.status === 'CANCELLED' ? 'bg-slate-800 text-slate-400' :
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {task.steps && task.steps.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-900">
                      <span className="text-[10px] text-slate-500 font-bold block">EXECUTION STEPS:</span>
                      {task.steps.map((st: any, sIdx: number) => (
                        <div key={sIdx} className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded">
                          <span>{st.stepIndex}. {st.title}</span>
                          <span className="text-cyan-400 text-[10px]">{st.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No active tasks recorded yet. Issue a command to spawn an autonomous task.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: MULTI-TIER MEMORY ENGINE */}
      {/* ========================================================= */}
      {activeSubTab === 'MEMORY' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-mono font-bold text-slate-200 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                4-TIER MEMORY ENGINE EXPLORER
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                SHORT_TERM &bull; SESSION &bull; PROJECT &bull; LONG_TERM MEMORY
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={memorySearchQuery}
                onChange={(e) => setMemorySearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {memoriesList
              .filter((m) => !memorySearchQuery || m.title.toLowerCase().includes(memorySearchQuery.toLowerCase()) || m.content.toLowerCase().includes(memorySearchQuery.toLowerCase()))
              .map((mem) => (
                <div key={mem.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{mem.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {mem.layer}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
                    {mem.content}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                    <span>Importance: {mem.importance}/10</span>
                    <span>Category: {mem.category}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: 20-POINT AUTOMATED TEST SUITE */}
      {/* ========================================================= */}
      {activeSubTab === 'TEST_SUITE' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-mono font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                20-POINT AUTOMATED ARCHITECTURAL TEST SUITE
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Executes live end-to-end tests across NLP, VFS, Sandbox, Model Fallbacks, Voice Interruption, and Verification Evidence.
              </p>
            </div>

            <button
              onClick={handleRunTestSuite}
              disabled={isRunningTestSuite}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all font-mono shadow-lg shadow-emerald-500/20"
            >
              {isRunningTestSuite ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>RUN FULL 20-POINT AUDIT</span>
            </button>
          </div>

          {testSuiteSummary && (
            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 text-[10px] block">TOTAL TESTS</span>
                  <span className="text-xl font-bold text-slate-200">{testSuiteSummary.totalTests}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 text-[10px] block">PASSED</span>
                  <span className="text-xl font-bold text-emerald-400">{testSuiteSummary.passedCount}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 text-[10px] block">FAILED</span>
                  <span className="text-xl font-bold text-rose-400">{testSuiteSummary.failedCount}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-500 text-[10px] block">SCORE</span>
                  <span className="text-xl font-bold text-cyan-400">{testSuiteSummary.overallScorePercent}%</span>
                </div>
              </div>

              {/* Test Cases List */}
              <div className="space-y-2">
                {testSuiteSummary.results.map((tc: TestResult) => (
                  <div
                    key={tc.testNumber}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      tc.passed
                        ? 'bg-slate-950/80 border-slate-800'
                        : 'bg-rose-950/20 border-rose-800/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px]">#{tc.testNumber}</span>
                        <span className="font-bold text-slate-200">{tc.name}</span>
                        <span className="text-[10px] px-2 py-0.2 bg-slate-900 text-slate-400 rounded">
                          {tc.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        {tc.evidence}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-[10px] text-slate-500">{tc.durationMs}ms</span>
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          tc.passed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tc.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
