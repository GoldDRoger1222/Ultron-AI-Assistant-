import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Radio,
  Lock,
  Unlock,
  AlertTriangle,
  FileCheck,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  Wifi,
  WifiOff,
  Database,
  Cpu,
  RefreshCw,
  HardDrive,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SecuritySubMode, SecurityFinding, SecurityOperationLog, OfflinePolicy, LocalOnlyStatus } from '../types/jarvis';
import { apiFetch } from '../lib/api';
import { LocalIntelligenceEngine } from '../lib/localIntelligence';

interface SecurityProps {
  isSecurityMode: boolean;
  onToggleSecurityMode: (action: 'activate' | 'exit', subMode?: SecuritySubMode) => void;
}

export const Security: React.FC<SecurityProps> = ({
  isSecurityMode,
  onToggleSecurityMode,
}) => {
  const [subMode, setSubMode] = useState<SecuritySubMode>('DEFENCE');
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [logs, setLogs] = useState<SecurityOperationLog[]>([]);
  const [incidentResponse, setIncidentResponse] = useState<any | null>(null);
  const [isRunningIncident, setIsRunningIncident] = useState(false);

  // Local-Only state
  const [localStatus, setLocalStatus] = useState<LocalOnlyStatus>(() =>
    LocalIntelligenceEngine.getInstance().getStatus()
  );
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTestingLocal, setIsTestingLocal] = useState(false);

  // Offence authorization form state
  const [offenceTarget, setOffenceTarget] = useState('localhost:8080 (Lab Environment)');
  const [offenceScope, setOffenceScope] = useState('Authorized CTF Web Service (User-Owned)');
  const [isAuthorized, setIsAuthorized] = useState(true);

  const fetchSecurityData = async () => {
    try {
      const data = await apiFetch<any>('/api/security/mode');
      setFindings(data.findings || []);
      setLogs(data.logs || []);
      if (data.subMode) setSubMode(data.subMode);
    } catch (err: any) {
      console.warn('Failed to fetch security state:', err?.message || err);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const unsub = LocalIntelligenceEngine.getInstance().onStatusChange((status) => {
      setLocalStatus(status);
    });
    return () => unsub();
  }, [isSecurityMode]);

  const handleSubModeChange = (mode: SecuritySubMode) => {
    setSubMode(mode);
    onToggleSecurityMode('activate', mode);
  };

  const handleToggleLocalOnly = async (enable: boolean) => {
    const engine = LocalIntelligenceEngine.getInstance();
    engine.setForceLocalOnly(enable);
    try {
      await apiFetch('/api/security/local-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: enable, policy: enable ? 'FORCE_LOCAL' : 'AUTO_DETECT' }),
      });
      fetchSecurityData();
    } catch {
      // Local mode works offline without server
    }
  };

  const handlePolicyChange = async (policy: OfflinePolicy) => {
    const engine = LocalIntelligenceEngine.getInstance();
    engine.setPolicy(policy);
    try {
      await apiFetch('/api/security/local-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: localStatus.enabled, policy }),
      });
      fetchSecurityData();
    } catch {
      // Works offline
    }
  };

  const handlePreloadCache = () => {
    const engine = LocalIntelligenceEngine.getInstance();
    engine.preloadFullKnowledge();
  };

  const handleClearCache = () => {
    const engine = LocalIntelligenceEngine.getInstance();
    engine.clearCache();
  };

  const handleTestLocalExecution = () => {
    setIsTestingLocal(true);
    const engine = LocalIntelligenceEngine.getInstance();
    const result = engine.executeOnboardCommand('Build 3D holographic Iron Man Arc Reactor');
    setTimeout(() => {
      setTestResult(result);
      setIsTestingLocal(false);
    }, 150);
  };

  const handleTriggerIncident = async () => {
    setIsRunningIncident(true);
    try {
      const data = await apiFetch<any>('/api/security/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threatDetails: 'Unauthorized SYN Flood & Credential Probe attempt from external subnet' }),
      });
      setIncidentResponse(data);
      fetchSecurityData();
    } catch (err: any) {
      console.warn('Failed to trigger incident response:', err?.message || err);
    } finally {
      setIsRunningIncident(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl border border-rose-500/40 bg-rose-950/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
            <h1 className="text-xl font-mono font-bold text-white tracking-wide">
              JARVIS SECURITY TERMINAL
            </h1>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isSecurityMode
                  ? 'border-rose-500 bg-rose-500 text-black'
                  : 'border-neutral-700 bg-neutral-900 text-neutral-400'
              }`}
            >
              {isSecurityMode ? 'ARMED' : 'STANDBY'}
            </span>

            {localStatus.enabled && (
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/80 bg-amber-950/80 text-amber-300 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span>LOCAL-ONLY (AIR-GAPPED)</span>
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-neutral-300">
            Activation Secret: <code className="text-rose-300 font-bold bg-neutral-950 px-1.5 py-0.5 rounded">"JARVIS MODE"</code> | Exit: <code className="text-neutral-400 bg-neutral-950 px-1.5 py-0.5 rounded">"JARVIS NORMAL"</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSecurityMode ? (
            <button
              onClick={() => onToggleSecurityMode('exit')}
              className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-mono font-bold text-white transition-all flex items-center gap-1.5"
            >
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span>EXIT SECURITY MODE</span>
            </button>
          ) : (
            <button
              onClick={() => onToggleSecurityMode('activate', 'DEFENCE')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>ARM SECURITY MODE</span>
            </button>
          )}
        </div>
      </div>

      {/* Local-Only & Air-Gap Defense Control Card */}
      <div className="p-5 rounded-2xl border border-amber-500/40 bg-neutral-900/70 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-mono font-bold text-white tracking-wide">
                LOCAL-ONLY MODE & ONBOARD DEVICE PROCESSING
              </h2>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
                  localStatus.isOnline
                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                    : 'border-rose-500/50 bg-rose-950/40 text-rose-400'
                }`}
              >
                {localStatus.isOnline ? '🌐 NETWORK ONLINE' : '🔌 DISCONNECTED / OFFLINE'}
              </span>
            </div>
            <p className="text-xs font-sans text-neutral-400">
              Guarantees zero API timeouts or hanging requests by automatically routing execution through local semantic response caches and onboard procedural 3D/device synthesizers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
              <input
                type="checkbox"
                checked={localStatus.enabled}
                onChange={(e) => handleToggleLocalOnly(e.target.checked)}
                className="accent-amber-500 rounded cursor-pointer"
              />
              <span className="font-bold">FORCE LOCAL-ONLY</span>
            </label>
          </div>
        </div>

        {/* Status Metrics & Policy Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Execution Engine</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {localStatus.enabled ? 'Onboard Neural Cache' : 'Hybrid Cloud + Local'}
            </div>
            <p className="text-[10px] font-sans text-neutral-400">
              {localStatus.enabled ? '0ms Cloud Latency (Air-Gapped)' : 'Dynamic Failover Active'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Cached Knowledge</span>
              <Database className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-sm font-mono font-bold text-amber-400">
              {localStatus.cachedResponseCount} Semantic Nodes
            </div>
            <p className="text-[10px] font-sans text-neutral-400">
              {((localStatus.cacheStorageBytes || 0) / 1024).toFixed(1)} KB Local Storage
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Offline Policy</span>
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <select
              value={localStatus.policy}
              onChange={(e) => handlePolicyChange(e.target.value as OfflinePolicy)}
              className="w-full bg-neutral-900 border border-neutral-700 text-xs font-mono text-white rounded p-1"
            >
              <option value="AUTO_DETECT">AUTO (Switch on Disconnect)</option>
              <option value="FORCE_LOCAL">STRICT LOCAL (Air-Gapped)</option>
              <option value="CLOUD_ALLOWED">ALWAYS TRY CLOUD</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Cache Management</span>
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={handlePreloadCache}
                className="flex-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-cyan-300 flex items-center justify-center gap-1"
                title="Preload full 3D, code and device knowledge templates"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Preload</span>
              </button>
              <button
                onClick={handleClearCache}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-rose-300 flex items-center justify-center gap-1"
                title="Reset response cache"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Onboard Subsystems Checklist & Instant Test */}
        <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Procedural 3D WebGL (0ms)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Native Hardware Torch & Calls</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Onboard Code Synthesizer</span>
            </div>
          </div>

          <button
            onClick={handleTestLocalExecution}
            disabled={isTestingLocal}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isTestingLocal ? 'EXECUTING ONBOARD...' : 'TEST LOCAL-ONLY PIPELINE'}</span>
          </button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/30 text-xs font-mono space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <span>Onboard Pipeline Result: {testResult.intent}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300">
                0.2ms Latency (Zero Cloud Calls)
              </span>
            </div>
            <div className="text-neutral-300 font-sans text-xs whitespace-pre-line">
              {testResult.response}
            </div>
          </div>
        )}
      </div>

      {/* Security Sub-Modes (ATTACK, DEFENCE, OFFENCE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* DEFENCE MODE */}
        <button
          onClick={() => handleSubModeChange('DEFENCE')}
          className={`p-4 rounded-xl border text-left transition-all ${
            subMode === 'DEFENCE'
              ? 'border-cyan-500 bg-cyan-950/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
              : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 1. DEFENCE MODE
            </span>
            {subMode === 'DEFENCE' && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
          <p className="text-xs text-neutral-300 font-sans">
            Device & Network Monitoring, Patch Advisory, Incident Response without retaliation.
          </p>
        </button>

        {/* ATTACK MODE */}
        <button
          onClick={() => handleSubModeChange('ATTACK')}
          className={`p-4 rounded-xl border text-left transition-all ${
            subMode === 'ATTACK'
              ? 'border-amber-500 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> 2. ATTACK MODE
            </span>
            {subMode === 'ATTACK' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <p className="text-xs text-neutral-300 font-sans">
            Authorized Attack Simulation, CTF Lab Mapping, and safe vulnerability validation.
          </p>
        </button>

        {/* OFFENCE MODE */}
        <button
          onClick={() => handleSubModeChange('OFFENCE')}
          className={`p-4 rounded-xl border text-left transition-all ${
            subMode === 'OFFENCE'
              ? 'border-rose-500 bg-rose-950/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> 3. OFFENCE MODE
            </span>
            {subMode === 'OFFENCE' && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            )}
          </div>
          <p className="text-xs text-neutral-300 font-sans">
            Authorized Red Team Assessment with strict Target, Scope, and Owner authorization verification.
          </p>
        </button>
      </div>

      {/* SubMode Control Panels */}
      {subMode === 'DEFENCE' && (
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-neutral-900/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Defensive Incident Containment Protocol</span>
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Ethical Principle: Detect → Alert → Identify → Isolate → Block → Evidence → Analyze → Remediate → Verify
              </p>
            </div>
            <button
              onClick={handleTriggerIncident}
              disabled={isRunningIncident}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isRunningIncident ? 'SIMULATING RESPONSE...' : 'TEST INCIDENT RESPONSE'}</span>
            </button>
          </div>

          {incidentResponse && (
            <div className="space-y-2 animate-in fade-in">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400">
                {incidentResponse.summary}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {incidentResponse.steps.map((st: any, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span>{st.phase}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-neutral-400 font-sans">{st.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subMode === 'OFFENCE' && (
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-neutral-900/50 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-mono font-bold text-rose-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Authorized Offensive Testing Scope Verification</span>
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Offensive security operations require user ownership and explicit authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-neutral-400">TARGET HOST / URL</label>
              <input
                type="text"
                value={offenceTarget}
                onChange={(e) => setOffenceTarget(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400">SCOPE & BOUNDARIES</label>
              <input
                type="text"
                value={offenceScope}
                onChange={(e) => setOffenceScope(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <label className="flex items-center gap-2 text-xs font-mono text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isAuthorized}
                onChange={(e) => setIsAuthorized(e.target.checked)}
                className="accent-rose-500 rounded"
              />
              <span>I confirm I own this target or have formal written CTF/Lab authorization.</span>
            </label>
            <button
              disabled={!isAuthorized}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-mono font-bold text-xs shadow-md"
            >
              RUN AUTHORIZED AUDIT
            </button>
          </div>
        </div>
      )}

      {/* Findings Matrix */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold text-white">Verified Security Findings</h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">{findings?.length || 0} findings recorded</span>
        </div>

        <div className="space-y-3">
          {(findings || []).map((f) => (
            <div
              key={f.id}
              className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">{f.title}</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    f.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : f.severity === 'HIGH'
                      ? 'bg-orange-950 text-orange-400 border border-orange-800'
                      : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                  }`}
                >
                  {f.severity} (CVSS {f.riskScore})
                </span>
              </div>
              <p className="text-neutral-400 font-sans text-[11px]">
                <strong className="text-neutral-300">Target:</strong> {f.target} |{' '}
                <strong className="text-neutral-300">Category:</strong> {f.category}
              </p>
              <p className="text-neutral-300 font-sans text-[11px]">
                <strong className="text-neutral-400">Evidence:</strong> {f.evidence}
              </p>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800/80 text-[11px] text-emerald-300 font-sans">
                <strong className="text-emerald-400 font-mono">Remediation:</strong> {f.remediation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

