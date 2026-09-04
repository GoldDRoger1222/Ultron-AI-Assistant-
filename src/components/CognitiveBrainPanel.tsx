import React, { useState } from 'react';
import {
  Brain,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  Search,
  FileCode,
  Activity,
  Terminal,
} from 'lucide-react';
import {
  CognitiveExecutionSession,
  DeepTaskAnalysis,
  AutonomousSubTask,
  DecisionMatrix,
  CognitiveStage,
} from '../types/jarvis';
import { AgentMatrixPanel } from './AgentMatrixPanel';
import { AutonomousBrainOSPanel } from './AutonomousBrainOSPanel';

interface CognitiveBrainPanelProps {
  currentSession: CognitiveExecutionSession | null;
  recentSessions: CognitiveExecutionSession[];
  onAnalyzeCommand: (cmd: string) => void;
  isLoading?: boolean;
}

const STAGES: { stage: CognitiveStage; label: string; desc: string }[] = [
  { stage: 'UNDERSTAND', label: 'Understand', desc: 'Intent, Goal & Scope' },
  { stage: 'ANALYZE', label: 'Analyze', desc: 'Requirements & Risks' },
  { stage: 'PLAN', label: 'Plan', desc: 'Autonomous Decomposition' },
  { stage: 'DECIDE', label: 'Decide', desc: 'Multi-AI Decision Matrix' },
  { stage: 'EXECUTE', label: 'Execute', desc: 'Autonomous Worker Pipeline' },
  { stage: 'VERIFY', label: 'Verify', desc: 'Zero-Error Quality Gate' },
  { stage: 'ADAPT', label: 'Adapt', desc: 'Self-Correction & Fallover' },
  { stage: 'COMPLETE', label: 'Complete', desc: 'Spoken Brief & Outcome' },
];

