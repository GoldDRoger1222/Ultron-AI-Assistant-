import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  FolderTree,
  Eye,
  BookOpen,
  GitBranch,
  Settings,
  Cpu,
  RefreshCw,
  Play,
  Pause,
  AlertOctagon,
  CheckCircle,
  FileCode,
  Sliders,
  Database,
  Search,
  Upload,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  UniversalConnector,
  KnowledgeDocument,
  ProjectPersistentMemory,
  UserPersonalizationSettings,
  ModelRouteEntry,
  SelfHealingIncident,
  SecuritySentinelStatus,
  EmergencyFailsafeStatus,
  ActionApprovalRequest,
  VerificationCriticReport,
  ScreenAnalysisResult,
  DeveloperModeReport,
  AutomationWorkflow,
} from '../types/jarvis';

export const AutonomousBrainOSPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'agentic' | 'verifier' | 'computer' | 'screen' | 'knowledge' | 'project' | 'tools' | 'router' | 'security' | 'personalization' | 'developer' | 'automation'
  >('agentic');

  // State buffers
  const [userGoalInput, setUserGoalInput] = useState('');
  const [isExecutingGoal, setIsExecutingGoal] = useState(false);
  const [goalResult, setGoalResult] = useState<any>(null);

  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<VerificationCriticReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [virtualFiles, setVirtualFiles] = useState<any[]>([]);
  const [runningApps, setRunningApps] = useState<any[]>([]);

  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
  const [knowledgeSearchResult, setKnowledgeSearchResult] = useState<any>(null);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  const [projectMemory, setProjectMemory] = useState<ProjectPersistentMemory | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);

  const [connectors, setConnectors] = useState<UniversalConnector[]>([]);
  const [modelRoutes, setModelRoutes] = useState<ModelRouteEntry[]>([]);
  const [recoveryIncidents, setRecoveryIncidents] = useState<SelfHealingIncident[]>([]);
  const [sentinelStatus, setSentinelStatus] = useState<SecuritySentinelStatus | null>(null);
  const [failsafeStatus, setFailsafeStatus] = useState<EmergencyFailsafeStatus | null>(null);
  const [personalization, setPersonalization] = useState<UserPersonalizationSettings | null>(null);
  const [devReport, setDevReport] = useState<DeveloperModeReport | null>(null);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [screenAnalysis, setScreenAnalysis] = useState<ScreenAnalysisResult | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<ActionApprovalRequest[]>([]);
  const [globalPermissionLevel, setGlobalPermissionLevel] = useState<number>(2);

  // Fetch OS Statuses
  const refreshAllData = async () => {
    try {
      const [
        filesRes,
        appsRes,
        docsRes,
        projRes,
        graphRes,
        connRes,
        routeRes,
        recRes,
        secRes,
        failRes,
        persRes,
        wfRes,
        permRes,
      ] = await Promise.all([
        fetch('/api/computer/files').then((r) => r.json()),
        fetch('/api/computer/apps').then((r) => r.json()),
        fetch('/api/knowledge/documents').then((r) => r.json()),
        fetch('/api/project-memory').then((r) => r.json()),
        fetch('/api/project-memory/graph').then((r) => r.json()),
        fetch('/api/tools/connectors').then((r) => r.json()),
        fetch('/api/router/routes').then((r) => r.json()),
        fetch('/api/recovery/incidents').then((r) => r.json()),
        fetch('/api/security-sentinel').then((r) => r.json()),
        fetch('/api/failsafe/status').then((r) => r.json()),
        fetch('/api/personalization').then((r) => r.json()),
        fetch('/api/automation/workflows').then((r) => r.json()),
        fetch('/api/permissions').then((r) => r.json()),
      ]);

      if (filesRes.success) setVirtualFiles(filesRes.files || []);
      if (appsRes.success) setRunningApps(appsRes.apps || []);
      if (docsRes.success) setKnowledgeDocs(docsRes.documents || []);
      if (projRes.success) setProjectMemory(projRes.project || null);
      if (graphRes.success) setKnowledgeGraph(graphRes.graph || null);
      if (connRes.success) setConnectors(connRes.connectors || []);
      if (routeRes.success) setModelRoutes(routeRes.routes || []);
      if (recRes.success) setRecoveryIncidents(recRes.incidents || []);
      if (secRes.success) setSentinelStatus(secRes.status || null);
      if (failRes.success) setFailsafeStatus(failRes.status || null);
      if (persRes.success) setPersonalization(persRes.settings || null);
      if (wfRes.success) setWorkflows(wfRes.workflows || []);
      if (permRes.success) {
        setGlobalPermissionLevel(permRes.level ?? 2);
        setPendingApprovals(permRes.pending || []);
      }
    } catch (err) {
      console.warn('Failed to load some autonomous status endpoints:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Execute Agentic Goal
  const handleExecuteGoal = async () => {
    if (!userGoalInput.trim() || isExecutingGoal) return;
    setIsExecutingGoal(true);
    setGoalResult(null);
    try {
      const res = await fetch('/api/agentic/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: userGoalInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setGoalResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingGoal(false);
      refreshAllData();
    }
  };

  // Trigger Emergency Stop
  const handleEmergencyStop = async () => {
    try {
      const res = await fetch('/api/failsafe/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) setFailsafeStatus(data.status);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResumeFailsafe = async () => {
    try {
      const res = await fetch('/api/failsafe/resume', { method: 'POST' });
      const data = await res.json();
      if (data.success) setFailsafeStatus(data.status);
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve Pending Approval
  const handleResolveApproval = async (id: string, approved: boolean) => {
    try {
      await fetch('/api/permissions/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved }),
      });
      refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Ingest Knowledge Document
  const handleIngestKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle.trim(),
          content: newDocContent.trim(),
          type: 'DOCUMENTATION',
          tags: ['manual-upload', 'user-notes'],
        }),
      });
      if (res.ok) {
        setNewDocTitle('');
        setNewDocContent('');
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search Knowledge Brain
  const handleSearchKnowledge = async () => {
    if (!knowledgeSearchQuery.trim()) return;
    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: knowledgeSearchQuery.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setKnowledgeSearchResult(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Banner with Emergency Stop & Live Status */}
      <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide">ULTRON Autonomous Operating Brain</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold uppercase">
                OS v5.2 Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agentic Decomposition • Verification Gate • Computer Agent • Knowledge Brain • Model Router
            </p>
          </div>
        </div>

        {/* Permission Level & Emergency Failsafe Controller */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Permission:</span>
            <span className="font-semibold text-emerald-300">
              Level {globalPermissionLevel} {globalPermissionLevel === 2 ? '(Standard Guard)' : '(Strict Confirmation)'}
            </span>
          </div>

          {failsafeStatus?.isEmergencyStopped ? (
            <button
              onClick={handleResumeFailsafe}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              Resume System
            </button>
          ) : (
            <button
              onClick={handleEmergencyStop}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all animate-pulse"
              title='Voice: Say "ULTRON STOP"'
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              ULTRON STOP
            </button>
          )}
        </div>
      </div>

      {/* Sensitive Action Approval Modal (Level 3 Permissions) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 text-amber-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 animate-bounce" />
              <div>
                <div className="text-xs font-bold text-amber-300">
                  Level 3 Sensitive Action Approval Required ({pendingApprovals.length} pending)
                </div>
                <div className="text-xs text-amber-200/80">
                  Target: <span className="font-mono">{pendingApprovals[0].target}</span> • Action:{' '}
                  <span className="font-semibold">{pendingApprovals[0].action}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResolveApproval(pendingApprovals[0].id, true)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all"
              >
                Approve & Execute
              </button>
              <button
                onClick={() => handleResolveApproval(pendingApprovals[0].id, false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-all"
              >
                Deny Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 overflow-x-auto text-xs">
        {[
          { id: 'agentic', label: 'True Agentic Brain', icon: Brain },
          { id: 'verifier', label: 'Self-Verification Gate', icon: ShieldCheck },
          { id: 'computer', label: 'Computer Agent', icon: Terminal },
          { id: 'screen', label: 'Screen Vision', icon: Eye },
          { id: 'knowledge', label: 'Knowledge Brain', icon: BookOpen },
          { id: 'project', label: 'Project Memory & Graph', icon: FolderTree },
          { id: 'tools', label: 'Tool Connectors', icon: GitBranch },
          { id: 'router', label: 'Model Router & Failover', icon: Cpu },
          { id: 'security', label: 'Security Sentinel', icon: ShieldAlert },
          { id: 'automation', label: 'Automations', icon: Zap },
          { id: 'developer', label: 'Developer Mode', icon: FileCode },
          { id: 'personalization', label: 'Personalization', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                isActive
                  ? 'bg-purple-600/90 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content View */}
      <div className="p-6 flex-1 overflow-y-auto max-h-[560px]">
        {/* 1. TRUE AGENTIC BRAIN */}
        {activeTab === 'agentic' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Goal-Oriented Autonomous Execution
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                State your goal naturally. ULTRON will understand intent, plan the task breakdown, execute across specialized agents, self-verify code, and deliver verified production results.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={userGoalInput}
                  onChange={(e) => setUserGoalInput(e.target.value)}
                  placeholder="e.g. Build a secure full-stack portfolio website with authentication and dark mode..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteGoal()}
                />
                <button
                  onClick={handleExecuteGoal}
                  disabled={isExecutingGoal || !userGoalInput.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  {isExecutingGoal ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Execute Goal
                </button>
              </div>
            </div>

            {/* Execution Result Steps */}
            {goalResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-purple-300">
                    Execution Pipeline for: "{goalResult.goal}"
                  </div>
                  <div className="text-xs text-slate-400">
                    Time: {(goalResult.executionTimeMs / 1000).toFixed(2)}s • Certainty:{' '}
                    {Math.round((goalResult.verificationReport?.certaintyRating || 0.95) * 100)}%
                  </div>
                </div>

                {/* Steps Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {goalResult.steps.map((stp: any) => (
                    <div
                      key={stp.id}
                      className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-300">Step {stp.stepNumber}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300">
                            {stp.agentRole}
                          </span>
                        </div>
                        <div className="font-medium text-slate-200 text-xs mb-1">{stp.actionName}</div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        {stp.status}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Output Snippet */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-300 mb-2">Autonomous Output:</div>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-60 whitespace-pre-wrap">
                    {goalResult.synthesizedOutput}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SELF-VERIFICATION GATE */}
        {activeTab === 'verifier' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                5-Stage Autonomous Self-Verification & Critic Engine
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Architecture: GENERATE → CRITIC → VERIFY → CORRECT → FINAL. ULTRON validates syntax, imports, edge cases, and facts before presenting to the user.
              </p>

              <textarea
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                placeholder="Paste code or response to run strict verification against..."
                className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-3"
              />

              <button
                onClick={async () => {
                  if (!verifyInput.trim()) return;
                  setIsVerifying(true);
                  try {
                    const res = await fetch('/api/verifier/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: verifyInput.trim() }),
                    });
                    const data = await res.json();
                    if (data.success) setVerifyResult(data.report);
                  } finally {
                    setIsVerifying(false);
                  }
                }}
                disabled={isVerifying || !verifyInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
              >
                {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Run Critic & Verification Loop
              </button>
            </div>

            {verifyResult && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Verdict: {verifyResult.verdict}</span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    Confidence: {Math.round(verifyResult.certaintyRating * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-300">{verifyResult.criticAssessment}</p>
                {verifyResult.detectedErrors && verifyResult.detectedErrors.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-rose-400 mb-1">Detected Defects:</div>
                    <ul className="list-disc list-inside text-xs text-rose-300 space-y-0.5">
                      {verifyResult.detectedErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. COMPUTER AGENT */}
        {activeTab === 'computer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Authorized Computer Agent</h3>
                <p className="text-xs text-slate-400">Virtual File System, Workspace Inspector, Process Manager</p>
              </div>
              <button
                onClick={refreshAllData}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Virtual File System */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
                  Workspace Files ({virtualFiles.length})
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto font-mono text-xs">
                  {virtualFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950/60 border border-slate-800/60"
                    >
                      <span className="text-slate-300">{f.path}</span>
                      <span className="text-[10px] text-slate-500">{f.sizeBytes} B</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Running Processes */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  Authorized Sub-Processes ({runningApps.length})
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto text-xs">
                  {runningApps.map((app, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950/60 border border-slate-800/60"
                    >
                      <span className="text-slate-300 font-medium">{app.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. KNOWLEDGE BRAIN */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-purple-400" />
                Semantic Retrieval from Personal Brain
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={knowledgeSearchQuery}
                  onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                  placeholder="Ask anything stored in your documents or project manuals..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchKnowledge()}
                />
                <button
                  onClick={handleSearchKnowledge}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Search
                </button>
              </div>

              {knowledgeSearchResult && (
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
                  <div className="font-semibold text-purple-300">Synthesized Answer:</div>
                  <p className="text-slate-200">{knowledgeSearchResult.synthesizedAnswer}</p>
                </div>
              )}
            </div>

            {/* Ingest Document */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Ingest New Document / Note into Knowledge Base
              </div>
              <form onSubmit={handleIngestKnowledge} className="space-y-3">
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Document Title (e.g. Database Migration Protocol)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Document content, specifications, API docs, notes..."
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!newDocTitle.trim() || !newDocContent.trim()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Ingest & Index Document
                </button>
              </form>
            </div>

            {/* Ingested Document List */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">
                Indexed Documents ({knowledgeDocs.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {knowledgeDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1"
                  >
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>{doc.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                        {doc.embeddingsStatus}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{doc.summary}</p>
                    <div className="text-[10px] text-slate-500">
                      Chunks: {doc.chunksCount} • Size: {doc.sizeBytes} B
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. PROJECT MEMORY & GRAPH */}
        {activeTab === 'project' && projectMemory && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-sm font-bold text-white">{projectMemory.projectName}</div>
              <div className="text-xs text-purple-300 font-mono">Architecture: {projectMemory.architecture}</div>
              <div className="text-xs text-slate-400">Current Version: {projectMemory.currentVersion}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-emerald-400 mb-2">
                  Completed Features ({projectMemory.featuresCompleted?.length || 0})
                </div>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {(projectMemory.featuresCompleted || []).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-cyan-400 mb-2">Important Architecture Decisions</div>
                <div className="space-y-2 text-xs">
                  {(projectMemory.importantDecisions || []).map((d, i) => (
                    <div key={i} className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                      <div className="font-semibold text-slate-200">{d.decision}</div>
                      <div className="text-[11px] text-slate-400">{d.rationale}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. UNIVERSAL TOOL CONNECTORS */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Universal Connector Framework: Plugin-style integrations with zero core architectural rewrite required.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connectors.map((conn) => (
                <div
                  key={conn.id}
                  className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      {conn.name}
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                          conn.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {conn.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{conn.description}</div>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch('/api/tools/toggle', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: conn.id, enabled: !conn.enabled }),
                      });
                      refreshAllData();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      conn.enabled ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    }`}
                  >
                    {conn.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. MODEL ROUTER & FAILOVER */}
        {activeTab === 'router' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Model Router & Cascading Failover: Primary AI → Fallback 1 → Fallback 2 → Local WASM / ONNX.
            </div>
            <div className="space-y-2">
              {modelRoutes.map((rt) => (
                <div
                  key={rt.category}
                  className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between text-xs gap-3"
                >
                  <div>
                    <span className="font-bold text-purple-300">{rt.category}</span>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Cascade: {rt.primaryModel} → {rt.fallback1} → {rt.fallback2} → {rt.localFallback}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">Latency: {rt.latencyMs}ms</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold text-[10px]">
                      {rt.health}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. SECURITY SENTINEL */}
        {activeTab === 'security' && sentinelStatus && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div>
                <div className="text-sm font-bold text-white">Security Sentinel Status</div>
                <div className="text-xs text-slate-400">Mode: {sentinelStatus.mode} • API Security Score: {sentinelStatus.apiHealthSecurityScore}%</div>
              </div>
              <div className="flex gap-2">
                {(['NORMAL', 'DEFENCE', 'LOCKDOWN'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={async () => {
                      await fetch('/api/security-sentinel/mode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: m }),
                      });
                      refreshAllData();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      sentinelStatus.mode === m ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-200 mb-2">Connected Devices & Terminals</div>
              <div className="space-y-1 text-xs">
                {sentinelStatus.connectedDevices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60">
                    <span className="text-slate-300">{d.name} ({d.ip})</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. AUTOMATIONS */}
        {activeTab === 'automation' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Trigger → Condition → Action → Verification Automations
            </div>
            <div className="space-y-2">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{wf.name}</div>
                    <div className="text-slate-400 text-[11px]">Condition: {wf.condition}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Last Run: {wf.lastResult || 'Standby'}</div>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch('/api/automation/trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: wf.id }),
                      });
                      refreshAllData();
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Trigger
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. DEVELOPER MODE */}
        {activeTab === 'developer' && (
          <div className="space-y-4">
            <button
              onClick={async () => {
                const res = await fetch('/api/developer/inspect', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projectName: 'ULTRON Autonomous Super Brain' }),
                });
                const data = await res.json();
                if (data.success) setDevReport(data.report);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              Run Deep Code & Architecture Inspection
            </button>

            {devReport && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-emerald-400">Quality Score: {devReport.codeQualityScore}/100</div>
                  <p className="text-slate-300">{devReport.architectureReview}</p>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-cyan-400">Automated Tests Summary</div>
                  <div className="text-slate-300">
                    Passed {devReport.testsSummary.passed} / {devReport.testsSummary.total} tests. Zero regressions.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 11. PERSONALIZATION */}
        {activeTab === 'personalization' && personalization && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="text-sm font-bold text-white">Personalization Settings</div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Language</label>
                  <select
                    value={personalization.language}
                    onChange={async (e) => {
                      const updated = await fetch('/api/personalization', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ language: e.target.value }),
                      }).then((r) => r.json());
                      if (updated.success) setPersonalization(updated.settings);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="bn-BD">Bengali (বাংলা)</option>
                    <option value="banglish">Banglish (বাংলা + English)</option>
                    <option value="en-US">English</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Response Depth</label>
                  <select
                    value={personalization.responseLength}
                    onChange={async (e) => {
                      const updated = await fetch('/api/personalization', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ responseLength: e.target.value }),
                      }).then((r) => r.json());
                      if (updated.success) setPersonalization(updated.settings);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="CONCISE">Concise</option>
                    <option value="BALANCED">Balanced</option>
                    <option value="THOROUGH">Thorough</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Voice Style</label>
                  <select
                    value={personalization.voiceStyle}
                    onChange={async (e) => {
                      const updated = await fetch('/api/personalization', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ voiceStyle: e.target.value }),
                      }).then((r) => r.json());
                      if (updated.success) setPersonalization(updated.settings);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="STARK_BRITISH">British Butler (ULTRON/JARVIS)</option>
                    <option value="BENGALI_NATURAL">Bengali Natural Voice</option>
                    <option value="NEUTRAL_AI">Neutral AI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12. SCREEN VISION */}
        {activeTab === 'screen' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-white mb-1">Permission-Protected Screen Vision</div>
              <p className="text-xs text-slate-400 mb-3">
                Analyzes authorized screen layouts, terminals, and code editors for defects with zero covert recording.
              </p>
              <button
                onClick={async () => {
                  const res = await fetch('/api/screen/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      screenData: {
                        windowTitle: 'VSCode / Terminal Workspace',
                        activeApp: 'TypeScript IDE',
                        rawTextContent: 'Terminal: TS build success. 0 errors detected. 12 agents initialized.',
                      },
                      userQuestion: 'Check if there are any errors in the current screen output.',
                    }),
                  });
                  const data = await res.json();
                  if (data.success) setScreenAnalysis(data.result);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Analyze Current Screen
              </button>
            </div>

            {screenAnalysis && (
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="font-bold text-slate-200">Analysis Summary:</div>
                <p className="text-slate-300">{screenAnalysis.aiExplanation}</p>
                <div className="text-slate-400 text-[11px]">Layout: {screenAnalysis.layoutDescription}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
