import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  SkipForward,
  MessageSquare,
  GitBranch,
  Cloud,
  Terminal,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Radio,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export interface UnifiedServiceStatus {
  id: string;
  name: string;
  category: 'MEDIA' | 'MESSAGING' | 'DEV_OPS' | 'CLOUD_INFRA' | 'OS_CONTROL';
  status: 'ONLINE' | 'STANDBY' | 'SYNCING' | 'ERROR';
  details: string;
  activeContext?: string;
  lastActionTimestamp: string;
  authorizedScopes: string[];
}

export interface ProactiveSuggestion {
  id: string;
  title: string;
  category: 'BUG_FIX' | 'PERFORMANCE' | 'ORGANIZATION' | 'SECURITY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  suggestedAction: string;
  confidenceScore: number;
  autoFixAvailable: boolean;
  resolved: boolean;
}

export const UnifiedOrchestratorPanel: React.FC = () => {
  const [services, setServices] = useState<UnifiedServiceStatus[]>([]);
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [isApplyingFix, setIsApplyingFix] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [svcRes, sugRes] = await Promise.all([
        apiFetch<{ services: UnifiedServiceStatus[] }>('/api/os/unified-services'),
        apiFetch<{ suggestions: ProactiveSuggestion[] }>('/api/os/suggestions'),
      ]);
      if (svcRes.services) setServices(svcRes.services);
      if (sugRes.suggestions) setSuggestions(sugRes.suggestions);
    } catch (e) {
      console.warn('Unified orchestrator error', e);
    }
  };

  const handleServiceAction = async (serviceId: string, actionType: string, payload?: any) => {
    try {
      const res = await apiFetch<any>('/api/os/unified-services/action', {
        method: 'POST',
        body: JSON.stringify({ serviceId, actionType, payload }),
      });
      showToast(`Action dispatched: ${res.message || actionType}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplySuggestion = async (id: string) => {
    setIsApplyingFix(id);
    try {
      await apiFetch('/api/os/suggestions/apply', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
      showToast('Autonomous agentic fix successfully applied.');
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplyingFix(null);
    }
  };

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'spotify':
        return <Play className="w-5 h-5 text-emerald-400" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'github':
        return <GitBranch className="w-5 h-5 text-purple-400" />;
      case 'aws':
        return <Cloud className="w-5 h-5 text-amber-400" />;
      default:
        return <Terminal className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed bottom-20 right-4 z-50 bg-neutral-900 border border-cyan-500 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md font-mono text-xs animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* TOP: UNIFIED ORCHESTRATOR MATRIX */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              UNIFIED API ORCHESTRATION MATRIX
            </h3>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              Synchronized cross-platform hub: Control media, messaging, repositories, and cloud workloads simultaneously.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl text-neutral-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-neutral-950/80 border border-neutral-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    {getServiceIcon(svc.id)}
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white">{svc.name}</h4>
                    <span className="text-[10px] font-mono text-neutral-500">{svc.category}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  {svc.status}
                </span>
              </div>

              <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-300">
                <span className="text-[10px] text-neutral-500 block mb-0.5">CURRENT STATE:</span>
                {svc.details}
              </div>

              {/* Service Action Bar */}
              <div className="flex items-center gap-2 pt-1">
                {svc.id === 'spotify' && (
                  <>
                    <button
                      onClick={() => handleServiceAction('spotify', 'PLAY_PAUSE')}
                      className="flex-1 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-mono font-bold border border-neutral-700 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Toggle Play
                    </button>
                    <button
                      onClick={() => handleServiceAction('spotify', 'NEXT_TRACK')}
                      className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-neutral-700"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </>
                )}

                {svc.id === 'github' && (
                  <button
                    onClick={() => handleServiceAction('github', 'TRIGGER_DEPLOY')}
                    className="w-full py-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 rounded-lg text-xs font-mono font-bold border border-purple-800 flex items-center justify-center gap-1.5"
                  >
                    <GitBranch className="w-3.5 h-3.5" /> Trigger CI/CD Action
                  </button>
                )}

                {svc.id === 'aws' && (
                  <button
                    onClick={() => handleServiceAction('aws', 'SCALE_CONTAINER')}
                    className="w-full py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 rounded-lg text-xs font-mono font-bold border border-amber-800 flex items-center justify-center gap-1.5"
                  >
                    <Cloud className="w-3.5 h-3.5" /> Scale Cluster Nodes
                  </button>
                )}

                {svc.id === 'whatsapp' && (
                  <button
                    onClick={() => handleServiceAction('whatsapp', 'PING_BRIDGE')}
                    className="w-full py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded-lg text-xs font-mono font-bold border border-emerald-800 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Send Automation Sync
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM: AUTONOMOUS AGENTIC PROACTIVE SUGGESTIONS */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AUTONOMOUS AGENTIC WATCHDOG: PROACTIVE SUGGESTIONS
            </h3>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              ULTRON automatically monitors repository patterns, hardware load, and security scans to formulate self-correcting proposals.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
            {suggestions.filter((s) => !s.resolved).length} ACTIONABLE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((sug) => (
            <div
              key={sug.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                sug.resolved
                  ? 'bg-neutral-950 border-neutral-800 opacity-60'
                  : 'bg-neutral-950/90 border-neutral-800 hover:border-purple-500/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    {sug.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      sug.priority === 'CRITICAL' || sug.priority === 'HIGH'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {sug.priority} ({Math.round(sug.confidenceScore * 100)}% CONFIDENCE)
                  </span>
                </div>
                <h4 className="text-xs font-mono font-bold text-white">{sug.title}</h4>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">{sug.description}</p>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyan-300 truncate max-w-[160px]">
                  {sug.suggestedAction}
                </span>
                {sug.resolved ? (
                  <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplySuggestion(sug.id)}
                    disabled={isApplyingFix === sug.id}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {isApplyingFix === sug.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> FIXING...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" /> APPLY FIX
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