export const CognitiveBrainPanel: React.FC<CognitiveBrainPanelProps> = ({
  currentSession,
  recentSessions,
  onAnalyzeCommand,
  isLoading = false,
}) => {
  const [testPrompt, setTestPrompt] = useState('');
  const [selectedTab, setSelectedTab] = useState<'current' | 'autonomous_os' | 'decomposition' | 'decision' | 'preservation' | 'agents' | 'history'>('current');
  const [selectedHistoricalSession, setSelectedHistoricalSession] = useState<CognitiveExecutionSession | null>(null);

  const activeSession = selectedHistoricalSession || currentSession || recentSessions[0] || null;

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim() || isLoading) return;
    onAnalyzeCommand(testPrompt.trim());
    setTestPrompt('');
  };

  const getStageIndex = (stage: CognitiveStage) => {
    return STAGES.findIndex((s) => s.stage === stage);
  };

  const currentStageIdx = activeSession ? getStageIndex(activeSession.currentStage) : -1;

  return (
    <div id="ultron-cognitive-brain-panel" className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-slate-900/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-wide text-white truncate">ULTRON Super Brain</h2>
              <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Cognitive Core v5.0
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">
              Autonomous Decomposition • 12-Agent Matrix • Multi-AI Decision Matrix
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full scrollbar-thin gap-1">
          <button
            onClick={() => { setSelectedHistoricalSession(null); setSelectedTab('current'); }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              selectedTab === 'current' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('autonomous_os')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              selectedTab === 'autonomous_os' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous OS Hub
          </button>
          <button
            onClick={() => setSelectedTab('agents')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              selectedTab === 'agents' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            12-Agent Matrix
          </button>
          <button
            onClick={() => setSelectedTab('decomposition')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              selectedTab === 'decomposition' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subtasks ({activeSession?.decomposition?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab('decision')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              selectedTab === 'decision' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Decision Matrix
          </button>
          <button
            onClick={() => setSelectedTab('preservation')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              selectedTab === 'preservation' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Context Engine
          </button>
        </div>
      </div>

      {/* 8-Stage Cognitive Reasoning Loop Pipeline Banner */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-900/40 border-b border-slate-800/60 overflow-x-auto scrollbar-thin">
        <div className="flex items-center min-w-[560px] sm:min-w-[680px] justify-between text-xs py-0.5">
          {STAGES.map((st, idx) => {
            const isPast = activeSession && (currentStageIdx > idx || activeSession.currentStage === 'COMPLETE');
            const isCurrent = activeSession?.currentStage === st.stage;
            return (
              <React.Fragment key={st.stage}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-[11px] transition-all ${
                      isCurrent
                        ? 'bg-purple-500 text-white ring-4 ring-purple-500/20 shadow-lg shadow-purple-500/30 animate-pulse'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                      isCurrent ? 'text-purple-300' : isPast ? 'text-emerald-300' : 'text-slate-500'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                {idx < STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-1.5 sm:mx-2 min-w-[12px] rounded ${
                      isPast ? 'bg-emerald-500/50' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
        {/* Quick Test Prompt Bar */}
        <form onSubmit={handleRunAnalysis} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Test Cognitive Core (e.g. 'Build offline-first voice app' or 'Security audit backend')..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !testPrompt.trim()}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Deep Analyze
          </button>
        </form>

        {activeSession ? (
          <>
            {/* TAB: OVERVIEW */}
            {selectedTab === 'current' && (
              <div className="space-y-6">
                {/* Active Goal & Confidence Card */}
                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                          Primary Goal & Intent
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {activeSession.intentType}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/30">
                          Complexity: {activeSession.analysis.estimatedComplexity}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-100 leading-snug">
                        {activeSession.analysis.goal}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="text-lg font-bold text-emerald-400">
                          {Math.round(activeSession.analysis.confidenceScore * 100)}%
                        </div>
                      </div>
                      <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                  </div>

                  {/* Concise Spoken Summary */}
                  {activeSession.spokenSummary && (
                    <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs flex items-start gap-2.5">
                      <Activity className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-purple-300">Voice Synthesis Brief: </span>
                        {activeSession.spokenSummary}
                      </div>
                    </div>
                  )}

                  {/* Requirements & Constraints Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Extracted Requirements ({activeSession.analysis?.requirements?.length || 0})
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-400">
                        {(activeSession.analysis?.requirements || []).map((req, i) => (
                          <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Operational Constraints & Guardrails
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-400">
                        {(activeSession.analysis?.constraints || []).map((con, i) => (
                          <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Subtask Quick Progress Matrix */}
                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold text-slate-200">Autonomous Subtask Flow</h4>
                    </div>
                    <span className="text-xs text-slate-400">
                      {(activeSession.decomposition || []).filter((s) => s.status === 'COMPLETED').length} / {activeSession.decomposition?.length || 0} Steps Complete
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(activeSession.decomposition || []).map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            sub.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : sub.status === 'IN_PROGRESS'
                              ? 'bg-purple-500 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {sub.stepNumber}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-semibold text-slate-200 truncate">{sub.name}</div>
                            <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-800 text-purple-300 rounded">
                              {sub.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{sub.description}</p>
                          {sub.outputSummary && (
                            <div className="text-[10px] text-emerald-400/90 pt-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{sub.outputSummary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DECOMPOSITION */}
            {selectedTab === 'decomposition' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Autonomous Subtask Decomposition</h3>
                    <p className="text-xs text-slate-400">
                      Step-by-step modular breakdown executed by the ULTRON Cognitive Core
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                    {activeSession.decomposition?.length || 0} Subtasks
                  </span>
                </div>

                <div className="space-y-3">
                  {(activeSession.decomposition || []).map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 text-xs font-bold bg-purple-600/30 text-purple-300 rounded border border-purple-500/30">
                            Step {sub.stepNumber}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-100">{sub.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[11px] bg-slate-800 text-slate-300 rounded">
                            {sub.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                              sub.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : sub.status === 'IN_PROGRESS'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">{sub.description}</p>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                        <div className="flex items-center gap-3">
                          <span>Worker AI: <strong className="text-slate-200">{sub.assignedAi}</strong></span>
                          <span>Model: <strong className="text-purple-300">{sub.assignedModel}</strong></span>
                        </div>
                        {sub.outputSummary && (
                          <div className="text-emerald-400 font-medium">{sub.outputSummary}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: DECISION MATRIX */}
            {selectedTab === 'decision' && activeSession.decisionMatrix && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-200">Selected Execution Strategy</h3>
                  </div>
                  <p className="text-xs text-purple-200 bg-purple-950/40 p-3 rounded-lg border border-purple-800/40 font-medium">
                    {activeSession.decisionMatrix.chosenStrategy}
                  </p>
                </div>

                {/* Evaluated Approaches Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Evaluated Mathematical Approaches
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeSession.decisionMatrix.evaluatedApproaches.map((app, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border space-y-3 ${
                          app.score > 0.8
                            ? 'bg-purple-950/20 border-purple-500/40'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-100">{app.name}</div>
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded ${
                              app.score > 0.8 ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Score: {Math.round(app.score * 100)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Reliability</div>
                            <div className="font-bold text-emerald-400">{Math.round(app.reliability * 100)}%</div>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Speed</div>
                            <div className="font-bold text-cyan-400">{Math.round(app.speed * 100)}%</div>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400">Security</div>
                            <div className="font-bold text-purple-400">{Math.round(app.securityScore * 100)}%</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400">{app.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Worker Allocation */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    Selected AI Workers & Roles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {activeSession.decisionMatrix.selectedWorkers.map((w, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                        <div className="text-[10px] text-slate-400">{w.role}</div>
                        <div className="font-semibold text-slate-200 capitalize">{w.provider}</div>
                        <div className="text-[10px] text-purple-400">{w.model}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONTEXT PRESERVATION */}
            {selectedTab === 'preservation' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    « The AI may change, but the task must not change. »
                  </div>
                  <p className="text-xs text-slate-300">
                    ULTRON continuously snapshots and preserves original goals, completed subtasks, memory vectors, and verification criteria across worker failovers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Current Active Worker State
                  </h4>
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400">Active Provider: </span>
                      <strong className="text-slate-200 uppercase">{activeSession.currentWorker.provider}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Model: </span>
                      <strong className="text-purple-300">{activeSession.currentWorker.model}</strong>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                      {activeSession.currentWorker.health}
                    </span>
                  </div>
                </div>

                {activeSession.contextPreservationSnapshots && activeSession.contextPreservationSnapshots.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Preserved Failover Snapshots
                    </h4>
                    {activeSession.contextPreservationSnapshots.map((snap, i) => (
                      <div key={i} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-purple-300">
                            {snap.fromProvider} <ArrowRight className="inline w-3 h-3" /> {snap.toProvider}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-400"><strong>Reason: </strong>{snap.switchReason}</p>
                        <p className="text-[11px] text-slate-500"><strong>Context Saved: </strong>{snap.requiredContext}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                    No failover events required. Primary worker completed task with 100% verification integrity.
                  </div>
                )}
              </div>
            )}
            {/* Tab 5: 12-Agent Matrix */}
            {selectedTab === 'agents' && (
              <div className="p-2 sm:p-4">
                <AgentMatrixPanel />
              </div>
            )}

            {/* Tab 6: Autonomous OS Hub */}
            {selectedTab === 'autonomous_os' && (
              <div className="p-2 sm:p-4">
                <AutonomousBrainOSPanel />
              </div>
            )}
          </>
        ) : selectedTab === 'autonomous_os' ? (
          <div className="p-2 sm:p-4">
            <AutonomousBrainOSPanel />
          </div>
        ) : selectedTab === 'agents' ? (
          <div className="p-2 sm:p-4">
            <AgentMatrixPanel />
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Brain className="w-10 h-10 mx-auto text-purple-500/40 animate-pulse" />
            <p className="text-sm">Speak "Heyy ULTRON" or enter a project prompt above to activate Deep Cognitive Analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};
