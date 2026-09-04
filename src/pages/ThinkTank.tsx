import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  GitBranch,
  Cloud,
  Globe,
  Radio,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  RefreshCw,
  Box,
  Check,
  Code2,
  Zap,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import {
  ThinkTankSession,
  CoTPhase,
  BanglaTechTerm,
  LiveNewsItem,
  RecursiveDebugSession,
  CloudToolAction,
  PredictiveDefenseScan,
  SandboxRunResult,
} from '../types/jarvis';

export const ThinkTank: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'COT_THINK_TANK' | 'AUTONOMOUS_DEBUGGER' | 'CLOUD_DEVOPS' | 'PREDICTIVE_DEFENSE' | 'BANGLA_NLP_ACADEMY' | 'LIVE_INFO'>('COT_THINK_TANK');

  // CoT State
  const [thinkTopic, setThinkTopic] = useState('Design a Real-Time Distributed Task Queue with Raft Consensus & Zero-Data-Loss');
  const [currentSession, setCurrentSession] = useState<ThinkTankSession | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Autonomous Debugger Sandbox State
  const [debugGoal, setDebugGoal] = useState('Fix off-by-one index error in binary search algorithm');
  const [debugCode, setDebugCode] = useState(`function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length; // Bug: should be arr.length - 1
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`);
  const [testAssertions, setTestAssertions] = useState('binarySearch([1,3,5,7,9], 7) === 3\nbinarySearch([1,3,5,7,9], 9) === 4\nbinarySearch([1,3,5,7,9], 2) === -1');
  const [activeDebugSession, setActiveDebugSession] = useState<RecursiveDebugSession | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  // Cloud & DevOps State
  const [cloudActions, setCloudActions] = useState<CloudToolAction[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<CloudToolAction['platform']>('GITHUB');
  const [selectedActionName, setSelectedActionName] = useState('CREATE_PULL_REQUEST');
  const [isDispatchingCloud, setIsDispatchingCloud] = useState(false);

  // Predictive Defense State
  const [predictiveScan, setPredictiveScan] = useState<PredictiveDefenseScan | null>(null);
  const [isScanningDefense, setIsScanningDefense] = useState(false);

  // Bangla NLP & Live News
  const [glossary, setGlossary] = useState<BanglaTechTerm[]>([]);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [liveNews, setLiveNews] = useState<LiveNewsItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const newsRes = await apiFetch<{ news: LiveNewsItem[] }>('/api/thinktank/live-news');
      if (newsRes.news) setLiveNews(newsRes.news);

      const termsRes = await apiFetch<{ terms: BanglaTechTerm[] }>('/api/thinktank/glossary');
      if (termsRes.terms) setGlossary(termsRes.terms);

      const cloudRes = await apiFetch<{ actions: CloudToolAction[] }>('/api/sandbox/cloud-actions');
      if (cloudRes.actions) setCloudActions(cloudRes.actions);
    } catch (err) {
      console.error(err);
    }
  };

  const runThinkTankOrchestration = async () => {
    if (!thinkTopic.trim()) return;
    setIsThinking(true);
    try {
      const res = await apiFetch<{ session: ThinkTankSession }>('/api/thinktank/orchestrate', {
        method: 'POST',
        body: JSON.stringify({ topic: thinkTopic.trim() }),
      });
      if (res.session) {
        setCurrentSession(res.session);
        showToast('5-Phase Chain-of-Thought reasoning successfully generated!');
      }
    } catch (err: any) {
      showToast(`Think-Tank error: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  const runRecursiveDebugHarness = async () => {
    if (!debugCode.trim()) return;
    setIsDebugging(true);
    try {
      const assertionsArray = testAssertions
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await apiFetch<{ session: RecursiveDebugSession }>('/api/sandbox/recursive-debug', {
        method: 'POST',
        body: JSON.stringify({
          goal: debugGoal,
          initialCode: debugCode,
          language: 'javascript',
          testAssertions: assertionsArray,
          maxIterations: 4,
        }),
      });

      if (res.session) {
        setActiveDebugSession(res.session);
        if (res.session.status === 'RESOLVED_ALL_TESTS_PASSED') {
          showToast('Autonomous Sandbox: All test assertions passed in self-correction loop!');
        } else {
          showToast(`Sandbox completed with status: ${res.session.status}`);
        }
      }
    } catch (err: any) {
      showToast(`Debugger Error: ${err.message}`);
    } finally {
      setIsDebugging(false);
    }
  };

  const dispatchCloudTool = async () => {
    setIsDispatchingCloud(true);
    try {
      const res = await apiFetch<{ action: CloudToolAction }>('/api/sandbox/cloud-action', {
        method: 'POST',
        body: JSON.stringify({
          platform: selectedPlatform,
          action: selectedActionName,
          payload: { target: 'production', automatedBy: 'JARVIS-Supreme-Engine' },
        }),
      });
      if (res.action) {
        setCloudActions([res.action, ...cloudActions]);
        showToast(`Cloud Action ${res.action.action} on ${res.action.platform} completed!`);
      }
    } catch (err: any) {
      showToast(`Cloud Tool error: ${err.message}`);
    } finally {
      setIsDispatchingCloud(false);
    }
  };

  const runPredictiveDefenseScan = async () => {
    setIsScanningDefense(true);
    try {
      const res = await apiFetch<{ scan: PredictiveDefenseScan }>('/api/security/predictive-scan', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (res.scan) {
        setPredictiveScan(res.scan);
        showToast(`SAST Defense Scan: ${res.scan.totalVulnerabilities} OWASP issues identified.`);
      }
    } catch (err: any) {
      showToast(`Scan failed: ${err.message}`);
    } finally {
      setIsScanningDefense(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredGlossary = glossarySearch.trim()
    ? glossary.filter(
        (t) =>
          t.englishTerm.toLowerCase().includes(glossarySearch.toLowerCase()) ||
          t.banglaTerm.toLowerCase().includes(glossarySearch.toLowerCase()) ||
          t.definitionBangla.toLowerCase().includes(glossarySearch.toLowerCase())
      )
    : glossary;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div
          id="thinktank-toast-notice"
          className="fixed bottom-20 right-4 z-50 bg-neutral-900 border border-cyan-500 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce font-mono text-xs"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER & HERO */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                Supreme Architecture & Think-Tank Core
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-mono tracking-tight">
              Autonomous Agentic Workflows & Think-Tank
            </h1>
            <p className="text-sm text-neutral-400 font-mono mt-1 max-w-2xl">
              5-Phase Chain-of-Thought (CoT) reasoning, autonomous recursive debugging loops in virtual sandboxes, cloud deployment dispatchers, and deep technical Bangla NLP.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">CoT Confidence</span>
              <span className="text-lg font-mono font-bold text-cyan-400">96.4%</span>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Sandbox Engine</span>
              <span className="text-lg font-mono font-bold text-emerald-400">Isolated</span>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">OWASP Guard</span>
              <span className="text-lg font-mono font-bold text-purple-400">Active</span>
            </div>
          </div>
        </div>

        {/* SUB-TABS */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-t border-neutral-800/80 pt-4">
          <button
            id="tab-cot-think-tank"
            onClick={() => setActiveTab('COT_THINK_TANK')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'COT_THINK_TANK'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            5-PHASE CoT THINK-TANK
          </button>
          <button
            id="tab-autonomous-debugger"
            onClick={() => setActiveTab('AUTONOMOUS_DEBUGGER')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'AUTONOMOUS_DEBUGGER'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RECURSIVE DEBUGGER SANDBOX
          </button>
          <button
            id="tab-cloud-devops"
            onClick={() => setActiveTab('CLOUD_DEVOPS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'CLOUD_DEVOPS'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            CLOUD & DEVOPS DISPATCH
          </button>
          <button
            id="tab-predictive-defense"
            onClick={() => setActiveTab('PREDICTIVE_DEFENSE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'PREDICTIVE_DEFENSE'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            PREDICTIVE DEFENSE (OWASP)
          </button>
          <button
            id="tab-bangla-nlp"
            onClick={() => setActiveTab('BANGLA_NLP_ACADEMY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'BANGLA_NLP_ACADEMY'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            BANGLA TECHNICAL NLP
          </button>
          <button
            id="tab-live-info"
            onClick={() => setActiveTab('LIVE_INFO')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'LIVE_INFO'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            LIVE INTEL & NEWS
          </button>
        </div>
      </div>

      {/* TAB 1: 5-PHASE CoT THINK-TANK */}
      {activeTab === 'COT_THINK_TANK' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Context-Aware Reasoning Engine (Chain-of-Thought)
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter architectural challenge or system goal..."
                value={thinkTopic}
                onChange={(e) => setThinkTopic(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={runThinkTankOrchestration}
                disabled={isThinking}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-black font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isThinking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isThinking ? 'ORCHESTRATING...' : 'DECOMPOSE VIA 5-PHASE CoT'}
              </button>
            </div>
          </div>

          {/* Render 5-Phase Sequence */}
          {currentSession && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {currentSession.phases.map((phase, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 rounded-xl p-4 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">
                        PHASE {idx + 1}: {phase.type}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="text-xs font-mono font-bold text-white">{phase.title}</h4>
                    <p className="text-[11px] font-mono text-neutral-400">{phase.description}</p>

                    <div className="pt-2 border-t border-neutral-800 space-y-1">
                      <span className="text-[10px] font-mono text-neutral-500 block">Deliverables:</span>
                      {phase.deliverables.map((d, dIdx) => (
                        <div key={dIdx} className="text-[10px] font-mono text-neutral-300 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Blueprint & Bangla Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase block">
                    Architectural Blueprint Specification:
                  </span>
                  <div className="p-3 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-200 border border-neutral-800 whitespace-pre-wrap">
                    {currentSession.architectureBlueprint}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase block">
                    Technical Bangla Translation & Context:
                  </span>
                  <div className="p-3 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-200 border border-neutral-800 whitespace-pre-wrap">
                    {currentSession.banglaExplanation}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUTONOMOUS RECURSIVE DEBUGGER SANDBOX */}
      {activeTab === 'AUTONOMOUS_DEBUGGER' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  Autonomous Sandbox & Self-Correction Loop
                </h3>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  JARVIS executes your code in an isolated container harness, captures exceptions and assertion failures, auto-generates fixes, and re-runs recursively until all tests pass.
                </p>
              </div>
              <button
                onClick={runRecursiveDebugHarness}
                disabled={isDebugging}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-black font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isDebugging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isDebugging ? 'RUNNING RECURSIVE LOOP...' : 'RUN & AUTO-FIX LOOP'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-300 font-bold block">Sandbox Source Code:</span>
                <textarea
                  rows={9}
                  value={debugCode}
                  onChange={(e) => setDebugCode(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-300 font-bold block">Unit Test Assertions (Line-by-line):</span>
                <textarea
                  rows={9}
                  value={testAssertions}
                  onChange={(e) => setTestAssertions(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Trace of Recursive Iterations */}
          {activeDebugSession && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Recursive Debugger Execution Trace ({activeDebugSession.iterations?.length || 0} Iterations)
                </h4>
                <span
                  className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold ${
                    activeDebugSession.status === 'RESOLVED_ALL_TESTS_PASSED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  STATUS: {activeDebugSession.status}
                </span>
              </div>

              <div className="space-y-3">
                {(activeDebugSession.iterations || []).map((iter) => (
                  <div
                    key={iter.iterationNumber}
                    className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400">
                        Iteration #{iter.iterationNumber} — {iter.status}
                      </span>
                      <span className="text-neutral-500 text-[11px]">
                        Passed {iter.runResult.testsPassed}/{iter.runResult.testsTotal} tests ({iter.runResult.executionTimeMs}ms)
                      </span>
                    </div>

                    {iter.runResult.stdout && (
                      <div className="p-2.5 bg-neutral-900/90 rounded border border-neutral-800 text-neutral-300 text-[11px] whitespace-pre-wrap">
                        {iter.runResult.stdout}
                      </div>
                    )}

                    {iter.errorIdentified && (
                      <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-[11px]">
                        <strong>Detected Error:</strong> {iter.errorIdentified}
                      </div>
                    )}

                    {iter.proposedFixDiff && (
                      <div className="p-2.5 bg-purple-950/40 border border-purple-800/60 rounded text-purple-300 text-[11px]">
                        <strong>Auto-Patch Applied:</strong> {iter.proposedFixDiff}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLOUD & DEVOPS DISPATCH */}
      {activeTab === 'CLOUD_DEVOPS' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              Cloud Infrastructure & Tool Integrator
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Autonomously manage GitHub repositories, trigger Vercel edge deployments, run Docker builds, and sync Jira tickets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="GITHUB">GitHub (PRs, Commits, Actions)</option>
                <option value="VERCEL">Vercel (Deployments, Preview Domains)</option>
                <option value="DOCKER">Docker (Container Builds, Images)</option>
                <option value="AWS_GCP">AWS / GCP (Cloud Run, S3, IAM)</option>
                <option value="JIRA">Jira (Sprint Sync, Issue Resolution)</option>
              </select>

              <input
                type="text"
                value={selectedActionName}
                onChange={(e) => setSelectedActionName(e.target.value)}
                placeholder="Action Name (e.g. CREATE_PULL_REQUEST)..."
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />

              <button
                onClick={dispatchCloudTool}
                disabled={isDispatchingCloud}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {isDispatchingCloud ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                EXECUTE CLOUD TOOL
              </button>
            </div>
          </div>

          {/* Action Log Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-mono font-bold text-white block">DISPATCHED CLOUD ACTIONS:</span>
            <div className="space-y-2">
              {cloudActions.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-cyan-400 font-bold">
                      {act.platform}
                    </span>
                    <span className="text-white font-bold">{act.action}</span>
                    <span className="text-neutral-500 text-[11px]">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {act.result?.url && (
                      <a
                        href={act.result.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Live URL
                      </a>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      SUCCESS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREDICTIVE DEFENSE (OWASP TOP 10) */}
      {activeTab === 'PREDICTIVE_DEFENSE' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Predictive Defense & OWASP Top 10 SAST Scanner
                </h3>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  Proactive static codebase analysis to detect SQL Injection, XSS, Hardcoded Secrets, and SSRF vectors before deployment.
                </p>
              </div>
              <button
                onClick={runPredictiveDefenseScan}
                disabled={isScanningDefense}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isScanningDefense ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                {isScanningDefense ? 'SCANNING CODEBASE...' : 'RUN SAST DEFENSE SCAN'}
              </button>
            </div>
          </div>

          {predictiveScan && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400">Security Health Score</span>
                  <span className="text-xl font-mono font-bold text-cyan-400">{predictiveScan.securityScore}/100</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400">Vulnerabilities Detected</span>
                  <span className="text-xl font-mono font-bold text-rose-400">{predictiveScan.totalVulnerabilities}</span>
                </div>
              </div>

              <div className="space-y-3">
                {predictiveScan.owaspFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="bg-neutral-900 border border-rose-500/30 rounded-2xl p-5 space-y-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 font-bold border border-rose-800">
                          {finding.category}
                        </span>
                        <span className="text-white font-bold">{finding.title}</span>
                      </div>
                      <span className="text-rose-400 font-bold uppercase text-[10px]">
                        Severity: {finding.severity}
                      </span>
                    </div>

                    <p className="text-neutral-300 text-xs">{finding.description}</p>
                    <p className="text-neutral-500 text-[11px]">Location: {finding.fileLocation}:{finding.lineNumber}</p>

                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-emerald-300 text-xs whitespace-pre-wrap">
                      <span className="text-[10px] text-neutral-500 uppercase block mb-1">Recommended Auto-Fix Patch:</span>
                      {finding.autoFixPatch}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BANGLA TECHNICAL NLP ACADEMY */}
      {activeTab === 'BANGLA_NLP_ACADEMY' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Bangla Technical NLP & Concept Dictionary
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Deep training on distributed systems, quantum computing, cryptography, and algorithms translated into fluent technical Bangla.
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search technical concepts (e.g. 'Raft', 'Quantum', 'Zero-Knowledge', 'Vector')..."
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map((term, i) => (
              <div
                key={i}
                className="bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-3 font-mono"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{term.englishTerm}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {term.category}
                  </span>
                </div>

                <p className="text-sm font-bold text-emerald-400">{term.banglaTerm}</p>
                <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  {term.definitionBangla}
                </p>

                <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80">
                  <span className="text-neutral-500">English:</span> {term.definitionEnglish}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: LIVE INTEL & NEWS */}
      {activeTab === 'LIVE_INFO' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Live Grounded Intelligence & Tech Stream
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Real-time alerts on AI breakthroughs, zero-day CVE patches, developer frameworks, and cloud infrastructure telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveNews.map((news) => (
              <div
                key={news.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-cyan-500/40 rounded-2xl p-5 space-y-3 font-mono flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                      {news.category}
                    </span>
                    <span className="text-[11px] text-neutral-500">{news.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white">{news.title}</h4>
                  <p className="text-xs text-neutral-300 mt-2">{news.summary}</p>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Source: {news.source}</span>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Read Article
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
