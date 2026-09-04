import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Play,
  RotateCw,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  Wrench,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export type CapabilityStatus =
  | 'WORKING'
  | 'PARTIAL'
  | 'NOT_CONFIGURED'
  | 'UNAVAILABLE'
  | 'ERROR'
  | 'NOT_TESTED';

export interface CapabilityRecord {
  id: string;
  name: string;
  module: string;
  category: 'VOICE' | 'AI' | 'INTERNET' | 'MEMORY' | 'VISION' | '3D' | 'CODING' | 'DEVICE_OS' | 'SYSTEM_SECURITY';
  status: CapabilityStatus;
  version: string;
  provider: string;
  apiConfigured: boolean;
  permissionState: 'granted' | 'denied' | 'prompt' | 'not_applicable';
  lastTestTime: string;
  lastTestResult: string;
  evidence: string;
  error?: string;
  dependencies: string[];
}

export interface DiagnosticRunSummary {
  runId: string;
  timestamp: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  totalCapabilities: number;
  workingCount: number;
  partialCount: number;
  notConfiguredCount: number;
  unavailableCount: number;
  errorCount: number;
  notTestedCount: number;
  operationalScorePercent: number;
  executionDurationMs: number;
  capabilities: CapabilityRecord[];
  missingDependencies: string[];
  failedTests: { capability: string; error: string; evidence: string }[];
  recommendations: string[];
  markdownReport: string;
  spokenSummary: string;
}

export const UltronSelfDiagnosticPanel: React.FC = () => {
  const [summary, setSummary] = useState<DiagnosticRunSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'CARDS' | 'MARKDOWN' | 'UPGRADES'>('CARDS');
  const [copied, setCopied] = useState(false);
  const [upgradeData, setUpgradeData] = useState<{ text: string; spokenText: string } | null>(null);
  const [isLoadingUpgrades, setIsLoadingUpgrades] = useState(false);

  const fetchLastDiagnostic = async () => {
    try {
      const data = await apiFetch<DiagnosticRunSummary>('/api/diagnostics/last');
      if (data && data.capabilities) {
        setSummary(data);
      }
    } catch (err: any) {
      console.warn('Notice: Could not load cached diagnostic:', err?.message || err);
    }
  };

  useEffect(() => {
    fetchLastDiagnostic();
  }, []);

  const handleRunFullDiagnostic = async () => {
    setIsRunning(true);
    try {
      const data = await apiFetch<DiagnosticRunSummary>('/api/diagnostics/self-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredLanguage: 'English',
        }),
      });
      if (data) {
        setSummary(data);
      }
    } catch (err: any) {
      console.error('Failed to execute self diagnostic:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFetchUpgrades = async () => {
    setIsLoadingUpgrades(true);
    try {
      const data = await apiFetch<{ text: string; spokenText: string }>('/api/diagnostics/upgrades?lang=English');
      setUpgradeData(data);
      setViewMode('UPGRADES');
    } catch (err: any) {
      console.warn('Failed to load upgrade analysis:', err);
    } finally {
      setIsLoadingUpgrades(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!summary?.markdownReport) return;
    navigator.clipboard.writeText(summary.markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: CapabilityStatus) => {
    switch (status) {
      case 'WORKING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" />
            WORKING
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <AlertTriangle className="w-3 h-3" />
            PARTIAL
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950/80 text-sky-400 border border-sky-800/80">
            <Clock className="w-3 h-3" />
            NOT_CONFIGURED
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-900 text-neutral-400 border border-neutral-700">
            <Clock className="w-3 h-3" />
            UNAVAILABLE
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-800/80">
            <XCircle className="w-3 h-3" />
            ERROR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800">
            NOT_TESTED
          </span>
        );
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Modules' },
    { id: 'AI', label: 'AI Core' },
    { id: 'VOICE', label: 'Voice & STT/TTS' },
    { id: 'INTERNET', label: 'Internet' },
    { id: 'MEMORY', label: 'Memory Systems' },
    { id: 'VISION', label: 'Vision' },
    { id: '3D', label: '3D Hologram' },
    { id: 'CODING', label: 'Coding & Sandbox' },
    { id: 'DEVICE_OS', label: 'Device & OS' },
    { id: 'SYSTEM_SECURITY', label: 'Security & Core' },
  ];

  const filteredCapabilities = (summary?.capabilities || []).filter((cap) => {
    const matchesCategory = activeCategory === 'ALL' || cap.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      cap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cap.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cap.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cap.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="p-5 rounded-2xl border border-cyan-500/40 bg-neutral-900/80 backdrop-blur-xl space-y-5 shadow-2xl">
      {/* Header & Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-inner">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-mono font-bold text-white tracking-wide">
                ULTRON LIVE SYSTEM SELF-DIAGNOSTIC ENGINE
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                30 CAPABILITIES REGISTRY
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              Live, safe execution tests verifying actual runtime operational status across all system layers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRunFullDiagnostic}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>EXECUTING LIVE TESTS...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>RUN LIVE SELF-DIAGNOSTIC</span>
              </>
            )}
          </button>

          <button
            onClick={handleFetchUpgrades}
            disabled={isLoadingUpgrades}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-amber-400 text-amber-300 font-mono text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Upgrade Priorities</span>
          </button>
        </div>
      </div>

      {/* Metrics & Overall Health Banner */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            summary.overallStatus === 'HEALTHY'
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              : summary.overallStatus === 'DEGRADED'
              ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
              : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
          }`}>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Overall Health</span>
              <div className="text-xl font-mono font-black mt-0.5">{summary.overallStatus}</div>
              <span className="text-[10px] font-mono text-neutral-400">Run ID: {summary.runId}</span>
            </div>
            {summary.overallStatus === 'HEALTHY' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-80" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-400 opacity-80" />
            )}
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-neutral-200">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Operational Score</span>
              <div className="text-xl font-mono font-black text-cyan-400 mt-0.5">
                {summary.workingCount}/{summary.totalCapabilities}
                <span className="text-xs text-neutral-400 font-normal ml-1">({summary.operationalScorePercent}%)</span>
              </div>
              <div className="w-28 bg-neutral-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${summary.operationalScorePercent}%` }}
                />
              </div>
            </div>
            <Cpu className="w-8 h-8 text-cyan-500/60" />
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-neutral-200">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Status Distribution</span>
              <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                <span className="text-emerald-400 font-bold">{summary.workingCount} OK</span>
                <span className="text-neutral-600">•</span>
                <span className="text-amber-400 font-bold">{summary.partialCount} Part</span>
                <span className="text-neutral-600">•</span>
                <span className="text-rose-400 font-bold">{summary.errorCount} Err</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">{summary.notConfiguredCount} not configured</span>
            </div>
            <Layers className="w-8 h-8 text-sky-500/60" />
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-neutral-200">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Diagnostics Probe</span>
              <div className="text-lg font-mono font-bold text-white mt-0.5">{summary.executionDurationMs}ms</div>
              <span className="text-[10px] font-mono text-neutral-400">
                {new Date(summary.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <Activity className="w-8 h-8 text-purple-500/60" />
          </div>
        </div>
      )}

      {/* View Switcher & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setViewMode('CARDS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'CARDS' ? 'bg-cyan-500 text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Capability Matrix ({filteredCapabilities.length})
          </button>
          <button
            onClick={() => setViewMode('MARKDOWN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'MARKDOWN' ? 'bg-cyan-500 text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Structured Report View
          </button>
          <button
            onClick={() => {
              if (!upgradeData) handleFetchUpgrades();
              setViewMode('UPGRADES');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'UPGRADES' ? 'bg-cyan-500 text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Upgrade Roadmap
          </button>
        </div>

        {viewMode === 'MARKDOWN' && (
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Diagnostic Report'}</span>
          </button>
        )}
      </div>

      {/* Mode 1: Capability Cards Matrix */}
      {viewMode === 'CARDS' && (
        <div className="space-y-4">
          {/* Category Tabs & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-neutral-800 text-cyan-400 border border-cyan-500/50'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800/80 hover:text-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Filter capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCapabilities.map((cap) => (
              <div
                key={cap.id}
                className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 space-y-2.5 transition-all shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white">{cap.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 mt-0.5">
                      <span className="text-cyan-400 font-semibold">{cap.module}</span>
                      <span>•</span>
                      <span>v{cap.version}</span>
                    </div>
                  </div>
                  {getStatusBadge(cap.status)}
                </div>

                <div className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[11px] font-sans text-neutral-300 leading-relaxed">
                  <span className="font-mono text-[10px] text-neutral-400 block mb-0.5">Live Test Evidence:</span>
                  {cap.evidence}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-900">
                  <span className="truncate max-w-[170px]">Provider: {cap.provider}</span>
                  <span>Result: <strong className="text-neutral-300">{cap.lastTestResult}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Clean Structured Markdown Report */}
      {viewMode === 'MARKDOWN' && summary && (
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
          {summary.markdownReport}
        </div>
      )}

      {/* Mode 3: Upgrade Roadmap */}
      {viewMode === 'UPGRADES' && (
        <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
            <Wrench className="w-4 h-4" />
            <span>Targeted Upgrade Recommendations (Based on Live Test Results)</span>
          </div>

          {upgradeData ? (
            <div className="font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
              {upgradeData.text}
            </div>
          ) : (
            <div className="text-xs font-mono text-neutral-400">
              Run a live diagnostic test to compute your personalized module upgrade priorities.
            </div>
          )}
        </div>
      )}
    </section>
  );
};
